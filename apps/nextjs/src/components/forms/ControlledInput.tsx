import { type ComponentProps } from 'react'
import { Controller } from 'react-hook-form'
interface props {
  inputProps: ComponentProps<'input'>
  control: any
  name: string
  form: string
}
export const ControlledInput = ({ inputProps, control, name, form }: props) => {
  return (
    <Controller
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      control={control}
      name={name}
      rules={{ required: true }}
      render={({ field }) => (
        <input
          {...field}
          {...inputProps}
          form={form}
          className={
            'block min-w-0 flex-1 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500  dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 ' +
            (inputProps.className || '')
          }
        ></input>
      )}
    />
  )
}
