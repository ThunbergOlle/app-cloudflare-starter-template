import './types';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { createContext, t } from './trpc';
import {
  checkEmail,
  registerUser,
  loginUser,
  signInWithApple,
  requestPasswordReset,
  resetPassword,
  deleteAccountViaWeb,
} from './lib/auth';
import {
  getCurrentUser,
  setLocale,
  updateUser,
  deleteAccount,
} from './lib/user/procedures';

import { log } from './lib/logger';
import { verifyJWT } from './lib/auth/jwt';

const appRouter = t.router({
  checkEmail,
  registerUser,
  loginUser,
  signInWithApple,
  requestPasswordReset,
  resetPassword,
  deleteAccountViaWeb,
  getCurrentUser,
  updateUser,
  setLocale,
  deleteAccount,
});

export type AppRouter = typeof appRouter;

// Image serving handler with authentication and resizing
async function handleImageRequest(
  request: Request,
  env: Env,
): Promise<Response> {
  const requestId = crypto.randomUUID().slice(0, 8);
  const logger = log;

  try {
    // Extract filename from URL path: /images/filename.jpg
    const url = new URL(request.url);
    const filename = url.pathname.replace('/images/', '');

    if (!filename) {
      return new Response('Missing filename', { status: 400 });
    }

    // Verify JWT from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response('Unauthorized', {
        status: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const token = authHeader.substring(7);
    const jwtResult = await verifyJWT(token, env.JWT_SECRET);

    if (!jwtResult.valid) {
      logger.warn('Invalid JWT for image request', { filename, requestId });
      return new Response('Unauthorized', {
        status: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    logger.info('🖼️ Image request authenticated', {
      filename,
      userId: jwtResult.payload?.userId,
      requestId,
    });

    // Fetch image from R2
    const object = await env.IMAGE_BUCKET.get(filename);
    if (!object) {
      logger.warn('Image not found in R2', { filename, requestId });
      return new Response('Image not found', {
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Get content type
    const contentType = object.httpMetadata?.contentType || 'image/jpeg';

    // For image resizing, we need to return the original image
    // Cloudflare's image resizing only works with public URLs or Workers fetch()
    // For now, return original image - client will handle sizing
    // TODO: Consider using Cloudflare Image Resizing with public R2 URLs in future
    return new Response(object.body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    logger.error('💥 Error serving image:', {
      error: error instanceof Error ? error.message : String(error),
      requestId,
    });

    return new Response('Internal server error', {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

export default {
  async fetch(request: Request, env: Env) {
    try {
      const url = new URL(request.url);
      const headers = Object.fromEntries(request.headers.entries());

      log.info(`🌐 Incoming ${request.method} request to ${url.pathname}`, {
        searchParams: url.searchParams.toString(),
        headers: headers,
        contentType: request.headers.get('content-type'),
        accept: request.headers.get('accept'),
      });

      // Handle CORS preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400',
          },
        });
      }

      // Handle image serving endpoint
      if (url.pathname.startsWith('/images/') && request.method === 'GET') {
        return await handleImageRequest(request, env);
      }

      const response = await fetchRequestHandler({
        endpoint: '/trpc',
        req: request,
        router: appRouter,
        createContext: ({ req, resHeaders }) => {
          // Add CORS headers for all responses
          resHeaders.set('Access-Control-Allow-Origin', '*');
          resHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          resHeaders.set(
            'Access-Control-Allow-Headers',
            'Content-Type, Authorization',
          );

          return createContext({
            req,
            env,
            resHeaders,
          });
        },
      });

      log.info(
        `✅ Response ${response.status} for ${request.method} ${url.pathname}`,
      );
      return response;
    } catch (error) {
      log.error('💥 Unhandled Worker Error:', {
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
                cause: error.cause,
              }
            : error,
        request: {
          method: request.method,
          url: request.url,
          headers: Object.fromEntries(request.headers.entries()),
        },
        timestamp: new Date().toISOString(),
      });

      // Return a proper error response
      return new Response(
        JSON.stringify({
          error: 'Internal Server Error',
          message: 'unhandled',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        },
      );
    }
  },
} satisfies ExportedHandler<Env>;
