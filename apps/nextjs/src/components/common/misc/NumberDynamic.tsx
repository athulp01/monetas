import React from "react";

import { CurrencyFormatter } from "~/lib/utils";

type Props = {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
};

const NumberDynamic = ({
  // prefix = "",
  suffix = "",
  value,
}: // duration = 1000,
Props) => {
  // const [newValue, setNewValue] = useState(value)

  // const newValueFormatted = newValue

  // const stepDurationMs = 25

  // const timeoutIds = []

  // const grow = (growIncrement: number) => {
  //   const incrementedStep = Math.ceil(newValue + growIncrement)
  //   console.log('incrementedStep', incrementedStep)

  //   if (incrementedStep > value) {
  //     setNewValue(value)
  //     return false
  //   }

  //   setNewValue(incrementedStep)

  //   timeoutIds.push(
  //     setTimeout(() => {
  //       grow(growIncrement)
  //     }, stepDurationMs)
  //   )
  // }

  // const shrink = (shrinkIncrement: number) => {
  //   const incrementedStep = Math.ceil(newValue - shrinkIncrement)
  //   console.log('decrementedStep', incrementedStep)

  //   if (incrementedStep < value) {
  //     setNewValue(value)
  //     return false
  //   }

  //   setNewValue(incrementedStep)

  //   timeoutIds.push(
  //     setTimeout(() => {
  //       shrink(shrinkIncrement)
  //     }, stepDurationMs)
  //   )
  // }

  // useEffect(() => {
  //   // const increment = Math.abs(value / (duration / stepDurationMs))
  //   // console.log('increment', increment)
  //   // value > 0 ? grow(increment) : shrink(increment)
  //   // return () => {
  //   //   timeoutIds.forEach((tid) => {
  //   //     clearTimeout(tid)
  //   //   })
  //   // }
  // })

  return (
    <div>
      {CurrencyFormatter.format(value)}
      {suffix}
    </div>
  );
};

export default NumberDynamic;
