/* eslint-disable @typescript-eslint/no-misused-promises */

import React, { useContext, useEffect, useState } from "react";
import { mdiCancel, mdiCheck, mdiPencil, mdiTrashCan } from "@mdi/js";

import BaseButton from "../common/buttons/BaseButton";
import BaseButtons from "../common/buttons/BaseButtons";
import "flowbite";
import { ITEMS_PER_PAGE } from "../../config/site";
import { DateFormater } from "../../lib/utils";
import TableLoading from "../common/loading/TableLoading";
import NumberDynamic from "../common/misc/NumberDynamic";
import "react-datetime/css/react-datetime.css";
import router from "next/router";
import { TRANSACTION_TYPE } from "@prisma/client";
import { toast } from "react-toastify";

import { api, type RouterInputs, type RouterOutputs } from "~/utils/api";
import { TransactionTypeOptions } from "~/utils/constants";
import { TopLoadingBarStateContext } from "~/utils/contexts";
import { TableCell } from "~/components/common/table/TableCell";
import { TableHeaderBlock } from "~/components/common/table/TableHeaderBlock";
import { TableRow } from "~/components/common/table/TableRow";
import { useDialog } from "~/hooks/useDialog";
import { useTable } from "~/hooks/useTable";
import CardBoxModal from "../common/cards/CardBoxModal";
import { Table } from "../common/table/Table";
import { TableHeader } from "../common/table/TableHeader";
import { ControlledDateTime } from "../forms/ControlledDateTime";
import { ControlledInputMoney } from "../forms/ControlledInputMoney";
import { ControlledSelect } from "../forms/ControlledSelect";

export type UnverifiedTransactionList =
  RouterOutputs["unverifiedTransaction"]["listUnverifiedTransactions"]["unverifiedTransactions"];
export type VerifyUnverifiedTransactionInput =
  RouterInputs["unverifiedTransaction"]["verifyUnverifiedTransaction"];

