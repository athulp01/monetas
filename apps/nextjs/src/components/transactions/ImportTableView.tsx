/* eslint-disable-file @typescript-eslint/no-misused-promises */
import React, { useContext, useEffect, useMemo, useState } from "react";
import { mdiContentSave } from "@mdi/js";
import { TRANSACTION_TYPE } from "@prisma/client";

import "flowbite";
import "react-datetime/css/react-datetime.css";
import "@yaireo/tagify/dist/tagify.css";
import { useRouter } from "next/router";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
import { v4 as uuid } from "uuid";

import {
  type ParsedStatementResult,
  type ParsedTransaction,
} from "@monetas/importer/src/types";

import { api, type RouterInputs, type RouterOutputs } from "~/utils/api";
import { TransactionTypeOptions } from "~/utils/constants";
import { TopLoadingBarStateContext } from "~/utils/contexts";
import { type AccountList } from "~/components/accounts/AccountsTableView";
import { Alert } from "~/components/common/alerts/Alert";
import CardBoxTextInputModal from "~/components/common/cards/CardBoxTextInputModal";
import { CardTable } from "~/components/common/cards/CardTable";
import TableLoading from "~/components/common/loading/TableLoading";
import { Table } from "~/components/common/table/Table";
import { TableCell } from "~/components/common/table/TableCell";
import { TableHeaderBlock } from "~/components/common/table/TableHeaderBlock";
import { TableRow } from "~/components/common/table/TableRow";
import { type PayeeList } from "~/components/payees/PayeeTableView";
import { HDFCInstructions } from "~/components/transactions/HDFCInstructions";
import {
  checkIfPasswordIsCorrect,
  isPdfPasswordProtected,
  isStatementImportSupported,
  parseCSVStatement,
  parsePDFStatement,
} from "~/components/transactions/importUtils";
import { ITEMS_PER_PAGE } from "~/config/site";
import { useDialog } from "~/hooks/useDialog";
import BaseButton from "../common/buttons/BaseButton";
import CardBoxModal from "../common/cards/CardBoxModal";
import { TableHeader } from "../common/table/TableHeader";
import { ControlledDateTime } from "../forms/ControlledDateTime";
import { ControlledInputMoney } from "../forms/ControlledInputMoney";
import { ControlledSelect } from "../forms/ControlledSelect";

export type TransactionImportInput =
  RouterInputs["transaction"]["importTransactions"];

type TransactionImportForm = {
  form: {
    id: string;
    sourceAccount: AccountList[0];
    type: TRANSACTION_TYPE;
    timeCreated: Date;
    amount: number;
    category: RouterOutputs["category"]["listCategories"]["categories"][0];
    payee: RouterOutputs["payee"]["listPayees"]["payees"][0];
    notes: string;
  }[];
};
interface Props {
  handleSave: () => void;
}

const tryFindPayee = (description: string, payees: PayeeList): PayeeList[0] => {
  return payees.find((payee) => {
    return description.toLowerCase().includes(payee.name.toLowerCase());
  });
};

