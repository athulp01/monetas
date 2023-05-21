import * as fs from "fs";
import { Configuration, OpenAIApi } from "openai";

const csv = require("csv-parser");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const test = async (description) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `
        You are a intelligent machine who is capable of categorising bank transactions. There are pre defined categories each having an id and a name in json format.
   [
  {
    "name": "Salary",
    "icon": "briefcase",
    "id": "f92b55b2-48f8-4021-96ab-e13a2a7fff60",
    "type": "CREDIT"
  },
  {
  "name": "Dividend",
  "icon": "briefcase",
  "id": "b3210507-f007-44c2-a045-9619fcd6fbc7",
  "type": "CREDIT"
  },
  {
    "name": "Interest",
    "icon": "briefcase",
    "id": "4487ebf6-9da0-4d70-a2a0-36ce06cc7ddf",
    "type": "CREDIT"
  },
  {
  "name": "Reimbursement",
  "icon": "briefcase",
  "id": "dbe894c3-f0a6-4cd6-9253-0727e5de66fb",
  "type": "CREDIT"
  },
  {
    "name": "Repayment",
    "icon": "briefcase",
    "id": "dbe894c3-f0a6-4cd6-9253-0727e5de66fb",
    "type": "CREDIT"
  },
  {
    "name": "Refund",
    "icon": "briefcase",
    "id": "4e0cefcc-2752-4f3c-af7c-c632376a021d",
    "type": "CREDIT"
  },
  {
    "name": "Vacation",
    "icon": "beach",
    "id": "91c18e01-ddf5-487e-9027-0e06fb71b635",
    "type": "DEBIT"
  },
  {
    "name": "Hotel",
    "icon": "bed",
    "id": "a69ed596-b398-4b5d-ab4e-89bd7e4764fb",
    "type": "DEBIT"
  },
  {
    "name": "Vehicle Maintenance",
    "icon": "road-variant",
    "id": "95fcd3c6-8c6c-490a-9c59-68ffe7fb2663",
    "type": "DEBIT"
  },
  {
    "name": "Insurance",
    "icon": "shield-half-full",
    "id": "891eb00f-e06f-4639-a73b-93fee36568ff",
    "type": "DEBIT"
  },
  {
    "name": "Grooming",
    "icon": "hair-dryer",
    "id": "0b247546-b772-489c-8314-3c8091e0036c",
    "type": "DEBIT"
  },
  {
    "name": "Food",
    "icon": "food-fork-drink",
    "id": "b0226a05-c25f-4e93-bd31-983357e3256a",
    "type": "DEBIT"
  },
  {
    "name": "Household",
    "icon": "home",
    "id": "3eed5a10-c928-4948-a219-7328252abc73",
    "type": "DEBIT"
  },
  {
    "name": "Grocery",
    "icon": "cart",
    "id": "9fe23aca-89d8-4541-b3b0-07159b2d157f",
    "type": "DEBIT"
  },
  {
    "name": "Electronics",
    "icon": "monitor-cellphone",
    "id": "0864e28c-8eac-44a9-87c4-342b11ad0701",
    "type": "DEBIT"
  },
  {
    "name": "Fuel",
    "icon": "gas-station",
    "id": "9f9b204b-7135-4440-a654-038b2a330661",
    "type": "DEBIT"
  },
  {
    "name": "Travel",
    "icon": "train-car",
    "id": "d1d5836f-5ba0-4061-8285-3813986e8b46",
    "type": "DEBIT"
  },
  {
    "name": "Apparel",
    "icon": "hanger",
    "id": "2736b7fe-3f9c-4bc4-9b11-66a2be08a16f",
    "type": "DEBIT"
  },
  {
    "name": "Hospital",
    "icon": "hospital-building",
    "id": "f8acb13a-dce0-40c8-b95f-dc9e4ba01e2a",
    "type": "DEBIT"
  },
  {
    "name": "Others",
    "icon": "basket",
    "id": "87aa95e5-4627-4784-9295-7dba27cf52b1",
    "type": "DEBIT"
  },
  {
    "name": "Entertainment",
    "icon": "party-popper",
    "id": "dca09b52-1c7e-404c-be75-4212323abc0c",
    "type": "DEBIT"
  },
  {
    "name": "Bills",
    "icon": "receipt-text-outline",
    "id": "2f86a506-45be-4ec5-aab6-7dd48c8380e4",
    "type": "DEBIT"
  },
  {
    "name": "Mobile & Internet",
    "icon": "receipt-text-outline",
    "id": "c56ed67d-9feb-416a-b69b-dbc3fa6ce4d2",
    "type": "DEBIT"
  },
  {
    "name": "Rent",
    "icon": "receipt-text-outline",
    "id": "02e04b9f-f6b5-4ff2-a2f5-5ddc9bfbd15c",
    "type": "DEBIT"
  },
  {
    "name": "Gift",
    "icon": "receipt-text-outline",
    "id": "4c9f9cb3-6400-4a9a-83bb-f42c7dd04b72",
    "type": "DEBIT"
  },
  {
    "name": "Gym",
    "icon": "receipt-text-outline",
    "id": "915f72c3-1b6c-4a8c-bf45-edb65d0bc9d5",
    "type": "DEBIT"
  },
  {
    "name": "Tuition",
    "icon": "receipt-text-outline",
    "id": "4b7cd729-544b-41f3-8bc2-b3b700d5dc68",
    "type": "DEBIT"
  },
  {
    "name": "Investment",
    "icon": "receipt-text-outline",
    "id": "9ca275e5-77a1-4b6e-a0c5-f587a286c24d",
    "type": "DEBIT"
  },
  {
    "name": "Electricity",
    "icon": "receipt-text-outline",
    "id": "f9178445-b0a0-4d2d-bdfe-b7cfc155cbc9",
    "type": "DEBIT"
  },
  {
    "name": "Lending",
    "icon": "receipt-text-outline",
    "id": "36474b34-d0e7-40fd-b2a5-91cb14a65f4b",
    "type": "DEBIT"
  },
  {
    "name": "Home Construction",
    "icon": "receipt-text-outline",
    "id": "bd0193cc-b182-42e4-8ca1-064828fc3d99",
    "type": "DEBIT"
  }
]
You should now only reply with category name and id of the transaction in json format. Category should not be transfer`,
      },
      {
        role: "user",
        content: description,
      },
    ],
  });
  // @ts-ignore
  console.log(completion?.data?.choices[0]?.message?.content);
  try {
    const out = JSON.parse(completion?.data?.choices[0]?.message?.content);
    return out?.id;
  } catch (e) {
    return null;
  }
};

