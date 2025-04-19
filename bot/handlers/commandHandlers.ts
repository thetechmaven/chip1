import prisma from '../../prisma/prisma';
import { ILastMessage } from '../models/ChatMessageHistory';
import type * as TelegramBotTypes from 'node-telegram-bot-api';
import { sendProfile } from '../utils/send';
import { messageHistory } from '.';
import { resetCommand } from '../utils/message';
import {
  USER_TYPE,
  USER_TYPE_BRAND,
  USER_TYPE_CREATOR,
} from '../contants/index';
import { sendRequestToGPT4 } from '../utils/openai';
import { deleteMessage, sendLoadingMessage } from './inline-query-handlers';
import { getResponseFormat } from '../utils/getCommand';
import { sendPackage } from '../utils/sendPackage';
import { buyerFaqs, sellerFaqs } from '../contants/faqs';
import { updateTags } from '../utils/profile';
import { sellerCommands } from '../prompts/commandPrompts';
import { config } from '../config';
import { EDIT_PROFILE_FIELD } from '../../constants';
import { generateImage } from '../utils/imageGeneration';
import getPrompt from '../utils/getPrompts';
import getText from '../../utils/getText';

const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

interface ICommandHandlerArgs {
  bot: typeof TelegramBot;
  command: string;
  message: TelegramBotTypes.Message;
  lastMessage?: ILastMessage | undefined;
  commandData?: string;
}

export const handleNewUser = async ({ bot, message }: ICommandHandlerArgs) => {
  const chatId = message.chat.id;
  const firstName = message.from?.first_name;

  let user = await prisma.user.findUnique({ where: { chatId } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        chatId,
        name: firstName,
        telegramId: message.from?.username,
      },
    });
  }
  bot.sendPhoto(chatId, config.welcomeImageLink, {
    caption: config.welcomeMessage,
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '👨‍🎨 Creator',
            callback_data: `${USER_TYPE}:${USER_TYPE_CREATOR}`,
          },
        ],
        [
          {
            text: '🏢 Brand',
            callback_data: `${USER_TYPE}:${USER_TYPE_BRAND}`,
          },
        ],
      ],
    },
  });
};

export const handleCommandAddPackage = async ({
  bot,
  message,
}: ICommandHandlerArgs) => {
  const chatId = message.chat.id;
  const loadingMessageId = await sendLoadingMessage(chatId);
  const user = await prisma.user.findUnique({ where: { chatId } });
  const commandData = sellerCommands['ADD_PACKAGE'];
  if (user?.userType === USER_TYPE_CREATOR) {
    const profileData = {
      brandName: user.brandName || 'MISSING',
      location: user.brandLocation || 'MISSING',
      industry: user.brandIndustry || 'MISSING',
    };
    const p = await getPrompt('addPackage');
    const prompt = `${commandData.commandPrompt}\n ${p?.value} ${message.text}`;
    const responseText = await sendRequestToGPT4(
      prompt,
      true,
      messageHistory.getRecentConversations(chatId),
      {
        jsonResponse: true,
      }
    );
    const response = JSON.parse(responseText);
    console.log('RESPONSE>>', response);
    console.log('PROMPT>>', prompt);
    messageHistory.addRecentConversation(chatId, {
      time: Date.now(),
      query: message.text || '',
      answer: responseText,
    });
    if (response.name && response.price) {
      const newPackge = await prisma.package.create({
        data: {
          status: 'ACTIVE',
          name: response.name,
          description: response.description || null,
          price: response.price,
          negotiation: response.negotiationLimit
            ? parseFloat(response.negotiationLimit)
            : null,
          creator: {
            connect: {
              chatId,
            },
          },
        },
      });
      sendPackage(bot, chatId, newPackge.id);
      updateTags(user.id);
    } else {
      bot.sendMessage(
        chatId,
        `I wasn’t able to pick up the following info to create the package:\n\n* Name\n* Price\n\nCan you please send it again!`
      );
    }
    messageHistory.deleteLoadingMessages(chatId, bot);
  }
};

