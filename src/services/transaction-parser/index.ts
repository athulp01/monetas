const PostalMime = require("postal-mime");
import { getTransactionInfo, ITransactionInfo } from "./parser/index";

async function streamToArrayBuffer(stream: ReadableStream, streamSize: number) {
  let result = new Uint8Array(streamSize);
  let bytesRead = 0;
  const reader = stream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    result.set(value, bytesRead);
    bytesRead += value.length;
  }
  return result;
}

export default {
  async email(message: EmailMessage, env: any) {
    if (message.from !== env.SOURCE_EMAIL) {
      const rawEmail = await streamToArrayBuffer(message.raw, message.rawSize);
      const parser = new PostalMime.default();
      const parsedEmail = await parser.parse(rawEmail);
      console.log(`New email: ${parsedEmail.html}`);
      const transaction: ITransactionInfo = getTransactionInfo(
        parsedEmail.html
      );
      console.log(`New transaction detected: ${JSON.stringify(transaction)}`);
      const request = new Request(
        "https://telegram-bot.athulp.workers.dev/newTransaction",
        {
          method: "POST",
          body: JSON.stringify(transaction),
          headers: new Headers({
            Accept: "application/json",
            "Content-Type": "application/json",
          }),
        }
      );
      await env.TelegramBot.fetch(request);
      message.forward(env.FORWARD_EMAIL);
    } else {
      message.setReject("UNAUTH");
    }
  },
};
