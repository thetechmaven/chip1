import prisma from '@/prisma/prisma';

export default function getPrompt(key: string) {
  return prisma.prompt.findUnique({ where: { key } });
}
