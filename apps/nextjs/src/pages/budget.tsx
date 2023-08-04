import { useState, type ReactElement } from "react";
import Head from "next/head";

import CardBox from "../components/common/cards/CardBox";
import SectionMain from "../components/common/sections/SectionMain";
import LayoutAuthenticated from "../components/layout";
import { getPageTitle } from "../config/config";
import "flowbite";
import BudgetTableView from "../components/budget/BudgetTableView";

const BudgetsPage = () => {
  const [createMode, setCreateMode] = useState(false);

  return (
    <>
      <Head>
        <title>{getPageTitle("Budgets")}</title>
      </Head>
      <SectionMain>
        <CardBox hasTable>
          <BudgetTableView />
        </CardBox>
      </SectionMain>
    </>
  );
};

BudgetsPage.getLayout = function getLayout(page: ReactElement) {
  return <LayoutAuthenticated>{page}</LayoutAuthenticated>;
};

export default BudgetsPage;
