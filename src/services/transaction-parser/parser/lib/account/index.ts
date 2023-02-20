import { combinedWords, wallets } from '../constants';
import { IAccountInfo, IAccountType, TMessageType } from '../interface';
import {
  extractBondedAccountNo,
  getProcessedMessage,
  trimLeadingAndTrailingChars,
} from '../utils';

const getCard = (message: string[]): IAccountInfo => {
  let combinedCardName = '';
  let isCreditCard = true;
  const cardIndex = message.findIndex((word) =>
    combinedWords // Any combined word of card type
      .filter(
        (w) =>
          w.type === IAccountType.CREDIT_CARD ||
          w.type === IAccountType.DEBIT_CARD
      )
      .some((w) => {
        if (w.word === word) {
          combinedCardName = w.word;
          isCreditCard = w.type === IAccountType.CREDIT_CARD;
          return true;
        }
        return false;
      })
  );
  const card: IAccountInfo = { type: null, name: null, number: null };

  // Search for "card" and if not found return empty obj
  if (cardIndex !== -1) {
    card.number = message[cardIndex + 1];
    card.type = isCreditCard
      ? IAccountType.CREDIT_CARD
      : IAccountType.DEBIT_CARD;

    // If the data is false positive
    // return empty obj
    // Else return the card info
    if (Number.isNaN(Number(card.number))) {
      return {
        type: combinedCardName ? card.type : null,
        name: combinedCardName,
        number: null,
      };
    }
    return card;
  }
  return { type: null, name: null, number: null };
};

const getAccount = (message: TMessageType): IAccountInfo => {
  const processedMessage = getProcessedMessage(message);
  let account: IAccountInfo = {
    type: null,
    name: null,
    number: null,
  };

  account = getCard(processedMessage);

  if (!account.type) {
    // eslint-disable-next-line no-restricted-syntax
    for (const [index, word] of processedMessage.entries()) {
      if (word === 'ac') {
        if (index + 1 < processedMessage.length) {
          const accountNo = trimLeadingAndTrailingChars(
            processedMessage[index + 1]
          );

          if (Number.isNaN(Number(accountNo))) {
            // continue searching for a valid account number
            // eslint-disable-next-line no-continue
            continue;
          } else {
            account.type = IAccountType.ACCOUNT;
            account.number = accountNo;
            break;
          }
        } else {
          // continue searching for a valid account number
          // eslint-disable-next-line no-continue
          continue;
        }
      } else if (word.includes('ac')) {
        const extractedAccountNo = extractBondedAccountNo(word);

        if (extractedAccountNo === '') {
          // eslint-disable-next-line no-continue
          continue;
        } else {
          account.type = IAccountType.ACCOUNT;
          account.number = extractedAccountNo;
          break;
        }
      }
    }
  }
  // Check for wallets
  if (!account.type) {
    const wallet = processedMessage.find((word) => {
      return wallets.includes(word);
    });
    if (wallet) {
      account.type = IAccountType.WALLET;
      account.name = wallet;
    }
  }

  // Check for special accounts
  if (!account.type) {
    const specialAccount = combinedWords
      .filter((word) => word.type === IAccountType.ACCOUNT)
      .find((w) => {
        return processedMessage.includes(w.word);
      });
    account.type = specialAccount?.type;
    account.name = specialAccount?.word;
  }

  // Extract last 4 digits of account number
  // E.g. 4334XXXXX4334
  if (account.number && account.number.length > 4) {
    account.number = account.number.slice(-4);
  }

  return account;
};

export default getAccount;
