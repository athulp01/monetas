import * as pdfjs from "pdfjs-dist";
import { getDocument } from "pdfjs-dist";
import { type TextItem } from "pdfjs-dist/types/src/display/api";

import { parseDate } from "../helpers";
import { type ParsedStatementResult, type ParsedTransaction } from "../types";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const dateTimeRegex = /^(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2})/;
const dateRegex = /^(\d{2}\/\d{2}\/\d{4})/;
const amountRegexDebit = / ([0-9]+(,[0-9]+)*\.[0-9][0-9])$/;
const amountRegexCredit = / ([0-9]+(,[0-9]+)*\.[0-9][0-9]) CR$/;

const parseCCStatementLine = (lastLine: string): ParsedTransaction => {
  const transactionDateStringMatch =
    lastLine.match(dateTimeRegex) ?? lastLine.match(dateRegex);
  if (transactionDateStringMatch) {
    const remainingString = lastLine.substring(
      transactionDateStringMatch[0].length,
      lastLine.length,
    );
    const transactionDate = parseDate(transactionDateStringMatch[0], true);
    const transactionAmountMatch =
      remainingString.match(amountRegexDebit) ??
      remainingString.match(amountRegexCredit);
    if (transactionAmountMatch) {
      const transactionDescription = remainingString
        .substring(0, remainingString.length - transactionAmountMatch[0].length)
        .trim();
      const transactionType = transactionAmountMatch[0].includes("CR")
        ? "CREDIT"
        : "DEBIT";
      const transactionAmount = parseInt(
        transactionAmountMatch[0]
          .replaceAll("CR", "")
          .trim()
          .replaceAll(",", ""),
      );
      return {
        timeCreated: transactionDate,
        amount: transactionAmount,
        notes: transactionDescription,
        type: transactionType,
      };
    }
  }
  return null;
};

export const parseICICICreditCardStatement = async (
  data: File,
  password?: string,
) => {
  const arrayBuffer = await data.arrayBuffer();
  return new Promise<ParsedStatementResult>((resolve) => {
    const transactions: ParsedTransaction[] = [];
    void getDocument({ data: arrayBuffer, password: password }).promise.then(
      async (doc) => {
        for (let i = 0; i < doc.numPages; ++i) {
          const page = await doc.getPage(i + 1);
          const textItems = (await page.getTextContent()).items;
          let finalString = "";
          let lineNumber = 0;
          let transactionTableStart = false;
          for (let i = 0; i < textItems.length; i++) {
            const textItem = textItems[i] as TextItem;
            if ("transform" in textItem) {
              if (lineNumber != textItem.transform[5]) {
                if (lineNumber != 0) {
                  if (transactionTableStart) {
                    const transaction = parseCCStatementLine(finalString);
                    transaction && transactions.push(transaction);
                  } else {
                    if (finalString.includes("CREDIT SUMMARY")) {
                      transactionTableStart = true;
                    }
                  }
                  finalString = "";
                }
                lineNumber = textItem.transform[5] as number;
              }
              finalString += textItem.str;
            }
          }
        }
        return resolve({ transactions, errors: 0 });
      },
    );
  });
};
