import { procedure } from '../../trpc';
import { drizzle } from 'drizzle-orm/d1';
import { users, passwordResetTokens } from '../../db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { z } from 'zod';
import { generateSalt, hashPassword, verifyPassword } from './crypto';
import { createJWT } from './jwt';
import { verifyAppleIdToken } from './apple';
import { sendPasswordResetEmail } from '../external/resend/api';
import { createSafeError } from '../errors';

export const checkEmail = procedure
  .input(
    z.object({
      email: z.string().email(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const db = drizzle(ctx.env.DB);
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    return { exists: existingUser.length > 0 };
  });

export const registerUser = procedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string().min(8),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const db = drizzle(ctx.env.DB);

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw createSafeError.conflict('User with this email already exists');
    }

    const salt = await generateSalt();
    const hashedPassword = await hashPassword(input.password, salt);

    const newUser = await db
      .insert(users)
      .values({
        email: input.email,
        password: hashedPassword,
        salt: salt,
        provider: 'email',
        externalId: null,
        appleIdentityToken: null,
      })
      .returning();

    const sessionToken = await createJWT(
      newUser[0].id,
      newUser[0].email!,
      newUser[0].locale,
      ctx.env.JWT_SECRET,
    );

    return {
      success: true,
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
        locale: newUser[0].locale,
      },
      sessionToken,
    };
  });

export const loginUser = procedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const db = drizzle(ctx.env.DB);

    // Find user by email
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    if (existingUser.length === 0) {
      throw createSafeError.badRequest('Invalid email or password');
    }

    if (existingUser[0].provider === 'apple') {
      throw createSafeError.badRequest(
        'This account uses Apple Sign-In. Please sign in with Apple.',
      );
    }

    if (!existingUser[0].password || !existingUser[0].salt) {
      throw createSafeError.badRequest('Invalid email or password');
    }

    const isValidPassword = await verifyPassword(
      input.password,
      existingUser[0].password,
      existingUser[0].salt,
    );

    if (!isValidPassword) {
      throw createSafeError.badRequest('Invalid email or password');
    }

    const sessionToken = await createJWT(
      existingUser[0].id,
      existingUser[0].email!, // Email is guaranteed to be non-null for email login
      existingUser[0].locale,
      ctx.env.JWT_SECRET,
    );

    return {
      success: true,
      user: {
        id: existingUser[0].id,
        email: existingUser[0].email,
      },
      sessionToken,
    };
  });

export const signInWithApple = procedure
  .input(
    z.object({
      identityToken: z.string(),
      email: z.string().email().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const db = drizzle(ctx.env.DB);

    // Verify Apple identity token
    // In development, be more permissive with bundle ID verification
    // Check for development environment in multiple ways
    const isDevelopment = ctx.env.ENVIRONMENT === 'development';
    const bundleId = isDevelopment ? undefined : 'com.aperto-app.app';

    ctx.log.info('Apple Sign-In verification started:', {
      isDevelopment,
      bundleId,
      environment: ctx.env.ENVIRONMENT,
    });

    const verificationResult = await verifyAppleIdToken(
      input.identityToken,
      bundleId,
    );

    if (!verificationResult.valid || !verificationResult.payload) {
      ctx.log.error('Apple token verification failed:', {
        tokenLength: input.identityToken?.length,
        hasToken: !!input.identityToken,
        bundleId,
        isDevelopment,
      });

      // Provide more helpful error message in development only
      const errorMessage = isDevelopment
        ? 'Apple Sign-In not properly configured. Please check your Apple Developer account settings and ensure Sign In with Apple capability is enabled for your App ID.'
        : 'Invalid Apple identity token';

      throw createSafeError.badRequest(errorMessage);
    }

    const appleUserId = verificationResult.payload.sub;
    // For returning users, email won't be provided by Apple
    // Use the email from the token payload if available
    const email = input.email || verificationResult.payload.email;

    // Check if user already exists with Apple provider (by externalId)
    let existingUser = await db
      .select()
      .from(users)
      .where(eq(users.externalId, appleUserId))
      .limit(1);

    // If user exists with this Apple ID, update token and return
    if (existingUser.length > 0) {
      // Update the existing Apple user's token
      await db
        .update(users)
        .set({
          appleIdentityToken: input.identityToken,
        })
        .where(eq(users.id, existingUser[0].id));

      // Create JWT for the existing user
      const sessionToken = await createJWT(
        existingUser[0].id,
        existingUser[0].email || email || '',
        existingUser[0].locale,
        ctx.env.JWT_SECRET,
      );

      return {
        success: true,
        user: {
          id: existingUser[0].id,
          email: existingUser[0].email || email,
          firstName: existingUser[0].firstName,
          locale: existingUser[0].locale,
        },
        sessionToken,
      };
    }

    // New user - check if email exists with different provider
    if (email) {
      existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser.length > 0) {
        // Link Apple account to existing user
        await db
          .update(users)
          .set({
            provider: 'apple',
            externalId: appleUserId,
            appleIdentityToken: input.identityToken,
          })
          .where(eq(users.id, existingUser[0].id));

        // Create JWT for the linked user
        const sessionToken = await createJWT(
          existingUser[0].id,
          existingUser[0].email || email,
          existingUser[0].locale,
          ctx.env.JWT_SECRET,
        );

        return {
          success: true,
          user: {
            id: existingUser[0].id,
            email: existingUser[0].email || email,
            firstName: existingUser[0].firstName,
            locale: existingUser[0].locale,
          },
          sessionToken,
        };
      }
    }

    // Create new Apple user
    const firstName = input.firstName || null;
    const newUser = await db
      .insert(users)
      .values({
        email: email || null,
        password: null,
        salt: null,
        firstName: firstName,
        provider: 'apple',
        externalId: appleUserId,
        appleIdentityToken: input.identityToken,
        locale: 'sv', // Default locale
      })
      .returning();

    // Create JWT for the new user
    const sessionToken = await createJWT(
      newUser[0].id,
      email || '',
      newUser[0].locale,
      ctx.env.JWT_SECRET,
    );

    return {
      success: true,
      user: {
        id: newUser[0].id,
        email: email,
        firstName: firstName,
        locale: newUser[0].locale,
      },
      sessionToken,
    };
  });

