import { accountRouter } from "./router/account";
import { budgetRouter } from "./router/budget";
import { categoryRouter } from "./router/category";
import { integrationRouter } from "./router/intergration";
import { investmentRouter } from "./router/investment";
import { payeeRouter } from "./router/payee";
import { reportsRouter } from "./router/reports";
import { transactionRouter } from "./router/transaction";
import { unverifiedTransactionRouter } from "./router/unverifiedTransaction";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  transaction: transactionRouter,
  category: categoryRouter,
  account: accountRouter,
  payee: payeeRouter,
  budget: budgetRouter,
  reports: reportsRouter,
  unverifiedTransaction: unverifiedTransactionRouter,
  investment: investmentRouter,
  integration: integrationRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
