/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import React from "react";
import { Controller, type ControllerProps } from "react-hook-form";
import Select from "react-select";

interface Props {
  control: any;
  name: string;
  className?: string;
  form: string;
  options: {
    name: string;
    id: string;
  }[];
  isSimple?: boolean;
  rules?: ControllerProps["rules"];
  isClearable?: boolean;
  isMulti?: boolean;
  isLoading?: boolean;
  isDisabled?: boolean;
  portal?: HTMLElement;
}

export const ControlledSelect = ({
  control,
  className,
  name,
  form,
  options,
  isSimple,
  rules = { required: true },
  isClearable = false,
  isMulti = false,
  isLoading = false,
  isDisabled = false,
  portal = document.body,
}: Props) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <Select
          {...field}
          className={className}
          onChange={
            isSimple
              ? (option) => field.onChange(option.id)
              : (option) => field.onChange(option)
          }
          isLoading={isLoading}
          value={
            isSimple
              ? options.filter((option) => option.id === field.value)
              : field.value
          }
          isMulti={isMulti}
          isClearable={isClearable}
          isDisabled={isDisabled}
          getOptionLabel={(option) => option.name}
          components={{
            IndicatorSeparator: () => null,
          }}
          getOptionValue={(option) => option.id}
          options={options}
          menuPortalTarget={portal}
          styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          form={form}
          isSearchable={false}
          classNames={{
            control: () =>
              " w-full text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",
            input: () => "border-0 text-white py-4",
          }}
        />
      )}
    ></Controller>
  );
};