export const requestPasswordReset = procedure
  .input(
    z.object({
      email: z.string().email(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const db = drizzle(ctx.env.DB);

    try {
      // Find user by email
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      // Always return success to prevent email enumeration
      if (existingUser.length === 0) {
        ctx.log.info('Password reset requested for non-existent email', {
          email: input.email,
        });
        return { success: true };
      }

      const user = existingUser[0];

      // Check if user is using Apple Sign-In
      if (user.provider === 'apple') {
        ctx.log.info('Password reset requested for Apple user', {
          userId: user.id,
        });
        throw createSafeError.badRequest(
          'This account uses Apple Sign-In. Please sign in with Apple.',
        );
      }

      // Generate reset token
      const resetToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // Store reset token
      await db.insert(passwordResetTokens).values({
        userId: user.id,
        token: resetToken,
        expiresAt: expiresAt.toISOString(),
      });

      // Send reset email
      const emailResult = await sendPasswordResetEmail(
        {
          to: user.email!,
          resetToken,
        },
        ctx.env.RESEND_API_KEY,
      );

      if (!emailResult.success) {
        ctx.log.error('Failed to send password reset email', {
          userId: user.id,
          error: emailResult.error,
        });
        throw createSafeError.internal('Failed to send password reset email');
      }

      ctx.log.info('Password reset email sent', { userId: user.id });
      return { success: true };
    } catch (error) {
      ctx.log.error('Password reset request error', { error });
      throw error;
    }
  });

export const resetPassword = procedure
  .input(
    z.object({
      token: z.string(),
      newPassword: z.string().min(8),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const db = drizzle(ctx.env.DB);

    try {
      // Find valid token
      const now = new Date().toISOString();
      const tokenRecord = await db
        .select()
        .from(passwordResetTokens)
        .where(
          and(
            eq(passwordResetTokens.token, input.token),
            eq(passwordResetTokens.used, false),
            gt(passwordResetTokens.expiresAt, now),
          ),
        )
        .limit(1);

      if (tokenRecord.length === 0) {
        ctx.log.warn('Invalid or expired password reset token', {
          token: input.token.substring(0, 8) + '...',
        });
        throw createSafeError.badRequest('Invalid or expired reset token');
      }

      const token = tokenRecord[0];

      // Get user
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, token.userId))
        .limit(1);

      if (user.length === 0) {
        ctx.log.error('User not found for password reset token', {
          userId: token.userId,
        });
        throw createSafeError.notFound('User');
      }

      // Check if user is using Apple Sign-In
      if (user[0].provider === 'apple') {
        ctx.log.warn('Password reset attempted for Apple user', {
          userId: user[0].id,
        });
        throw createSafeError.badRequest(
          'This account uses Apple Sign-In. Please sign in with Apple.',
        );
      }

      // Generate new salt and hash password
      const salt = await generateSalt();
      const hashedPassword = await hashPassword(input.newPassword, salt);

      // Update user password
      await db
        .update(users)
        .set({
          password: hashedPassword,
          salt: salt,
        })
        .where(eq(users.id, user[0].id));

      // Mark token as used
      await db
        .update(passwordResetTokens)
        .set({ used: true })
        .where(eq(passwordResetTokens.id, token.id));

      ctx.log.info('Password reset successfully', { userId: user[0].id });

      return { success: true };
    } catch (error) {
      ctx.log.error('Password reset error', { error });
      throw error;
    }
  });

export const deleteAccountViaWeb = procedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string(),
      confirmation: z.boolean().refine((val) => val === true, {
        message: 'You must confirm account deletion',
      }),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const db = drizzle(ctx.env.DB);

    try {
      // Find user by email
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existingUser.length === 0) {
        ctx.log.info('Account deletion requested for non-existent email', {
          email: input.email,
        });
        throw createSafeError.badRequest('Invalid email or password');
      }

      const user = existingUser[0];

      // Check if this is an Apple user
      if (user.provider === 'apple') {
        ctx.log.info('Account deletion requested for Apple user', {
          userId: user.id,
        });
        throw createSafeError.badRequest(
          'This account uses Apple Sign-In. Please delete your account from your device settings.',
        );
      }

      // Verify password against hash using stored salt
      if (!user.password || !user.salt) {
        ctx.log.warn('Account deletion requested for user without password', {
          userId: user.id,
        });
        throw createSafeError.badRequest('Invalid email or password');
      }

      const isValidPassword = await verifyPassword(
        input.password,
        user.password,
        user.salt,
      );

      if (!isValidPassword) {
        ctx.log.warn('Account deletion attempted with invalid password', {
          userId: user.id,
        });
        throw createSafeError.badRequest('Invalid email or password');
      }

      // Import deleteUserAccount from user operations
      const { deleteUserAccount } = await import('../user/operations');

      ctx.log.info('Account deletion via web initiated', { userId: user.id });

      // Delete the account
      await deleteUserAccount(user.id, ctx);

      return { success: true };
    } catch (error) {
      ctx.log.error('Account deletion via web error', { error });
      throw error;
    }
  });
