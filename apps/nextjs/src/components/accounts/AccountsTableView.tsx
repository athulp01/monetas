/* eslint-disable @typescript-eslint/no-misused-promises */

import { useState } from "react";
import {
  mdiCancel,
  mdiCheck,
  mdiPencil,
  mdiPlus,
  mdiPlusThick,
  mdiTrashCan,
} from "@mdi/js";

import BaseButton from "../common/buttons/BaseButton";
import BaseButtons from "../common/buttons/BaseButtons";
import "flowbite";
import TableLoading from "../common/loading/TableLoading";
import NumberDynamic from "../common/misc/NumberDynamic";
import "react-datetime/css/react-datetime.css";
import Image from "next/image";
import { toast } from "react-toastify";

import { api, type RouterInputs, type RouterOutputs } from "~/utils/api";
import { CardTable } from "~/components/common/cards/CardTable";
import { Table } from "~/components/common/table/Table";
import { TableCell } from "~/components/common/table/TableCell";
import { TableHeaderBlock } from "~/components/common/table/TableHeaderBlock";
import { TableRow } from "~/components/common/table/TableRow";
import { SearchInput } from "~/components/forms/SearchInput";
import { useTable } from "~/hooks/useTable";
import CardBoxModal, { type DialogProps } from "../common/cards/CardBoxModal";
import { TableHeader } from "../common/table/TableHeader";
import { ControlledInput } from "../forms/ControlledInput";
import { ControlledInputMoney } from "../forms/ControlledInputMoney";
import { ControlledSelect } from "../forms/ControlledSelect";

export type AccountList = RouterOutputs["account"]["listAccounts"]["accounts"];
export type AccountCreate = RouterInputs["account"]["addAccount"];
export type AccountUpdate = RouterInputs["account"]["updateAccount"];

export type ProviderList = RouterOutputs["account"]["listAccountProviders"];
export type TypeList = RouterOutputs["account"]["listAccountTypes"];

