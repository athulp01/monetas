import { createTRPCRouter } from "./trpc";
import { transactionRouter } from "./router/transaction";
import { categoryRouter } from "./router/category";
import { accountRouter } from "./router/account";
import { payeeRouter } from "./router/payee";
import { budgetRouter } from "./router/budget";
import { reportsRouter } from "./router/reports";
import { unverifiedTransactionRouter } from "./router/unverifiedTransaction";
import { investmentRouter } from "./router/investment";

export const appRouter = createTRPCRouter({
  transaction: transactionRouter,
  category: categoryRouter,
  account: accountRouter,
  payee: payeeRouter,
  budget: budgetRouter,
  reports: reportsRouter,
  unverifiedTransaction: unverifiedTransactionRouter,
  investment: investmentRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
