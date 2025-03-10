import { messageHistory } from '../handlers';
import getPrompt from './getPrompts';
import { sendRequestToGPT4 } from './openai';

interface ICommandData {
  [key: string]: {
    details: string;
    required?: boolean;
  };
}

interface ICommandList {
  [key: string]: {
    condition: string;
  };
}

const getCommandsAsText = (commandsList: ICommandList) => {
  return Object.keys(commandsList)
    .map((key) => {
      return `${key}: ${commandsList[key].condition}`;
    })
    .join('\n');
};

export const getResponseFormat = (data: ICommandData) => {
  return `
        {
            ${Object.keys(data)
              .map((key) => {
                return `${key}: ${data[key].details}`;
              })
              .join(',\n')}
        }
    `;
};

export const getCommandAndData = async (
  message: string,
  commandsList: ICommandList,
  chatId: number
) => {
  const commandText = getCommandsAsText(commandsList);
  const p = await getPrompt('getCommandAndData');
  const prompt = getText(p?.value as string, {
    commandText,
    message,
  });
  const responseText = await sendRequestToGPT4(
    prompt,
    true,
    messageHistory.getRecentConversations(chatId),
    {
      jsonResponse: true,
    }
  );
  const response = await JSON.parse(responseText);
  if (response.command) {
    response.command = 'COMMAND_' + response.command.toUpperCase();
  }
  return response;
};