const AccountsTableView = () => {
  const [isInEditMode, setIsInEditMode, createForm, editForm] =
    useTable<AccountList[0]>();
  const [isCreateMode, setIsCreateMode] = useState(false);

  const providersQuery = api.account.listAccountProviders.useQuery();
  const typesQuery = api.account.listAccountTypes.useQuery();
  const accountsQuery = api.account.listAccounts.useQuery();

  const accountCreateMutation = api.account.addAccount.useMutation({
    onSuccess: async () => {
      createForm.reset();
      setIsCreateMode(false);
      toast.success("Account created successfully");
      await accountsQuery.refetch();
    },
    onError: (err) => {
      toast.error("Error creating account");
      console.log(err);
    },
    onSettled: () => {
      setIsDialogOpen(false);
    },
  });
  const accountUpdateMutation = api.account.updateAccount.useMutation({
    onSuccess: async () => {
      editForm.reset();
      toast.success("Account updated successfully");
      await accountsQuery.refetch();
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
  const accountDeleteMutation = api.account.deleteAccount.useMutation({
    onSuccess: async () => {
      toast.success("Account deleted successfully");
      await accountsQuery.refetch();
    },
    onError: (err) => {
      toast.error("Error deleting account");
      console.log(err);
    },
    onSettled: () => {
      setIsDialogOpen(false);
    },
  });

  const watchProvider = editForm.watch("accountProvider");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogProps, setDialogProps] =
    useState<
      Pick<
        DialogProps,
        "title" | "buttonColor" | "onConfirm" | "message" | "warning"
      >
    >(null);

  const onCreateFormSubmit = (account: AccountList[0]) => {
    const payload: AccountCreate = {
      name: account.name,
      balance: +account.balance,
      accountTypeId: account.accountType.id,
      accountProviderId: account.accountProvider.id,
      accountNumber: account.accountNumber,
    };
    setDialogProps({
      title: "Confirmation",
      buttonColor: "success",
      message: "Do you want to create this account?",
      onConfirm: () => {
        accountCreateMutation.mutate(payload);
      },
    });
    setIsDialogOpen(true);
  };

  const onEditFormSubmit = (account: AccountList[0]) => {
    const payload: AccountUpdate = {
      id: account.id,
      name: account.name,
      balance: +account.balance,
      accountTypeId: account.accountType.id,
      accountProviderId: account.accountProvider.id,
      accountNumber: account.accountNumber,
    };
    setDialogProps({
      title: "Confirmation",
      buttonColor: "success",
      message: "Do you want to edit this account?",
      onConfirm: () => {
        accountUpdateMutation.mutate(payload);
      },
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (i: number) => {
    setIsInEditMode(i);
    editForm.reset(accountsQuery.data?.accounts[i]);
  };

  const handleDelete = (id: string) => {
    setDialogProps({
      title: "Confirmation",
      buttonColor: "danger",
      message: "Do you want to delete this account?",
      warning:
        "This action would delete all transactions associated with this account",
      onConfirm: () => {
        accountDeleteMutation.mutate({ id });
      },
    });
    setIsDialogOpen(true);
  };

  if (accountsQuery.isLoading) {
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
        <div className="flex flex-wrap items-center justify-between pb-4">
          <SearchInput></SearchInput>
          <div>
            <BaseButton
              icon={mdiPlusThick}
              color="contrast"
              className={"mr-2"}
              disabled={isCreateMode}
              onClick={() => setIsCreateMode(true)}
            />
          </div>
        </div>

        <Table>
          <TableHeaderBlock>
            <tr>
              <TableHeader></TableHeader>
              <TableHeader title="Name"></TableHeader>
              <TableHeader title="Account Number"></TableHeader>
              <TableHeader title="Type" isSortable></TableHeader>
              <TableHeader title="Provider" isSortable></TableHeader>
              <TableHeader title="Balance" isSortable></TableHeader>
              <TableHeader></TableHeader>
            </tr>
          </TableHeaderBlock>
          <tbody>
            {isCreateMode && (
              <TableRow>
                <TableCell>
                  {watchProvider?.icon && (
                    <Image
                      alt="logo"
                      width={40}
                      height={40}
                      src={watchProvider?.icon}
                    ></Image>
                  )}
                </TableCell>
                <TableCell>
                  <ControlledInput
                    control={createForm.control}
                    name="name"
                    form="createForm"
                    inputProps={{
                      placeholder: "Name",
                      required: true,
                    }}
                  />
                </TableCell>
                <TableCell>
                  <ControlledInput
                    control={createForm.control}
                    name="accountNumber"
                    form="createForm"
                    inputProps={{
                      className: "w-24",
                      width: "4",
                      placeholder: "Last 4 digits",
                      required: true,
                    }}
                  />
                </TableCell>
                <TableCell>
                  <ControlledSelect
                    control={createForm.control}
                    name="accountType"
                    form="createForm"
                    options={typesQuery.data}
                  />
                </TableCell>
                <TableCell>
                  <ControlledSelect
                    control={createForm.control}
                    name="accountProvider"
                    form="createForm"
                    options={providersQuery.data}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex w-40">
                    <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-200 px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400">
                      ₹
                    </span>
                    <input
                      form="createForm"
                      {...createForm.register("balance", { required: true })}
                      placeholder="Balance"
                      type="number"
                      className="block min-w-0 flex-1 rounded-none rounded-r-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500  dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                      required
                    ></input>
                  </div>
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
                      onClick={() => setIsCreateMode(false)}
                    ></BaseButton>
                  </BaseButtons>
                </TableCell>
              </TableRow>
            )}
            {accountsQuery.data.accounts?.map((account, i) => (
              <TableRow key={account.id}>
                <TableCell>
                  <Image
                    alt="logo"
                    width={40}
                    height={40}
                    src={account.accountProvider.icon}
                  ></Image>
                </TableCell>
                <TableCell>
                  {isInEditMode === i ? (
                    <ControlledInput
                      control={editForm.control}
                      name="name"
                      form="createForm"
                      inputProps={{
                        placeholder: "Name",
                        required: true,
                      }}
                    />
                  ) : (
                    account.name
                  )}
                </TableCell>
                <TableCell>
                  {isInEditMode === i ? (
                    <ControlledInput
                      control={editForm.control}
                      name="accountNumber"
                      form="editForm"
                      inputProps={{
                        className: "w-24",
                        width: "4",
                        placeholder: "Last 4 digits",
                        required: true,
                      }}
                    />
                  ) : (
                    account.accountNumber
                  )}
                </TableCell>
                <TableCell>
                  {isInEditMode === i ? (
                    <ControlledSelect
                      control={editForm.control}
                      name="accountType"
                      form="editForm"
                      options={typesQuery.data}
                    />
                  ) : (
                    account.accountType.name
                  )}
                </TableCell>
                <TableCell>
                  {isInEditMode === i ? (
                    <ControlledSelect
                      control={editForm.control}
                      name="accountProvider"
                      form="editForm"
                      options={providersQuery.data}
                    />
                  ) : (
                    account.accountProvider.name
                  )}
                </TableCell>
                <TableCell>
                  {isInEditMode === i ? (
                    <ControlledInputMoney
                      form="editForm"
                      control={editForm.control}
                      name="balance"
                      inputProps={{
                        placeholder: "Balance",
                        required: true,
                      }}
                    />
                  ) : (
                    <span
                      className={
                        account?.balance < 0
                          ? "font-semibold text-red-600"
                          : "font-semibold text-green-500"
                      }
                    >
                      <NumberDynamic
                        value={Math.abs(account?.balance)}
                        prefix={`${account?.balance < 0 ? "-" : "+"} ₹`}
                      ></NumberDynamic>
                    </span>
                  )}
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
                        onClick={() => handleDelete(account?.id)}
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
            ))}
          </tbody>
        </Table>
      </CardTable>
    </>
  );
};

export default AccountsTableView;
