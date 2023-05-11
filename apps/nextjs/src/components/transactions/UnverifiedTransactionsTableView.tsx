/* eslint-disable @typescript-eslint/no-misused-promises */
import { mdiCancel, mdiCheck, mdiPencil, mdiTrashCan } from '@mdi/js'
import { useState } from 'react'
import BaseButton from '../common/buttons/BaseButton'
import BaseButtons from '../common/buttons/BaseButtons'
import 'flowbite'
import TableLoading from '../common/loading/TableLoading'
import NumberDynamic from '../common/misc/NumberDynamic'
import { ITEMS_PER_PAGE } from '../../config/site'
import { DateFormater } from '../../lib/utils'
import 'react-datetime/css/react-datetime.css'
import CardBoxModal, { type DialogProps } from '../common/cards/CardBoxModal'
import { type RouterOutputs, api } from '~/utils/api'
import { useTable } from '~/hooks/useTable'
import { type TransactionCreate } from './TransactionsTableView'
import { toast } from 'react-toastify'
import { TableHeader } from '../common/table/TableHeader'
import { ControlledSelect } from '../forms/ControlledSelect'
import { ControlledDateTime } from '../forms/ControlledDateTime'
import { TransactionTypeOptions } from '~/utils/constants'
import { ControlledInputMoney } from '../forms/ControlledInputMoney'

export type UnverifiedTransactionList =
  RouterOutputs['unverifiedTransaction']['listUnverifiedTransactions']['unverifiedTransactions']