export const handleCommandUpdatePackage = async ({
  bot,
  message,
  command,
  lastMessage,
}: ICommandHandlerArgs) => {
  const chatId = message.chat.id;
  const packageId = lastMessage?.command?.split(':')[1];
  const packageData = await prisma.package.findUnique({
    where: { id: packageId },
  });
  await sendLoadingMessage(chatId);
  const user = await prisma.user.findUnique({ where: { chatId } });
  const commandData = sellerCommands['ADD_PACKAGE'];
  if (user?.userType === USER_TYPE_CREATOR) {
    const currentPackage = JSON.stringify(packageData);
    const commandFields = JSON.stringify(commandData.data);
    const responseFormat = getResponseFormat({
      ...commandData.data,
      message: {
        details:
          'Let user know that the package has been updated successfully. If any field is missing, ask user to send the message again with the missing field',
      },
    });
    const messageText = message.text;
    const p = await getPrompt('updatePackage');
    const prompt = getText(p?.value as string, {
      currentPackage,
      commandFields,
      responseFormat,
      messageText,
    });
    const responseText = await sendRequestToGPT4(
      prompt,
      true,
      messageHistory.getRecentConversations(chatId),
      {
        jsonResponse: true,
      }
    );
    const response = JSON.parse(responseText);
    console.log('RESPONSE>>', response);
    messageHistory.addRecentConversation(chatId, {
      time: Date.now(),
      query: message.text || '',
      answer: responseText,
    });
    if (!response.error) {
      const newPackge = await prisma.package.update({
        where: { id: packageId },
        data: {
          status: 'ACTIVE',
          name: response.name,
          description: response.description || null,
          price: response.price,
          negotiation: response.negotiationLimit || null,
          creator: {
            connect: {
              chatId,
            },
          },
        },
      });
      bot.sendMessage(chatId, response.message);
      sendPackage(bot, chatId, newPackge.id);
      updateTags(user.id);
    } else {
      bot.sendMessage(chatId, response.message);
    }
    messageHistory.deleteLoadingMessages(chatId, bot);
  }
};

export const handleUpdateName = async ({
  bot,
  message,
}: ICommandHandlerArgs) => {
  await prisma.user.update({
    where: { chatId: message.chat.id },
    data: { name: message.text },
  });
  sendProfile({ bot, chatId: message.chat.id, specificField: 'name' });
  resetCommand(message.chat.id);
};

export const handleUpdatePicture = async ({
  bot,
  message: msg,
}: ICommandHandlerArgs) => {
  if (msg.photo && msg.photo[0]) {
    const filePath = await bot.downloadFile(
      msg.photo.slice(-1)[0].file_id,
      './public/bot-images'
    );
    const newName = `./public/bot-images/i-${msg.chat.id}.jpg`;
    fs.renameSync(filePath, newName, (err: Error) => {
      if (err) {
        bot.sendMessage(
          msg.chat.id,
          'There was an error while updating the photo. Please try again later'
        );
      } else {
        bot.sendMessage(
          msg.chat.id,
          'Your profile picture has been updated successfully'
        );
      }
    });
    bot.sendMessage(
      msg.chat.id,
      'Your profile picture has been updated successfully'
    );
    resetCommand(msg.chat.id);
  } else {
    bot.sendMessage(msg.chat.id, 'Error: No photo received');
  }
};

export const handleReceiveUpdateProfile = async ({
  bot,
  message,
}: ICommandHandlerArgs) => {
  const chatId = message.chat.id;
  await sendLoadingMessage(chatId);
  const user = await prisma.user.findUnique({ where: { chatId } });
  if (user?.userType === USER_TYPE_BRAND) {
    const p = await getPrompt('getBrandProfileData');
    const profileData = await sendRequestToGPT4(
      `${p?.value} "${message.text}"
    `,
      true,
      messageHistory.getRecentConversations(chatId),
      {
        jsonResponse: true,
      }
    );
    messageHistory.addRecentConversation(chatId, {
      time: Date.now(),
      query: message.text || '',
      answer: profileData,
    });
    const data = JSON.parse(profileData);
    for (let key in data) {
      if (data[key] === null) {
        delete data[key];
      }
    }
    await prisma.user.update({
      where: { chatId },
      data: {
        ...data,
      },
    });
    bot.sendMessage(
      chatId,
      'Your profile has been updated! Use /profile to view or edit your profile.'
    );
  } else if (user?.userType === USER_TYPE_CREATOR) {
    const p = await getPrompt('getCreatorProfileData');
    const profileData = await sendRequestToGPT4(
      `
      ${p?.value} "${message.text}"
    `,
      true,
      messageHistory.getRecentConversations(chatId),
      {
        jsonResponse: true,
      }
    );
    messageHistory.addRecentConversation(chatId, {
      time: Date.now(),
      query: message.text || '',
      answer: profileData,
    });
    const data = JSON.parse(profileData);

    console.log('PROFILE DATA>>', data);

    for (let key in data) {
      if (data[key] === null) {
        delete data[key];
      }
    }
    updateTags(user.id);
    const updatedUser = await prisma.user.update({
      where: { chatId },
      data: {
        ...data,
      },
      include: {
        packages: true,
      },
    });

    if (updatedUser.packages.length === 0 && !user.congratsMessageSent) {
      generateImage(bot, message);
      await bot.sendMessage(
        chatId,
        `Congrats! You’re officially represented by CAAA - here’s your badge of approval. I’ve already got your first paid deal!! Over $100k in rewards up for grabs. Just need you to share this badge on X and tag ME @ChipTheAgent - then come back and share that tweet link here!`
      );
      messageHistory.setLastMessage(chatId, {
        command: 'COMMAND_RECEIVE_X_LINK',
      });
      await prisma.user.update({
        where: { chatId },
        data: {
          congratsMessageSent: true,
        },
      });
    } else {
      bot.sendMessage(
        chatId,
        'Your profile has been updated! Use /profile to view or edit your profile.'
      );
    }
  }
  messageHistory.deleteLoadingMessages(chatId, bot);
};

