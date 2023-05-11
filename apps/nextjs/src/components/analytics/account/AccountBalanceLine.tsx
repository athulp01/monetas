// install (please make sure versions match peerDependencies)
// yarn add @nivo/core @nivo/line
import { ResponsiveLine } from '@nivo/line'
const data = [
  {
    id: 'japan',
    color: 'green',
    data: [
      { x: '2018-01-01', y: 7 },
      { x: '2018-01-02', y: 5 },
      { x: '2018-01-03', y: 11 },
      { x: '2018-01-04', y: 9 },
      { x: '2018-01-05', y: 12 },
      { x: '2018-01-06', y: 16 },
      { x: '2018-01-07', y: 13 },
      { x: '2018-01-08', y: 13 },
    ],
  },
]
// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
export const AccountBalanceLine = () => (
  <ResponsiveLine
    data={data}
    margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
    xScale={{
      type: 'time',
      format: '%Y-%m-%d',
      useUTC: false,
      precision: 'day',
    }}
    xFormat="time:%Y-%m-%d"
    yScale={{
      type: 'linear',
      min: 0,
      max: 'auto',
      stacked: true,
      reverse: false,
    }}
    enablePoints={false}
    yFormat=" >-.2f"
    axisTop={null}
    axisRight={null}
    axisBottom={{
      format: '%b %d',
      tickValues: 'every 1 day',
    }}
    curve="natural"
    lineWidth={1}
    colors={{ scheme: 'set1' }}
    axisLeft={{
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
    }}
    pointSize={0}
    pointColor={{ theme: 'background' }}
    pointLabelYOffset={-12}
    enableArea={true}
    useMesh={true}
  />
)
