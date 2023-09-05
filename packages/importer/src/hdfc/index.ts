import { parse } from "papaparse";
import * as pdfjs from "pdfjs-dist";
import { getDocument } from "pdfjs-dist";
import { type TextItem } from "pdfjs-dist/types/src/display/api";

import { parseDate, parseDateTime } from "../helpers";
import { type ParsedStatementResult, type ParsedTransaction } from "../types";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

type CSVRow = {
  Date: Date;
  Narration: string;
  "Debit Amount": number;
  "Credit Amount": number;
  "Chq/Ref Number": string;
  "Closing Balance": number;
};

const dateTimeRegex = /^(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2})/;
const dateRegex = /^(\d{2}\/\d{2}\/\d{4})/;
const amountRegexDebit = / ([0-9]+(,[0-9]+)*\.[0-9][0-9])$/;
const amountRegexCredit = / ([0-9]+(,[0-9]+)*\.[0-9][0-9]) Cr$/;

const parseCCStatementLine = (lastLine: string): ParsedTransaction => {
  const transactionDateStringMatch =
    lastLine.match(dateTimeRegex) ?? lastLine.match(dateRegex);
  if (transactionDateStringMatch) {
    const remainingString = lastLine.substring(
      transactionDateStringMatch[0].length,
      lastLine.length,
    );
    const transactionDate = parseDateTime(transactionDateStringMatch[0]);
    const transactionAmountMatch =
      remainingString.match(amountRegexDebit) ??
      remainingString.match(amountRegexCredit);
    if (transactionAmountMatch) {
      const transactionDescription = remainingString
        .substring(0, remainingString.length - transactionAmountMatch[0].length)
        .trim();
      const transactionType = transactionAmountMatch[0].includes("Cr")
        ? "CREDIT"
        : "DEBIT";
      const transactionAmount = parseInt(
        transactionAmountMatch[0]
          .replaceAll("Cr", "")
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

export const parseHDFCCreditCardStatement = async (
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
              if (
                "transform" in textItems[i] &&
                lineNumber != textItem.transform[5]
              ) {
                if (lineNumber != 0) {
                  if (transactionTableStart) {
                    const transaction = parseCCStatementLine(finalString);
                    transaction && transactions.push(transaction);
                  } else {
                    if (finalString.includes("Domestic Transactions")) {
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

export const parseHDFCAccountStatement = async (file: File) => {
  return new Promise<ParsedStatementResult>((resolve, reject) => {
    const transactions: ParsedTransaction[] = [];
    let errors = 0;
    parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      step: (result) => {
        if (result.errors?.length > 0) {
          errors += 1;
          console.error(result.errors);
          return;
        }
        const row = result.data as CSVRow;
        if (row) {
          console.log(row);
          if (row["Debit Amount"] || row["Credit Amount"]) {
            transactions.push({
              timeCreated: row.Date,
              amount: row["Debit Amount"] || row["Credit Amount"],
              notes: row.Narration,
              type: row["Debit Amount"] ? "DEBIT" : "CREDIT",
            });
          }
        }
      },
      complete: function (results, file) {
        console.log("Parsing complete:", results, file);
        resolve({ transactions, errors });
      },
      error: function (error, file) {
        console.log("Parsing error:", error, file);
        reject(error.message);
      },
      transform: (value: string, header: string) => {
        if (header.trim() === "Date" && value) {
          return parseDate(value.trim(), true).toISOString();
        }
        return value;
      },
      transformHeader: (header: string) => {
        return header.trim();
      },
    });
  });
};
