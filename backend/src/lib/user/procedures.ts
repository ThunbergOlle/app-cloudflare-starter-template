import { protectedProcedure } from '../../trpc';
import { drizzle } from 'drizzle-orm/d1';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { createSafeError } from '../errors';
import { deleteUserAccount } from './operations';

export const getCurrentUser = protectedProcedure.query(async ({ ctx }) => {
  const userId = ctx.user.id;
  const db = drizzle(ctx.env.DB);

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
    .get();

  if (!user) {
    throw createSafeError.unauthorized('Invalid token');
  }

  return {
    user: {
      id: ctx.user.id,
      email: ctx.user.email,
      firstName: user.firstName,
    },
  };
});

export const updateUser = protectedProcedure
  .input(
    z.object({
      firstName: z.string().min(1).max(50),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const db = drizzle(ctx.env.DB);

    await db
      .update(users)
      .set({ firstName: input.firstName })
      .where(eq(users.id, ctx.user.id));

    return {
      success: true,
      user: {
        id: ctx.user.id,
        email: ctx.user.email,
        firstName: input.firstName,
      },
    };
  });

export const setLocale = protectedProcedure
  .input(
    z.object({
      locale: z.string().max(2).min(2),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const db = drizzle(ctx.env.DB);

    await db
      .update(users)
      .set({ locale: input.locale })
      .where(eq(users.id, ctx.user.id));

    return {
      success: true,
    };
  });

export const deleteAccount = protectedProcedure.mutation(async ({ ctx }) => {
  const userId = ctx.user.id;
  ctx.log.info('User requested account deletion', { userId });
  await deleteUserAccount(userId, ctx);

  return {
    success: true,
    message: 'Account deleted successfully',
  };
});
