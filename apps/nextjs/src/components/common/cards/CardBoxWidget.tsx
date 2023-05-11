import { mdiCog } from '@mdi/js'
import React from 'react'
import { type ColorKey, type TrendType } from '../../../interfaces'
import { colorsText } from '../../../config/colors'
import BaseButton from '../buttons/BaseButton'
import BaseIcon from '../icon/BaseIcon'
import CardBox from './CardBox'
import NumberDynamic from '../misc/NumberDynamic'
import PillTagTrend from '../pills/PillTagTrend'

type Props = {
  number: number
  numberPrefix?: string
  numberSuffix?: string
  icon: string
  iconColor: ColorKey
  label: string
  trendLabel?: string
  trendType?: TrendType
  trendColor?: ColorKey
}

const CardBoxWidget = (props: Props) => {
  return (
    <CardBox>
      {props.trendLabel && props.trendType && props.trendColor && (
        <div className="mb-3 flex items-center justify-between">
          <PillTagTrend
            label={props.trendLabel}
            type={props.trendType}
            color={props.trendColor}
            small
          />
          <BaseButton icon={mdiCog} color="lightDark" small />
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg leading-tight text-gray-500 dark:text-slate-400">{props.label}</h3>
          <h1 className="text-3xl font-semibold leading-tight">
            <NumberDynamic
              value={props.number}
              prefix={props.numberPrefix}
              suffix={props.numberSuffix}
            />
          </h1>
        </div>
        {props.icon && (
          <BaseIcon
            path={props.icon}
            size="48"
            w=""
            h="h-16"
            className={colorsText[props.iconColor]}
          />
        )}
      </div>
    </CardBox>
  )
}

export default CardBoxWidget
