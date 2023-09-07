/* eslint-disable @typescript-eslint/no-misused-promises */

import React, { useContext, useState } from "react";
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
import "react-datetime/css/react-datetime.css";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { api, type RouterInputs, type RouterOutputs } from "~/utils/api";
import { TopLoadingBarStateContext } from "~/utils/contexts";
import { CardTable } from "~/components/common/cards/CardTable";
import { Table } from "~/components/common/table/Table";
import { TableCell } from "~/components/common/table/TableCell";
import { TableHeaderBlock } from "~/components/common/table/TableHeaderBlock";
import { TableRow } from "~/components/common/table/TableRow";
import { SearchInput } from "~/components/forms/SearchInput";
import { useDialog } from "~/hooks/useDialog";
import { useTable } from "~/hooks/useTable";
import CardBoxModal from "../common/cards/CardBoxModal";
import { TableHeader } from "../common/table/TableHeader";
import { ControlledInput } from "../forms/ControlledInput";
import { ControlledSelect } from "../forms/ControlledSelect";

export type PayeeList = RouterOutputs["payee"]["listPayees"]["payees"];
export type PayeeCreate = RouterInputs["payee"]["addPayee"];
export type PayeeUpdate = RouterInputs["payee"]["updatePayee"];

const PayeeTableView = () => {
  const [isInEditMode, setIsInEditMode, createForm, editForm] =
    useTable<PayeeList[0]>();
  const [isCreateMode, setIsCreateMode] = useState(false);
  const categoriesQuery = api.category.listCategories.useQuery();
  const payeesQuery = api.payee.listPayees.useQuery();

  const dialog = useDialog();
  const topLoadingBar = useContext(TopLoadingBarStateContext);

  const searchForm = useForm<{ query: string }>();
  const [searchQuery, setSearchQuery] = useState<string>();

  const handleSearchFormSubmit = (data: { query: string }) => {
    setSearchQuery(data.query);
  };

  const payeeUpdateMutation = api.payee.updatePayee.useMutation({
    onSuccess: async () => {
      createForm.reset();
      setIsCreateMode(false);
      await payeesQuery.refetch();
      toast.success("Payee updated successfully");
    },
    onError: (err) => {
      toast.error("Error updating payee");
      console.log(err);
    },
    onSettled: () => {
      topLoadingBar.hide();
      setIsInEditMode(-1);
    },
  });
  const payeeCreateMutation = api.payee.addPayee.useMutation({
    onSuccess: async () => {
      editForm.reset();
      setIsCreateMode(false);
      await payeesQuery.refetch();
      toast.success("Payee created successfully");
    },
    onError: (err) => {
      toast.error("Error creating payee");
      console.log(err);
    },
    onSettled: () => {
      topLoadingBar.hide();
    },
  });
  const payeeDeleteMutation = api.payee.deletePayee.useMutation({
    onSuccess: async () => {
      await payeesQuery.refetch();
      toast.success("Payee deleted successfully");
    },
    onError: (err) => {
      toast.error("Error deleting payee");
      console.log(err);
    },
    onSettled: () => {
      topLoadingBar.hide();
    },
  });

  const [hack, setHack] = useState(false);

  const onCreateFormSubmit = (data: PayeeList[0]) => {
    console.log(data);
    const payload: PayeeCreate = {
      name: data.name,
      categoryIds: data.categories.map((c) => c.id),
    };
    dialog.setProps({
      title: "Confirmation",
      buttonColor: "success",
      message: "Do you want to create this payee?",
      onConfirm: () => {
        dialog.hide();
        payeeCreateMutation.mutate(payload);
      },
    });
    dialog.show();
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
    dialog.setProps({
      title: "Confirmation",
      buttonColor: "success",
      message: "Do you want to edit this payee?",
      onConfirm: () => {
        dialog.hide();
        payeeUpdateMutation.mutate(payload);
      },
    });
    dialog.show();
  };

  const handleEdit = (i: number) => {
    editForm.reset(payeesQuery.data.payees[i]);
    setIsInEditMode(i);
    setHack(true);
  };

  const handleDelete = (id: string) => {
    dialog.setProps({
      title: "Confirmation",
      buttonColor: "danger",
      message: "Do you want to delete this payee?",
      onConfirm: () => {
        dialog.hide();
        payeeDeleteMutation.mutate({ id });
      },
    });
    dialog.show();
  };

  if (payeesQuery.isLoading) {
    return <TableLoading></TableLoading>;
  }

  return (
    <>
      <CardBoxModal
        {...dialog.props}
        buttonLabel="Confirm"
        isActive={dialog.isOpen}
        onCancel={() => dialog.hide()}
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
          <SearchInput
            placeholder={"Search payees"}
            onEnter={searchForm.handleSubmit(handleSearchFormSubmit)}
            control={searchForm.control}
            name={"query"}
          ></SearchInput>
          <div className={"mr-2"}>
            <BaseButton
              icon={mdiPlusThick}
              color="contrast"
              disabled={isCreateMode}
              onClick={() => setIsCreateMode(true)}
            />
          </div>
        </div>

        <Table>
          <TableHeaderBlock>
            <tr>
              <TableHeader title="Name"></TableHeader>
              <TableHeader title="Category" isSortable></TableHeader>
              <TableHeader></TableHeader>
            </tr>
          </TableHeaderBlock>
          <tbody>
            {isCreateMode && (
              <TableRow>
                <TableCell>
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
                </TableCell>
                <TableCell>
                  <ControlledSelect
                    control={createForm.control}
                    name="categories"
                    options={categoriesQuery.data?.categories}
                    isMulti
                    form="createForm"
                  ></ControlledSelect>
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
            {payeesQuery.data.payees?.map((payee, i) => (
              <TableRow key={payee.id}>
                <TableCell>
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
                </TableCell>
                <TableCell>
                  {isInEditMode === i ? (
                    <ControlledSelect
                      control={editForm.control}
                      name="categories"
                      isMulti
                      options={categoriesQuery.data?.categories}
                      form="editForm"
                    ></ControlledSelect>
                  ) : (
                    payee.categories.map((category) => category.name).join(", ")
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
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </CardTable>
    </>
  );
};

export default PayeeTableView;
