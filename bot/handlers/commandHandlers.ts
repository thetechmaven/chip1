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

const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

interface ICommandHandlerArgs {
  bot: typeof TelegramBot;
  command: string;
  message: TelegramBotTypes.Message;
  lastMessage?: ILastMessage | undefined;
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
    const prompt = `${
      commandData.commandPrompt
    }\n If required fields return an error message. List of fields:${JSON.stringify(
      commandData.data
    )}  \nOUTPUT AS JSON IN THIS Format: ${getResponseFormat({
      ...commandData.data,
      error: { details: 'Set it to true if required fields are missing' },
      message: {
        details:
          'Ask user to send message again if any required field is missing in data. If optional fields are missing, motivate user to send optional fields',
      },
    })}\n Text: ${message.text}`;
    const responseText = await sendRequestToGPT4(
      prompt,
      true,
      messageHistory.getRecentConversations(chatId),
      {
        jsonResponse: true,
      }
    );
    const response = JSON.parse(responseText);
    messageHistory.addRecentConversation(chatId, {
      time: Date.now(),
      query: message.text || '',
      answer: responseText,
    });
    if (!response.error) {
      const newPackge = await prisma.package.create({
        data: {
          status: 'ACTIVE',
          name: response.name,
          description: response.description || null,
          price: response.price,
          negotitationLimit: response.negotitationLimit || null,
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
    const prompt = `${
      commandData.commandPrompt
    }\n Content creator wants to update his/her package. 
    
    Current Package: ${JSON.stringify(packageData)}
    
    Only return the fields which are present in text and skip the fields which are not there. List of fields:${JSON.stringify(
      commandData.data
    )}  \nOUTPUT AS JSON IN THIS Format: ${getResponseFormat({
      ...commandData.data,
      message: {
        details:
          'Let user know that the package has been updated successfully. If any field is missing, ask user to send the message again with the missing field',
      },
    })}\n Text: ${message.text}`;
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
          negotitationLimit: response.negotitationLimit || null,
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
  sendProfile({ bot, chatId: message.chat.id });
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
    sendProfile({ bot, chatId: msg.chat.id });
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
    const profileData = await sendRequestToGPT4(
      `
      Extract the data from the provided text and output it as a JSON object in the following format without any additional text:  
      {
        "brandName": "name/brandName in this text",
        "brandLocation": "location of brand",
        "brandIndustry": "industry of brand"
      }  
      NB: If something is missing. set it null.
      Text: "${message.text}"
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
    await sendProfile({ bot, chatId });
  } else if (user?.userType === USER_TYPE_CREATOR) {
    const profileData = await sendRequestToGPT4(
      `
      Extract the data from the provided text and output it as a JSON object in the following format without any additional text:  
      {
        "name": "name/brandName in this text",
        "bio": "bio of creator",
        "telegramId": "telegram account of creator",
        "twitterId": "x/twitter handle, x.com or twitter.com link",
        "discordId": "discord id of the creator",
        "facebookId": "facebook id of the creator",
        "youtubeId": "youtube profile of the creator",
        "evmWallet": "EVM Wallet Address of the creator",
        "solWallet": "Solana wallet address of the creator",
        "niche": "niche/field/industry of creator",
        "schedule": "Working schedule of the creator",
        "location": "Location of the creator",
        "contentStyle": "Content style of the creator",
      }  
      NB: If something is missing. set it null.
      Text: "${message.text}"
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
    await sendProfile({ bot, chatId });
    if (updatedUser.packages.length === 0) {
      await bot.sendMessage(
        chatId,
        `Congrats! You’re officially represented by CAAA - here’s your badge of approval. I’ve already got your first paid deal!! Over $100k in rewards up for grabs. Just need you to share this badge on X and tag ME @ChipTheAgent - then come back and share that tweet link here!`
      );
    }
  }
  messageHistory.setLastMessage(chatId, {
    command: 'COMMAND_RECEIVE_UPDATE_PROFILE',
  });
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
          } \nNegotiation Limit: ${pack.negotitationLimit || 'Not set'}`,
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
    console.log('Creators', creators);
    const searchResultString = await sendRequestToGPT4(
      `Here is the list of creators:
      ${creators
        .map((creator) => {
          return `${creator.id}: ${creator.tags.join(', ')}`;
        })
        .join('\n')}
      
      Find the top 5 creators which match the user requirements. Requirements are:
      ${JSON.stringify(message.text)}

      Output as array of creator ids and ensure the output is valid JSON and contains no additional text.
      ["id1", "id2", ...]
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
