import prisma from '@/prisma/prisma';
import { IGqlContext } from '@/types';
import { adminOnly } from '../../wrappers';

export const user = (_: unknown, args: unknown, { user }: IGqlContext) => {
  return user;
};

export const users = (_: unknown, args: unknown) => {
  return prisma.user.findMany({});
};

export const packages = adminOnly(async (_: unknown, args: unknown) => {
  return prisma.package.findMany({
    include: {
      creator: true,
    },
  });
});
