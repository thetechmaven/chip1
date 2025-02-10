const axios = require('axios');
const fs = require('fs');
const sharp = require('sharp');
const { createCanvas, registerFont } = require('canvas');

export const generateImage = async (bot: any, msg: any) => {
  const TOKEN = process.env.BOT_TOKEN;
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  try {
    // Get user profile photos
    const userPhotos = await bot.getUserProfilePhotos(userId, { limit: 1 });

    if (!userPhotos.total_count) {
      return bot.sendMessage(chatId, "You don't have a profile picture!");
    }

    // Get the highest resolution profile picture
    const photoVariants = userPhotos.photos[0];
    const fileId = photoVariants[photoVariants.length - 1].file_id;

    // Get file path from Telegram API
    const file = await bot.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${TOKEN}/${file.file_path}`;

    // Define file paths
    const profilePicPath = `./profile_${userId}.jpg`;
    const finalImagePath = `./final_${userId}.jpg`;

    // Download the image
    const response = await axios({ url: fileUrl, responseType: 'stream' });
    const writer = fs.createWriteStream(profilePicPath);

    response.data.pipe(writer);
    writer.on('finish', async () => {
      console.log('Profile picture downloaded:', profilePicPath);

      await processImage(
        profilePicPath,
        finalImagePath,
        msg.from.first_name + ' ' + (msg.from.last_name || '')
      );

      if (fs.existsSync(finalImagePath)) {
        await bot.sendPhoto(chatId, finalImagePath);

        fs.unlinkSync(profilePicPath);
        fs.unlinkSync(finalImagePath);
      } else {
        bot.sendMessage(chatId, 'Something went wrong, image not generated.');
      }
    });
  } catch (error) {
    console.error('Error:', error);
    bot.sendMessage(chatId, 'Failed to generate the image.');
  }
};

async function processImage(
  profilePicPath: any,
  outputImagePath: any,
  text: string
) {
  try {
    console.log('Processing image...');

    // Load the profile image
    const profileImage = await sharp(profilePicPath)
      .resize(273, 273) // Resize profile picture
      .toBuffer();

    // Load the background image
    const background = sharp('./template.jpg');
    const metadata = await background.metadata();

    const fontPath = './IGOR-BoldItalic.ttf';
    const fontSize = 46; // Base font size, adjust as needed

    if (fs.existsSync(fontPath)) {
      registerFont(fontPath, { family: 'IGORE-BoldItalic' });
      console.log('Font loaded:', fontPath);
    } else {
      console.error('Font not found:', fontPath);
    }
    const tempCanvas = createCanvas(500, 200);
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.font = `${fontSize}px IGORE-BoldItalic`;

    // Measure text dimensions

    const textWidth = Math.ceil(tempCtx.measureText(text).width) + 20; // Add padding
    const textHeight = fontSize; // Use exact font size (no extra padding)

    // Create a real canvas with correct dimensions for the SVG
    const canvas = createCanvas(textWidth, textHeight, 'svg');
    const ctx = canvas.getContext('2d');

    // Set the font again on the real canvas
    ctx.font = `${fontSize}px CustomFont, Arial`;
    ctx.fillStyle = '#dd2173'; // Set text color
    ctx.textBaseline = 'top'; // Ensures text starts at (0,0)
    ctx.fillText(text, 0, 0); // Render text at (0, fontSize) for correct positioning

    // Get the SVG buffer from the canvas
    const svgBuffer = Buffer.from(canvas.toBuffer());

    // Composite the profile image onto the background
    await background
      .composite([
        { input: profileImage, top: 255, left: 195 },
        { input: Buffer.from(svgBuffer as any), top: 570, left: 224 }, // Text position
        // { input: Buffer.from(nicheSVG), top: 654, left: 176 }, // Text position
        // { input: Buffer.from(nicheSVG), top: 654, left: 390 } // Text position
      ]) // Position the profile image
      .toFile(outputImagePath);

    console.log('Image processing completed:', outputImagePath);
  } catch (error) {
    console.error('Error processing image:', error);
  }
}
