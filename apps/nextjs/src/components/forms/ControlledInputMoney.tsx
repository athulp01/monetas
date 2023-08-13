import { type ComponentProps } from 'react'
import { Controller } from 'react-hook-form'

interface props {
  inputProps: ComponentProps<'input'>
  className?: string
  control: any
  name: string
  form: string
}
export const ControlledInputMoney = ({
  inputProps,
  control,
  name,
  form,
  className = 'w-40',
}: props) => {
  return (
    <div className={'flex ' + className}>
      <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-200 px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400">
        ₹
      </span>
      <Controller
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        control={control}
        name={name}
        rules={{ required: true }}
        render={({ field }) => (
          <input
            {...field}
            {...inputProps}
            type="number"
            form={form}
            className={
              'block min-w-0 flex-1 rounded-lg rounded-l-none border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500  dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 ' +
              (inputProps.className || '')
            }
          ></input>
        )}
      />
    </div>
  )
}
