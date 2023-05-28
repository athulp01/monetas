/* eslint-disable @typescript-eslint/no-misused-promises */

import { useState } from "react";
import { mdiCancel, mdiCheck, mdiPencil, mdiPlus, mdiTrashCan } from "@mdi/js";

import BaseButton from "../common/buttons/BaseButton";
import BaseButtons from "../common/buttons/BaseButtons";
import "flowbite";
import TableLoading from "../common/loading/TableLoading";
import NumberDynamic from "../common/misc/NumberDynamic";
import "react-datetime/css/react-datetime.css";
import { INVESTMENT_TYPE } from "@prisma/client";
import { toast } from "react-toastify";

import { api, type RouterInputs, type RouterOutputs } from "~/utils/api";
import { useTable } from "~/hooks/useTable";
import { CurrencyFormatter } from "~/lib/utils";
import CardBoxModal, { type DialogProps } from "../common/cards/CardBoxModal";
import { TableHeader } from "../common/table/TableHeader";
import { ControlledInput } from "../forms/ControlledInput";

export type InvestmentList =
  RouterOutputs["investment"]["listInvestments"]["investments"];
export type InvestmentCreate = RouterInputs["investment"]["addInvestment"];
export type InvestmentUpdate = RouterInputs["investment"]["updateInvestment"];

interface Props {
  isCreateMode: boolean;
  handleCreateModeCancel: () => void;
}

