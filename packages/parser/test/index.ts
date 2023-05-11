import test from "ava";
import { getTransactionInfo } from "../src/engine";

var fs = require("fs");

test("HDFC credit card debit", (t) => {
  const emailBody = fs.readFileSync("./test/data/HDFC/CC_DEBIT.txt", "utf8");
  const transaction = getTransactionInfo(emailBody);
  console.log(transaction);
  t.assert(transaction.amount == Math.round(311.96));
  t.assert(transaction.type === "DEBIT");
  t.assert(transaction.sourceAccount.number === "1234");
  t.assert(transaction.payee === "Example Retail Conc");
});

test("HDFC debit card debit", (t) => {
  const emailBody = fs.readFileSync("./test/data/HDFC/DC_DEBIT.txt", "utf8");
  const transaction = getTransactionInfo(emailBody);
  console.log(transaction);
  t.assert(transaction.amount == Math.round(100.0));
  t.assert(transaction.type === "DEBIT");
  t.assert(transaction.sourceAccount.number === "1234");
  t.assert(transaction.payee === "ABC*RETAIL MALL ABCD");
});

test.only("HDFC UPI debit", (t) => {
  const emailBody = fs.readFileSync("./test/data/HDFC/UPI_DEBIT.txt", "utf8");
  const transaction = getTransactionInfo(emailBody);
  console.log(transaction);
  t.assert(transaction.amount == Math.round(210.0));
  t.assert(transaction.type === "DEBIT");
  t.assert(transaction.sourceAccount.number === "1234");
  t.assert(transaction.payee === "proteins.eazypay@icici");
});

test("AXIS CC debit", (t) => {
  const emailBody = fs.readFileSync("./test/data/AXIS/CC_DEBIT.txt", "utf8");
  const transaction = getTransactionInfo(emailBody);
  console.log(transaction);
  t.assert(transaction.amount == Math.round(251.0));
  t.assert(transaction.type === "DEBIT");
  t.assert(transaction.sourceAccount.number === "1234");
  t.assert(transaction.payee === "SWIGGY");
});

test("ICICI CC debit", (t) => {
  const emailBody = fs.readFileSync("./test/data/ICICI/CC_DEBIT.txt", "utf8");
  const transaction = getTransactionInfo(emailBody);
  console.log(transaction);
  t.assert(transaction.amount == Math.round(299.0));
  t.assert(transaction.type === "DEBIT");
  t.assert(transaction.sourceAccount.number === "1234");
  t.assert(transaction.payee === "Amazon");
});
