const TelegramBot = require('node-telegram-bot-api');
import './handlers';
import handlers from './handlers';
require('dotenv').config();

const bot = new TelegramBot(process.env.BOT_TOKEN as string, { polling: true });
handlers(bot);

export default bot;
