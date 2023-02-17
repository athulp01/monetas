import { InlineKeyboardMarkup } from "node-telegram-bot-api";
import { TRANSACTION_ACTIONS } from "./types";

export const TELEGRAM_SECRET_HEADER = "X-Telegram-Bot-Api-Secret-Token";
export const NEW_TRANSACTION_URL =
  "https://telegram-bot.athulp.workers.dev/newTransaction";
export const TELEGRAM_BASE_URL = "https://api.telegram.org";
export const TRANSACTION_EDIT_WEBAPP_URL = "https://example.com";

export const INLINE_KEYBOARD_MSG: InlineKeyboardMarkup = {
  inline_keyboard: [
    [
      {
        text: "Edit",
        callback_data: TRANSACTION_ACTIONS.EDIT,
        web_app: { url: TRANSACTION_EDIT_WEBAPP_URL },
      },
    ],
    [
      { text: "Add", callback_data: TRANSACTION_ACTIONS.ADD },
      { text: "Ignore", callback_data: TRANSACTION_ACTIONS.IGNORE },
    ],
  ],
};
