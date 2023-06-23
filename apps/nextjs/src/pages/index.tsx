import React, { type ReactElement } from "react";
import Head from "next/head";
import {
  mdiAccountCash,
  mdiBankTransferIn,
  mdiBankTransferOut,
  mdiChartPie,
  mdiChartTimelineVariant,
} from "@mdi/js";
import moment from "moment";

import { api } from "~/utils/api";
import CardBox from "~/components/common/cards/CardBox";
import CardBoxWidget from "../components/common/cards/CardBoxWidget";
import SectionMain from "../components/common/sections/SectionMain";
import SectionTitleLineWithButton from "../components/common/sections/SectionTitleLineWithButton";
import LayoutAuthenticated from "../components/layout";
import { getPageTitle } from "../config/config";

const Dashboard = () => {
  const incomeQuery = api.reports.getTotalIncomeForMonth.useQuery({
    month: moment().startOf("day").toDate(),
  });
  const expenseQuery = api.reports.getTotalExpensesForMonth.useQuery({
    month: moment().startOf("day").toDate(),
  });
  const netWorthQuery = api.reports.getNetWorth.useQuery();

  return (
    <>
      <Head>
        <title>{getPageTitle("Dashboard")}</title>
      </Head>
      <SectionMain>
        <SectionTitleLineWithButton
          icon={mdiChartTimelineVariant}
          title="Overview"
          main
        ></SectionTitleLineWithButton>

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
      </SectionMain>
    </>
  );
};

Dashboard.getLayout = function getLayout(page: ReactElement) {
  return <LayoutAuthenticated>{page}</LayoutAuthenticated>;
};

export default Dashboard;
