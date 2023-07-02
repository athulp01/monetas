import React, { useMemo, useRef, useState } from "react";
import { mdiTrashCan } from "@mdi/js";
import { TRANSACTION_TYPE } from "@prisma/client";
import Tags from "@yaireo/tagify/dist/react.tagify";

import "flowbite";
import "react-datetime/css/react-datetime.css";
import ReactPaginate from "react-paginate";

import "@yaireo/tagify/dist/tagify.css";
import { Controller, useForm } from "react-hook-form";
import LoadingBar from "react-top-loading-bar";

import {
  parseHDFCAccountStatement,
  parseHDFCCreditCardStatement,
  type ParsedStatementResult,
} from "@monetas/importer";

import { api } from "~/utils/api";
import { TransactionTypeOptions } from "~/utils/constants";
import { ITEMS_PER_PAGE } from "~/config/site";
import BaseButton from "../common/buttons/BaseButton";
import BaseButtons from "../common/buttons/BaseButtons";
import CardBoxModal, { type DialogProps } from "../common/cards/CardBoxModal";
import { TableHeader } from "../common/table/TableHeader";
import { ControlledDateTime } from "../forms/ControlledDateTime";
import { ControlledInputMoney } from "../forms/ControlledInputMoney";
import { ControlledSelect } from "../forms/ControlledSelect";

