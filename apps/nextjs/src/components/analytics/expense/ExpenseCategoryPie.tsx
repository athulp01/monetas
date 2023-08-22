// install (please make sure versions match peerDependencies)
// yarn add @nivo/core @nivo/pie
import { ResponsivePie } from '@nivo/pie'
import { api } from '~/utils/api'
import type moment from 'moment'
import { CurrencyFormatter } from '~/lib/utils'

interface Props {
  rangeStart: moment.Moment
  rangeEnd: moment.Moment
}
// you'll often use just a few of them.

export const ExpenseCategoryPie = ({ rangeStart, rangeEnd }: Props) => {
  const expensePerCategoryReport = api.reports.getNetExpensePerCategory.useQuery({
    rangeStart: rangeStart.toDate(),
    rangeEnd: rangeEnd.toDate(),
  })

  const chartData =
    expensePerCategoryReport.data?.map((x) => ({
      id: x.name,
      label: x.id,
      value: Number(x.sum),
    })) ?? []

  return (
    <ResponsivePie
      data={chartData}
      margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      valueFormat={(value) => CurrencyFormatter.format(value)}
      borderWidth={1}
      borderColor={{
        from: 'color',
        modifiers: [['darker', 0.2]],
      }}
      colors={{ scheme: 'pastel1' }}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor="#333333"
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: 'color' }}
      arcLabelsSkipAngle={10}
      arcLabelsTextColor={{
        from: 'color',
        modifiers: [['darker', 2]],
      }}
    />
  )
}