function parseDate(dateString) {
  const parts = dateString.split("/");
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is zero-based
  const year = 2000 + parseInt(parts[2], 10); // Assuming year is between 2000-2099
  return new Date(year, month, day);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const results = [];
const readCSV = async () => {
  fs.createReadStream("src/data/50100430588509_1684402797274.csv")
    .pipe(csv())
    .on("data", async (data) => {
      const debitAmount = parseInt(data["Debit Amount"]?.toString()?.trim());
      const creditAmount = parseInt(data["Credit Amount"]?.toString()?.trim());

      const type = debitAmount > 0 ? "DEBIT" : "CREDIT";
      const trans = {
        timeCreated: parseDate(data[" Date"].toString().trim()).toISOString(),
        amount: debitAmount > 0 ? debitAmount : creditAmount,
        description: data["Narration"].toString().trim(),
        type: type,
        closingBalance: parseInt(data["Closing Balance"].toString().trim()),
        category: "",
      };
      results.push(trans);
    })
    .on("end", () => {
      processAPI();
    });
};

const processAPI = async () => {
  for (const trans of results) {
    console.log(`Processing ${trans.description}`);
    trans.category =
      (await test(trans.description)) ?? "87aa95e5-4627-4784-9295-7dba27cf52b1";
    console.log(trans);
    await sleep(30000);
  }
  const json = JSON.stringify(results, null, 3);
  fs.writeFile("file.json", json, "utf8", (err) => {
    if (err) {
      console.error("Error writing JSON file:", err);
    } else {
      console.log("CSV file successfully converted to JSON.");
    }
  });
};
readCSV();
