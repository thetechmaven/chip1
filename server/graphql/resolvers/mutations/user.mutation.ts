import prisma from '@/prisma/prisma';
import type * as Prisma from '@prisma/client';

export const registerUser = async (_: unknown, args: Prisma.User) => {
  return prisma.user.create({
    data: args,
  });
};
