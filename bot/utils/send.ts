import prisma from '../../prisma/prisma';
import { sendRequestToGPT4 } from './openai';

const TelegramBot = require('node-telegram-bot-api');

interface ISendProfile {
  bot: typeof TelegramBot;
  chatId: number;
}

function replaceAll(inputString: string, search: string, replacement: string) {
  const regex = new RegExp(search, 'g');
  return inputString.replace(regex, replacement);
}

export const sendProfile = async ({ bot, chatId }: ISendProfile) => {
  const user = await prisma.user?.findUnique({ where: { chatId } });
  if (user?.userType === 'BRAND') {
    const profileData = {
      brandName: user.brandName || 'MISSING',
      location: user.brandLocation || 'MISSING',
      industry: user.brandIndustry || 'MISSING',
    };
    const message =
      await sendRequestToGPT4(`This is data for a brand profile: ${JSON.stringify(
        profileData
      )}. Create a message for the brand owner that humorously summarizes the profile data using the format:  

<emoji> field: value  

For any missing fields:  
Please also provide field1, field2, ... We need it to match you with good creators.  

If "brandName" is missing, emphasize its importance in a polite and funny way. If "location" or "industry" is missing, joke lightly about them being optional but helpful.
`);
    await bot.sendMessage(chatId, message, {
      reply_markup: {},
    });
  } else if (user?.userType === 'CREATOR') {
    let data: any = { ...user };

    delete data.chatId;
    delete data.id;
    delete data.userType;
    delete data.name;
    delete data.isAdmin;
    delete data.brandName;
    delete data.brandLocation;
    delete data.brandIndustry;
    delete data.username;
    delete data.dob;
    delete data.email;
    delete data.isStaff;
    delete data.tags;

    for (const key in data) {
      if (!data[key]) {
        data[key] = 'MISSING';
      }
    }

    const message = await sendRequestToGPT4(
      `This is data for a creator profile: ${JSON.stringify(
        data
      )}. Create a message for the creator that humorously summarizes the profile data using the format:
      <emoji> field: value

      In the end, ask the creator to update their profile with the missing information only if some data is missing
      `
    );
    await bot.sendMessage(chatId, message, {
      reply_markup: {
        inline_keyboard: [],
      },
    });
  }
};
