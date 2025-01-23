import prisma from '../../prisma/prisma';
import { sendRequestToGPT4 } from './openai';

export const updateTags = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { packages: true },
  });
  if (!user) {
    return;
  }
  const tagsString = await sendRequestToGPT4(`
        This is user info:
        ${JSON.stringify(user)}

        Extract tags based on user location, industry, and packages and output as JSON in this format:
        {
            "tags": ["tag1", "tag2", "tag3", "min_package_price:<min package price>", "max_package_price:<max package price>"]
        }
    `);
  const tags = JSON.parse(tagsString).tags;
  tags.push(`location:${user.location}`);
  tags.push(`industry:${user.niche}`);
  return prisma.user.update({
    where: { id: userId },
    data: {
      tags: {
        set: tags,
      },
    },
  });
};