export const viewMyPackages = async ({ bot, message }: ICommandHandlerArgs) => {
  const chatId = message.chat.id;
  await sendLoadingMessage(chatId);
  const user = await prisma.user.findUnique({ where: { chatId } });
  if (user?.userType === USER_TYPE_CREATOR) {
    const packages = await prisma.package.findMany({
      where: {
        creatorId: user.id,
      },
    });
    messageHistory.addRecentConversation(chatId, {
      time: Date.now(),
      query: message.text || '',
      answer: `${JSON.stringify(packages)}`,
    });
    if (packages.length === 0) {
      bot.sendMessage(chatId, 'You have no packages yet');
    } else {
      packages.forEach((pack) => {
        bot.sendMessage(
          chatId,
          `*${pack.name}*\n${pack.description || ''}\nPrice: ${
            pack.price
          } \nNegotiation Limit: ${pack.negotiation || 'Not set'}`,
          {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: 'Edit',
                    callback_data: `EDIT_PACKAGE:${pack.id}`,
                  },
                  {
                    text: 'Delete',
                    callback_data: `DELETE_PACKAGE:${pack.id}`,
                  },
                ],
              ],
            },
          }
        );
      });
    }
  }
  messageHistory.deleteLoadingMessages(chatId, bot);
};

export const handleSendProfile = async ({
  bot,
  message,
}: ICommandHandlerArgs) => {
  await sendLoadingMessage(message.chat.id);
  await sendProfile({ bot, chatId: message.chat.id });
  messageHistory.deleteLoadingMessages(message.chat.id, bot);
};

export const handleOther = async ({ bot, message }: ICommandHandlerArgs) => {
  const chatId = message.chat.id;
  await sendLoadingMessage(chatId);
  const document = await prisma.user.findUnique({
    where: { chatId: message.chat.id },
    include: { packages: true },
  });
  if (!document) {
    messageHistory.deleteLoadingMessages(chatId, bot);
    return;
  }
  const { packages, ...user }: any = document;
  if (user.userType === USER_TYPE_BRAND) {
    delete user.niche;
    delete user.schedule;
    delete user.contentStyle;
    delete user.location;
    delete user.telegramId;
    delete user.twitterId;
    delete user.discordId;
    delete user.facebookId;
    delete user.youtubeId;
    delete user.evmWallet;
    delete user.solWallet;
    delete user.bio;
  } else {
    delete user.brandName;
    delete user.brandLocation;
    delete user.brandIndustry;
  }
  const prompt =
    user.userType === USER_TYPE_CREATOR
      ? `
    Answer the users question in a friendly manner. User is a UGC (Content creator). Im providing you knowledge base so please dont answer anything
    outside this knowledgebase.

    User Info: ${JSON.stringify(user)}
    Creator Packages: ${JSON.stringify(packages)}
    FAQs: ${JSON.stringify(sellerFaqs)}

    Users query: ${message.text}
  `
      : `
      Answer the users question in a friendly manner. User is a brand owner and they might need a UGC (content creator). Im providing you knowledge base so please dont answer anything
    outside this knowledgebase.

    User Info: ${JSON.stringify(user)}
    FAQs: ${JSON.stringify(buyerFaqs)}

    Users query: ${message.text}
      `;
  const response = await sendRequestToGPT4(
    prompt,
    false,
    messageHistory.getRecentConversations(message.chat.id)
  );
  messageHistory.addRecentConversation(message.chat.id, {
    time: Date.now(),
    query: message.text || '',
    answer: response,
  });
  bot.sendMessage(message.chat.id, response, {
    parse_mode: 'Markdown',
  });
  messageHistory.deleteLoadingMessages(chatId, bot);
};

