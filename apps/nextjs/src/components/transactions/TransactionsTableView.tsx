/* eslint-disable @typescript-eslint/no-misused-promises */

import React, { useContext, useEffect, useState } from "react";
import {
  mdiCancel,
  mdiCheck,
  mdiFileImport,
  mdiPencil,
  mdiPlus,
  mdiPlusThick,
  mdiTrashCan,
} from "@mdi/js";

import BaseButton from "../common/buttons/BaseButton";
import BaseButtons from "../common/buttons/BaseButtons";
import "flowbite";
import Datetime from "react-datetime";

import { ITEMS_PER_PAGE } from "~/config/site";
import { DateFormater } from "~/lib/utils";
import TableLoading from "../common/loading/TableLoading";
import NumberDynamic from "../common/misc/NumberDynamic";
import "react-datetime/css/react-datetime.css";
import { TRANSACTION_TYPE } from "@prisma/client";
import moment from "moment";
import Sheet from "react-modal-sheet";
import { toast } from "react-toastify";

import { api, type RouterInputs, type RouterOutputs } from "~/utils/api";
import { TransactionTypeOptions } from "~/utils/constants";
import { useTable } from "~/hooks/useTable";
import CardBoxModal from "../common/cards/CardBoxModal";
import { TableHeader } from "../common/table/TableHeader";
import { ControlledDateTime } from "../forms/ControlledDateTime";
import { ControlledInputMoney } from "../forms/ControlledInputMoney";
import { ControlledSelect } from "../forms/ControlledSelect";
import TransactionCard from "./TransactionCard";
import "@yaireo/tagify/dist/tagify.css";
import { useRouter } from "next/router";
import Tags from "@yaireo/tagify/dist/react.tagify";
import { Controller } from "react-hook-form";

import { TopLoadingBarStateContext } from "~/utils/contexts";
import { CardTable } from "~/components/common/cards/CardTable";
import IconRounded from "~/components/common/icon/IconRounded";
import { Table } from "~/components/common/table/Table";
import { TableCell } from "~/components/common/table/TableCell";
import { TableHeaderBlock } from "~/components/common/table/TableHeaderBlock";
import { TableRow } from "~/components/common/table/TableRow";
import { SearchInput } from "~/components/forms/SearchInput";
import { EmptyTransactions } from "~/components/transactions/EmptyTransactions";
import ImportTableView from "~/components/transactions/ImportTableView";
import { IconMap } from "~/config/iconMap";
import { useDialog } from "~/hooks/useDialog";

export type TransactionsList =
  RouterOutputs["transaction"]["listTransactions"]["transactions"];
export type TransactionCreate = RouterInputs["transaction"]["addTransaction"];
export type TransactionUpdate =
  RouterInputs["transaction"]["updateTransaction"];

type Mode = "CREATE" | "EDIT" | "VIEW" | "IMPORT" | "REVIEW" | "EMPTY";