const UnverifiedTransactionsTableView = () => {
  const topLoadingBar = useContext(TopLoadingBarStateContext);
  const dialog = useDialog();
  const [isInEditMode, setIsInEditMode, , editForm] =
    useTable<UnverifiedTransactionList[0]>();
  const [currentPage, setCurrentPage] = useState(0);

  const accountsQuery = api.account.listAccounts.useQuery();
  const payeesQuery = api.payee.listPayees.useQuery();
  const categoriesQuery = api.category.listCategories.useQuery();
  const unverifiedTransactionsQuery =
    api.unverifiedTransaction.listUnverifiedTransactions.useQuery({
      page: currentPage,
      perPage: ITEMS_PER_PAGE,
    });

  useEffect(() => {
    // Always do navigations after the first render
    void router.push("/transactions?review=true", undefined, { shallow: true });
  }, []);

  const unverifiedTransactionDeleteMutation =
    api.unverifiedTransaction.deleteUnverifiedTransaction.useMutation({
      onSuccess: async () => {
        await unverifiedTransactionsQuery.refetch();
        toast.success("Transaction deleted successfully");
      },
      onError: (err) => {
        toast.error("Error deleting transaction");
        console.log(err);
      },
      onSettled: () => {
        topLoadingBar.hide();
      },
    });
  const createTransactionMutation =
    api.unverifiedTransaction.verifyUnverifiedTransaction.useMutation({
      onSuccess: async () => {
        await unverifiedTransactionsQuery.refetch();
        editForm.reset();
        setIsInEditMode(-1);
        topLoadingBar.hide();
        toast.success("Transaction created successfully");
      },
      onError: (err) => {
        topLoadingBar.hide();
        toast.error("Error creating transaction");
        console.log(err);
      },
    });

  const totalCount = unverifiedTransactionsQuery?.data?.totalCount || 0;

  const onCreateFormSubmit = (data: UnverifiedTransactionList[0]) => {
    const payload: VerifyUnverifiedTransactionInput = {
      amount: data.amount,
      sourceAccountId: data.sourceAccount.id,
      categoryId: data.category.id,
      transferredAccountId: data.transferredAccount?.id,
      payeeId: data.payee?.id,
      type: data.type,
      unverifiedTransactionId: data.id,
    };
    dialog.setProps({
      title: "Confirmation",
      buttonColor: "success",
      message: "Do you want to verify and add this transaction?",
      onConfirm: () => {
        topLoadingBar.show();
        dialog.hide();
        createTransactionMutation.mutate(payload);
      },
    });
    dialog.show();
  };

  const handleEdit = (i: number) => {
    editForm.reset(
      unverifiedTransactionsQuery?.data?.unverifiedTransactions[i],
    );
    setIsInEditMode(i);
  };

  const handleDelete = (id: string) => {
    dialog.setProps({
      title: "Confirmation",
      buttonColor: "danger",
      message: "Do you want to delete this transaction?",
      onConfirm: () => {
        topLoadingBar.show();
        dialog.hide();
        unverifiedTransactionDeleteMutation.mutate({ id });
      },
    });
    dialog.show();
  };

  if (unverifiedTransactionsQuery.isLoading) {
    return <TableLoading></TableLoading>;
  }

  return (
    <>
      <CardBoxModal
        {...dialog.props}
        buttonLabel="Confirm"
        isActive={dialog.isOpen}
        onCancel={dialog.hide}
      ></CardBoxModal>
      <div className="relative mt-6 overflow-x-auto shadow-md sm:rounded-lg">
        <form
          id="editForm"
          hidden
          onSubmit={editForm.handleSubmit(onCreateFormSubmit)}
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
        </div>

        <div className="relative overflow-x-auto p-2 shadow-md sm:rounded-lg">
          <Table
            isPaginated
            currentPage={currentPage}
            totalItems={totalCount}
            itemsInCurrentPage={
              unverifiedTransactionsQuery?.data?.unverifiedTransactions?.length
            }
            setCurrentPage={setCurrentPage}
          >
            <TableHeaderBlock>
              <tr>
                <TableHeader title="Account"></TableHeader>
                <TableHeader title="Type"></TableHeader>
                <TableHeader title="Category" isSortable></TableHeader>
                <TableHeader title="Payee" isSortable></TableHeader>
                <TableHeader title="Date"></TableHeader>
                <TableHeader title="Amount"></TableHeader>
                <TableHeader title="Narration"></TableHeader>
                <TableHeader></TableHeader>
              </tr>
            </TableHeaderBlock>
            <tbody>
              {unverifiedTransactionsQuery.data?.unverifiedTransactions?.map(
                (transaction, i) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {isInEditMode === i ? (
                        <ControlledSelect
                          control={editForm.control}
                          form="editForm"
                          name="sourceAccount"
                          options={accountsQuery?.data.accounts}
                        ></ControlledSelect>
                      ) : (
                        transaction?.sourceAccount?.name ?? "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      {isInEditMode === i ? (
                        <ControlledSelect
                          control={editForm.control}
                          form="editForm"
                          name="type"
                          options={TransactionTypeOptions}
                          isSimple
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
                          form="editForm"
                          name="category"
                          isDisabled={editForm.watch("type") == null}
                          isLoading={categoriesQuery.isLoading}
                          options={categoriesQuery?.data.categories}
                        ></ControlledSelect>
                      ) : (
                        transaction?.category?.name ?? "N/A"
                      )}
                    </TableCell>
                    <TableCell>
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
                        transaction.payee?.name ?? "N/A"
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
                        DateFormater.format(new Date(transaction.timeCreated))
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
                              : "font-semibold text-green-500"
                          }
                        >
                          <NumberDynamic
                            value={transaction?.amount}
                            prefix={`${
                              transaction?.type === "DEBIT" ? "-" : "+"
                            } ₹`}
                          ></NumberDynamic>
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className={"w-48 truncate text-xs"}>
                        {transaction?.payeeAlias}
                      </div>
                    </TableCell>
                    <TableCell>
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
                            onClick={() => setIsInEditMode(null)}
                            icon={mdiCancel}
                            small
                          />
                        </BaseButtons>
                      )}
                    </TableCell>
                  </TableRow>
                ),
              )}
            </tbody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default UnverifiedTransactionsTableView;
