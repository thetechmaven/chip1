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

Extract tags based on user location, niche, and packages. If any information is missing, ignore it. You can generate 10 - 25 (atleat 10, max 25) tags which can help in searching creators. If there is less information, you can add some related tags yourself to that this creator can be found by brands. Output as array of strings which can be parsed by JSON.parse and dont add any extra text:
Along with other tags, Tags should also include max price of packages and location and niche of user`,
      true,
      [],
      {
        jsonResponse: true,
      }
    );
    const { tags } = JSON.parse(tagsString);
    tags.push(`location:${user.location}`);
    tags.push(`industry:${user.niche}`);
    console.log();
    return prisma.user.update({
      where: { id: userId },
      data: {
        tags: {
          set: tags,
        },
      },
    });
  } catch (e) {
    console.log(e);
  }
};
