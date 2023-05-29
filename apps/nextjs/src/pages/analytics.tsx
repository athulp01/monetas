import { useState, type ReactElement } from "react";
import Head from "next/head";
import { mdiChartBar, mdiDownload } from "@mdi/js";

import BaseButton from "../components/common/buttons/BaseButton";
import BaseButtons from "../components/common/buttons/BaseButtons";
import CardBox from "../components/common/cards/CardBox";
import SectionMain from "../components/common/sections/SectionMain";
import SectionTitleLineWithButton from "../components/common/sections/SectionTitleLineWithButton";
import LayoutAuthenticated from "../components/layout";
import { getPageTitle } from "../config/config";
import "flowbite";
import Datetime from "react-datetime";
import Select from "react-select";

import "react-datetime/css/react-datetime.css";
import dynamic from "next/dynamic";
import moment from "moment";

import { ExpenseAnalytics } from "~/components/analytics/expense";
import { IncomeAnalytics } from "~/components/analytics/income";
import { AccountAnalytics } from "../components/analytics/account";
import { CashflowAnalytics } from "../components/analytics/cashflow";

const AnalyticsPage = () => {
  const [view, setView] = useState({ name: "Expense", id: "1" });
  const views = [
    { id: "1", name: "Expense" },
    { id: "2", name: "Income" },
    { id: "4", name: "Account" },
    { id: "5", name: "Cashflow" },
  ];
  const [rangeStart, setRangeStart] = useState(moment().startOf("month"));
  const [rangeEnd, setRangeEnd] = useState(moment().endOf("month"));

  return (
    <>
      <Head>
        <title>{getPageTitle("Analytics")}</title>
      </Head>
      <SectionMain>
        <SectionTitleLineWithButton icon={mdiChartBar} title={"Analytics"} main>
          <BaseButtons>
            <BaseButton icon={mdiDownload} color="whiteDark"></BaseButton>
          </BaseButtons>
        </SectionTitleLineWithButton>
        <CardBox className="mb-6 mt-6">
          <div className="flex flex-wrap justify-between">
            <Select
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.id}
              value={view}
              onChange={(option) => setView(option)}
              options={views}
              menuPortalTarget={document.body}
              styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
              isSearchable={false}
              classNames={{
                control: () =>
                  " w-full text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",
                input: () => "border-0 text-white py-4",
              }}
            />
            <div className="flex">
              <span className="mr-2 self-center">From</span>
              <Datetime
                timeFormat={false}
                initialViewDate={new Date()}
                dateFormat="MMMM YYYY"
                className="w-32"
                inputProps={{
                  placeholder: "Select date",
                  className:
                    "block w-32 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",
                }}
                value={rangeStart}
                onChange={(date: moment.Moment) =>
                  setRangeStart(date.startOf("month"))
                }
              />
              <span className="ml-2 mr-2 self-center">to</span>
              <Datetime
                timeFormat={false}
                initialViewDate={new Date()}
                dateFormat="MMMM YYYY"
                className="w-32"
                inputProps={{
                  placeholder: "Select date",
                  className:
                    "block w-32 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",
                }}
                value={rangeEnd}
                onChange={(date: moment.Moment) =>
                  setRangeEnd(date.endOf("month"))
                }
              />
            </div>
          </div>
          <div className="mt-6">
            {view?.name === "Expense" && (
              <ExpenseAnalytics
                rangeEnd={rangeEnd}
                rangeStart={rangeStart}
              ></ExpenseAnalytics>
            )}
            {view?.name === "Income" && <IncomeAnalytics></IncomeAnalytics>}
            {view?.name === "Account" && (
              <AccountAnalytics
                rangeEnd={rangeEnd}
                rangeStart={rangeStart}
              ></AccountAnalytics>
            )}
            {view?.name === "Cashflow" && (
              <CashflowAnalytics></CashflowAnalytics>
            )}
          </div>
        </CardBox>
      </SectionMain>
    </>
  );
};

AnalyticsPage.getLayout = function getLayout(page: ReactElement) {
  return <LayoutAuthenticated>{page}</LayoutAuthenticated>;
};

const AnalyticsPageNoSSR = dynamic(() => Promise.resolve(AnalyticsPage), {
  ssr: false,
});

export default AnalyticsPageNoSSR;
