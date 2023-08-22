// install (please make sure versions match peerDependencies)
// yarn add @nivo/core @nivo/pie
import { ResponsivePie } from '@nivo/pie'

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.

const data = [
  {
    id: 'Swiggy',
    label: 'Swiggy',
    value: 55,
    color: 'hsl(337, 70%, 50%)',
  },
  {
    id: 'Amazon',
    label: 'Amazon',
    value: 274,
    color: 'hsl(318, 70%, 50%)',
  },
  {
    id: 'Ajio',
    label: 'Ajio',
    value: 329,
    color: 'hsl(29, 70%, 50%)',
  },
  {
    id: 'Uber',
    label: 'Uber',
    value: 172,
    color: 'hsl(200, 70%, 50%)',
  },
  {
    id: 'Zepto',
    label: 'Zepto',
    value: 191,
    color: 'hsl(356, 70%, 50%)',
  },
]

export const IncomePayeePie = () => (
  <>
    <p className="text-lg text-center text-gray-900 dark:text-white">Payees</p>
    <ResponsivePie
      data={data}
      margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      borderWidth={1}
      borderColor={{
        from: 'color',
        modifiers: [['darker', 0.2]],
      }}
      colors={{ scheme: 'pastel2' }}
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
  </>
)
