const TelegramBot = require('node-telegram-bot-api');
import type * as TelegramBotTypes from 'node-telegram-bot-api';
import {
  dealOpenaiWrapper,
  getChatId,
  getKnowledgeBase,
  initGroup,
  isCreatorGroup,
  sendRequestToEliza,
} from '../utils/groupHelpers';
import { sendLoadingMessage } from './inline-query-handlers';
import { messageHistory } from '.';

const handleBotMessage = (
  bot: typeof TelegramBot,
  chatId: number, 
  message: string, 
  options = {}
) => {
  return bot.sendMessage(chatId, message, options).catch((error: any) => {
    if (error.response?.body?.error_code === 403 && 
        error.response?.body?.description?.includes('bot was kicked from the group chat')) {
      console.log(`Bot was kicked from group ${chatId}`);
      // You might want to add cleanup logic here, like:
      // - Remove group from database
      // - Clear any stored messages
      // - Update group status
      return 'BOT_KICKED';
    }
    // Re-throw other errors
    throw error;
  });
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const groupHandler = async (
  bot: typeof TelegramBot,
  message: TelegramBotTypes.Message
) => {
  try {
    // Check if this is the bot being added
    const isBotBeingAdded = 
      (message.new_chat_members?.some(member => member.id === bot.options.id)) ||
      ((message as any).new_chat_member?.status === 'member') ||
      ((message as any).new_chat_member?.status === 'administrator');

    if (!isBotBeingAdded) {
      if (message.new_chat_members || 
          message.left_chat_member || 
          message.new_chat_title ||
          message.new_chat_photo ||
          message.delete_chat_photo ||
          message.group_chat_created ||
          message.pinned_message) {
        return;
      }

      if (!message.text) {
        return;
      }
    }

    // Start loading the response immediately
    const responsePromise = (async () => {
      const { isCreator, isNewGroup } = await isCreatorGroup(message);
      let responseText = '';
      
      if (isNewGroup || isBotBeingAdded) {
        if (isCreator) {
          await initGroup(message);
          
          // Check if bot is already admin
          const isAdmin = (message as any).new_chat_member?.status === 'administrator';
          
          responseText = isAdmin ? 
            'Thank you! I\'m ready to help clients learn about your content creation services.' :
            'Group initialized!\n\n' +
            'I\'m ready to assist clients. I\'ll answer questions about your services and packages.\n\n' +
            'Tip: For better response to all messages, please disable Privacy Mode via BotFather.';
        } else {
          responseText = 'This group is not for you. Please leave the group.';
        }
      } else if (isCreator) {
        await dealOpenaiWrapper(getChatId(message), [
          {
            role: 'user',
            name: 'Creator',
            content: [
              {
                type: 'text',
                text:
                  (message.text as string) +
                  `This is the creators message. He is telling something to ${
                    message.from?.first_name || 'Client'
                  }. Just save this for your later use. You need not to respond to it now.`,
              },
            ],
          },
        ]);
        responseText = 'Temp Message: will be removed because Chip dont reply to creators, only replies to buyers';
      } else {
        const knowledgebase = await getKnowledgeBase(getChatId(message));
        try {
          responseText = await dealOpenaiWrapper(getChatId(message), [
            {
              role: 'user',
              name: message.from?.first_name || 'Client',
              content: [
                {
                  type: 'text',
                  text:
                    (message.text as string) +
                    `\n\nNote: In most cases when client refers "You" that means the content creator. Keep your response concise and under 3 sentences when possible.\n\nUse the following knowledgebase to help the user if required: \n${knowledgebase || ''} \n`,
                },
              ],
            },
          ]);
        } catch (error: any) {
          console.error('OpenAI API error:', error);
          
          // Default response for any error
          responseText = "I apologize, but I'm experiencing technical difficulties at the moment. Please try again in a few moments.";
          
          // Try to provide more specific responses for common errors
          if (error.message?.includes('context length') || 
              error.message?.includes('maximum context length') ||
              error.error?.code === 'context_length_exceeded') {
            
            console.log('Context length exceeded, trying with shorter context...');
            
            // Try again with just the current message and shorter knowledgebase
            try {
              const shortenedKnowledgebase = knowledgebase ? knowledgebase.split('\n').slice(0, 5).join('\n') : '';
              responseText = await dealOpenaiWrapper(getChatId(message), [
                {
                  role: 'user',
                  name: message.from?.first_name || 'Client',
                  content: [
                    {
                      type: 'text',
                      text: (message.text as string) + 
                        `\n\nKeep your response very brief.\n\nKey information: \n${shortenedKnowledgebase}`,
                    },
                  ],
                }
              ], true);
            } catch (retryError) {
              // Already set default response above
              console.error('Even retry failed:', retryError);
            }
          }
        }
      }
      return responseText;
    })();

    // Show thinking/typing states in parallel
    const loadingMsg = await bot.sendMessage(getChatId(message), '🤔 Thinking...');
    await sleep(500);
    
    await bot.editMessageText('✍️ Typing...', {
      chat_id: getChatId(message),
      message_id: loadingMsg.message_id
    });
    
    // Keep showing typing indicator until response is ready
    const typingInterval = setInterval(() => {
      bot.sendChatAction(getChatId(message), 'typing').catch(() => {});
    }, 5000);

    // Wait for the response
    const responseText = await responsePromise;
    
    // Clear typing indicator
    clearInterval(typingInterval);

    // Edit the loading message with the actual response
    try {
      await bot.editMessageText(responseText, {
        chat_id: getChatId(message),
        message_id: loadingMsg.message_id,
        parse_mode: 'Markdown'
      });
    } catch (editError) {
      console.log('Failed to edit message:', editError.message);
      try {
        await bot.sendMessage(getChatId(message), responseText, { parse_mode: 'Markdown' });
      } catch (sendError) {
        console.error('Failed to send message:', sendError.message);
      }
    }
  } catch (err) {
    console.error('Error handling group message:', err);
  }
};
