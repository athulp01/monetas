/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller } from 'react-hook-form'
import Datetime from 'react-datetime'

interface Props {
  control: any
  name: string
  form: string
  inputClassName?: string
}
export const ControlledDateTime = ({ control, name, form, inputClassName = 'w-32' }: Props) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={{ required: true }}
      render={({ field: { onChange, onBlur, value, name, ref } }) => (
        <Datetime
          timeFormat={false}
          initialViewDate={new Date()}
          dateFormat="Do MMMM YY"
          inputProps={{
            form: form,
            placeholder: 'Select date',
            onBlur: onBlur,
            name: name,
            className:
              'block p-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ' +
              inputClassName,
          }}
          onChange={onChange}
          value={new Date(value)}
          ref={ref}
        />
      )}
    />
  )
}