const UnverifiedTransactionsTableView = () => {
  const [isInEditMode, setIsInEditMode, , editForm] = useTable<UnverifiedTransactionList[0]>()
  const [currentPage, setCurrentPage] = useState(0)

  const accountsQuery = api.account.listAccounts.useQuery()
  const payeesQuery = api.payee.listPayees.useQuery()
  const categoriesQuery = api.category.listCategories.useQuery()
  const unverifiedTransactionsQuery = api.unverifiedTransaction.listUnverifiedTransactions.useQuery(
    { page: currentPage, perPage: ITEMS_PER_PAGE }
  )

  const unverifiedTransactionDeleteMutation =
    api.unverifiedTransaction.deleteUnverifiedTransaction.useMutation({
      onSuccess: async () => {
        if (isInEditMode === -1) {
          toast.success('Transaction deleted successfully')
          await unverifiedTransactionsQuery.refetch()
        }
      },
      onError: (err) => {
        toast.error('Error deleting transaction')
        console.log(err)
      },
      onSettled: () => {
        setIsDialogOpen(false)
      },
    })
  const createTransactionMutation = api.transaction.addTransaction.useMutation({
    onSuccess: async () => {
      await unverifiedTransactionDeleteMutation.mutateAsync({
        id: unverifiedTransactionsQuery?.data?.unverifiedTransactions[isInEditMode].id,
      })
      editForm.reset()
      setIsInEditMode(-1)
      toast.success('Transaction created successfully')
      await unverifiedTransactionsQuery.refetch()
    },
    onError: (err) => {
      toast.error('Error creating transaction')
      console.log(err)
    },
    onSettled: () => {
      setIsDialogOpen(false)
    },
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogProps, setDialogProps] =
    useState<Pick<DialogProps, 'title' | 'buttonColor' | 'onConfirm' | 'message'>>(null)

  const totalCount = unverifiedTransactionsQuery?.data?.unverifiedTransactions?.length || 0
  const numPages = Math.floor(totalCount / ITEMS_PER_PAGE) + 1

  const onCreateFormSubmit = (data: UnverifiedTransactionList[0]) => {
    const payload: TransactionCreate = {
      amount: data.amount,
      sourceAccountId: data.sourceAccount.id,
      categoryId: data.category.id,
      transferredAccountId: data.transferredAccount?.id,
      payeeId: data.payee.id,
      type: data.type,
    }
    setDialogProps({
      title: 'Confirmation',
      buttonColor: 'success',
      message: 'Do you want to verify and add this transaction?',
      onConfirm: () => {
        createTransactionMutation.mutate(payload)
      },
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (i: number) => {
    editForm.reset(unverifiedTransactionsQuery?.data?.unverifiedTransactions[i])
    setIsInEditMode(i)
  }

  const handleDelete = (id: string) => {
    setDialogProps({
      title: 'Confirmation',
      buttonColor: 'danger',
      message: 'Do you want to delete this transaction?',
      onConfirm: () => {
        unverifiedTransactionDeleteMutation.mutate({ id })
      },
    })
    setIsDialogOpen(true)
  }

  if (unverifiedTransactionsQuery.isLoading) {
    return <TableLoading></TableLoading>
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
        <form id="editForm" hidden onSubmit={editForm.handleSubmit(onCreateFormSubmit)}></form>
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

        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <TableHeader title="Account"></TableHeader>
                <TableHeader title="Category" isSortable></TableHeader>
                <TableHeader title="Payee" isSortable></TableHeader>
                <TableHeader title="Date"></TableHeader>
                <TableHeader title="Type"></TableHeader>
                <TableHeader title="Amount"></TableHeader>
                <TableHeader></TableHeader>
              </tr>
            </thead>
            <tbody>
              {unverifiedTransactionsQuery.data?.unverifiedTransactions?.map((transaction, i) => (
                <tr
                  key={transaction.id}
                  className="border-b bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <th
                    scope="row"
                    className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white"
                  >
                    {isInEditMode === i ? (
                      <ControlledSelect
                        control={editForm.control}
                        form="editForm"
                        name="sourceAccount"
                        options={accountsQuery?.data.accounts}
                      ></ControlledSelect>
                    ) : (
                      transaction?.sourceAccount?.name ?? 'N/A'
                    )}
                  </th>
                  <td className="px-6 py-4">
                    {isInEditMode === i ? (
                      <ControlledSelect
                        control={editForm.control}
                        form="editForm"
                        name="category"
                        options={categoriesQuery?.data.categories}
                      ></ControlledSelect>
                    ) : (
                      transaction?.category?.name ?? 'N/A'
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isInEditMode === i ? (
                      <ControlledSelect
                        control={editForm.control}
                        form="editForm"
                        name="payee"
                        options={payeesQuery?.data.payees}
                      ></ControlledSelect>
                    ) : (
                      transaction?.payee?.name ?? 'N/A'
                    )}
                  </td>

                  <td className="px-6 py-4">
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
                  <td className="px-6 py-4">
                    {isInEditMode === i ? (
                      <ControlledSelect
                        control={editForm.control}
                        form="editForm"
                        name="type"
                        options={TransactionTypeOptions}
                        isSimple
                      ></ControlledSelect>
                    ) : (
                      transaction.type.charAt(0) + transaction.type.substring(1).toLowerCase()
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isInEditMode === i ? (
                      <ControlledInputMoney
                        control={editForm.control}
                        name="amount"
                        form="editForm"
                        inputProps={{
                          placeholder: 'Amount',
                          required: true,
                        }}
                      />
                    ) : (
                      <span
                        className={
                          transaction?.type === 'DEBIT'
                            ? 'font-semibold text-red-600'
                            : 'font-semibold text-green-500'
                        }
                      >
                        <NumberDynamic
                          value={transaction?.amount}
                          prefix={`${transaction?.type === 'DEBIT' ? '-' : '+'} ₹`}
                        ></NumberDynamic>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-gray-100 p-3 dark:border-slate-800 lg:px-6">
            <div className="flex flex-col items-center justify-between py-3 md:flex-row md:py-0">
              <BaseButtons>
                {Array.from(Array(numPages).keys()).map((page) => (
                  <BaseButton
                    key={page}
                    active={page === currentPage}
                    label={(page + 1).toString()}
                    color={page === currentPage ? 'lightDark' : 'whiteDark'}
                    small
                    onClick={() => setCurrentPage(page)}
                  />
                ))}
              </BaseButtons>
              <small className="mt-6 md:mt-0">
                Page {currentPage + 1} of {numPages}
              </small>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default UnverifiedTransactionsTableView
