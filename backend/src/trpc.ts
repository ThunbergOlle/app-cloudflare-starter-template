import { inferAsyncReturnType, initTRPC } from '@trpc/server';
import { TRPCError } from '@trpc/server';
import { verifyJWT } from './lib/auth/jwt';
import { createLogger } from './lib/logger';
import { sanitizeError } from './lib/errors';

export const createContext = async ({
  req,
  env,
  resHeaders,
}: {
  env: Env;
  req: Request;
  resHeaders: Headers;
}) => {
  // Generate unique request ID for this request
  const requestId = crypto.randomUUID().slice(0, 8);

  // Extract client IP from Cloudflare headers
  const ip = req.headers.get('cf-connecting-ip') || 'unknown';

  const log = createLogger(requestId, undefined, { env, ip });

  return {
    req,
    env,
    resHeaders,
    log,
    requestId,
    ip,
  };
};

export type Context = inferAsyncReturnType<typeof createContext>;

export type AuthenticationContext = Context & {
  user: {
    id: number;
    email: string;
  } | null;
  token?: string;
};

export type ProtectedRouteContext = AuthenticationContext & {
  user: {
    id: number;
    email: string;
  };
};

export const t = initTRPC.context<Context>().create({
  errorFormatter: ({ shape, error, ctx }) => {
    // Log detailed error information for development using context logger if available
    const logger = ctx?.log || createLogger('error-fmt');
    logger.error('🔥 tRPC Error:', {
      code: error.code,
      message: error.message,
      cause: error.cause,
      stack: error.stack,
      shape,
      timestamp: new Date().toISOString(),
    });

    // Return the error shape (this is what gets sent to the client)
    // In development, include stack traces for debugging
    // In production, only return the error code and safe message
    return {
      ...shape,
      data: {
        ...shape.data,
        // Add additional debugging info in development only
        ...(process.env.NODE_ENV !== 'production' && {
          stack: error.stack,
          cause: error.cause,
        }),
      },
    };
  },
});

// Create error-logging and sanitization middleware
export const errorLoggingMiddleware = t.middleware(
  async ({ next, path, type, input, ctx }) => {
    ctx.log.info(`📞 tRPC ${type.toUpperCase()}: ${path}`, {
      input: input ? JSON.stringify(input, null, 2) : undefined,
      timestamp: new Date().toISOString(),
    });

    try {
      const result = await next();

      ctx.log.info(`✅ tRPC SUCCESS: ${path}`, {
        timestamp: new Date().toISOString(),
      });

      return result;
    } catch (error) {
      ctx.log.error(`❌ tRPC ERROR in ${path}:`, {
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
                cause: error.cause,
              }
            : error,
        input: input ? JSON.stringify(input, null, 2) : undefined,
        type,
        timestamp: new Date().toISOString(),
      });

      // Sanitize the error before re-throwing to prevent leaking sensitive information
      throw sanitizeError(error, ctx.log, path);
    }
  },
);

export const authMiddleware = t.middleware(async ({ next, ctx }) => {
  const authHeader = ctx.req.headers.get('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return next({
      ctx: {
        ...ctx,
        user: null,
      },
    });
  }

  const token = authHeader.substring(7);

  try {
    const jwtResult = await verifyJWT(token, ctx.env.JWT_SECRET);

    if (!jwtResult.valid) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
      });
    }

    return next({
      ctx: {
        ...ctx,
        user: {
          id: jwtResult.payload!.userId,
          email: jwtResult.payload!.email,
        },
        token,
      },
    });
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid token',
    });
  }
});

export const requireAuthMiddleware = t.middleware<ProtectedRouteContext>(
  async ({ next, ctx }) => {
    const authCtx = ctx as AuthenticationContext;

    if (!authCtx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
    }

    ctx.log = createLogger(ctx.requestId, authCtx.user?.id, {
      env: ctx.env,
      ip: ctx.ip,
    });

    return next({
      ctx: authCtx,
    });
  },
);

export const procedure = t.procedure.use(errorLoggingMiddleware);
export const protectedProcedure = t.procedure
  .use(errorLoggingMiddleware)
  .use(authMiddleware)
  .use(requireAuthMiddleware);
