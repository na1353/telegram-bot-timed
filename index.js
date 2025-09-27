import TelegramBot from "node-telegram-bot-api";
import B2 from "backblaze-b2";
import dotenv from "dotenv";

dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const b2 = new B2({
  applicationKeyId: process.env.B2_KEY_ID,
  applicationKey: process.env.B2_APP_KEY,
});

async function getSignedUrl(fileName) {
  try {
    await b2.authorize();
    const response = await b2.getDownloadAuthorization({
      bucketId: process.env.B2_BUCKET_ID,
      fileNamePrefix: fileName,
      validDurationInSeconds: 3600, // لینک یک‌ساعته
    });

    const downloadUrl = `https://f002.backblazeb2.com/file/${process.env.B2_BUCKET_NAME}/${fileName}?Authorization=${response.data.authorizationToken}`;
    return downloadUrl;
  } catch (err) {
    console.error("خطا در ساخت لینک:", err);
    return null;
  }
}

bot.onText(/\/get (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const fileName = match[1];

  bot.sendMessage(chatId, "⏳ در حال ساخت لینک دانلود زمان‌دار...");

  const signedUrl = await getSignedUrl(fileName);
  if (signedUrl) {
    bot.sendMessage(chatId, `📥 لینک دانلود آماده است:\n${signedUrl}`);
  } else {
    bot.sendMessage(chatId, "❌ خطا در ساخت لینک. لطفا دوباره تلاش کنید.");
  }
});
