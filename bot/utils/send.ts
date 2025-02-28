import prisma from '../../prisma/prisma';
import { messageHistory } from '../handlers';
import camelToNormalCase from './camelcaseToNormal';
import { sendRequestToGPT4 } from './openai';
import { getMissingFields } from './profile';

const TelegramBot = require('node-telegram-bot-api');

interface ISendProfile {
  bot: typeof TelegramBot;
  chatId: number;
  specificField?: string;
  inline_keyboard?: any;
  note?: string;
}

function replaceAll(inputString: string, search: string, replacement: string) {
  const regex = new RegExp(search, 'g');
  return inputString.replace(regex, replacement);
}

export const sendProfile = async ({
  bot,
  chatId,
  specificField,
  inline_keyboard,
  note,
}: ISendProfile) => {
  const user = await prisma.user?.findUnique({ where: { chatId } });
  if (specificField && typeof (user as any)[specificField] !== 'undefined') {
    const message = `Your ${camelToNormalCase(specificField)} is ${
      (user as any)[specificField]
    }${specificField === 'negotationField' ? '%' : ''}.`;
    bot.sendMessage(chatId, message);
    return;
  }

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
    messageHistory.addRecentConversation(chatId, {
      time: Date.now(),
      query: 'Show me my profile',
      answer: message,
    });
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

    let message = '*👨‍🎨 Your Creator Profile*\n';
    message += `\n🎯 Bio: ${user.bio || 'Not Set'}`;
    message += `\n🐦 X Account: ${user.twitterId || 'Not Set'}`;
    message += `\n📺 Youtube: ${user.youtubeId || 'Not Set'}`;
    message += `\n📱 Tiktok: ${user.tiktokId || 'Not Set'}`;
    message += `\n🎮 Twitch: ${user.twitchId || 'Not Set'}`;
    message += `\n💰 EVM Wallet: ${user.evmWallet || 'Not Set'}`;
    message += `\n💎 Sol Wallet: ${user.solWallet || 'Not Set'}`;
    message += `\n📍 Location: ${user.location || 'Not Set'}`;
    message += `\n🎨 Content Style: ${user.contentStyle || 'Not Set'}`;
    message += `\n🎯 Niche: ${user.niche || 'Not Set'}`;
    message += `\n⏰ Hours: ${user.schedule || 'Not Set'}`;

    const missingFields = getMissingFields(user);
    if (missingFields.length > 0) {
      message += '\n\n⚠️ Required fields are missing.';
      message += '\nPlease update: ';
      message += missingFields.map((f) => camelToNormalCase(f)).join(', ');
      message += '\nComplete your profile to get matched with brands.';
    }

    if (note) {
      message += `\n\n${note}`;
    }

    messageHistory.addRecentConversation(chatId, {
      time: Date.now(),
      query: 'Show me my profile',
      answer: message,
    });
    await bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: inline_keyboard || [],
      },
    });
    console.log('Done');
  }
};
