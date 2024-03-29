import * as process from "process";
import {
  type InlineKeyboardMarkup,
  type SendMessageOptions,
} from "node-telegram-bot-api";

import { TRANSACTION_ACTIONS, type TelegramMethod } from "~/types/telegram";

export const TELEGRAM_SECRET_HEADER = "x-telegram-bot-api-secret-token";
export const TELEGRAM_BASE_URL = "https://api.telegram.org";

export const getInlineKeyboardMsg = (
  transactionId: string,
): InlineKeyboardMarkup => {
  return {
    inline_keyboard: [
      [
        {
          text: "Review",
          web_app: {
            url: `${process.env.BASE_URL}/telegram/unverified/${transactionId}`,
          },
        },
        { text: "Ignore", callback_data: TRANSACTION_ACTIONS.IGNORE },
      ],
    ],
  };
};

export const callTelegramAPI = async (
  method: TelegramMethod,
  params?: object,
): Promise<Response> => {
  const url = `${TELEGRAM_BASE_URL}/bot${process.env.TELEGRAM_API_KEY}/${method}`;
  console.log(`Calling ${url} with params - ${JSON.stringify(params)}`);
  return fetch(url, {
    body: params ? JSON.stringify(params) : undefined,
    method: "POST",
    headers: new Headers({
      Accept: "application/json",
      "Content-Type": "application/json",
    }),
  });
};

export const sendTransactionMessage = (
  message: string,
  chatId: string,
  unverifiedTransactionId?: string,
) => {
  if (unverifiedTransactionId) {
    const params: SendMessageOptions = {
      reply_markup: getInlineKeyboardMsg(unverifiedTransactionId),
    };
    return callTelegramAPI("sendMessage", {
      text: message,
      chat_id: chatId,
      ...params,
    });
  } else {
    return callTelegramAPI("sendMessage", {
      text: message,
      chat_id: chatId,
    });
  }
};
