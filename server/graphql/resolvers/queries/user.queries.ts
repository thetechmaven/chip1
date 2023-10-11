import prisma from '@/prisma/prisma';
import { IGqlContext } from '@/types';

export const user = (_: unknown, args: unknown, { user }: IGqlContext) => {
  return user;
};

export const users = (_: unknown, args: unknown) => {
  return prisma.user.findMany({});
};
