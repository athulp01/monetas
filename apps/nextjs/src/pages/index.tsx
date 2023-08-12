import React, { type ReactElement } from "react";
import Head from "next/head";
import {
  mdiAccountCash,
  mdiBankTransferIn,
  mdiBankTransferOut,
  mdiCashClock,
  mdiChartPie,
} from "@mdi/js";
import moment from "moment";

import { api } from "~/utils/api";
import CardBox from "~/components/common/cards/CardBox";
import { CardTable } from "~/components/common/cards/CardTable";
import IconRounded from "~/components/common/icon/IconRounded";
import TableLoading from "~/components/common/loading/TableLoading";
import NumberDynamic from "~/components/common/misc/NumberDynamic";
import { Table } from "~/components/common/table/Table";
import { TableCell } from "~/components/common/table/TableCell";
import { TableHeader } from "~/components/common/table/TableHeader";
import { TableHeaderBlock } from "~/components/common/table/TableHeaderBlock";
import { TableRow } from "~/components/common/table/TableRow";
import {
  GET_STARTED_IN_PROGRESS_KEY,
  GetStarted,
} from "~/components/dashboard/GetStarted";
import { EmptyTransactions } from "~/components/transactions/EmptyTransactions";
import { getPageTitle } from "~/config/config";
import { IconMap } from "~/config/iconMap";
import { useLocalStorage } from "~/hooks/useLocalStorage";
import { DateFormater } from "~/lib/utils";
import CardBoxWidget from "../components/common/cards/CardBoxWidget";
import SectionMain from "../components/common/sections/SectionMain";
import SectionTitleLineWithButton from "../components/common/sections/SectionTitleLineWithButton";
import LayoutAuthenticated from "../components/layout";

const Dashboard = () => {
  const [getStartedInProgess] = useLocalStorage(
    GET_STARTED_IN_PROGRESS_KEY,
    false,
  );

  const incomeQuery = api.reports.getTotalIncomeForMonth.useQuery({
    month: moment().startOf("day").toDate(),
  });
  const expenseQuery = api.reports.getTotalExpensesForMonth.useQuery({
    month: moment().startOf("day").toDate(),
  });
  const netWorthQuery = api.reports.getNetWorth.useQuery();
  const accountsQuery = api.account.listAccounts.useQuery();
  const transactionsQuery = api.transaction.listTransactions.useQuery({
    page: 0,
    perPage: 10,
    month: moment().startOf("day").toDate(),
  });

  if (
    accountsQuery.isLoading ||
    incomeQuery.isLoading ||
    expenseQuery.isLoading ||
    netWorthQuery.isLoading ||
    transactionsQuery.isLoading
  ) {
    return (
      <SectionMain>
        <CardBox hasTable>
          {" "}
          <TableLoading></TableLoading>
        </CardBox>
      </SectionMain>
    );
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

            <div className="mb-3 mt-3 flex items-center justify-start">
              <IconRounded
                icon={mdiCashClock}
                color="transparent"
                className="mr-3"
                bg
              />
              <h1 className={`leading-tight`}>Recent Transactions</h1>
            </div>

            <CardBox hasTable>
              {transactionsQuery?.data?.transactions?.length === 0 && (
                <EmptyTransactions></EmptyTransactions>
              )}
              {transactionsQuery?.data?.transactions?.length > 0 && (
                <CardTable>
                  <Table isPaginated={false}>
                    <TableHeaderBlock>
                      <tr>
                        <TableHeader title={""}></TableHeader>
                        <TableHeader title="Account"></TableHeader>
                        <TableHeader title="Type"></TableHeader>
                        <TableHeader title="Category" isSortable></TableHeader>
                        <TableHeader title="Payee" isSortable></TableHeader>
                        <TableHeader title="Date"></TableHeader>
                        <TableHeader title="Amount"></TableHeader>
                        <TableHeader title="Tags"></TableHeader>
                        <TableHeader></TableHeader>
                      </tr>
                    </TableHeaderBlock>
                    <tbody>
                      {transactionsQuery?.data?.transactions?.map(
                        (transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              <IconRounded
                                color={"transparent"}
                                bg
                                icon={IconMap[transaction.category.icon]}
                              ></IconRounded>{" "}
                            </TableCell>
                            <TableCell>
                              {transaction.sourceAccount.name}
                            </TableCell>
                            <TableCell>
                              {transaction.type.charAt(0) +
                                transaction.type.substring(1).toLowerCase()}
                            </TableCell>
                            <TableCell>{transaction.category.name}</TableCell>
                            <TableCell>
                              {transaction.type === "TRANSFER"
                                ? transaction?.transferredAccount?.name
                                : transaction.payee?.name}
                            </TableCell>

                            <TableCell>
                              {DateFormater.format(
                                new Date(transaction.timeCreated),
                              )}
                            </TableCell>

                            <TableCell>
                              <span
                                className={
                                  transaction?.type === "DEBIT"
                                    ? "font-semibold text-red-600"
                                    : transaction?.type === "CREDIT"
                                    ? "font-semibold text-green-500"
                                    : "font-semibold text-blue-500"
                                }
                              >
                                <NumberDynamic
                                  value={transaction?.amount}
                                  prefix={`${
                                    transaction?.type === "DEBIT"
                                      ? "-"
                                      : transaction?.type === "CREDIT"
                                      ? "+"
                                      : "  "
                                  } ₹`}
                                ></NumberDynamic>
                              </span>
                            </TableCell>
                            <TableCell>
                              {transaction?.tags.map((tag) => (
                                <span
                                  className={
                                    "mr-2 rounded-lg border-0 bg-gray-300 p-1 pl-2 pr-2 text-black"
                                  }
                                  key={tag.id}
                                >
                                  {tag.name}
                                </span>
                              ))}
                            </TableCell>
                          </TableRow>
                        ),
                      )}
                    </tbody>
                  </Table>
                </CardTable>
              )}
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
