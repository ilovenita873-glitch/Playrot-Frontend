import 'dotenv/config';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { Bot, InlineKeyboard, InputFile } from 'grammy';

const bot = new Bot(process.env.BOT_TOKEN!);

const BANNER_PATH = join(__dirname, 'banner.jpg');

bot.command('start', async (ctx) => {
  const keyboard = new InlineKeyboard().webApp('🚀 Play', process.env.WEBAPP_URL!);

  const caption =
    `😎 <b>Playrot'ga xush kelibsiz!</b>\n\n` +
    `» O'yinlarni o'ynang va ball to'plang\n` +
    `» Topshiriqlarni bajaring\n` +
    `» Do'konda yangi narsalar oling\n\n` +
    `🍀 Omadingizni sinab ko'ring!`;

  if (existsSync(BANNER_PATH)) {
    await ctx.replyWithPhoto(new InputFile(BANNER_PATH), {
      caption,
      parse_mode: 'HTML',
      reply_markup: keyboard,
    });
  } else {
    console.log('Rasm topilmadi:', BANNER_PATH);
    await ctx.reply(caption, { parse_mode: 'HTML', reply_markup: keyboard });
  }
});

bot.catch((err) => {
  console.error('Xato:', err.message);
});

bot.start();
console.log('Playrot bot ishga tushdi');