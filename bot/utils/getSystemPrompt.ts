import prisma from '@/prisma/prisma';

export const getSystemPrompt = async () => {
  const p = await prisma.prompt.findFirst({
    where: {
      key: 'group_systemPrompt',
    },
  });
  return p?.value;
};
