export type Env = {
  API_KEY: string;
  CHAT_ID: string;
  SECRET_TOKEN: string;
};

export type TelegramMethod = "sendMessage";

export enum TRANSACTION_ACTIONS {
  EDIT = "edit",
  ADD = "add",
  IGNORE = "ignore",
}
