const axios = require('axios');

/**
 * Sends a request to OpenAI's GPT-4 model and returns the response.
 * @param {string} prompt - The prompt to send to the GPT-4 model.
 * @param {number} [maxTokens=100] - The maximum number of tokens to generate.
 * @param {string} [apiKey=process.env.OPENAI_API_KEY] - Your OpenAI API key.
 * @returns {Promise<string>} - The generated response from GPT-4.
 */
export async function sendRequestToGPT4(
  prompt: string,
  maxTokens = 500,
  apiKey = process.env.OPENAI_KEY
) {
  if (!apiKey) {
    throw new Error(
      'OpenAI API key is required. Make sure to set it in the environment variables or pass it as an argument.'
    );
  }

  const url = 'https://api.openai.com/v1/chat/completions';

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };

  const data = {
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: maxTokens,
    temperature: 0.7,
  };

  try {
    const response = await axios.post(url, data, { headers });
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error(
      'Error communicating with OpenAI:',
      (error as any).response?.data || (error as any).message
    );
    throw new Error('Failed to get a response from GPT-4.');
  }
}
