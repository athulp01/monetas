import { ResponsiveSankey } from '@nivo/sankey'

const data = {
  nodes: [
    {
      id: 'John',
      nodeColor: 'hsl(348, 70%, 50%)',
    },
    {
      id: 'Raoul',
      nodeColor: 'hsl(136, 70%, 50%)',
    },
    {
      id: 'Jane',
      nodeColor: 'hsl(330, 70%, 50%)',
    },
    {
      id: 'Marcel',
      nodeColor: 'hsl(20, 70%, 50%)',
    },
    {
      id: 'Ibrahim',
      nodeColor: 'hsl(7, 70%, 50%)',
    },
    {
      id: 'Junko',
      nodeColor: 'hsl(108, 70%, 50%)',
    },
  ],
  links: [
    {
      source: 'Junko',
      target: 'Marcel',
      value: 46,
    },
    {
      source: 'Junko',
      target: 'Ibrahim',
      value: 147,
    },
    {
      source: 'Marcel',
      target: 'Raoul',
      value: 80,
    },
    {
      source: 'Marcel',
      target: 'Jane',
      value: 174,
    },
    {
      source: 'Marcel',
      target: 'Ibrahim',
      value: 139,
    },
    {
      source: 'Jane',
      target: 'John',
      value: 78,
    },
    {
      source: 'Jane',
      target: 'Ibrahim',
      value: 20,
    },
    {
      source: 'Ibrahim',
      target: 'John',
      value: 72,
    },
    {
      source: 'Ibrahim',
      target: 'Raoul',
      value: 124,
    },
    {
      source: 'John',
      target: 'Raoul',
      value: 60,
    },
  ],
}

export const CashflowSankey = () => (
  <ResponsiveSankey
    data={data}
    margin={{ top: 40, right: 160, bottom: 40, left: 50 }}
    align="justify"
    colors={{ scheme: 'category10' }}
    nodeOpacity={1}
    nodeHoverOthersOpacity={0.35}
    nodeThickness={18}
    nodeSpacing={24}
    nodeBorderWidth={0}
    nodeBorderColor={{
      from: 'color',
      modifiers: [['darker', 0.8]],
    }}
    nodeBorderRadius={3}
    linkOpacity={0.5}
    linkHoverOthersOpacity={0.1}
    linkContract={3}
    enableLinkGradient={true}
    labelPosition="outside"
    labelOrientation="vertical"
    labelPadding={16}
    labelTextColor={{
      from: 'color',
      modifiers: [['darker', 1]],
    }}
    legends={[
      {
        anchor: 'bottom-right',
        direction: 'column',
        translateX: 130,
        itemWidth: 100,
        itemHeight: 14,
        itemDirection: 'right-to-left',
        itemsSpacing: 2,
        itemTextColor: '#999',
        symbolSize: 14,
        effects: [
          {
            on: 'hover',
            style: {
              itemTextColor: '#000',
            },
          },
        ],
      },
    ]}
  />
)
