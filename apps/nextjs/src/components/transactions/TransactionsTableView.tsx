/* eslint-disable @typescript-eslint/no-misused-promises */

import { useEffect, useState } from "react";
import { mdiCancel, mdiCheck, mdiPencil, mdiPlus, mdiTrashCan } from "@mdi/js";

import BaseButton from "../common/buttons/BaseButton";
import BaseButtons from "../common/buttons/BaseButtons";
import "flowbite";
import Datetime from "react-datetime";

import { ITEMS_PER_PAGE } from "../../config/site";
import { DateFormater } from "../../lib/utils";
import TableLoading from "../common/loading/TableLoading";
import NumberDynamic from "../common/misc/NumberDynamic";
import "react-datetime/css/react-datetime.css";
import { TRANSACTION_TYPE } from "@prisma/client";
import moment from "moment";
import Sheet from "react-modal-sheet";
import ReactPaginate from "react-paginate";
import { toast } from "react-toastify";

import { api, type RouterInputs, type RouterOutputs } from "~/utils/api";
import { TransactionTypeOptions } from "~/utils/constants";
import { useTable } from "../../hooks/useTable";
import CardBoxModal, { type DialogProps } from "../common/cards/CardBoxModal";
import { TableHeader } from "../common/table/TableHeader";
import { ControlledDateTime } from "../forms/ControlledDateTime";
import { ControlledInputMoney } from "../forms/ControlledInputMoney";
import { ControlledSelect } from "../forms/ControlledSelect";
import TransactionCard from "./TransactionCard";
import "@yaireo/tagify/dist/tagify.css";
import Tags from "@yaireo/tagify/dist/react.tagify";
import { Controller } from "react-hook-form";

// React-wrapper file

// Tagify CSS

export type TransactionsList =
  RouterOutputs["transaction"]["listTransactions"]["transactions"];
export type TransactionCreate = RouterInputs["transaction"]["addTransaction"];
export type TransactionUpdate =
  RouterInputs["transaction"]["updateTransaction"];

interface Props {
  isCreateMode: boolean;
  handleCreateModeCancel: () => void;
}

