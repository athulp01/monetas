/* eslint-disable @typescript-eslint/no-misused-promises */

import { useState } from "react";
import { mdiCancel, mdiCheck, mdiPencil, mdiPlus, mdiTrashCan } from "@mdi/js";

import BaseButton from "../common/buttons/BaseButton";
import BaseButtons from "../common/buttons/BaseButtons";
import "flowbite";
import TableLoading from "../common/loading/TableLoading";
import "react-datetime/css/react-datetime.css";
import { toast } from "react-toastify";

import { api, type RouterInputs, type RouterOutputs } from "~/utils/api";
import { useTable } from "~/hooks/useTable";
import CardBoxModal, { type DialogProps } from "../common/cards/CardBoxModal";
import { TableHeader } from "../common/table/TableHeader";
import { ControlledInput } from "../forms/ControlledInput";
import { ControlledSelect } from "../forms/ControlledSelect";

export type PayeeList = RouterOutputs["payee"]["listPayees"]["payees"];
export type PayeeCreate = RouterInputs["payee"]["addPayee"];
export type PayeeUpdate = RouterInputs["payee"]["updatePayee"];

interface Props {
  isCreateMode: boolean;
  handleCreateModeCancel: () => void;
}

const PayeeTableView = (props: Props) => {
  const [isInEditMode, setIsInEditMode, createForm, editForm] =
    useTable<PayeeList[0]>();
  const categoriesQuery = api.category.listCategories.useQuery();
  const payeesQuery = api.payee.listPayees.useQuery();

  const payeeUpdateMutation = api.payee.updatePayee.useMutation({
    onSuccess: async () => {
      createForm.reset();
      props?.handleCreateModeCancel();
      toast.success("Payee updated successfully");
      await payeesQuery.refetch();
    },
    onError: (err) => {
      toast.error("Error updating payee");
      console.log(err);
    },
    onSettled: () => {
      setIsInEditMode(-1);
      setIsDialogOpen(false);
    },
  });
  const payeeCreateMutation = api.payee.addPayee.useMutation({
    onSuccess: async () => {
      editForm.reset();
      props?.handleCreateModeCancel();
      toast.success("Payee created successfully");
      await payeesQuery.refetch();
    },
    onError: (err) => {
      toast.error("Error creating payee");
      console.log(err);
    },
    onSettled: () => {
      setIsDialogOpen(false);
    },
  });
  const payeeDeleteMutation = api.payee.deletePayee.useMutation({
    onSuccess: async () => {
      toast.success("Payee deleted successfully");
      await payeesQuery.refetch();
    },
    onError: (err) => {
      toast.error("Error deleting payee");
      console.log(err);
    },
    onSettled: () => {
      setIsDialogOpen(false);
    },
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogProps, setDialogProps] =
    useState<
      Pick<DialogProps, "title" | "buttonColor" | "onConfirm" | "message">
    >(null);
  const [hack, setHack] = useState(false);

  const onCreateFormSubmit = (data: PayeeList[0]) => {
    console.log(data);
    const payload: PayeeCreate = {
      name: data.name,
      categoryIds: data.categories.map((c) => c.id),
    };
    setDialogProps({
      title: "Confirmation",
      buttonColor: "success",
      message: "Do you want to create this payee?",
      onConfirm: () => {
        payeeCreateMutation.mutate(payload);
      },
    });
    setIsDialogOpen(true);
  };

  const onEditFormSubmit = (data: PayeeList[0]) => {
    if (hack) {
      setHack(false);
      return;
    }
    const payload: PayeeUpdate = {
      name: data.name,
      id: payeesQuery.data.payees[isInEditMode].id,
      categoryIds: data.categories.map((c) => c.id),
    };
    setDialogProps({
      title: "Confirmation",
      buttonColor: "success",
      message: "Do you want to edit this payee?",
      onConfirm: () => {
        payeeUpdateMutation.mutate(payload);
      },
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (i: number) => {
    editForm.reset(payeesQuery.data.payees[i]);
    setIsInEditMode(i);
    // setHack(true)
  };

  const handleDelete = (id: string) => {
    setDialogProps({
      title: "Confirmation",
      buttonColor: "danger",
      message: "Do you want to delete this payee?",
      onConfirm: () => {
        payeeDeleteMutation.mutate({ id });
      },
    });
    setIsDialogOpen(true);
  };

  if (payeesQuery.isLoading) {
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
              placeholder="Search payees"
            ></input>
          </div>
        </div>

        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <TableHeader title="Name"></TableHeader>
                <TableHeader title="Category" isSortable></TableHeader>
                <TableHeader></TableHeader>
              </tr>
            </thead>
            <tbody>
              {props?.isCreateMode && (
                <tr className="border-b bg-white dark:border-gray-700 dark:bg-gray-800 ">
                  <td scope="row" className="px-1 py-4">
                    <ControlledInput
                      form="createForm"
                      control={createForm.control}
                      name="name"
                      inputProps={{
                        placeholder: "Name",
                        type: "text",
                        required: true,
                      }}
                    ></ControlledInput>
                  </td>
                  <td scope="row" className="px-1 py-4">
                    <ControlledSelect
                      control={createForm.control}
                      name="categories"
                      options={categoriesQuery.data?.categories}
                      isMulti
                      form="createForm"
                    ></ControlledSelect>
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
                        onClick={props?.handleCreateModeCancel}
                      ></BaseButton>
                    </BaseButtons>
                  </td>
                </tr>
              )}
              {payeesQuery.data.payees?.map((payee, i) => (
                <tr
                  key={payee.id}
                  className="border-b bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <td className="whitespace-nowrap px-1 py-4 font-medium text-gray-900">
                    {isInEditMode === i ? (
                      <ControlledInput
                        form="editForm"
                        control={editForm.control}
                        name="name"
                        inputProps={{
                          placeholder: "Name",
                          type: "text",
                          required: true,
                        }}
                      ></ControlledInput>
                    ) : (
                      payee.name
                    )}
                  </td>
                  <td scope="row" className="px-1 py-4  dark:text-white">
                    {isInEditMode === i ? (
                      <ControlledSelect
                        control={editForm.control}
                        name="categories"
                        isMulti
                        options={categoriesQuery.data?.categories}
                        form="editForm"
                      ></ControlledSelect>
                    ) : (
                      payee.categories
                        .map((category) => category.name)
                        .join(", ")
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
                          onClick={() => handleDelete(payee?.id)}
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default PayeeTableView;
