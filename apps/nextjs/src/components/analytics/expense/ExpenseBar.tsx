// install (please make sure versions match peerDependencies)
// yarn add @nivo/core @nivo/line
import { ResponsiveBar } from "@nivo/bar";
import moment from "moment";
import { Bars } from "react-loader-spinner";

import { api } from "~/utils/api";
import { CurrencyFormatter } from "~/lib/utils";

interface Props {
  rangeStart: moment.Moment;
  rangeEnd: moment.Moment;
}

export const ExpenseBar = ({ rangeStart, rangeEnd }: Props) => {
  const precision = rangeEnd.diff(rangeStart, "days") > 60 ? "month" : "day";
  const expensePerDayReport = api.reports.getNetExpensePerDay.useQuery({
    rangeStart: rangeStart.toDate(),
    rangeEnd: rangeEnd.toDate(),
    precision: precision,
  });

  if (expensePerDayReport.isLoading)
    return (
      <Bars
        height="80"
        width="80"
        color="black"
        ariaLabel="bars-loading"
        wrapperStyle={{}}
        wrapperClass=""
      />
    );

  const chartData =
    expensePerDayReport.data?.map((x) => ({
      x: moment(x.timeCreated).format(
        precision === "month" ? "MMM YYYY" : "DD MMM YY",
      ),
      y: Number(x.sum),
    })) ?? [];

  return (
    <ResponsiveBar
      data={chartData}
      indexBy="x"
      keys={["y"]}
      margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
      axisTop={null}
      axisRight={null}
      colors={{ scheme: "pastel1" }}
      valueFormat={(value: number) => CurrencyFormatter.format(value)}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        format: (value: number) => CurrencyFormatter.format(value),
      }}
    />
  );
};
