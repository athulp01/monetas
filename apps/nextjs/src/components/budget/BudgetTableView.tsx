/* eslint-disable @typescript-eslint/no-misused-promises */

import { useContext, useState } from "react";
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
import Datetime from "react-datetime";

import TableLoading from "../common/loading/TableLoading";
import NumberDynamic from "../common/misc/NumberDynamic";
import "react-datetime/css/react-datetime.css";
import moment from "moment";
import { toast } from "react-toastify";

import { api, type RouterInputs, type RouterOutputs } from "~/utils/api";
import { TopLoadingBarStateContext } from "~/utils/contexts";
import { EmptyBudget } from "~/components/budget/EmptyBudget";
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
import { ControlledInputMoney } from "../forms/ControlledInputMoney";
import { ControlledSelect } from "../forms/ControlledSelect";

export type BudgetList = RouterOutputs["budget"]["listBudgets"]["budget"];
export type BudgetCreate = RouterInputs["budget"]["addBudget"];
export type BudgetUpdate = RouterInputs["budget"]["updateBudget"];

const getColorOfRemaining = (remaining: number) => {
  if (remaining < 0.5) {
    return "text-green-600 bg-green-600";
  } else if (remaining < 0.75) {
    return "text-yellow-600 bg-yellow-600";
  } else {
    return "text-red-600 bg-red-600";
  }
};

