/* eslint-disable @typescript-eslint/restrict-template-expressions */
import {type InlineKeyboardMarkup, type SendMessageOptions} from 'node-telegram-bot-api'
import {type TelegramMethod, TRANSACTION_ACTIONS} from '~/types/telegram'
import * as process from 'process'

export const TELEGRAM_SECRET_HEADER = 'X-Telegram-Bot-Api-Secret-Token'
export const TELEGRAM_BASE_URL = 'https://api.telegram.org'

export const getInlineKeyboardMsg = (transactionId: string): InlineKeyboardMarkup => {
  return {
    inline_keyboard: [
      [
        {
          text: 'Review',
          web_app: {
            url: `${process.env.TELEGRAM_WEBAPP_URL}/telegram/unverified/${transactionId}`,
          },
        },
        { text: 'Ignore', callback_data: TRANSACTION_ACTIONS.IGNORE },
      ],
    ],
  }
}

export const callTelegramAPI = async (
  method: TelegramMethod,
  params?: object
): Promise<Response> => {
  const url = `${TELEGRAM_BASE_URL}/bot${process.env.TELEGRAM_API_KEY}/${method}`
  console.log(`Calling ${url} with params - ${JSON.stringify(params)}`)
  return fetch(url, {
    body: params ? JSON.stringify(params) : undefined,
    method: 'POST',
    headers: new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }),
  })
}

export const sendTransactionMessage = (message: string, unverifiedTransactionId?: string) => {
  if (unverifiedTransactionId) {
    const params: SendMessageOptions = {
      reply_markup: getInlineKeyboardMsg(unverifiedTransactionId),
    }
    return callTelegramAPI('sendMessage', {
      text: message,
      chat_id: process.env.TELEGRAM_CHAT_ID,
      ...params,
    })
  } else {
    return callTelegramAPI('sendMessage', {
      text: message,
      chat_id: process.env.TELEGRAM_CHAT_ID,
    })
  }
}