export const handleFindCreators = async ({
  bot,
  message,
}: ICommandHandlerArgs) => {
  const chatId = message.chat.id;
  const loadingMessageId = await sendLoadingMessage(chatId);
  const user = await prisma.user.findUnique({ where: { chatId } });
  if (user?.userType === USER_TYPE_BRAND || true) {
    const creators = await prisma.user.findMany({
      where: {
        //userType: USER_TYPE_CREATOR,
      },
      select: {
        id: true,
        tags: true,
      },
    });
    const creatorsList = creators
      .map((creator) => {
        return `${creator.id}: ${creator.tags.join(', ')}`;
      })
      .join('\n');
    const messageText = JSON.stringify(message.text);
    const p = await getPrompt('findCreators');
    const query = getText(p?.value as string, {
      messageText,
      creatorsList,
    });
    const searchResultString = await sendRequestToGPT4(
      query,
      true,
      messageHistory.getRecentConversations(chatId),
      {
        jsonResponse: true,
      }
    );
    messageHistory.addRecentConversation(chatId, {
      time: Date.now(),
      query: message.text || '',
      answer: searchResultString,
    });
    const searchResult = JSON.parse(searchResultString);
    if (!searchResult.creators) {
      bot.sendMessage(
        chatId,
        "Oops! No creators found. Maybe try tweaking your requirements a bit? Let's find that perfect match!"
      );
      return;
    }
    const relatedCreators = await prisma.user.findMany({
      where: {
        id: {
          in: searchResult.creators,
        },
      },
      include: {
        packages: true,
      },
    });
    relatedCreators.forEach((creator) => {
      bot.sendMessage(
        chatId,
        `*${creator.name}\n*${
          creator.bio ? `${creator.bio}\n` : ''
        }*Packages*\n${creator.packages
          .map((pack) => {
            return `Name: ${pack.name}\nDescription: ${pack.description}\nPrice: ${pack.price}\n`;
          })
          .join('\n')}
        `,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Contact',
                  url: `t.me/${
                    creator.telegramId?.startsWith('@')
                      ? creator.telegramId.substring(
                          1,
                          creator.telegramId.length
                        )
                      : `${creator.telegramId}`
                  }`,
                },
              ],
            ],
          },
        }
      );
    });
  }
  messageHistory.deleteLoadingMessages(chatId, bot);
};

export const handleXLink = async ({ bot, message }: ICommandHandlerArgs) => {
  const user = await prisma.user.findUnique({
    where: { chatId: message.chat.id },
  });
  const username = message.text?.split('/').filter(Boolean)[1];
  const username2 = message.text?.split('/').filter(Boolean)[2];
  const twitterId = user?.twitterId?.replace('@', '');
  if (username !== twitterId && username2 !== twitterId) {
    bot.sendMessage(
      message.chat.id,
      `Hey there, the tweet link you shared doesn't match the X account you provided. Please share the correct tweet link. Use /profile command to view your X username.`
    );
    return;
  }
  bot.sendMessage(
    message.chat.id,
    'Boom!! Hop in our Discord to get instant access to your new deals.\n\nhttps://discord.gg/uKrdskvm.\n\nSoon I’ll be able to bring you deals directly to your DMs!! \n\nIn the meantime, setup your content packages if you want deals brought directly to your DMs. \n\nUse the /packages command to get started! Then you can start adding me to chats with your clients!'
  );
};

export const handleBadgeCommand = async ({
  bot,
  message,
}: ICommandHandlerArgs) => {
  const user = await prisma.user.findUnique({
    where: { chatId: message.chat.id },
  });
  if (user?.userType === USER_TYPE_CREATOR) {
    sendLoadingMessage(message.chat.id, 'Generating ...');
    await generateImage(bot, message);
    messageHistory.deleteLoadingMessages(message.chat.id, bot);
    return;
  } else {
    bot.sendMessage(
      'Hey there, brand owner! This command is only for the creators'
    );
  }
};