const InvestmentsTableView = (props: Props) => {
  const [isInEditMode, setIsInEditMode, createForm, editForm] =
    useTable<InvestmentList[0]>();

  const investmentsQuery = api.investment.listInvestments.useQuery();
  api.investment.getQuote.useQuery(
    { symbol: createForm.watch("symbol"), type: INVESTMENT_TYPE.STOCK },
    {
      enabled: createForm.watch("symbol") != null,
      onSuccess: (data) => {
        createForm.setValue("name", data.shortName);
        createForm.setValue("currentPrice", data.regularMarketPrice);
      },
    },
  );

  const investmentCreateMutation = api.investment.addInvestment.useMutation({
    onSuccess: async () => {
      createForm.reset();
      props?.handleCreateModeCancel();
      toast.success("Investment created successfully");
      await investmentsQuery.refetch();
    },
    onError: (err) => {
      toast.error("Error creating investment");
      console.log(err);
    },
    onSettled: () => {
      setIsDialogOpen(false);
    },
  });
  const investmentUpdateMutation = api.investment.updateInvestment.useMutation({
    onSuccess: async () => {
      editForm.reset();
      toast.success("Investment updated successfully");
      await investmentsQuery.refetch();
    },
    onError: (err) => {
      toast.error("Error updating investment");
      console.log(err);
    },
    onSettled: () => {
      setIsInEditMode(-1);
      setIsDialogOpen(false);
    },
  });
  const investmentDeleteMutation = api.investment.deleteInvestment.useMutation({
    onSuccess: async () => {
      toast.success("Investment deleted successfully");
      await investmentsQuery.refetch();
    },
    onError: (err) => {
      toast.error("Error deleting investment");
      console.log(err);
    },
    onSettled: () => {
      setIsDialogOpen(false);
    },
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogProps, setDialogProps] =
    useState<
      Pick<
        DialogProps,
        "title" | "buttonColor" | "onConfirm" | "message" | "warning"
      >
    >(null);

  const onCreateFormSubmit = (investment: InvestmentList[0]) => {
    const payload: InvestmentCreate = {
      name: investment.name,
      units: +investment.units,
      buyPrice: +investment.buyPrice,
      buyDate: new Date(investment.buyDate),
      type: INVESTMENT_TYPE.STOCK,
      symbol: investment.symbol,
      currentPrice: +Math.floor(investment.currentPrice),
    };
    setDialogProps({
      title: "Confirmation",
      buttonColor: "success",
      message: "Do you want to add this investment?",
      onConfirm: () => {
        investmentCreateMutation.mutate(payload);
      },
    });
    setIsDialogOpen(true);
  };

  const onEditFormSubmit = (investment: InvestmentList[0]) => {
    const payload: InvestmentUpdate = {
      id: investmentsQuery.data.investments[isInEditMode].id,
      name: investment.name,
      units: +investment.units,
      buyPrice: +investment.buyPrice,
      buyDate: investment.buyDate,
      symbol: investment.symbol,
    };
    setDialogProps({
      title: "Confirmation",
      buttonColor: "success",
      message: "Do you want to edit this investment?",
      onConfirm: () => {
        investmentUpdateMutation.mutate(payload);
      },
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (i: number) => {
    setIsInEditMode(i);
    editForm.reset(investmentsQuery.data.investments[i]);
  };

  const handleDelete = (id: string) => {
    setDialogProps({
      title: "Confirmation",
      buttonColor: "danger",
      message: "Do you want to remove this investment?",
      onConfirm: () => {
        investmentDeleteMutation.mutate({ id });
      },
    });
    setIsDialogOpen(true);
  };

  if (investmentsQuery.isLoading) {
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
              placeholder="Search accounts"
            ></input>
          </div>
        </div>

        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <TableHeader title="Symbol"></TableHeader>
                <TableHeader title="Name"></TableHeader>
                <TableHeader title="Units" isSortable></TableHeader>
                <TableHeader title="Average Buy Price" isSortable></TableHeader>
                <TableHeader title="Current Price" isSortable></TableHeader>
                <TableHeader title="P/L" isSortable></TableHeader>
                <TableHeader></TableHeader>
              </tr>
            </thead>
            <tbody>
              {props?.isCreateMode && (
                <tr className="border-b bg-white dark:border-gray-700 dark:bg-gray-800 ">
                  <td scope="row" className="px-1 py-4">
                    <ControlledInput
                      control={createForm.control}
                      name="symbol"
                      form="createForm"
                      inputProps={{
                        placeholder: "Symbol",
                        required: true,
                      }}
                    />
                  </td>
                  <td scope="row" className="px-1 py-4">
                    <input
                      disabled
                      form="createForm"
                      {...createForm.register("name", { required: true })}
                      className={
                        "block min-w-0 flex-1 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500  dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 "
                      }
                    ></input>
                  </td>
                  <td scope="row" className="px-1 py-4">
                    <ControlledInput
                      control={createForm.control}
                      name="units"
                      form="createForm"
                      inputProps={{
                        className: "w-24",
                        width: "4",
                        placeholder: "No. of units",
                        required: true,
                      }}
                    />
                  </td>
                  <td className="px-1 py-4">
                    <div className="flex w-40">
                      <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-200 px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400">
                        ₹
                      </span>
                      <input
                        form="createForm"
                        {...createForm.register("buyPrice", { required: true })}
                        placeholder="Buy Price"
                        type="number"
                        className="block min-w-0 flex-1 rounded-none rounded-r-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500  dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                        required
                      ></input>
                    </div>
                  </td>
                  <td className="px-1 py-4">
                    <div className="flex w-40">
                      <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-200 px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400">
                        ₹
                      </span>
                      <input
                        form="createForm"
                        {...createForm.register("currentPrice", {
                          required: true,
                        })}
                        placeholder="Current Price"
                        type="number"
                        disabled
                        className="block min-w-0 flex-1 rounded-none rounded-r-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500  dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                        required
                      ></input>
                    </div>
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
              {investmentsQuery.data.investments?.map((investment, i) => (
                <tr
                  key={investment.id}
                  className="border-b bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <td className="whitespace-nowrap px-1 py-4 font-medium text-gray-900">
                    {isInEditMode === i ? (
                      <ControlledInput
                        control={editForm.control}
                        name="symbol"
                        form="editForm"
                        inputProps={{
                          placeholder: "Symbol",
                          required: true,
                        }}
                      />
                    ) : (
                      investment.symbol
                    )}
                  </td>
                  <td className="whitespace-nowrap px-1 py-4">
                    {isInEditMode === i ? (
                      <input
                        className={
                          "block min-w-0 flex-1 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500  dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 "
                        }
                      ></input>
                    ) : (
                      investment.name
                    )}
                  </td>
                  <td className="whitespace-nowrap px-1 py-4 ">
                    {isInEditMode === i ? (
                      <input
                        className={
                          "block min-w-0 flex-1 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500  dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 "
                        }
                      ></input>
                    ) : (
                      investment.units
                    )}
                  </td>
                  <td scope="row" className="px-1 py-4  dark:text-white">
                    {isInEditMode === i ? (
                      <div className="flex w-40">
                        <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-200 px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400">
                          ₹
                        </span>
                        <input
                          form="editForm"
                          {...editForm.register("buyPrice", { required: true })}
                          placeholder="Buy Price"
                          type="number"
                          className="block min-w-0 flex-1 rounded-none rounded-r-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500  dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                          required
                        ></input>
                      </div>
                    ) : (
                      CurrencyFormatter.format(investment.buyPrice)
                    )}
                  </td>
                  <td className="px-1 py-4">
                    {isInEditMode === i ? (
                      <div className="flex w-40">
                        <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-200 px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400">
                          ₹
                        </span>
                        <input
                          form="createForm"
                          {...createForm.register("currentPrice", {
                            required: true,
                          })}
                          placeholder="Current Price"
                          type="number"
                          disabled
                          className="block min-w-0 flex-1 rounded-none rounded-r-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500  dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                          required
                        ></input>
                      </div>
                    ) : (
                      <NumberDynamic
                        value={Math.abs(investment?.currentPrice)}
                      ></NumberDynamic>
                    )}
                  </td>
                  <td className="px-1 py-4">
                    {isInEditMode === i ? (
                      <div>N/A</div>
                    ) : (
                      <span
                        className={
                          investment?.currentPrice - investment?.buyPrice < 0
                            ? "font-semibold text-red-600"
                            : investment?.currentPrice - investment?.buyPrice >
                              0
                            ? "font-semibold text-green-500"
                            : "font-semibold text-blue-500"
                        }
                      >
                        {investment?.currentPrice - investment?.buyPrice < 0
                          ? ""
                          : "+"}{" "}
                        {CurrencyFormatter.format(
                          (investment?.currentPrice - investment?.buyPrice) *
                            investment?.units,
                        ) +
                          ` (${
                            investment?.currentPrice - investment?.buyPrice < 0
                              ? ""
                              : "+"
                          }${Math.floor(
                            ((investment?.currentPrice - investment?.buyPrice) *
                              100) /
                              investment?.buyPrice,
                          )}%)`}
                      </span>
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
                          onClick={() => handleDelete(investment?.id)}
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

export default InvestmentsTableView;
