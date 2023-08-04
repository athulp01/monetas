import Papa from "papaparse";
import * as pdfjs from "pdfjs-dist";
import { getDocument } from "pdfjs-dist";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

type CSVRow = {
  Date: Date;
  Narration: string;
  "Debit Amount": number;
  "Credit Amount": number;
  "Chq/Ref Number": string;
  "Closing Balance": number;
};

export type ParsedTransaction = {
  timeCreated: Date;
  amount: number;
  notes: string;
  type: "CREDIT" | "DEBIT";
};

export type ParsedStatementResult = {
  transactions: ParsedTransaction[];
  errors: number;
};

const dateTimeRegex = /^(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2})/;
const dateRegex = /^(\d{2}\/\d{2}\/\d{4})/;
const amountRegexDebit = / ([0-9]+(,[0-9]+)*\.[0-9][0-9])$/;
const amountRegexCredit = / ([0-9]+(,[0-9]+)*\.[0-9][0-9]) Cr$/;

function parseDate(dateString: string) {
  const parts = dateString.split("/");
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is zero-based
  const year = parseInt(parts[2], 10); // Assuming year is between 2000-2099
  return new Date(year, month, day);
}

function parseDateTime(dateTimeString: string) {
  const parts = dateTimeString.split(" ");
  const date = parseDate(parts[0]);
  if (parts.length === 1) return date;
  const time = parts[1];
  return new Date(`${date.toDateString()} ${time}`);
}

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

export const parseHDFCCreditCardStatement = async (data: ArrayBuffer) => {
  return new Promise<ParsedStatementResult>((resolve, reject) => {
    const transactions: ParsedTransaction[] = [];
    getDocument(data).promise.then(async (doc) => {
      for (let i = 0; i < doc.numPages; ++i) {
        const page = await doc.getPage(i + 1);
        const textItems = (await page.getTextContent()).items;
        let finalString = "";
        let lineNumber = 0;
        let transactionTableStart = false;
        for (let i = 0; i < textItems.length; i++) {
          // @ts-ignore
          if (lineNumber != textItems[i].transform[5]) {
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
            // @ts-ignore
            lineNumber = textItems[i].transform[5];
          }
          // @ts-ignore
          finalString += textItems[i].str;
        }
      }
      return resolve({ transactions, errors: 0 });
    });
  });
};

export const parseHDFCAccountStatement = async (file: File) => {
  return new Promise<ParsedStatementResult>((resolve, reject) => {
    const transactions: ParsedTransaction[] = [];
    let errors = 0;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      step: (result) => {
        if (result.error?.length > 0) {
          errors += 1;
          console.error(result.error);
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
          return parseDate(value.trim()).toISOString();
        }
        return value;
      },
      transformHeader: (header: string) => {
        return header.trim();
      },
    });
  });
};
