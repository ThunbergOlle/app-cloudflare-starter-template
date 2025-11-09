import { drizzle } from 'drizzle-orm/d1';
import type { Context } from '../../trpc';

export async function deleteUserAccount(
  userId: number,
  ctx: Context,
): Promise<void> {
  const db = drizzle(ctx.env.DB);

  try {
    ctx.log.info('Starting account deletion process', { userId });

    throw new Error('You need to implement the deleteUserAccount function.');
  } catch (error) {
    ctx.log.error('Account deletion failed', {
      userId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}
