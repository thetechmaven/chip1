import type * as Prisma from '@prisma/client';

export interface IGqlContext {
  user?: Prisma.User | null;
  isAdmin?: boolean;
}
