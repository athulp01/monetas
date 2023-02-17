import getAccount from "./lib/account";
import getBalance from "./lib/balance";
import { getTransactionInfo } from "./lib/engine";

export * from "./lib/interface";
export * from "./lib/engine";
export const getAccountInfo = getAccount;
export const getBalanceInfo = getBalance;

const email = `
Dear Card Member,

Thank you for using your HDFC Bank Credit Card ending 1234 for Rs 646.00 at MSW*NANDHANA FOODS PVT on 03-02-2023 19:57:20.

After the above transaction, the available balance on your card is Rs 296028.00 and the total outstanding is Rs 3972.00.

For more details on this transaction please visit HDFC Bank MyCards.

If you have not done this transaction, please immediately call on 18002586161 to report this transaction.

Explore HDFC Bank MyCards: your one stop platform to manage Credit Card ON THE GO.

One view access to Card summary, transactions, reward points, e statement and much more.

Save it on your phone now: Visit mycards.hdfcbank.com

Regards 
`;
console.log(getTransactionInfo(email));
