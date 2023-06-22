/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Script from "next/script";
import { TRANSACTION_TYPE } from "@prisma/client";
import Datetime from "react-datetime";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";

import { api, setTelegramData } from "~/utils/api";
import { TransactionTypeOptions } from "~/utils/constants";
import { ControlledSelect } from "~/components/forms/ControlledSelect";
import { type UnverifiedTransactionList } from "~/components/transactions/UnverifiedTransactionsTableView";
import telegramStyles from "~/css/telegram";

const Transaction = () => {
  const { transactionId } = useRouter().query;
  const unverifiedTransactionQuery =
    api.unverifiedTransaction.getUnverifiedTransaction.useQuery(
      {
        id: transactionId as string,
      },
      {
        onSuccess: (data) => {
          editForm.reset(data);
        },
        refetchInterval: false,
        refetchIntervalInBackground: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    );
  const accountsQuery = api.account.listAccounts.useQuery();

  const verifyTransactionMutation =
    api.unverifiedTransaction.verifyUnverifiedTransaction.useMutation();

  const editForm = useForm<UnverifiedTransactionList[0]>({
    defaultValues: unverifiedTransactionQuery.data,
  });

  const payeesQuery = api.payee.listPayees.useQuery({
    categoryId: editForm.watch("category")?.id,
  });
  const categoriesQuery = api.category.listCategories.useQuery({
    type: editForm.watch("type"),
  });

  const [Telegram, setTelegram] = useState(null);

  const addTransaction = useCallback(
    async (transaction: UnverifiedTransactionList[0]) => {
      Telegram?.MainButton.showProgress();
      const payload = {
        amount: +transaction.amount,
        type: transaction.type,
        payeeId: transaction.payee ? transaction.payee.id : undefined,
        categoryId: transaction.category.id,
        sourceAccountId: transaction.sourceAccount.id,
        transferredAccountId: transaction.transferredAccount.id,
        unverifiedTransactionId: transaction.id,
        payeeAlias: transaction.payeeAlias ?? undefined,
      };
      const resp = await verifyTransactionMutation.mutateAsync(payload);
      console.log(resp);
      Telegram?.MainButton.hideProgress();
      Telegram?.showAlert("Transaction added", () => Telegram?.close());
    },
    [Telegram, verifyTransactionMutation],
  );

  useEffect(() => {
    if (Telegram) {
      console.log(JSON.stringify(Telegram));
      setTelegramData(Telegram?.initData as string);
      Telegram?.MainButton.setText("Add");
      Telegram?.MainButton.onClick(() => {
        Telegram?.showConfirm(
          "Do you want to add this transaction to monetas",
          (isConfirmed: boolean) => {
            console.log(isConfirmed);
            isConfirmed && void editForm.handleSubmit(addTransaction)();
          },
        );
      });
      Telegram?.MainButton.show();
      Telegram?.BackButton.show();
      Telegram?.BackButton.onClick(() => Telegram?.close());
      console.log(Telegram?.version);
    }
  }, [addTransaction, Telegram, editForm]);

  const isLoading =
    unverifiedTransactionQuery.isLoading ||
    accountsQuery.isLoading ||
    payeesQuery.isLoading ||
    categoriesQuery.isLoading;
  const isError =
    unverifiedTransactionQuery.isError ||
    accountsQuery.isError ||
    payeesQuery.isError ||
    categoriesQuery.isError;

  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        onLoad={() => {
          setTelegram((window as any).Telegram.WebApp);
        }}
      />
      {isLoading && <div>Loading...</div>}
      {isError && <div>Error</div>}
      {!isLoading && !isError && (
        <div className="h-screen">
          <style jsx global>
            {telegramStyles}
          </style>
          <header className="text-center text-2xl font-bold">
            Review Transaction
          </header>

          <form id="editForm" className="p-5">
            <Controller
              control={editForm.control}
              name="sourceAccount"
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  {...field}
                  options={accountsQuery.data.accounts}
                  form="editForm"
                  getOptionLabel={(option) => option.name}
                  getOptionValue={(option) => option.id}
                  menuPortalTarget={document.body}
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                  isSearchable={false}
                  theme={(theme) => ({
                    ...theme,
                    colors: {
                      ...theme.colors,
                      primary25: Telegram?.themeParams?.hint_color,
                      primary: Telegram?.themeParams?.button_color,
                      neutral0: Telegram?.themeParams?.secondary_bg_color,
                      neutral80: Telegram?.themeParams?.text_color,
                    },
                  })}
                  classNames={{
                    control: () =>
                      " w-full text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",
                    input: () => "border-0 text-white py-4 bg-black",
                  }}
                />
              )}
            ></Controller>
            <Controller
              control={editForm.control}
              name="type"
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  {...field}
                  className="my-2"
                  onChange={(option) => field.onChange(option.id)}
                  value={TransactionTypeOptions.filter(
                    (option) => option.id === field.value,
                  )}
                  options={TransactionTypeOptions}
                  form="editForm"
                  getOptionLabel={(option) => option.name}
                  getOptionValue={(option) => option.id}
                  menuPortalTarget={document.body}
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                  isSearchable={false}
                  theme={(theme) => ({
                    ...theme,
                    colors: {
                      ...theme.colors,
                      primary25: Telegram?.themeParams?.hint_color,
                      primary: Telegram?.themeParams?.button_color,
                      neutral0: Telegram?.themeParams?.secondary_bg_color,
                      neutral80: Telegram?.themeParams?.text_color,
                    },
                  })}
                  classNames={{
                    control: () =>
                      " w-full text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",
                    input: () => "border-0 text-white py-4 bg-black",
                  }}
                />
              )}
            ></Controller>
            <Controller
              control={editForm.control}
              name="category"
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  {...field}
                  options={categoriesQuery.data.categories}
                  className="my-2"
                  form="editForm"
                  isLoading={categoriesQuery.isLoading}
                  isDisabled={editForm.watch("type") == null}
                  getOptionLabel={(option) => option.name}
                  getOptionValue={(option) => option.id}
                  menuPortalTarget={document.body}
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                  isSearchable={false}
                  theme={(theme) => ({
                    ...theme,
                    colors: {
                      ...theme.colors,
                      primary25: Telegram?.themeParams?.hint_color,
                      primary: Telegram?.themeParams?.button_color,
                      neutral0: Telegram?.themeParams?.secondary_bg_color,
                      neutral80: Telegram?.themeParams?.text_color,
                    },
                  })}
                  classNames={{
                    control: () =>
                      " w-full text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",
                    input: () => "border-0 text-white py-4",
                  }}
                />
              )}
            ></Controller>
            {editForm.watch("type") !== TRANSACTION_TYPE.TRANSFER ? (
              <Controller
                control={editForm.control}
                name="payee"
                rules={{ required: false }}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={payeesQuery.data.payees}
                    getOptionLabel={(option) => option.name}
                    getOptionValue={(option) => option.id}
                    menuPortalTarget={document.body}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                    form="editForm"
                    isSearchable={false}
                    theme={(theme) => ({
                      ...theme,
                      colors: {
                        ...theme.colors,
                        primary25: Telegram?.themeParams?.hint_color,
                        primary: Telegram?.themeParams?.button_color,
                        neutral0: Telegram?.themeParams?.secondary_bg_color,
                        neutral80: Telegram?.themeParams?.text_color,
                      },
                    })}
                    classNames={{
                      control: () =>
                        " w-full text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",
                      input: () => "border-0 text-white py-4",
                    }}
                  />
                )}
              ></Controller>
            ) : (
              <ControlledSelect
                control={editForm.control}
                form="editForm"
                isDisabled={editForm.watch("type") == null}
                name="transferredAccount"
                options={accountsQuery?.data.accounts.filter(
                  (account) =>
                    account.id !== editForm.watch("sourceAccount")?.id,
                )}
              ></ControlledSelect>
            )}

            <Controller
              control={editForm.control}
              name="timeCreated"
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value, name, ref } }) => (
                <Datetime
                  timeFormat={false}
                  initialViewDate={new Date()}
                  dateFormat="Do MMMM YY"
                  className="my-2"
                  inputProps={{
                    form: "editForm",
                    placeholder: "Select date",
                    onBlur: onBlur,
                    name: name,
                    className:
                      "block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",
                  }}
                  onChange={onChange}
                  value={value}
                  ref={ref}
                />
              )}
            />
            <div className="flex">
              <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-200 px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400">
                ₹
              </span>
              <input
                form="editForm"
                {...editForm.register("amount", { required: true })}
                placeholder="Amount"
                type="number"
                className="block min-w-0 flex-1 rounded-none rounded-r-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500  dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                required
              ></input>
            </div>
            {/* <div className="mt-5 flex justify-start">
          <button
            type="submit"
            className="border w-32 p-2 br rounded-lg focus:ring ring-emerald-300 dark:ring-emerald-700 transition-colors duration-150 bg-emerald-600 dark:bg-emerald-500 text-white"
          >
            Add
          </button>
          <button className="ml-8 w-32 border p-2 br rounded-lg focus:ring bg-red-600 dark:bg-red-500 text-white">
            Cancel
          </button>
        </div> */}
          </form>
        </div>
      )}
    </>
  );
};

export default Transaction;