const ImportTableView = () => {
  const loadingBarRef = useRef();
  const editForm = useForm<ParsedStatementResult["transactions"]>();
  const targetAccountForm = useForm();
  const [currentPage, setCurrentPage] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogProps, setDialogProps] =
    useState<
      Pick<DialogProps, "title" | "buttonColor" | "onConfirm" | "message">
    >();
  const [parsingError, setParsingError] = useState<string>(null);

  const accountsQuery = api.account.listAccounts.useQuery();
  const categoriesQuery = api.category.listCategories.useQuery();
  const payeesQuery = api.payee.listPayees.useQuery({});

  const [parsedStatement, setParsedStatement] =
    useState<ParsedStatementResult>(null);
  const totalCount = parsedStatement?.transactions?.length ?? 0;
  const numPages = Math.floor(totalCount / ITEMS_PER_PAGE) + 1;

  const paginatedTransactions = useMemo(
    () =>
      parsedStatement?.transactions?.slice(
        currentPage * ITEMS_PER_PAGE,
        (currentPage + 1) * ITEMS_PER_PAGE,
      ) ?? [],

    [parsedStatement, currentPage],
  );

  const handleDelete = (id: string) => {
    setDialogProps({
      title: "Confirmation",
      buttonColor: "danger",
      message: "Do you want to delete this transaction?",
      onConfirm: () => {
        id;
      },
    });
    setIsDialogOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParsingError(null);
    setParsedStatement(null);
    const file = e.target.files[0];
    if (!file) return;
    if (
      !file.name.toLowerCase().endsWith(".csv") &&
      !file.name.toLowerCase().endsWith(".txt") &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setParsingError(
        "Invalid file type. Please upload a CSV,TXT or PDF file.",
      );
      return;
    }
    if (file.name.toLowerCase().endsWith(".pdf")) {
      file
        .arrayBuffer()
        .then((buffer) => {
          return parseHDFCCreditCardStatement(buffer);
        })
        .then((result) => {
          console.log(result);
          console.log(targetAccountForm.getValues("targetAccount"));
          setParsedStatement(result);
          editForm.reset(result.transactions);
        });
    } else {
      parseHDFCAccountStatement(file)
        .then((result) => {
          console.log(result);
          console.log(targetAccountForm.getValues("targetAccount"));
          setParsedStatement(result);
          editForm.reset(result.transactions);
        })
        .catch((err) => {
          setParsingError(err);
          console.log(err);
        });
    }
  };

  return (
    <>
      <LoadingBar height={8} color="black" ref={loadingBarRef} />
      <CardBoxModal
        {...dialogProps}
        buttonLabel="Confirm"
        isActive={isDialogOpen}
        onCancel={() => setIsDialogOpen(false)}
      ></CardBoxModal>
      <div className="relative mt-6 overflow-x-auto shadow-md sm:rounded-lg">
        <form
          id="editForm"
          hidden
          onSubmit={(e) => {
            console.log(e);
          }}
        ></form>
        {!targetAccountForm.watch("targetAccount") && (
          <>
            <div className="flex flex-wrap items-center justify-between pb-1">
              <div className="text- relative ml-6 text-gray-700">
                Select an account to import transactions.
              </div>
              <div className="ml-6 mt-4 text-gray-500 sm:mr-6 sm:mt-0">
                <div className={"mb-2 text-sm text-gray-500"}>
                  Target Account:
                </div>

                <ControlledSelect
                  className={"w-64"}
                  control={targetAccountForm.control}
                  form="targetAccountForm"
                  name="targetAccount"
                  options={accountsQuery?.data.accounts}
                ></ControlledSelect>
              </div>
            </div>
            <div
              className="mb-4 mt-2 flex bg-blue-50 p-4 text-sm text-blue-800 dark:bg-gray-800 dark:text-blue-400"
              role="alert"
            >
              <svg
                aria-hidden="true"
                className="mr-3 inline h-5 w-5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="sr-only">Info</span>
              <div>
                <span className="font-medium">Info: </span> Currently only
                statements from HDFC Bank are supported.
              </div>
            </div>
          </>
        )}
        {targetAccountForm.watch("targetAccount") && (
          <>
            <div className="flex flex-wrap items-center justify-between pb-4">
              <div className="relative ml-6">
                <div className={"mb-2 text-sm text-gray-500"}>
                  Target Account:
                </div>
                <ControlledSelect
                  control={targetAccountForm.control}
                  form="targetAccountForm"
                  name="targetAccount"
                  options={accountsQuery?.data.accounts}
                ></ControlledSelect>
              </div>
              <div className="ml-6 mt-4 sm:mr-6 sm:mt-0">
                <div className="mb-2 block text-sm  text-gray-500 dark:text-white">
                  Upload statement
                </div>
                <input
                  className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-900 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:placeholder-gray-400"
                  id="csv_file"
                  type="file"
                  title="Upload a CSV file"
                  onChange={handleFileUpload}
                ></input>
              </div>
            </div>
            {parsingError && (
              <div
                className="mb-4 flex  bg-red-50 p-4 text-sm text-red-800 dark:bg-gray-800 dark:text-red-400"
                role="alert"
              >
                <svg
                  aria-hidden="true"
                  className="mr-3 inline h-5 w-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span className="sr-only">Info</span>
                <div>
                  <span className="font-medium">Parsing failed: </span>{" "}
                  {parsingError}
                </div>
              </div>
            )}
            {parsedStatement?.transactions?.length > 0 && (
              <div
                className="mb-4 bg-blue-50 p-4 text-sm text-blue-800 dark:bg-gray-800 dark:text-blue-400"
                role="alert"
              >
                Found {parsedStatement?.transactions?.length} transactions in
                the statement.
              </div>
            )}
            {parsedStatement?.errors > 0 && (
              <div
                className="mb-4 flex bg-red-50 p-4 text-sm text-red-800 dark:bg-gray-800 dark:text-red-400"
                role="alert"
              >
                <svg
                  aria-hidden="true"
                  className="mr-3 inline h-5 w-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className="sr-only">Info</span>
                <div>
                  <span className="font-medium">Error: </span>
                  {`Parsing failed for 2 transactions. `}
                </div>
              </div>
            )}
          </>
        )}

        <div className="relative overflow-x-auto p-2 shadow-md sm:rounded-lg">
          <table className="hidden w-full text-left text-sm text-gray-500 dark:text-gray-400 md:table">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <TableHeader title="Type"></TableHeader>
                <TableHeader title="Category" isSortable></TableHeader>
                <TableHeader title="Payee" isSortable></TableHeader>
                <TableHeader title="Date"></TableHeader>
                <TableHeader title="Amount"></TableHeader>
                <TableHeader title="Tags"></TableHeader>
                <TableHeader title="Description"></TableHeader>
                <TableHeader></TableHeader>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions?.map((transaction, i) => (
                <tr
                  key={i + currentPage * ITEMS_PER_PAGE}
                  className="border-b bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <td className="px-1 py-4">
                    <ControlledSelect
                      control={editForm.control}
                      form="editForm"
                      name={`${i + currentPage * ITEMS_PER_PAGE}.type`}
                      isSimple
                      options={TransactionTypeOptions}
                    ></ControlledSelect>
                  </td>
                  <td className="px-1 py-4">
                    <ControlledSelect
                      control={editForm.control}
                      isLoading={categoriesQuery.isLoading}
                      isDisabled={
                        editForm.watch(
                          `${i + currentPage * ITEMS_PER_PAGE}.type`,
                        ) == null
                      }
                      form="editForm"
                      name={`${i + currentPage * ITEMS_PER_PAGE}.category`}
                      options={categoriesQuery?.data?.categories}
                    ></ControlledSelect>
                  </td>
                  <td className="px-1 py-4">
                    {editForm.watch(
                      `${i + currentPage * ITEMS_PER_PAGE}.type`,
                    ) !== TRANSACTION_TYPE.TRANSFER ? (
                      <ControlledSelect
                        control={editForm.control}
                        form="editForm"
                        isClearable={true}
                        isLoading={payeesQuery.isLoading}
                        isDisabled={
                          editForm.watch(
                            `${i + currentPage * ITEMS_PER_PAGE}.type`,
                          ) == null
                        }
                        name={`${i + currentPage * ITEMS_PER_PAGE}.payee`}
                        rules={{ required: false }}
                        options={payeesQuery?.data?.payees}
                      ></ControlledSelect>
                    ) : (
                      <ControlledSelect
                        control={editForm.control}
                        form="editForm"
                        isDisabled={
                          editForm.watch(
                            `${i + currentPage * ITEMS_PER_PAGE}.type`,
                          ) == null
                        }
                        name={`${
                          i + currentPage * ITEMS_PER_PAGE
                        }.transferredAccount`}
                        options={accountsQuery?.data.accounts.filter(
                          (account) =>
                            account.id !==
                            editForm.watch(
                              `${
                                i + currentPage * ITEMS_PER_PAGE
                              }.sourceAccount`,
                            )?.id,
                        )}
                      ></ControlledSelect>
                    )}
                  </td>

                  <td className="px-1 py-4">
                    <ControlledDateTime
                      control={editForm.control}
                      name={`${i + currentPage * ITEMS_PER_PAGE}.timeCreated`}
                      form="editForm"
                    ></ControlledDateTime>
                  </td>

                  <td className="px-1 py-4">
                    <ControlledInputMoney
                      control={editForm.control}
                      name={`${i + currentPage * ITEMS_PER_PAGE}.amount`}
                      form="editForm"
                      inputProps={{
                        placeholder: "Amount",
                        required: true,
                      }}
                    />
                  </td>
                  <td className="px-1 py-4">
                    <Controller
                      control={editForm.control}
                      name={`${i + currentPage * ITEMS_PER_PAGE}.tags`}
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
                  <td className="px-1 py-4">
                    <div className={"w-48 break-words text-xs"}>
                      {transaction.notes}
                    </div>
                  </td>
                  <td className="px-1 py-4 text-right">
                    <BaseButtons type="justify-start lg:justify-end" noWrap>
                      <BaseButton
                        color="danger"
                        icon={mdiTrashCan}
                        onClick={() => handleDelete(transaction?.id)}
                        small
                      ></BaseButton>
                    </BaseButtons>
                  </td>
                </tr>
              ))}
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
                {currentPage * ITEMS_PER_PAGE + paginatedTransactions?.length ||
                  0}
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
              pageRangeDisplayed={4}
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
    </>
  );
};

export default ImportTableView;
