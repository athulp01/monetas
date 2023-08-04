import React, { type ReactElement } from "react";
import Head from "next/head";
import {
  mdiAccountCash,
  mdiBankTransferIn,
  mdiBankTransferOut,
  mdiChartPie,
} from "@mdi/js";
import moment from "moment";

import { api } from "~/utils/api";
import CardBox from "~/components/common/cards/CardBox";
import TableLoading from "~/components/common/loading/TableLoading";
import {
  GET_STARTED_IN_PROGRESS_KEY,
  GET_STARTED_STEP_KEY,
  GetStarted,
} from "~/components/dashboard/GetStarted";
import { useLocalStorage } from "~/hooks/useLocalStorage";
import CardBoxWidget from "../components/common/cards/CardBoxWidget";
import SectionMain from "../components/common/sections/SectionMain";
import SectionTitleLineWithButton from "../components/common/sections/SectionTitleLineWithButton";
import LayoutAuthenticated from "../components/layout";
import { getPageTitle } from "../config/config";

const Dashboard = () => {
  const [getStartedInProgess] = useLocalStorage(
    GET_STARTED_IN_PROGRESS_KEY,
    false,
  );
  const [currentStep, setCurrentStep] = useLocalStorage<number>(
    GET_STARTED_STEP_KEY,
    1,
  );

  const incomeQuery = api.reports.getTotalIncomeForMonth.useQuery({
    month: moment().startOf("day").toDate(),
  });
  const expenseQuery = api.reports.getTotalExpensesForMonth.useQuery({
    month: moment().startOf("day").toDate(),
  });
  const netWorthQuery = api.reports.getNetWorth.useQuery();
  const accountsQuery = api.account.listAccounts.useQuery();

  if (
    accountsQuery.isLoading ||
    incomeQuery.isLoading ||
    expenseQuery.isLoading ||
    netWorthQuery.isLoading
  ) {
    return <TableLoading></TableLoading>;
  }

  const haveAnAccount =
    accountsQuery.data?.totalCount > 0 && !getStartedInProgess;

  return (
    <>
      <Head>
        <title>{getPageTitle("Dashboard")}</title>
      </Head>
      <SectionMain>
        {haveAnAccount && (
          <>
            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <CardBoxWidget
                icon={mdiAccountCash}
                iconColor="info"
                number={netWorthQuery?.data?.netWorth ?? 0}
                numberPrefix={"₹"}
                label="Net worth"
              />
              <CardBoxWidget
                icon={mdiBankTransferOut}
                iconColor="danger"
                number={expenseQuery?.data?.totalExpenses ?? 0}
                numberPrefix={"₹"}
                label="Expenses"
              />
              <CardBoxWidget
                icon={mdiBankTransferIn}
                iconColor="success"
                number={incomeQuery?.data?.totalIncome ?? 0}
                numberPrefix={"₹"}
                label="Income"
              />
            </div>
            <SectionTitleLineWithButton
              icon={mdiChartPie}
              title="Trends overview"
            ></SectionTitleLineWithButton>
            <CardBox className="min-h-1/4 mb-6 mt-6">
              <h5 className="mb-2 text-center text-3xl font-bold text-gray-900 dark:text-white">
                Coming soon
              </h5>
            </CardBox>
          </>
        )}
        {!haveAnAccount && <GetStarted></GetStarted>}
      </SectionMain>
    </>
  );
};

Dashboard.getLayout = function getLayout(page: ReactElement) {
  return <LayoutAuthenticated>{page}</LayoutAuthenticated>;
};

export default Dashboard;
