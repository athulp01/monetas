import * as fs from "fs";

import { Prisma, prisma } from "@monetas/db";

const csv = require("csv-parser");

function parseDate(dateString) {
  const parts = dateString.split("/");
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is zero-based
  const year = 2000 + parseInt(parts[2], 10); // Assuming year is between 2000-2099
  return new Date(year, month, day);
}

let results: Prisma.AccountBalanceHistoryCreateManyInput[] = [];
const readCSV = async () => {
  fs.createReadStream("src/data/50100430588509_1684402750293.csv")
    .pipe(csv())
    .on("data", async (data) => {
      const debitAmount = parseInt(data["Debit Amount"]?.toString()?.trim());
      const creditAmount = parseInt(data["Credit Amount"]?.toString()?.trim());
      console.log(data["Closing Balance"]?.toString()?.trim());
      const balance = parseInt(data["Closing Balance"]?.toString()?.trim());

      const log: Prisma.AccountBalanceHistoryCreateManyInput = {
        date: parseDate(data[" Date"].toString().trim()).toISOString(),
        balance: balance,
        accountId: "8cbc0085-319b-479e-874a-c05e97f0114e",
        userId: "user_2PWFBOkCpkZcoDaByZOZma39nra",
      };
      results.push(log);
    })
    .on("end", async () => {
      await prisma.accountBalanceHistory.createMany({ data: results });
      console.log("CSV file successfully processed");
    });
};

// const processAPI = async () => {
//   for (const trans of results) {
//     console.log(`Processing ${trans.description}`);
//     trans.category =
//       (await test(trans.description)) ?? "87aa95e5-4627-4784-9295-7dba27cf52b1";
//     console.log(trans);
//     await sleep(30000);
//   }
//   const json = JSON.stringify(results, null, 3);
//   fs.writeFile("file.json", json, "utf8", (err) => {
//     if (err) {
//       console.error("Error writing JSON file:", err);
//     } else {
//       console.log("CSV file successfully converted to JSON.");
//     }
//   });
// };
readCSV();