export const handleProfileCommand = async ({
  bot,
  message,
}: ICommandHandlerArgs) => {
  const user = await prisma.user.findUnique({
    where: { chatId: message.chat.id },
  });

  if (user?.userType === USER_TYPE_BRAND) {
    if (user.brandName || user.brandIndustry || user.brandLocation) {
      bot.sendMessage(
        message.chat.id,
        'Hey there, brand owner! here is your profile\n\n*Brand Name:* ' +
          (user.brandName || '*Not provided*') +
          '\n*Brand Industry:* ' +
          (user.brandIndustry || '*Not provided*') +
          '\n*Brand Location:* ' +
          (user.brandLocation || '*Not provided*'),
        {
          parse_mode: 'Markdown',
        }
      );
    } else {
      bot.sendMessage(
        message.chat.id,
        'Hey there, brand owner! Let us know your brand name, location, and industry',
        {
          parse_mode: 'Markdown',
        }
      );
      messageHistory.setSuperCommand(
        message.chat.id,
        'COMMAND_RECEIVE_UPDATE_PROFILE'
      );
      return;
    }
    return;
  }

  sendProfile({
    bot,
    chatId: message.chat.id,
    note: '✏️ To edit any field, click on the field name below',
    inline_keyboard: [
      [
        {
          text: '*Bio',
          callback_data: `${EDIT_PROFILE_FIELD}:bio`,
        },
        {
          text: '*X Account',
          callback_data: `${EDIT_PROFILE_FIELD}:twitterId`,
        },
        {
          text: 'Youtube',
          callback_data: `${EDIT_PROFILE_FIELD}:youtubeId`,
        },
      ],
      [
        {
          text: 'Tiktok',
          callback_data: `${EDIT_PROFILE_FIELD}:tiktokId`,
        },
        {
          text: 'Discord',
          callback_data: `${EDIT_PROFILE_FIELD}:discordId`,
        },
        {
          text: 'Twitch',
          callback_data: `${EDIT_PROFILE_FIELD}:twitchId`,
        },
      ],
      [
        {
          text: '*EVM Wallet',
          callback_data: `${EDIT_PROFILE_FIELD}:evmWallet`,
        },
        {
          text: '*Sol Wallet',
          callback_data: `${EDIT_PROFILE_FIELD}:solWallet`,
        },
        {
          text: 'Location',
          callback_data: `${EDIT_PROFILE_FIELD}:location`,
        },
      ],
      [
        {
          text: '*Content Style',
          callback_data: `${EDIT_PROFILE_FIELD}:contentStyle`,
        },
        {
          text: '*Niche',
          callback_data: `${EDIT_PROFILE_FIELD}:niche`,
        },
        {
          text: 'Hours',
          callback_data: `${EDIT_PROFILE_FIELD}:schedule`,
        },
      ],
      [
        {
          text: 'Packages',
          callback_data: 'VIEW_MY_PACKAGES',
        },
        {
          text: 'Negotiation',
          callback_data: `${EDIT_PROFILE_FIELD}:negotiationLimit`,
        },
      ],
      [
        {
          text: 'Complete Setup ✅',
          callback_data: 'COMPLETE_SETUP',
        },
      ],
    ],
  });
};

export const handleEditProfileField = async ({
  bot,
  message,
  command,
  commandData,
}: ICommandHandlerArgs) => {
  try {
    const chatId = message.chat.id;
    const user = await prisma.user.findUnique({ where: { chatId } });
    if (!user) {
      return;
    }
    if (commandData === 'negotiationLimit') {
      await prisma.user.update({
        where: { chatId },
        data: {
          negotiationLimit: parseFloat(message.text as string),
        },
      });
      await sendProfile({ bot, chatId, specificField: commandData });
      return;
    }
    await prisma.user.update({
      where: { chatId },
      data: {
        [commandData as string]: message.text,
      },
    });
    await sendProfile({ bot, chatId, specificField: commandData });
  } catch (err) {
    console.log(err);
  }
};

export const handlePackageCommand = async ({
  bot,
  message,
}: ICommandHandlerArgs) => {
  const user = await prisma.user.findUnique({
    where: { chatId: message.chat.id },
    include: { packages: true },
  });
  if (user?.userType === USER_TYPE_BRAND) {
    bot.sendMessage(
      message.chat.id,
      'Hey there, brand owner! This command is for creators only'
    );
    return;
  }
  if (user?.packages.length === 0) {
    bot.sendMessage(
      message.chat.id,
      `Time to get you paid! 

Your content packages are what I will use to consider you for hire, and to share with your clients. For your first package, please provide the required fields: title, price. You can also include description and negotiation limit for a more detailed package!`
    );
    messageHistory.setSuperCommand(message.chat.id, 'COMMAND_ADD_PACKAGE');
    return;
  }
  bot.sendMessage(
    message.chat.id,
    'Hey there, content creator! Let me know what do you need',
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Add Package',
              callback_data: 'ADD_PACKAGE',
            },
            {
              text: 'View My Packages',
              callback_data: 'VIEW_MY_PACKAGES',
            },
          ],
        ],
      },
    }
  );
};
