import { useState, type ReactElement } from "react";
import Head from "next/head";

import CardBox from "../components/common/cards/CardBox";
import SectionMain from "../components/common/sections/SectionMain";
import LayoutAuthenticated from "../components/layout";
import TransactionsTableView from "../components/transactions/TransactionsTableView";
import { getPageTitle } from "../config/config";
import "flowbite";
import ImportTableView from "~/components/transactions/ImportTableView";
import UnverifiedTransactionsTableView from "../components/transactions/UnverifiedTransactionsTableView";

enum Mode {
  Review,
  Import,
  Create,
  View,
}
const TransactionsPage = () => {
  const [mode, setMode] = useState<Mode>(Mode.View);
  // const unverifiedTranstotalCountQuery =
  //   api.unverifiedTransaction.getUnverifiedTransactionCount.useQuery();

  const handleSave = () => {
    setMode(Mode.View);
  };

  return (
    <>
      <Head>
        <title>{getPageTitle("Transactions")}</title>
      </Head>
      <SectionMain>
        <CardBox hasTable>
          {mode === Mode.Review && (
            <UnverifiedTransactionsTableView></UnverifiedTransactionsTableView>
          )}
          {(mode === Mode.View || mode === Mode.Create) && (
            <TransactionsTableView />
          )}
          {mode === Mode.Import && (
            <ImportTableView handleSave={handleSave}></ImportTableView>
          )}
        </CardBox>
      </SectionMain>
    </>
  );
};

// const getTitle = (mode: Mode) => {
//   switch (mode) {
//     case Mode.Review:
//       return "Review Transactions";
//     case Mode.Import:
//       return "Import Transactions";
//     case Mode.View:
//     case Mode.Create:
//       return "Transactions";
//   }
// };

TransactionsPage.getLayout = function getLayout(page: ReactElement) {
  return <LayoutAuthenticated>{page}</LayoutAuthenticated>;
};

export default TransactionsPage;
