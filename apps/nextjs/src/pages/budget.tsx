import { useState, type ReactElement } from "react";
import Head from "next/head";
import * as icons from "@mdi/js";
import { mdiPlusThick } from "@mdi/js";

import BaseButton from "../components/common/buttons/BaseButton";
import BaseButtons from "../components/common/buttons/BaseButtons";
import CardBox from "../components/common/cards/CardBox";
import SectionMain from "../components/common/sections/SectionMain";
import SectionTitleLineWithButton from "../components/common/sections/SectionTitleLineWithButton";
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
        <SectionTitleLineWithButton
          icon={icons.mdiWallet}
          title={"Budgets"}
          main
        >
          <BaseButtons>
            <BaseButton
              icon={mdiPlusThick}
              color="contrast"
              disabled={createMode}
              label="Add new"
              onClick={() => setCreateMode(true)}
            />
          </BaseButtons>
        </SectionTitleLineWithButton>
        <CardBox className="mb-6 mt-6" hasTable>
          <BudgetTableView
            handleCreateModeCancel={() => setCreateMode(false)}
            isCreateMode={createMode}
          />
        </CardBox>
      </SectionMain>
    </>
  );
};

BudgetsPage.getLayout = function getLayout(page: ReactElement) {
  return <LayoutAuthenticated>{page}</LayoutAuthenticated>;
};

export default BudgetsPage;
