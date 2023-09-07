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
import NumberDynamic from "../common/misc/NumberDynamic";
import "react-datetime/css/react-datetime.css";
import { INVESTMENT_TYPE } from "@prisma/client";
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
import { EmptyInvestments } from "~/components/investments/EmptyInvestments";
import { useDialog } from "~/hooks/useDialog";
import { useTable } from "~/hooks/useTable";
import { CurrencyFormatter } from "~/lib/utils";
import CardBoxModal from "../common/cards/CardBoxModal";
import { TableHeader } from "../common/table/TableHeader";
import { ControlledInput } from "../forms/ControlledInput";

export type InvestmentList =
  RouterOutputs["investment"]["listInvestments"]["investments"];
export type InvestmentCreate = RouterInputs["investment"]["addInvestment"];
export type InvestmentUpdate = RouterInputs["investment"]["updateInvestment"];

const InvestmentsTableView = () => {
  const [isInEditMode, setIsInEditMode, createForm, editForm] =
    useTable<InvestmentList[0]>();
  const [isCreateMode, setIsCreateMode] = useState(false);
  const dialog = useDialog();
  const topLoadingBar = useContext(TopLoadingBarStateContext);

  const searchForm = useForm<{ query: string }>();
  const [searchQuery, setSearchQuery] = useState<string>();

  const handleSearchFormSubmit = (data: { query: string }) => {
    setSearchQuery(data.query);
  };

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
      setIsCreateMode(false);
      toast.success("Investment created successfully");
      await investmentsQuery.refetch();
    },
    onError: (err) => {
      toast.error("Error creating investment");
      console.log(err);
    },
    onSettled: () => {
      topLoadingBar.hide();
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
      topLoadingBar.hide();
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
      topLoadingBar.hide();
    },
  });

  const onCreateFormSubmit = (investment: InvestmentList[0]) => {
    const payload: InvestmentCreate = {
      name: investment.name,
      units: +investment.units,
      buyPrice: +investment.buyPrice,
      buyDate: new Date(),
      type: INVESTMENT_TYPE.STOCK,
      symbol: investment.symbol,
      currentPrice: +Math.floor(investment.currentPrice),
    };
    dialog.setProps({
      title: "Confirmation",
      buttonColor: "success",
      message: "Do you want to add this investment?",
      onConfirm: () => {
        dialog.hide();
        topLoadingBar.show();
        investmentCreateMutation.mutate(payload);
      },
    });
    dialog.show();
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
    dialog.setProps({
      title: "Confirmation",
      buttonColor: "success",
      message: "Do you want to edit this investment?",
      onConfirm: () => {
        dialog.hide();
        topLoadingBar.show();
        investmentUpdateMutation.mutate(payload);
      },
    });
    dialog.show();
  };

  const handleEdit = (i: number) => {
    setIsInEditMode(i);
    editForm.reset(investmentsQuery.data.investments[i]);
  };

  const handleDelete = (id: string) => {
    dialog.setProps({
      title: "Confirmation",
      buttonColor: "danger",
      message: "Do you want to remove this investment?",
      onConfirm: () => {
        topLoadingBar.show();
        investmentDeleteMutation.mutate({ id });
      },
    });
    dialog.show();
  };

  if (investmentsQuery.isLoading) {
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
            placeholder={"Search investments"}
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
        {investmentsQuery.data?.investments.length === 0 && !isCreateMode && (
          <EmptyInvestments></EmptyInvestments>
        )}
        {(investmentsQuery.data?.totalCount != 0 || isCreateMode) && (
          <Table>
            <TableHeaderBlock>
              <tr>
                <TableHeader title="Symbol"></TableHeader>
                <TableHeader title="Name"></TableHeader>
                <TableHeader title="Units" isSortable></TableHeader>
                <TableHeader title="Average Buy Price" isSortable></TableHeader>
                <TableHeader title="Current Price" isSortable></TableHeader>
                <TableHeader title="P/L" isSortable></TableHeader>
                <TableHeader></TableHeader>
              </tr>
            </TableHeaderBlock>
            <tbody>
              {isCreateMode && (
                <TableRow>
                  <TableCell>
                    <ControlledInput
                      control={createForm.control}
                      name="symbol"
                      form="createForm"
                      inputProps={{
                        placeholder: "Symbol",
                        required: true,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <input
                      disabled
                      form="createForm"
                      {...createForm.register("name", { required: true })}
                      className={
                        "block min-w-0 flex-1 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500  dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 "
                      }
                    ></input>
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    <div className="flex w-40">
                      <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-200 px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400">
                        ₹
                      </span>
                      <input
                        form="createForm"
                        {...createForm.register("buyPrice", {
                          required: true,
                        })}
                        placeholder="Buy Price"
                        type="number"
                        className="block min-w-0 flex-1 rounded-none rounded-r-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500  dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                        required
                      ></input>
                    </div>
                  </TableCell>
                  <TableCell>
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
              {investmentsQuery.data.investments?.map((investment, i) => (
                <TableRow key={investment.id}>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    {isInEditMode === i ? (
                      <input
                        className={
                          "block min-w-0 flex-1 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500  dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 "
                        }
                      ></input>
                    ) : (
                      investment.name
                    )}
                  </TableCell>
                  <TableCell>
                    {isInEditMode === i ? (
                      <input
                        className={
                          "block min-w-0 flex-1 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500  dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 "
                        }
                      ></input>
                    ) : (
                      investment.units
                    )}
                  </TableCell>
                  <TableCell>
                    {isInEditMode === i ? (
                      <div className="flex w-40">
                        <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-200 px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400">
                          ₹
                        </span>
                        <input
                          form="editForm"
                          {...editForm.register("buyPrice", {
                            required: true,
                          })}
                          placeholder="Buy Price"
                          type="number"
                          className="block min-w-0 flex-1 rounded-none rounded-r-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500  dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                          required
                        ></input>
                      </div>
                    ) : (
                      CurrencyFormatter.format(investment.buyPrice)
                    )}
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
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

export default InvestmentsTableView;
