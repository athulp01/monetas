import type moment from 'moment'
import { type ComponentProps } from 'react'
import Datetime from 'react-datetime'

interface Props {
  inputProps: ComponentProps<'input'>
  value: moment.Moment
  onChange: (date: moment.Moment) => void
}
export const DateTime = (props: Props) => {
  return (
    <Datetime
      timeFormat={false}
      initialViewDate={new Date()}
      dateFormat="Do MMMM YY"
      className="w-40"
      inputProps={props.inputProps}
      onChange={props?.onChange}
      value={props.value}
    />
  )
}
