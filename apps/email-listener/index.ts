import { type IncomingTransaction, getTransactionInfo } from "@monetas/parser";
import {type EmailMessage } from "@cloudflare/workers-types"

// eslint-disable-next-line @typescript-eslint/no-var-requires,@typescript-eslint/no-unsafe-assignment
const PostalMime = require("postal-mime");

async function streamToArrayBuffer(stream: ReadableStream, streamSize: number) {
  const result = new Uint8Array(streamSize);
  let bytesRead = 0;
  const reader = stream.getReader();
  while (true) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    result.set(value, bytesRead);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    bytesRead += value.length;
  }
  return result;
}

export default {
  async email(message: EmailMessage, env: any) {
    // if (message.from !== env.SOURCE_EMAIL) {
    console.log(message.from, message.to);
    const rawEmail = await streamToArrayBuffer(message.raw, message.rawSize);
    const parser = new PostalMime.default();
    let parsedEmail: string = ((await parser.parse(rawEmail)).html as string)
      .replace(/<head>[\s\S]*?<\/head>/gi, "")
      .replace(/(<([^>]+)>)/gi, "")
      .toLowerCase();
    const salutationRegex = /Dear/i;
    const closingRegex = /(Sincerely|Regards)/i;

    const salutationMatch = parsedEmail.match(salutationRegex);
    const closingMatch = parsedEmail.match(closingRegex);

    if (salutationMatch?.index && closingMatch?.index) {
      const startIndex = salutationMatch.index + salutationMatch[0].length;
      const endIndex = closingMatch.index;
      parsedEmail = parsedEmail.substring(startIndex, endIndex).trim();
    }
    console.log(`New email: ${parsedEmail}`);
    const transaction: IncomingTransaction = getTransactionInfo(parsedEmail);
    console.log(`New transaction detected: ${JSON.stringify(transaction)}`);
    const response = await fetch(
      "http://monetas-app.vercel.app/api/transaction/unverified",
      {
        method: "POST",
        body: JSON.stringify(transaction),
        headers: new Headers({
          Accept: "application/json",
          "Content-Type": "application/json",
        }),
      }
    );
    console.log(JSON.stringify(response));
    message.forward(env.FORWARD_EMAIL);
    // } else {
    // message.setReject("UNAUTH");
    // }
  },
};
