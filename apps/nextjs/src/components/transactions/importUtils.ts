import * as pdfjs from "pdfjs-dist";
import { getDocument } from "pdfjs-dist";

import {
  parseHDFCAccountStatement,
  parseHDFCCreditCardStatement,
  parseICICICreditCardStatement,
} from "@monetas/importer";

import { type AccountList } from "~/components/accounts/AccountsTableView";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
export const isStatementImportSupported = (account: AccountList[0]) => {
  switch (account.accountProvider.name) {
    case "HDFC Bank":
      return (
        account.accountType.name === "Savings Account" ||
        account.accountType.name === "Current Account" ||
        account.accountType.name === "Credit Card"
      );
    case "ICICI Bank":
      return account.accountType.name === "Credit Card";
  }
};

export const checkIfPasswordIsCorrect = async (
  file: File,
  password: string,
): Promise<boolean> => {
  const arrayBuffer = await file.arrayBuffer();
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  return new Promise(async (resolve) => {
    const pdf = getDocument({ data: arrayBuffer, password });
    pdf.onPassword = () => {
      resolve(false);
    };
    await pdf.promise;
    resolve(true);
  });
};

export const isPdfPasswordProtected = async (file: File): Promise<boolean> => {
  const arrayBuffer = await file.arrayBuffer();
  return new Promise((resolve, reject) => {
    const pdf = getDocument(arrayBuffer);
    pdf.onPassword = (_, reason: number) => {
      if (reason === 1) {
        resolve(true);
      }
    };
    pdf.promise
      .then(() => {
        resolve(false);
      })
      .catch((err: unknown) => {
        reject(err);
      });
  });
};

export const parsePDFStatement = (
  account: AccountList[0],
  file: File,
  password?: string,
) => {
  switch (account.accountProvider.name) {
    case "HDFC Bank":
      return parseHDFCCreditCardStatement(file, password);
    case "ICICI Bank":
      return parseICICICreditCardStatement(file, password);
  }
};

export const parseCSVStatement = (account: AccountList[0], file: File) => {
  switch (account.accountProvider.name) {
    case "HDFC Bank":
      return parseHDFCAccountStatement(file);
  }
};