const BudgetTableView = () => {
  const topLoadingBar = useContext(TopLoadingBarStateContext);
  const dialog = useDialog();
  const [isInEditMode, setIsInEditMode, createForm, editForm] =
    useTable<BudgetList[0]>();
  const [isCreateMode, setIsCreateMode] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<moment.Moment>(moment());

  const categoriesQuery = api.category.listCategories.useQuery();
  const budgetQuery = api.budget.listBudgets.useQuery({
    month: selectedMonth.toDate(),
  });

  const budgetCreateMutation = api.budget.addBudget.useMutation({
    onSuccess: async () => {
      await budgetQuery.refetch();
      createForm.reset();
      setIsCreateMode(false);
      toast.success("Budget created successfully");
    },
    onError: (err) => {
      toast.error("Error creating budget");
      console.log(err);
    },
    onSettled: () => {
      topLoadingBar.hide();
    },
  });
  const budgetUpdateMutation = api.budget.updateBudget.useMutation({
    onSuccess: async () => {
      await budgetQuery.refetch();
      setIsInEditMode(-1);
      editForm.reset();
      toast.success("Budget updated successfully");
    },
    onError: (err) => {
      toast.error("Error updating budget");
      console.log(err);
    },
    onSettled: () => {
      topLoadingBar.hide();
    },
  });
  const budgetDeleteMutation = api.budget.deleteBudget.useMutation({
    onSuccess: async () => {
      await budgetQuery.refetch();
      toast.success("Budget deleted successfully");
    },
    onError: (err) => {
      toast.error("Error deleting budget");
      console.log(err);
    },
    onSettled: () => {
      topLoadingBar.hide();
    },
  });

  const [hack, setHack] = useState(false);

  const onCreateFormSubmit = (data: BudgetList[0]) => {
    const payload: BudgetCreate = {
      amount: +data.budgetedAmount,
      categoryId: data.category.id,
      month: selectedMonth.toDate(),
    };
    dialog.setProps({
      title: "Confirmation",
      buttonColor: "success",
      message: "Do you want to create this budget?",
      onConfirm: () => {
        topLoadingBar.show();
        dialog.hide();
        budgetCreateMutation.mutate(payload);
      },
    });
    dialog.show();
  };

  const onEditFormSubmit = (data: BudgetList[0]) => {
    if (hack) {
      setHack(false);
      return;
    }
    const payload: BudgetUpdate = {
      id: budgetQuery.data.budget[isInEditMode].id,
      amount: +data.budgetedAmount,
      categoryId: data.category.id,
    };
    dialog.setProps({
      title: "Confirmation",
      buttonColor: "success",
      message: "Do you want to edit this budget?",
      onConfirm: () => {
        topLoadingBar.show();
        dialog.hide();
        budgetUpdateMutation.mutate(payload);
      },
    });
    dialog.show();
  };

  const handleEdit = (i: number) => {
    editForm.reset(budgetQuery.data.budget[i]);
    setIsInEditMode(i);
    setHack(true);
  };

  const handleDelete = (id: string) => {
    dialog.setProps({
      title: "Confirmation",
      buttonColor: "danger",
      message: "Do you want to delete this budget?",
      onConfirm: () => {
        topLoadingBar.show();
        dialog.hide();
        budgetDeleteMutation.mutate({ id });
      },
    });
    dialog.show();
  };

  if (budgetQuery.isLoading) {
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
          <SearchInput></SearchInput>
          <div className="ml-6 mt-4 flex sm:mr-6 sm:mt-0">
            <Datetime
              timeFormat={false}
              onChange={(value: moment.Moment) => setSelectedMonth(value)}
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
              className={"ml-3"}
              icon={mdiPlusThick}
              color="contrast"
              disabled={isCreateMode}
              onClick={() => setIsCreateMode(true)}
            />
          </div>
        </div>

        {budgetQuery.data?.budget?.length === 0 && !isCreateMode && (
          <EmptyBudget></EmptyBudget>
        )}
        {(budgetQuery.data?.budget?.length != 0 || isCreateMode) && (
          <Table>
            <TableHeaderBlock>
              <tr>
                <TableHeader title="Category"></TableHeader>
                <TableHeader title="Budgeted" isSortable></TableHeader>
                <TableHeader title="Spent" isSortable></TableHeader>
                <TableHeader></TableHeader>
                <TableHeader></TableHeader>
              </tr>
            </TableHeaderBlock>
            <tbody>
              {isCreateMode && (
                <TableRow>
                  <TableCell>
                    <ControlledSelect
                      control={createForm.control}
                      name="category"
                      form="createForm"
                      options={categoriesQuery.data.categories}
                    ></ControlledSelect>
                  </TableCell>
                  <TableCell>
                    <ControlledInputMoney
                      form="createForm"
                      control={createForm.control}
                      name="budgetedAmount"
                      inputProps={{
                        placeholder: "Budgeted",
                        required: true,
                      }}
                    ></ControlledInputMoney>
                  </TableCell>
                  <TableCell>N/A</TableCell>
                  <TableCell>N/A</TableCell>
                  <TableCell>
                    <BaseButtons type="justify-start md:justify-end" noWrap>
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
              {budgetQuery.data.budget?.map((budget, i) => (
                <TableRow key={budget.id}>
                  <TableCell>
                    {isInEditMode === i ? (
                      <ControlledSelect
                        control={editForm.control}
                        name="category"
                        form="editForm"
                        options={categoriesQuery.data.categories}
                      ></ControlledSelect>
                    ) : (
                      budget.category.name
                    )}
                  </TableCell>
                  <TableCell>
                    {isInEditMode === i ? (
                      <ControlledInputMoney
                        form="editForm"
                        control={editForm.control}
                        name="budgetedAmount"
                        inputProps={{
                          placeholder: "Budgeted",
                          required: true,
                        }}
                      ></ControlledInputMoney>
                    ) : (
                      <span>
                        <NumberDynamic
                          value={budget?.budgetedAmount}
                          prefix={`₹`}
                        ></NumberDynamic>
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`${getColorOfRemaining(
                        Math.round(budget?.spent / budget?.budgetedAmount),
                      )} font-bold`}
                    >
                      <NumberDynamic
                        value={budget?.spent}
                        prefix={`₹`}
                      ></NumberDynamic>
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="mb-1 flex justify-end">
                      <span className="text-sm font-medium text-black dark:text-white">{`${Math.round(
                        (budget?.spent / budget?.budgetedAmount) * 100,
                      )}%`}</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className={`h-2.5 rounded-full ${getColorOfRemaining(
                          Math.round(budget?.spent / budget?.budgetedAmount),
                        )}`}
                        style={{
                          width: `${Math.min(
                            Math.round(
                              (budget?.spent / budget?.budgetedAmount) * 100,
                            ),
                            100,
                          )}%`,
                        }}
                      ></div>
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
                          onClick={() => handleDelete(budget?.id)}
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
        )}
      </CardTable>
    </>
  );
};

export default BudgetTableView;
