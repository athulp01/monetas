import { type NextApiRequest, type NextApiResponse } from "next";
import { type Update } from "node-telegram-bot-api";

import { TELEGRAM_SECRET_HEADER, callTelegramAPI } from "~/utils/telegram";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    if (authorizeRequestFromTG(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const payload = req.body as Update;
    console.log(req.body);

    // Extract the chat ID and command from the payload
    const { message } = payload;
    if (message) {
      const chatId = message.chat.id;
      const command = message.text.split(" ")[0];

      // Check if the command is "/start"
      if (command === "/start") {
        await callTelegramAPI("sendMessage", {
          text: "Welcome to Monetas 🎉",
          chat_id: chatId,
        });
        // Send a message back with the chat ID
        await callTelegramAPI("sendMessage", {
          text: `Your chat ID is ${chatId}. Type this in the Monetas web app to integrate with Telegram.`,
          chat_id: chatId,
        });
      }
    }
  }

  res.status(200).end("Hello, Telegram!");
}

// Verify the request signature
export function authorizeRequestFromTG(request: NextApiRequest) {
  return (
    request.headers[TELEGRAM_SECRET_HEADER] ===
    process.env.TELEGRAM_SECRET_TOKEN
  );
}
