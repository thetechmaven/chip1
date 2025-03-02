import { handleStartCommand } from '@/bot/handlers/commandHandlers';
import inlineQueryHandlers from '@/bot/handlers/inline-query-handlers';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse, NextRequest } from 'next/server';
import type * as TelegramBotTypes from 'node-telegram-bot-api';

const markupToString = (option: any) => {
  const reply_markup = option?.reply_markup;
  const inlineKeyboard = reply_markup?.inline_keyboard;
  let keyboard = ':::KEYBOARD:::';
  if (inlineKeyboard) {
    keyboard += inlineKeyboard
      .flat()
      .map((row: any) => {
        return `${row.text}\n${row.callback_data}\n`;
      })
      .join('\n\n');
    return keyboard;
  } else {
    return '';
  }
};

const bot = (responses: string[]) => {
  return {
    sendMessage: (chatId: string, message: string, options: any) => {
      responses.push(message + markupToString(options));
      return {};
    },
    sendPhoto: (chatId: string, photo: string, options: any) => {
      responses.push(
        'Photo sent\n' +
          photo +
          '\n\n' +
          options.caption +
          '\n' +
          markupToString(options)
      );
      return {};
    },
    deleteMessage: (chatId: string, messageId: string) => {
      responses.push('Message deleted');
      return {};
    },
    updateMesaage: (
      chatId: string,
      messageId: string,
      message: string,
      options: any
    ) => {
      responses.push('Updating', message);
      return {};
    },
  };
};

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const chatId = parseInt(searchParams.get('chatId') as string);
  const first_name = searchParams.get('first_name');
  const last_name = searchParams.get('last_name');
  const message = searchParams.get('message');
  const username = searchParams.get('username');
  const command = searchParams.get('command');

  const responses: string[] = [];

  if (!type) {
    return NextResponse.json({
      param: "Please choose a type, either 'QUERY' or 'MESSAGE'",
    });
  }
  if (!chatId) {
    return NextResponse.json({
      param: 'Please provide a chatId',
    });
  }

  if (type === 'QUERY') {
    const botMessage: any = {
      data: command,
      message: {
        id: chatId + '-' + Date.now(),
        chat: {
          id: chatId,
        },
        from: {
          id: chatId,
          first_name,
          last_name,
        },
      },
    };
    await inlineQueryHandlers(
      bot(responses),
      botMessage as TelegramBotTypes.CallbackQuery
    );
    return NextResponse.json({
      responses,
    });
  } else {
    const botMessage: any = {
      text: message,
      chat: {
        id: chatId,
      },
      from: {
        id: chatId,
        first_name,
        last_name,
        username,
      },
    };
    console.log('Message', message);
    switch (message) {
      case '/start': {
        await handleStartCommand({
          bot: bot(responses),
          message: botMessage,
          command: '',
        });
        break;
      }
      default: {
        bot(responses).sendMessage(chatId.toString(), botMessage, {});
      }
    }
    return NextResponse.json({
      responses,
    });
  }

  return NextResponse.json({
    message: 'Hello from bot-testing route',
  });
};