const ImportTableView = (props: Props) => {
  const topLoadingBar = useContext(TopLoadingBarStateContext);
  const importForm = useForm<TransactionImportForm>();
  const targetAccountForm = useForm<{ targetAccount: AccountList[0] }>();
  const dialog = useDialog();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [uploadedFile, setUploadFile] = useState<File>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const [parsingError, setParsingError] = useState<string>(null);
  const [parsedTransactions, setParsedTransactions] =
    useState<TransactionImportForm>(null);

  const accountsQuery = api.account.listAccounts.useQuery();
  const categoriesQuery = api.category.listCategories.useQuery();
  const payeesQuery = api.payee.listPayees.useQuery({});

  const router = useRouter();

  useEffect(() => {
    // Always do navigations after the first render
    void router.push("/transactions?import=true", undefined, { shallow: true });
  }, []);

  const importTransactionsMutation =
    api.transaction.importTransactions.useMutation({
      onSuccess: () => {
        void router.push("/transactions");
        props?.handleSave();
        toast.success("Transaction imported successfully");
      },
      onError: (err) => {
        toast.error("Error importing transaction");
        console.log(err);
      },
      onSettled: () => {
        topLoadingBar.hide();
      },
    });

  const convertToFormData = (data: ParsedTransaction[]) => {
    return data.map((transaction) => {
      const matchedPayee = tryFindPayee(
        transaction.notes,
        payeesQuery.data?.payees,
      );
      const matchedCategory = matchedPayee
        ? categoriesQuery.data?.categories.find(
            (cat) => cat.id === matchedPayee.categories[0]?.id,
          )
        : undefined;
      const formData: TransactionImportForm["form"][0] = {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        id: uuid() as string,
        sourceAccount: targetAccountForm.getValues("targetAccount"),
        type: transaction.type,
        timeCreated: transaction.timeCreated,
        amount: Math.floor(transaction.amount),
        category:
          matchedCategory ??
          categoriesQuery.data?.categories.find(
            (category) => category.name === "Others",
          ),
        payee: matchedPayee ?? undefined,
        notes: transaction.notes,
      };
      return formData;
    });
  };

  const onImportFormSubmit: SubmitHandler<TransactionImportForm> = (data) => {
    const payload: TransactionImportInput = {
      transactions: data.form.map((transaction) => ({
        sourceAccountId: transaction.sourceAccount.id,
        type: transaction.type,
        timeCreated: transaction.timeCreated,
        amount: transaction.amount,
        categoryId: transaction.category.id,
        payeeId: transaction.payee?.id,
      })),
      sourceAccountId: data.form[0].sourceAccount.id,
    };
    dialog.setProps({
      title: "Confirmation",
      buttonColor: "success",
      message: "Do you want to import these transactions?",
      onConfirm: () => {
        topLoadingBar.show();
        importTransactionsMutation.mutate(payload);
        dialog.hide();
      },
    });
    dialog.show();
  };
  const [parsedStatement, setParsedStatement] =
    useState<ParsedStatementResult>(null);
  const totalCount = parsedTransactions?.form?.length ?? 0;

  const paginatedTransactions = useMemo(
    () =>
      parsedTransactions?.form?.slice(
        currentPage * ITEMS_PER_PAGE,
        (currentPage + 1) * ITEMS_PER_PAGE,
      ) ?? [],

    [parsedStatement, currentPage],
  );

  const handlePDFFileUpload = async (file: File, password?: string) => {
    return parsePDFStatement(
      targetAccountForm.watch("targetAccount"),
      file,
      password,
    )
      .then((result) => {
        setParsedStatement(result);
        const convertedData = convertToFormData(result.transactions);
        setParsedTransactions({ form: convertedData });
        importForm.reset({ form: convertedData });
      })
      .catch((err: unknown) => {
        setParsingError(err.toString());
        console.log(err.toString());
      })
      .finally(topLoadingBar.hide);
  };

  const handleCSVFileUpload = async (file: File) => {
    try {
      const result = await parseCSVStatement(
        targetAccountForm.watch("targetAccount"),
        file,
      );
      setParsedStatement(result);
      const convertedData = convertToFormData(result.transactions);
      setParsedTransactions({ form: convertedData });
      importForm.reset({ form: convertedData });
    } catch (err: unknown) {
      setParsingError(err.toString());
      console.log(err);
    } finally {
      topLoadingBar.hide();
    }
  };
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPage(0);
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
    topLoadingBar.show();
    if (file.name.toLowerCase().endsWith(".pdf")) {
      isPdfPasswordProtected(file)
        .then((isProtected) => {
          if (isProtected) {
            topLoadingBar.hide();
            setIsPasswordModalOpen(true);
            setUploadFile(file);
          } else {
            void handlePDFFileUpload(file);
          }
        })
        .catch((err: string) => {
          console.log(err);
          setParsingError(err.toString());
        });
    } else {
      void handleCSVFileUpload(file);
    }
  };

  const handlePasswordSubmit = async (password: string) => {
    const isCorrect = await checkIfPasswordIsCorrect(uploadedFile, password);
    if (isCorrect) {
      setIsPasswordModalOpen(false);
      topLoadingBar.show();
      void handlePDFFileUpload(uploadedFile, password);
    } else {
      toast.error("Incorrect password");
    }
  };

  if (
    accountsQuery.isLoading ||
    categoriesQuery.isLoading ||
    payeesQuery.isLoading
  )
    return <TableLoading />;

  return (
    <>
      <CardBoxModal
        {...dialog.props}
        buttonLabel="Confirm"
        isActive={dialog.isOpen}
        onCancel={dialog.hide}
      ></CardBoxModal>
      <CardBoxTextInputModal
        title={"Enter the password to open the PDF file"}
        buttonColor={"success"}
        buttonLabel={"Confirm"}
        isActive={isPasswordModalOpen}
        onConfirm={handlePasswordSubmit}
      ></CardBoxTextInputModal>
      <CardTable>
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
                  options={accountsQuery?.data.accounts.filter((account) =>
                    isStatementImportSupported(account),
                  )}
                ></ControlledSelect>
              </div>
            </div>
            <Alert
              showIcon
              text={
                "Statements from HDFC & ICICI bank are only supported currently"
              }
              type={"info"}
            ></Alert>
          </>
        )}
        {targetAccountForm.watch("targetAccount") && (
          <>
            <div className="flex items-center justify-between pb-4">
              <div className="relative ml-6">
                <div className={"mb-2 text-sm text-gray-500"}>
                  Target Account:
                </div>
                <ControlledSelect
                  control={targetAccountForm.control}
                  form="targetAccountForm"
                  name="targetAccount"
                  options={accountsQuery?.data.accounts}
                  isDisabled={!!parsedStatement}
                ></ControlledSelect>
              </div>
              <div className="ml-6 mt-4 sm:mr-6 sm:mt-0">
                <div className="mb-2 block text-sm  text-gray-500 dark:text-white">
                  Upload statement
                </div>
                <div className="flex">
                  <input
                    className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-900 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:placeholder-gray-400"
                    id="csv_file"
                    type="file"
                    title="Upload statement"
                    onChange={handleFileUpload}
                  ></input>
                  <BaseButton
                    onClick={importForm.handleSubmit(onImportFormSubmit)}
                    className={"ml-4"}
                    icon={mdiContentSave}
                    // form={"importForm"}
                    // type={"submit"}
                    color="success"
                    label="Save"
                  />
                </div>
              </div>
            </div>
            {parsingError && (
              <Alert text={`Parsing failed: ${parsingError}`} type={"error"} />
            )}
            {parsedTransactions?.form?.length > 0 && (
              <Alert
                text={`Found ${parsedTransactions?.form?.length} transactions in
                the statement`}
                type={"info"}
              />
            )}
            {parsedStatement?.errors > 0 && (
              <Alert
                text={`Parsing failed for ${parsedStatement?.errors} transactions`}
                type={"error"}
              />
            )}
          </>
        )}
        {parsedStatement == null && <HDFCInstructions></HDFCInstructions>}
        {parsedStatement && (
          <>
            <form
              id="importForm"
              hidden
              onSubmit={() => importForm.handleSubmit(onImportFormSubmit)}
            ></form>
            <Table
              isPaginated={true}
              currentPage={currentPage}
              totalItems={totalCount}
              itemsInCurrentPage={paginatedTransactions?.length}
              setCurrentPage={setCurrentPage}
            >
              <TableHeaderBlock>
                <tr>
                  <TableHeader title="Type"></TableHeader>
                  <TableHeader title="Category" isSortable></TableHeader>
                  <TableHeader title="Payee" isSortable></TableHeader>
                  <TableHeader title="Date"></TableHeader>
                  <TableHeader title="Amount"></TableHeader>
                  <TableHeader title="Description"></TableHeader>
                </tr>
              </TableHeaderBlock>
              <tbody>
                {paginatedTransactions?.map((transaction, i) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <ControlledSelect
                        control={importForm.control}
                        form="importForm"
                        name={
                          `form.${
                            i + currentPage * ITEMS_PER_PAGE
                          }.type` as const
                        }
                        isSimple
                        options={TransactionTypeOptions}
                      ></ControlledSelect>
                    </TableCell>
                    <TableCell>
                      <ControlledSelect
                        control={importForm.control}
                        isLoading={categoriesQuery.isLoading}
                        isDisabled={
                          importForm.watch(
                            `form.${i + currentPage * ITEMS_PER_PAGE}.type`,
                          ) == null
                        }
                        form="importForm"
                        name={`form.${
                          i + currentPage * ITEMS_PER_PAGE
                        }.category`}
                        options={categoriesQuery?.data?.categories.filter(
                          (cat) => {
                            return (
                              cat.type ===
                              importForm.watch(
                                `form.${i + currentPage * ITEMS_PER_PAGE}.type`,
                              )
                            );
                          },
                        )}
                      ></ControlledSelect>
                    </TableCell>
                    <TableCell>
                      {importForm.watch(
                        `form.${i + currentPage * ITEMS_PER_PAGE}.type`,
                      ) !== TRANSACTION_TYPE.TRANSFER ? (
                        <ControlledSelect
                          control={importForm.control}
                          form="importForm"
                          isClearable={true}
                          isLoading={payeesQuery.isLoading}
                          isDisabled={
                            importForm.watch(
                              `form.${i + currentPage * ITEMS_PER_PAGE}.type`,
                            ) == null
                          }
                          name={`form.${
                            i + currentPage * ITEMS_PER_PAGE
                          }.payee`}
                          rules={{ required: false }}
                          options={payeesQuery?.data?.payees}
                        ></ControlledSelect>
                      ) : (
                        <ControlledSelect
                          control={importForm.control}
                          form="importForm"
                          isDisabled={
                            importForm.watch(
                              `form.${i + currentPage * ITEMS_PER_PAGE}.type`,
                            ) == null
                          }
                          name={`form.${
                            i + currentPage * ITEMS_PER_PAGE
                          }.transferredAccount`}
                          options={accountsQuery?.data.accounts.filter(
                            (account) =>
                              account.id !==
                              importForm.watch(
                                `form.${
                                  i + currentPage * ITEMS_PER_PAGE
                                }.sourceAccount`,
                              )?.id,
                          )}
                        ></ControlledSelect>
                      )}
                    </TableCell>
                    <TableCell>
                      <ControlledDateTime
                        control={importForm.control}
                        name={`form.${
                          i + currentPage * ITEMS_PER_PAGE
                        }.timeCreated`}
                        form="importForm"
                      ></ControlledDateTime>
                    </TableCell>
                    <TableCell>
                      <ControlledInputMoney
                        control={importForm.control}
                        name={`form.${i + currentPage * ITEMS_PER_PAGE}.amount`}
                        form="importForm"
                        inputProps={{
                          placeholder: "Amount",
                          required: true,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className={"w-72 break-words text-xs"}>
                        {transaction.notes}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </>
        )}
      </CardTable>
    </>
  );
};

export default ImportTableView;
