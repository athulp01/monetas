import React from "react";
import { mdiCog } from "@mdi/js";

import { colorsText } from "~/config/colors";
import { type ColorKey, type TrendType } from "~/interfaces";
import BaseButton from "../buttons/BaseButton";
import BaseIcon from "../icon/BaseIcon";
import NumberDynamic from "../misc/NumberDynamic";
import PillTagTrend from "../pills/PillTagTrend";
import CardBox from "./CardBox";

type Props = {
  number: number;
  numberPrefix?: string;
  numberSuffix?: string;
  icon: string;
  iconColor: ColorKey;
  label: string;
  trendLabel?: string;
  trendType?: TrendType;
  trendColor?: ColorKey;
};

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
          <h3 className="text-lg leading-tight text-gray-500 dark:text-slate-400">
            {props.label}
          </h3>
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
            className={colorsText[props.iconColor] as string}
          />
        )}
      </div>
    </CardBox>
  );
};

export default CardBoxWidget;
