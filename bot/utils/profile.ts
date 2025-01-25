import prisma from '../../prisma/prisma';
import { sendRequestToGPT4 } from './openai';

export const updateTags = async (userId: string) => {
  try {
    const user: any = await prisma.user.findUnique({
      where: { id: userId },
      include: { packages: true },
    });
    if (!user) {
      return;
    }
    delete user.tags;
    const tagsString = await sendRequestToGPT4(
      `
        This is user info:
${JSON.stringify(user)}

Extract tags based on user location, niche, and packages. If any information is missing, ignore it. You can generate upto 25 tags which can help in searching creators. If there is less information, you can add some related tags yourself to that this creator can be found by brands. Output as array of strings which can be parsed by JSON.parse and dont add any extra text:
For example: ["min_package_price:<min package price if available>", "max_package_price:<max package price if available>", "<tag1>", "<tag2>", ...]`,
      true,
      [],
      {
        jsonResponse: true,
      }
    );
    const tags = JSON.parse(tagsString);
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
  } catch (e) {}
};