const TransactionsTableView = () => {
  const topLoadingBar = useContext(TopLoadingBarStateContext);
  const dialog = useDialog();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("VIEW");
  const [isInEditMode, setIsInEditMode, createForm, editForm] =
    useTable<TransactionsList[0]>();
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(moment());
  const [hack, setHack] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const transactionsQuery = api.transaction.listTransactions.useQuery({
    page: currentPage,
    perPage: ITEMS_PER_PAGE,
    month: selectedMonth.toDate(),
  });
  const totalCount = transactionsQuery.data?.totalCount || 0;

  const accountsQuery = api.account.listAccounts.useQuery();
  const categoriesQuery = api.category.listCategories.useQuery({
    type:
      isInEditMode !== -1 ? editForm.watch("type") : createForm.watch("type"),
  });
  const payeesQuery = api.payee.listPayees.useQuery({
    categoryId:
      isInEditMode !== -1
        ? editForm.watch("category")?.id
        : createForm.watch("category")?.id,
  });

  useEffect(() => {
    if (router.query["import"]) {
      setMode("IMPORT");
    } else {
      setMode("VIEW");
    }
  }, [router]);

  const handleCardEdit = (index: number) => {
    setIsInEditMode(index);
    editForm.reset(transactionsQuery.data.transactions[index]);
    setIsSheetOpen(true);
  };
  const addTransactionMutation = api.transaction.addTransaction.useMutation({
    onSuccess: async () => {
      createForm.reset();
      setMode("VIEW");
      toast.success("Transaction created successfully");
      await transactionsQuery.refetch();
    },
    onError: (err) => {
      toast.error("Error creating transaction");
      console.log(err);
    },
    onSettled: () => {
      topLoadingBar.hide();
    },
  });

  const updateTransactionMutation =
    api.transaction.updateTransaction.useMutation({
      onSuccess: async () => {
        editForm.reset();
        topLoadingBar.hide();
        toast.success("Transaction updated successfully");
        await transactionsQuery.refetch();
      },
      onError: (err) => {
        topLoadingBar.hide();
        toast.error("Error updating transaction");
        console.log(err);
      },
    });
  const deleteTransactionMutation =
    api.transaction.deleteTransaction.useMutation({
      onSuccess: async () => {
        toast.success("Transaction deleted successfully");
        await transactionsQuery.refetch();
      },
      onError: (err) => {
        toast.error("Error deleting transaction");
        console.log(err);
      },
      onSettled: () => {
        dialog.hide();
      },
    });

  const onCreateFormSubmit = (data: TransactionsList[0]): void => {
    const payload: TransactionCreate = {
      amount: +data.amount,
      type: data.type,
      payeeId: data.payee ? data.payee?.id : undefined,
      categoryId: data.category?.id,
      sourceAccountId: data.sourceAccount?.id,
      transferredAccountId: data.transferredAccount?.id,
      timeCreated: new Date(data.timeCreated),
      tags: data.tags?.map((tag) => tag.name) ?? undefined,
    };
    dialog.setProps({
      title: "Confirmation",
      buttonColor: "success",
      message: "Do you want to create this transaction?",
      onConfirm: () => {
        topLoadingBar.show();
        addTransactionMutation.mutate(payload);
        dialog.hide();
      },
    });
    dialog.show();
  };

  const onEditFormSubmit = (data: TransactionsList[0]) => {
    if (hack) {
      setHack(false);
      return;
    }
    if (isSheetOpen) {
      setIsSheetOpen(false);
    }
    const payload: TransactionUpdate = {
      id: transactionsQuery.data.transactions[isInEditMode].id,
      type: data.type,
      amount: +data.amount,
      payeeId: data.payee?.id,
      categoryId: data.category?.id,
      sourceAccountId: data.sourceAccount?.id,
      transferredAccountId: data.transferredAccount?.id,
      timeCreated: new Date(data.timeCreated),
      tags: data.tags?.map((tag) => tag.name) ?? undefined,
    };
    dialog.setProps({
      title: "Confirmation",
      buttonColor: "success",
      message: "Do you want to edit this transaction?",
      onConfirm: () => {
        topLoadingBar.show();
        updateTransactionMutation.mutate(payload);
        setIsInEditMode(-1);
        dialog.hide();
      },
    });
    dialog.show();
  };

  const handleEdit = (i: number) => {
    editForm.reset(transactionsQuery.data.transactions[i]);
    setIsInEditMode(i);
    setHack(true);
  };

  const handleDelete = (id: string) => {
    dialog.setProps({
      title: "Confirmation",
      buttonColor: "danger",
      message: "Do you want to delete this transaction?",
      onConfirm: () => {
        deleteTransactionMutation.mutate(id);
      },
    });
    dialog.show();
  };

  useEffect(() => {
    setCurrentPage(0);
  }, [selectedMonth]);

  if (transactionsQuery.isLoading) {
    return <TableLoading></TableLoading>;
  }

  if (mode === "IMPORT") {
    return (
      <ImportTableView handleSave={() => setMode("VIEW")}></ImportTableView>
    );
  }

  return (
    <>
      <CardBoxModal
        {...dialog.props}
        buttonLabel="Confirm"
        isActive={dialog.isOpen}
        onCancel={dialog.hide}
      ></CardBoxModal>

      <CardTable>
        <form
          id="createForm"
          hidden
          onSubmit={createForm.handleSubmit(onCreateFormSubmit)}
        ></form>
        <form
          id="editForm"
          hidden
          onSubmit={editForm.handleSubmit(onEditFormSubmit)}
        ></form>
        <div className="flex min-w-full flex-wrap items-center justify-between pb-4">
          <SearchInput></SearchInput>
          <div className="ml-6 mt-4 flex sm:mr-6 sm:mt-0">
            <Datetime
              timeFormat={false}
              onChange={(value: moment.Moment | string) =>
                setSelectedMonth(moment(value))
              }
              value={selectedMonth}
              dateFormat="MMMM, YYYY"
              className="w-40"
              inputProps={{
                form: "createForm",
                placeholder: "Select date",
                className:
                  "block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",
              }}
            />
            <BaseButton
              icon={mdiPlusThick}
              color="contrast"
              className={"ml-2"}
              disabled={mode === "CREATE"}
              onClick={() => setMode("CREATE")}
            />
            <BaseButton
              icon={mdiFileImport}
              tooltip="Import transactions"
              color="contrast"
              className={"ml-2"}
              onClick={() => setMode("IMPORT")}
            />
          </div>
        </div>

        {transactionsQuery.data?.totalCount === 0 && mode !== "EMPTY" && (
          <EmptyTransactions></EmptyTransactions>
        )}

        <CardTable>
          <div className="block md:hidden">
            {transactionsQuery?.data?.transactions?.map((transaction, i) => (
              <TransactionCard
                key={transaction?.id}
                transaction={transaction}
                index={i}
                handleEdit={handleCardEdit}
              ></TransactionCard>
            ))}
          </div>
          {(transactionsQuery.data?.totalCount != 0 || mode === "CREATE") && (
            <>
              <Table
                isPaginated
                currentPage={currentPage}
                totalItems={totalCount}
                itemsInCurrentPage={
                  transactionsQuery?.data?.transactions?.length
                }
                setCurrentPage={setCurrentPage}
              >
                <TableHeaderBlock>
                  <tr>
                    <TableHeader title={""}></TableHeader>
                    <TableHeader title="Account"></TableHeader>
                    <TableHeader title="Type"></TableHeader>
                    <TableHeader title="Category" isSortable></TableHeader>
                    <TableHeader title="Payee" isSortable></TableHeader>
                    <TableHeader title="Date"></TableHeader>
                    <TableHeader title="Amount"></TableHeader>
                    <TableHeader title="Tags"></TableHeader>
                    <TableHeader></TableHeader>
                  </tr>
                </TableHeaderBlock>
                <tbody>
                  {mode === "CREATE" && (
                    <TableRow>
                      <TableCell>
                        <></>
                      </TableCell>
                      <TableCell>
                        <ControlledSelect
                          control={createForm.control}
                          form="createForm"
                          name="sourceAccount"
                          options={accountsQuery?.data?.accounts}
                        ></ControlledSelect>
                      </TableCell>
                      <TableCell>
                        <ControlledSelect
                          control={createForm.control}
                          form="createForm"
                          name="type"
                          options={TransactionTypeOptions}
                          isSimple
                        ></ControlledSelect>
                      </TableCell>
                      <TableCell>
                        <ControlledSelect
                          control={createForm.control}
                          form="createForm"
                          isDisabled={createForm.watch("type") == null}
                          isLoading={categoriesQuery.isLoading}
                          name="category"
                          options={categoriesQuery?.data?.categories}
                        ></ControlledSelect>
                      </TableCell>
                      <TableCell>
                        {createForm.watch("type") ===
                          TRANSACTION_TYPE.TRANSFER && (
                          <ControlledSelect
                            control={createForm.control}
                            form="createForm"
                            name="transferredAccount"
                            options={accountsQuery?.data?.accounts?.filter(
                              (account) =>
                                account.id !==
                                createForm.watch("sourceAccount")?.id,
                            )}
                          ></ControlledSelect>
                        )}
                        {createForm.watch("type") !==
                          TRANSACTION_TYPE.TRANSFER && (
                          <ControlledSelect
                            isLoading={payeesQuery.isLoading}
                            control={createForm.control}
                            isDisabled={createForm.watch("type") == null}
                            rules={{ required: false }}
                            form="createForm"
                            name="payee"
                            options={payeesQuery?.data?.payees}
                            isClearable
                          ></ControlledSelect>
                        )}
                      </TableCell>

                      <TableCell>
                        <ControlledDateTime
                          control={createForm.control}
                          name="timeCreated"
                          form="createForm"
                        ></ControlledDateTime>
                      </TableCell>

                      <TableCell>
                        <ControlledInputMoney
                          control={createForm.control}
                          name="amount"
                          form="createForm"
                          inputProps={{
                            placeholder: "Amount",
                            required: true,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          control={createForm.control}
                          name={"tags"}
                          rules={{ required: false }}
                          render={({ field }) => (
                            <Tags
                              onChange={(e) => {
                                field.onChange(
                                  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
                                  e.detail.tagify
                                    .getCleanValue()
                                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
                                    .map((tag) => ({ name: tag.value })),
                                );
                              }}
                              value={field.value?.map((tag) => ({
                                value: tag.name,
                              }))}
                            />
                          )}
                        ></Controller>
                      </TableCell>
                      <TableCell>
                        <BaseButtons type="justify-start lg:justify-end" noWrap>
                          <BaseButton
                            color="success"
                            icon={mdiPlus}
                            small
                            type="submit"
                            form="createForm"
                            // onClick={props?.handleCreate}
                          />
                          <BaseButton
                            color="danger"
                            icon={mdiCancel}
                            small
                            onClick={() => {
                              createForm.reset();
                              setMode("VIEW");
                            }}
                          ></BaseButton>
                        </BaseButtons>
                      </TableCell>
                    </TableRow>
                  )}
                  {transactionsQuery?.data.transactions?.map(
                    (transaction, i) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <IconRounded
                            color={"transparent"}
                            bg
                            icon={IconMap[transaction.category.icon]}
                          ></IconRounded>{" "}
                        </TableCell>
                        <TableCell>
                          {isInEditMode === i ? (
                            <ControlledSelect
                              control={editForm.control}
                              form="editForm"
                              name="sourceAccount"
                              options={accountsQuery?.data.accounts}
                            ></ControlledSelect>
                          ) : (
                            transaction.sourceAccount.name
                          )}
                        </TableCell>
                        <TableCell>
                          {isInEditMode === i ? (
                            <ControlledSelect
                              control={editForm.control}
                              form="editForm"
                              name="type"
                              isSimple
                              options={TransactionTypeOptions}
                            ></ControlledSelect>
                          ) : (
                            transaction.type.charAt(0) +
                            transaction.type.substring(1).toLowerCase()
                          )}
                        </TableCell>
                        <TableCell>
                          {isInEditMode === i ? (
                            <ControlledSelect
                              control={editForm.control}
                              isLoading={categoriesQuery.isLoading}
                              isDisabled={editForm.watch("type") == null}
                              form="editForm"
                              name="category"
                              options={categoriesQuery?.data?.categories}
                            ></ControlledSelect>
                          ) : (
                            transaction.category.name
                          )}
                        </TableCell>
                        <TableCell>
                          {isInEditMode === i ? (
                            editForm.watch("type") !==
                            TRANSACTION_TYPE.TRANSFER ? (
                              <ControlledSelect
                                control={editForm.control}
                                form="editForm"
                                isClearable={true}
                                isLoading={payeesQuery.isLoading}
                                isDisabled={editForm.watch("type") == null}
                                name="payee"
                                rules={{ required: false }}
                                options={payeesQuery?.data?.payees}
                              ></ControlledSelect>
                            ) : (
                              <ControlledSelect
                                control={editForm.control}
                                form="editForm"
                                isDisabled={editForm.watch("type") == null}
                                name="transferredAccount"
                                options={accountsQuery?.data.accounts.filter(
                                  (account) =>
                                    account.id !==
                                    editForm.watch("sourceAccount")?.id,
                                )}
                              ></ControlledSelect>
                            )
                          ) : transaction.type === "TRANSFER" ? (
                            transaction?.transferredAccount?.name
                          ) : (
                            transaction.payee?.name
                          )}
                        </TableCell>

                        <TableCell>
                          {isInEditMode === i ? (
                            <ControlledDateTime
                              control={editForm.control}
                              name="timeCreated"
                              form="editForm"
                            ></ControlledDateTime>
                          ) : (
                            DateFormater.format(
                              new Date(transaction.timeCreated),
                            )
                          )}
                        </TableCell>

                        <TableCell>
                          {isInEditMode === i ? (
                            <ControlledInputMoney
                              control={editForm.control}
                              name="amount"
                              form="editForm"
                              inputProps={{
                                placeholder: "Amount",
                                required: true,
                              }}
                            />
                          ) : (
                            <span
                              className={
                                transaction?.type === "DEBIT"
                                  ? "font-semibold text-red-600"
                                  : transaction?.type === "CREDIT"
                                  ? "font-semibold text-green-500"
                                  : "font-semibold text-blue-500"
                              }
                            >
                              <NumberDynamic
                                value={transaction?.amount}
                                prefix={`${
                                  transaction?.type === "DEBIT"
                                    ? "-"
                                    : transaction?.type === "CREDIT"
                                    ? "+"
                                    : "  "
                                } ₹`}
                              ></NumberDynamic>
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {isInEditMode === i ? (
                            <Controller
                              control={editForm.control}
                              name={"tags"}
                              rules={{ required: false }}
                              render={({ field }) => (
                                <Tags
                                  onChange={(e) => {
                                    field.onChange(
                                      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
                                      e.detail.tagify
                                        .getCleanValue()
                                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
                                        .map((tag) => ({ name: tag.value })),
                                    );
                                  }}
                                  value={field.value?.map((tag) => ({
                                    value: tag.name,
                                  }))}
                                />
                              )}
                            ></Controller>
                          ) : (
                            transaction?.tags.map((tag) => (
                              <span
                                className={
                                  "mr-2 rounded-lg border-0 bg-gray-300 p-1 pl-2 pr-2 text-black"
                                }
                                key={tag.id}
                              >
                                {tag.name}
                              </span>
                            ))
                          )}
                        </TableCell>
                        <TableCell>
                          {isInEditMode !== i ? (
                            <BaseButtons
                              type="justify-start lg:justify-end"
                              noWrap
                            >
                              <BaseButton
                                color="info"
                                icon={mdiPencil}
                                onClick={() => handleEdit(i)}
                                small
                              />
                              <BaseButton
                                color="danger"
                                icon={mdiTrashCan}
                                onClick={() => handleDelete(transaction?.id)}
                                small
                              ></BaseButton>
                            </BaseButtons>
                          ) : (
                            <BaseButtons
                              type="justify-start lg:justify-end"
                              noWrap
                            >
                              <BaseButton
                                color="success"
                                icon={mdiCheck}
                                type="submit"
                                form="editForm"
                                small
                              />
                              <BaseButton
                                color="danger"
                                onClick={() => setIsInEditMode(-1)}
                                icon={mdiCancel}
                                small
                              />
                            </BaseButtons>
                          )}
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                  {!transactionsQuery.isLoading && totalCount === 0 && (
                    <tr className="h-40">
                      <td rowSpan={6} className="text-center" colSpan={5}>
                        No transactions found!
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </>
          )}
        </CardTable>
      </CardTable>
      <Sheet
        snapPoints={[0.5]}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      >
        <Sheet.Container>
          <Sheet.Header />
          <Sheet.Content>
            <div className={"p-2"}>
              <div className={"mb-2 grid grid-cols-2 gap-1"}>
                <div className="mb-4">
                  <label
                    className="mb-2 block text-sm font-medium text-gray-900
                  dark:text-white"
                  >
                    Account
                  </label>

                  <ControlledSelect
                    portal={null}
                    control={editForm.control}
                    form="editForm"
                    name="sourceAccount"
                    options={accountsQuery?.data.accounts}
                  ></ControlledSelect>
                </div>
                <div className="mb-4">
                  <label
                    className="mb-2 block text-sm font-medium text-gray-900
                  dark:text-white"
                  >
                    Type
                  </label>
                  <ControlledSelect
                    control={editForm.control}
                    form="editForm"
                    portal={null}
                    name="type"
                    isSimple
                    options={TransactionTypeOptions}
                  ></ControlledSelect>
                </div>
                <div className="mb-4">
                  <label
                    className="mb-2 block text-sm font-medium text-gray-900
                  dark:text-white"
                  >
                    Category
                  </label>
                  <ControlledSelect
                    control={editForm.control}
                    isLoading={categoriesQuery.isLoading}
                    portal={null}
                    isDisabled={editForm.watch("type") == null}
                    form="editForm"
                    name="category"
                    options={categoriesQuery?.data?.categories}
                  ></ControlledSelect>
                </div>
                <div className="mb-4">
                  <label
                    className="mb-2 block text-sm font-medium text-gray-900
                  dark:text-white"
                  >
                    Payee
                  </label>
                  {editForm.watch("type") !== TRANSACTION_TYPE.TRANSFER ? (
                    <ControlledSelect
                      control={editForm.control}
                      form="editForm"
                      isClearable={true}
                      portal={null}
                      isLoading={payeesQuery.isLoading}
                      isDisabled={editForm.watch("type") == null}
                      name="payee"
                      rules={{ required: false }}
                      options={payeesQuery?.data?.payees}
                    ></ControlledSelect>
                  ) : (
                    <ControlledSelect
                      control={editForm.control}
                      form="editForm"
                      isDisabled={editForm.watch("type") == null}
                      name="transferredAccount"
                      portal={null}
                      options={accountsQuery?.data.accounts.filter(
                        (account) =>
                          account.id !== editForm.watch("sourceAccount")?.id,
                      )}
                    ></ControlledSelect>
                  )}
                </div>
                <div className="mb-4">
                  <label
                    className="mb-2 block text-sm font-medium text-gray-900
                  dark:text-white"
                  >
                    Date
                  </label>
                  <ControlledDateTime
                    inputClassName={"w-full"}
                    control={editForm.control}
                    name="timeCreated"
                    form="editForm"
                  ></ControlledDateTime>
                </div>
                <div className="mb-4">
                  <label
                    className="mb-2 block text-sm font-medium text-gray-900
                  dark:text-white"
                  >
                    Amount
                  </label>
                  <ControlledInputMoney
                    control={editForm.control}
                    name="amount"
                    form="editForm"
                    className="w-full"
                    inputProps={{
                      placeholder: "Amount",
                      required: true,
                    }}
                  />
                </div>
              </div>
              <BaseButton
                className={"mr-3"}
                color={"success"}
                label={"Save"}
                type={"submit"}
                form={"editForm"}
              ></BaseButton>
              <BaseButton
                label={"Cancel"}
                color={"danger"}
                onClick={() => setIsSheetOpen(false)}
              ></BaseButton>
            </div>
          </Sheet.Content>
        </Sheet.Container>

        <Sheet.Backdrop />
      </Sheet>
    </>
  );
};

export default TransactionsTableView;
