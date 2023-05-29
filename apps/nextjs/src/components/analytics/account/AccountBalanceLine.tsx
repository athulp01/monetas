// install (please make sure versions match peerDependencies)
// yarn add @nivo/core @nivo/line

import React from "react";
import { ResponsiveLine } from "@nivo/line";
import moment from "moment";
import { Bars } from "react-loader-spinner";

import { api } from "~/utils/api";
import { CurrencyFormatter } from "~/lib/utils";

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.

interface Props {
  rangeStart: moment.Moment;
  rangeEnd: moment.Moment;
}

export const AccountBalanceLine = ({ rangeStart, rangeEnd }: Props) => {
  const accountBalanceHistory = api.account.getAccountBalanceHistory.useQuery({
    rangeStart: rangeStart.toDate(),
    rangeEnd: rangeEnd.toDate(),
  });

  if (accountBalanceHistory.isLoading)
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
        accountBalanceHistory.data?.map((x) => ({
          x: moment(x.date).format("YYYY-MM-DD"),
          y: Number(x.avg).toFixed(0),
        })) ?? [],
    },
  ];
  console.log(chartData);
  return (
    <ResponsiveLine
      data={chartData}
      margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
      xScale={{
        type: "time",
        format: "%Y-%m-%d",
        useUTC: false,
        precision: "day",
      }}
      xFormat="time:%Y-%m-%d"
      yScale={{
        type: "linear",
        min: 0,
        max: "auto",
        stacked: true,
        reverse: false,
      }}
      enablePoints={false}
      yFormat={(value: number) => CurrencyFormatter.format(value)}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        format: "%b %d %Y",
        tickValues: "every 3 month",
      }}
      lineWidth={1}
      colors={{ scheme: "set1" }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        format: (value: number) => CurrencyFormatter.format(value),
      }}
      pointSize={0}
      pointColor={{ theme: "background" }}
      pointLabelYOffset={-12}
      enableArea={true}
      useMesh={true}
    />
  );
};
