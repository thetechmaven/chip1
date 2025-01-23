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
  commandsList: ICommandList
) => {
  const prompt = `
        From this following text, choose one of the following commands:
        ${getCommandsAsText(commandsList)}

        Text: ${message}

        Output as json in the following format:
        {
            command: The choosen command, null if no command matches the result,
        }
    `;
  const responseText = await sendRequestToGPT4(prompt, true);
  const response = await JSON.parse(responseText);
  if (response.command) {
    response.command = 'COMMAND_' + response.command.toUpperCase();
  }
  return response;
};
