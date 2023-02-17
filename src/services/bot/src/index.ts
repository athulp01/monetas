import { ITransactionInfo } from "transaction-email-parser";
import { NEW_TRANSACTION_URL, TELEGRAM_SECRET_HEADER } from "./constants";
import { sendTransactionMessage } from "./telegram";
import { Env } from "./types";

async function handleTransaction(transaction: ITransactionInfo, env: Env) {
  const response = await sendTransactionMessage(env, transaction);
  console.log(JSON.stringify(response));
  return new Response(null, { status: 200 });
}

export function authorizeRequestFromTG(request: Request, env: Env) {
  if (request.headers.get(TELEGRAM_SECRET_HEADER) !== env.SECRET_TOKEN) {
    return new Response("Unauthorized", { status: 403 });
  }
}

export default {
  async fetch(request: Request, env: Env) {
    console.log(`Request received: ${request.url}`);
    const body = await request.json();
    console.log(`Body: ${JSON.stringify(body)}`);
    if (request.url === NEW_TRANSACTION_URL) {
      const transaction: ITransactionInfo = body as ITransactionInfo;
      console.log(`New transaction detected ${transaction}`);
      return handleTransaction(transaction, env);
    }
    console.log(`No matching route`);
    return new Response(null, { status: 404 });
  },
};
