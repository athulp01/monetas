import Papa from "papaparse";

import { type Prisma } from "@monetas/db";

type CSVRow = {
  Date: Date;
  Narration: string;
  "Debit Amount": number;
  "Credit Amount": number;
  "Chq/Ref Number": string;
  "Closing Balance": number;
};

export type ParsedHDFCStatementResult = {
  transactions: Prisma.TransactionCreateInput[];
  errors: number;
};
function parseDate(dateString: string) {
  const parts = dateString.split("/");
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is zero-based
  const year = 2000 + parseInt(parts[2], 10); // Assuming year is between 2000-2099
  return new Date(year, month, day);
}

export const parseHDFCStatement = async (file: File) => {
  return new Promise<ParsedHDFCStatementResult>((resolve, reject) => {
    const transactions: Prisma.TransactionCreateInput[] = [];
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
              sourceAccount: null,
              category: null,
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