const TransactionsTableView = (props: Props) => {
  const [isInEditMode, setIsInEditMode, createForm, editForm] =
    useTable<TransactionsList[0]>();
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(moment());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogProps, setDialogProps] =
    useState<
      Pick<DialogProps, "title" | "buttonColor" | "onConfirm" | "message">
    >();
  const [hack, setHack] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const transactionsQuery = api.transaction.listTransactions.useQuery({
    page: currentPage,
    perPage: ITEMS_PER_PAGE,
    month: selectedMonth.toDate(),
  });
  const totalCount = transactionsQuery.data?.totalCount || 0;
  const numPages = Math.floor(totalCount / ITEMS_PER_PAGE) + 1;

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

  const handleCardEdit = (index: number) => {
    setIsInEditMode(index);
    editForm.reset(transactionsQuery.data.transactions[index]);
    setIsSheetOpen(true);
  };
  const addTransactionMutation = api.transaction.addTransaction.useMutation({
    onSuccess: async () => {
      createForm.reset();
      props?.handleCreateModeCancel();
      toast.success("Transaction created successfully");
      await transactionsQuery.refetch();
    },
    onError: (err) => {
      toast.error("Error creating transaction");
      console.log(err);
    },
    onSettled: () => {
      setIsDialogOpen(false);
    },
  });

  const updateTransactionMutation =
    api.transaction.updateTransaction.useMutation({
      onSuccess: async () => {
        editForm.reset();
        toast.success("Transaction updated successfully");
        await transactionsQuery.refetch();
      },
      onError: (err) => {
        toast.error("Error updating transaction");
        console.log(err);
      },
      onSettled: () => {
        setIsInEditMode(-1);
        setIsDialogOpen(false);
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
        setIsDialogOpen(false);
      },
    });

  const onCreateFormSubmit = (data: TransactionsList[0]): void => {
    console.log(data);
    const payload: TransactionCreate = {
      amount: +data.amount,
      type: data.type,
      payeeId: data.payee ? data.payee?.id : undefined,
      categoryId: data.category?.id,
      sourceAccountId: data.sourceAccount?.id,
      transferredAccountId: data.transferredAccount?.id,
      timeCreated: new Date(data.timeCreated),
      tags: data.tags.map((tag) => tag.name),
    };
    setDialogProps({
      title: "Confirmation",
      buttonColor: "success",
      message: "Do you want to create this transaction?",
      onConfirm: () => {
        addTransactionMutation.mutate(payload);
      },
    });
    setIsDialogOpen(true);
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
      tags: data.tags.map((tag) => tag.name),
    };
    console.log(`Data: ${JSON.stringify(payload)}`);
    setDialogProps({
      title: "Confirmation",
      buttonColor: "success",
      message: "Do you want to edit this transaction?",
      onConfirm: () => {
        updateTransactionMutation.mutate(payload);
      },
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (i: number) => {
    editForm.reset(transactionsQuery.data.transactions[i]);
    setIsInEditMode(i);
    setHack(true);
  };

  const handleDelete = (id: string) => {
    setDialogProps({
      title: "Confirmation",
      buttonColor: "danger",
      message: "Do you want to delete this transaction?",
      onConfirm: () => {
        deleteTransactionMutation.mutate(id);
      },
    });
    setIsDialogOpen(true);
  };

  useEffect(() => {
    setCurrentPage(0);
  }, [selectedMonth]);

  if (transactionsQuery.isLoading) {
    return <TableLoading></TableLoading>;
  }

  return (
    <>
      <CardBoxModal
        {...dialogProps}
        buttonLabel="Confirm"
        isActive={isDialogOpen}
        onCancel={() => setIsDialogOpen(false)}
      ></CardBoxModal>
      <div className="relative mt-6 overflow-x-auto shadow-md sm:rounded-lg">
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
        <div className="flex flex-wrap items-center justify-between pb-4">
          <div className="relative ml-6">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
            <input
              type="text"
              id="table-search"
              className="block w-80 rounded-lg border border-gray-300 bg-gray-50 p-2 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="Search transactions"
            ></input>
          </div>
          <div className="ml-6 mt-4 sm:mr-6 sm:mt-0">
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
          </div>
        </div>

        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
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
          <table className="hidden w-full text-left text-sm text-gray-500 dark:text-gray-400 md:table">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <TableHeader title="Account"></TableHeader>
                <TableHeader title="Type"></TableHeader>
                <TableHeader title="Category" isSortable></TableHeader>
                <TableHeader title="Payee" isSortable></TableHeader>
                <TableHeader title="Date"></TableHeader>
                <TableHeader title="Amount"></TableHeader>
                <TableHeader title="Tags"></TableHeader>
                <TableHeader></TableHeader>
              </tr>
            </thead>
            <tbody>
              {props?.isCreateMode && (
                <tr className="border-b bg-white dark:border-gray-700 dark:bg-gray-800 ">
                  <td scope="row" className="px-1 py-4">
                    <ControlledSelect
                      control={createForm.control}
                      form="createForm"
                      name="sourceAccount"
                      options={accountsQuery?.data?.accounts}
                    ></ControlledSelect>
                  </td>
                  <td className="px-1 py-4">
                    <ControlledSelect
                      control={createForm.control}
                      form="createForm"
                      name="type"
                      options={TransactionTypeOptions}
                      isSimple
                    ></ControlledSelect>
                  </td>
                  <td className="px-1 py-4">
                    <ControlledSelect
                      control={createForm.control}
                      form="createForm"
                      isDisabled={createForm.watch("type") == null}
                      isLoading={categoriesQuery.isLoading}
                      name="category"
                      options={categoriesQuery?.data?.categories}
                    ></ControlledSelect>
                  </td>
                  <td className="px-1 py-4">
                    {createForm.watch("type") === TRANSACTION_TYPE.TRANSFER && (
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
                    {createForm.watch("type") !== TRANSACTION_TYPE.TRANSFER && (
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
                  </td>

                  <td className="px-1 py-4">
                    <ControlledDateTime
                      control={createForm.control}
                      name="timeCreated"
                      form="createForm"
                    ></ControlledDateTime>
                  </td>

                  <td className="px-1 py-4">
                    <ControlledInputMoney
                      control={createForm.control}
                      name="amount"
                      form="createForm"
                      inputProps={{
                        placeholder: "Amount",
                        required: true,
                      }}
                    />
                  </td>
                  <td className="px-1 py-4">
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
                  </td>
                  <td className="px-1 py-4 text-right">
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
                          props?.handleCreateModeCancel();
                        }}
                      ></BaseButton>
                    </BaseButtons>
                  </td>
                </tr>
              )}
              {transactionsQuery?.data.transactions?.map((transaction, i) => (
                <tr
                  key={transaction.id}
                  className="border-b bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <th
                    scope="row"
                    className="whitespace-nowrap px-1 py-4 font-medium text-gray-900 dark:text-white"
                  >
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
                  </th>
                  <td className="px-1 py-4">
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
                  </td>
                  <td className="px-1 py-4">
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
                  </td>
                  <td className="px-1 py-4">
                    {isInEditMode === i ? (
                      editForm.watch("type") !== TRANSACTION_TYPE.TRANSFER ? (
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
                  </td>

                  <td className="px-1 py-4">
                    {isInEditMode === i ? (
                      <ControlledDateTime
                        control={editForm.control}
                        name="timeCreated"
                        form="editForm"
                      ></ControlledDateTime>
                    ) : (
                      DateFormater.format(new Date(transaction.timeCreated))
                    )}
                  </td>

                  <td className="px-1 py-4">
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
                  </td>
                  <td className="px-1 py-4">
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
                  </td>
                  <td className="px-1 py-4 text-right">
                    {isInEditMode !== i ? (
                      <BaseButtons type="justify-start lg:justify-end" noWrap>
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
                      <BaseButtons type="justify-start lg:justify-end" noWrap>
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
                  </td>
                </tr>
              ))}
              {!transactionsQuery.isLoading && totalCount === 0 && (
                <tr className="h-40">
                  <td rowSpan={6} className="text-center" colSpan={5}>
                    No transactions found!
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <nav
            className="flex items-end justify-between p-4"
            aria-label="Table navigation"
          >
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              Showing{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {currentPage * ITEMS_PER_PAGE + 1}-
                {currentPage * ITEMS_PER_PAGE +
                  transactionsQuery?.data.transactions?.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {totalCount}
              </span>
            </span>
            <ReactPaginate
              breakLabel="..."
              nextLabel={
                <svg
                  className="w-5"
                  style={{ height: "1.14rem" }}
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              }
              onPageChange={(event) => {
                setCurrentPage(event.selected);
              }}
              pageRangeDisplayed={5}
              forcePage={currentPage}
              pageCount={numPages}
              previousLabel={
                <svg
                  className="h-5 w-5"
                  style={{ height: "1.14rem" }}
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              }
              containerClassName={
                "inline-flex items-center -space-x-px text-gray-500  bg-white border-gray-300"
              }
              pageLinkClassName={
                "px-3 py-2 leading-tight border hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              }
              breakLinkClassName={
                "px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              }
              previousLinkClassName={
                "block px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              }
              nextLinkClassName={
                "block px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              }
              activeLinkClassName={
                "z-10 px-3 py-2 leading-tight text-blue-600 border bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
              }
              renderOnZeroPageCount={null}
            />
          </nav>
        </div>
      </div>
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
