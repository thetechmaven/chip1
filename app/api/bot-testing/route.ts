import inlineQueryHandlers from '@/bot/handlers/inline-query-handlers';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse, NextRequest } from 'next/server';
import type * as TelegramBotTypes from 'node-telegram-bot-api';

const bot = (responses: string[]) => {
  return {
    sendMessage: (chatId: string, message: string, options: any) => {
      responses.push(message);
      return {};
    },
    sendPhoto: (chatId: string, photo: string, options: any) => {
      responses.push('Photo sent');
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
  const chatId = searchParams.get('chatId');
  const first_name = searchParams.get('first_name');
  const last_name = searchParams.get('last_name');
  const message = searchParams.get('message');
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
      message: {
        id: chatId + '-' + Date.now(),
        chat: {
          id: chatId,
        },
        data: message,
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
  }

  return NextResponse.json({
    message: 'Hello from bot-testing route',
  });
};
