import prisma from '@/prisma/prisma';

export const user = () => {
  console.log('Called');
  return prisma.user.findFirst({});
};
