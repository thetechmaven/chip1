import bot from './bot';
import handlers from './handlers';
require('dotenv').config();

handlers(bot);

export default bot;
