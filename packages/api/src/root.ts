import { accountRouter } from "./router/accountsRouter";
import { budgetRouter } from "./router/budgetsRouter";
import { categoryRouter } from "./router/categoriesRouter";
import { integrationRouter } from "./router/integrationsRouter";
import { investmentRouter } from "./router/investmentsRouter";
import { payeeRouter } from "./router/payeesRouter";
import { reportsRouter } from "./router/reportsRouter";
import { transactionRouter } from "./router/transactionsRouter";
import { unverifiedTransactionRouter } from "./router/unverifiedTransactionsRouter";
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
