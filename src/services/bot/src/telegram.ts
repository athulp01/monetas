import { SendMessageOptions } from "node-telegram-bot-api";
import { ITransactionInfo } from "transaction-email-parser";
import { INLINE_KEYBOARD_MSG, TELEGRAM_BASE_URL } from "./constants";
import { Env, TelegramMethod } from "./types";

export const callTelegramAPI = async (
  env: Env,
  method: TelegramMethod,
  params?: Object
): Promise<Response> => {
  const url = `${TELEGRAM_BASE_URL}/bot${env.API_KEY}/${method}`;
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
  env: Env,
  transaction: ITransactionInfo
) => {
  const text = `New transaction detected💰\nAmount: ${transaction.transactionAmount} ₹\nType: ${transaction.transactionType}\nAccount type: ${transaction.account.type}\nAccount number: ${transaction.account.number}`;
  const params: SendMessageOptions = {
    reply_markup: INLINE_KEYBOARD_MSG,
  };
  return callTelegramAPI(env, "sendMessage", {
    text,
    chat_id: env.CHAT_ID,
    ...params,
  });
};
