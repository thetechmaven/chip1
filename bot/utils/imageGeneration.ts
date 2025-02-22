import prisma from '../../prisma/prisma';

const axios = require('axios');
const fs = require('fs');
const sharp = require('sharp');
const { createCanvas, registerFont } = require('canvas');
const path = require('path');

export const generateImage = async (bot: any, msg: any) => {
  const TOKEN = process.env.BOT_TOKEN;
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  try {
    const user = await prisma.user.findUnique({
      where: { chatId: msg.chat.id },
    });
    if (!user) {
      return;
    }
    const finalImagePath = `./final_${userId}.jpg`;
    const profilePicPath = `./profile_${userId}.jpg`;
    const userPhotos = await bot.getUserProfilePhotos(userId, { limit: 1 });
    const missingProfilePic = !userPhotos.total_count;
    if (missingProfilePic) {
      await processImage(
        path.join(__dirname, './defaultPhoto.jpg'),
        finalImagePath,
        msg.from.first_name + ' ' + (msg.from.last_name || ''),
        user.niche + '    ' + user.contentStyle
      );
      if (fs.existsSync(finalImagePath)) {
        await bot.sendPhoto(chatId, finalImagePath);

        fs.unlinkSync(finalImagePath);
      } else {
        bot.sendMessage(chatId, 'Something went wrong, image not generated.');
      }
    } else {
      const photoVariants = userPhotos.photos[0] || [];
      const fileId = photoVariants[photoVariants.length - 1].file_id;
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
        if (!user) {
          return;
        }
        await processImage(
          missingProfilePic ? './defaultPhoto.jpg' : profilePicPath,
          finalImagePath,
          msg.from.first_name + ' ' + (msg.from.last_name || ''),
          user.niche + '    ' + user.contentStyle
        );

        if (fs.existsSync(finalImagePath)) {
          await bot.sendPhoto(chatId, finalImagePath);

          fs.unlinkSync(profilePicPath);
          fs.unlinkSync(finalImagePath);
        } else {
          bot.sendMessage(chatId, 'Something went wrong, image not generated.');
        }
      });
    }
  } catch (error) {
    console.error('Error:', error);
    bot.sendMessage(chatId, 'Failed to generate the image.');
  }
};

async function processImage(
  profilePicPath: any,
  outputImagePath: any,
  text: string,
  text2: string
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

    const fontPath = path.join(__dirname, './IGOR-BoldItalic.ttf');
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

    const textWidth = Math.ceil(tempCtx.measureText(text).width) + 20;
    const textHeight = fontSize; // Use exact font size (no extra padding)

    // Create a real canvas with correct dimensions for the SVG
    const canvas = createCanvas(420, textHeight, 'svg');
    const ctx = canvas.getContext('2d');
    ctx.font = `${fontSize}px IGORE-BoldItalic`;
    ctx.fillStyle = '#dd2173';
    ctx.textBaseline = 'top';
    ctx.fillText(text, (420 - textWidth) / 2, 0);

    const canvas2 = createCanvas(420, textHeight + 10, 'svg');
    const ctx2 = canvas2.getContext('2d');
    let fontSizeSub = 46;
    do {
      ctx.font = `${fontSizeSub}px IGOR-BoldItalic`;
      const textWidth = ctx.measureText(text2).width;

      if (textWidth <= 320) {
        break;
      }
      fontSizeSub--;
    } while (fontSizeSub > 10);
    const subTextHeight = ctx.measureText(text2).height;
    ctx2.font = `${fontSizeSub}px IGORE-BoldItalic`;
    ctx2.fillStyle = '#000000';
    ctx2.textBaseline = 'top';
    ctx2.fillText(text2, 0, (textHeight - fontSizeSub) / 2);

    // Get the SVG buffer from the canvas
    const svgBuffer = Buffer.from(canvas.toBuffer());
    const nicheSVG = Buffer.from(canvas2.toBuffer());

    // Composite the profile image onto the background
    await background
      .composite([
        { input: profileImage, top: 255, left: 195 },
        { input: Buffer.from(svgBuffer as any), top: 570, left: 116 }, // Text position
        { input: Buffer.from(nicheSVG as any), top: 634, left: 116 }, // Text position
        // { input: Buffer.from(nicheSVG), top: 654, left: 390 } // Text position
      ]) // Position the profile image
      .toFile(outputImagePath);

    console.log('Image processing completed:', outputImagePath);
  } catch (error) {
    console.error('Error processing image:', error);
  }
}
