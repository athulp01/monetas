// install (please make sure versions match peerDependencies)
// yarn add @nivo/core @nivo/line
import { ResponsiveLine } from "@nivo/line";
import moment from "moment";
import { Bars } from "react-loader-spinner";

import { api } from "~/utils/api";
import { CurrencyFormatter } from "~/lib/utils";

interface Props {
  rangeStart: moment.Moment;
  rangeEnd: moment.Moment;
}

export const ExpenseLine = ({ rangeStart, rangeEnd }: Props) => {
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

  const chartData = [
    {
      id: "japan",
      data:
        expensePerDayReport.data?.map((x) => ({
          x: moment(x.timeCreated).format("YYYY-MM-DD"),
          y: Number(x.sum),
        })) ?? [],
    },
  ];

  return (
    <ResponsiveLine
      data={chartData}
      margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
      xScale={{
        type: "time",
        format: "%Y-%m-%d",
        useUTC: false,
        precision: precision,
      }}
      xFormat="time:%Y-%m-%d"
      yScale={{
        type: "linear",
        min: 0,
        stacked: false,
      }}
      enablePoints={false}
      yFormat={(value: number) => CurrencyFormatter.format(value)}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        format: "%b %d",
        tickValues: `${
          precision === "month"
            ? `every 1 ${precision}`
            : `every 4 ${precision}`
        }`,
      }}
      lineWidth={1}
      colors={{ scheme: "set1" }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        format: (value: number) => CurrencyFormatter.format(value),
      }}
      pointSize={5}
      pointLabelYOffset={-12}
      enableArea={true}
      useMesh={true}
    />
  );
};
