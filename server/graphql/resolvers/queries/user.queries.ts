import prisma from '@/prisma/prisma';

export const user = () => {
  return prisma.user.findFirst({});
};
