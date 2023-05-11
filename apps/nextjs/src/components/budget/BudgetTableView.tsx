/* eslint-disable @typescript-eslint/no-misused-promises */
import { mdiCancel, mdiCheck, mdiPencil, mdiPlus, mdiTrashCan } from '@mdi/js'
import { useState } from 'react'
import BaseButton from '../common/buttons/BaseButton'
import BaseButtons from '../common/buttons/BaseButtons'
import 'flowbite'
import TableLoading from '../common/loading/TableLoading'
import NumberDynamic from '../common/misc/NumberDynamic'
import Datetime from 'react-datetime'
import 'react-datetime/css/react-datetime.css'
import CardBoxModal, { type DialogProps } from '../common/cards/CardBoxModal'
import { api, type RouterInputs, type RouterOutputs } from '~/utils/api'
import { useTable } from '~/hooks/useTable'
import { toast } from 'react-toastify'
import { TableHeader } from '../common/table/TableHeader'
import { ControlledInputMoney } from '../forms/ControlledInputMoney'
import { ControlledSelect } from '../forms/ControlledSelect'
import moment from 'moment'

export type BudgetList = RouterOutputs['budget']['listBudgets']['budget']
export type BudgetCreate = RouterInputs['budget']['addBudget']
export type BudgetUpdate = RouterInputs['budget']['updateBudget']

interface Props {
  isCreateMode: boolean
  handleCreateModeCancel: () => void
}

const getColorOfRemaining = (remaining: number) => {
  if (remaining < 0.5) {
    return 'text-green-600 bg-green-600'
  } else if (remaining < 0.75) {
    return 'text-yellow-600 bg-yellow-600'
  } else {
    return 'text-red-600 bg-red-600'
  }
}

const BudgetTableView = (props: Props) => {
  const [isInEditMode, setIsInEditMode, createForm, editForm] = useTable<BudgetList[0]>()
  const [selectedMonth, setSelectedMonth] = useState<moment.Moment>(moment())

  const categoriesQuery = api.category.listCategories.useQuery()
  const budgetQuery = api.budget.listBudgets.useQuery({ month: selectedMonth.toDate() })

  const budgetCreateMutation = api.budget.addBudget.useMutation({
    onSuccess: async () => {
      createForm.reset()
      props?.handleCreateModeCancel()
      toast.success('BudgetScreen created successfully')
      await budgetQuery.refetch()
    },
    onError: (err) => {
      toast.error('Error creating budget')
      console.log(err)
    },
    onSettled: () => {
      setIsDialogOpen(false)
    },
  })
  const budgetUpdateMutation = api.budget.updateBudget.useMutation({
    onSuccess: async () => {
      editForm.reset()
      toast.success('BudgetScreen updated successfully')
      await budgetQuery.refetch()
    },
    onError: (err) => {
      toast.error('Error updating budget')
      console.log(err)
    },
    onSettled: () => {
      setIsInEditMode(-1)
      setIsDialogOpen(false)
    },
  })
  const budgetDeleteMutation = api.budget.deleteBudget.useMutation({
    onSuccess: async () => {
      toast.success('BudgetScreen deleted successfully')
      await budgetQuery.refetch()
    },
    onError: (err) => {
      toast.error('Error deleting budget')
      console.log(err)
    },
    onSettled: () => {
      setIsDialogOpen(false)
    },
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogProps, setDialogProps] =
    useState<Pick<DialogProps, 'title' | 'buttonColor' | 'onConfirm' | 'message'>>(null)
  const [hack, setHack] = useState(false)

  const onCreateFormSubmit = (data: BudgetList[0]) => {
    const payload: BudgetCreate = {
      amount: +data.budgetedAmount,
      categoryId: data.category.id,
      month: selectedMonth.toDate(),
    }
    setDialogProps({
      title: 'Confirmation',
      buttonColor: 'success',
      message: 'Do you want to create this budget?',
      onConfirm: () => {
        budgetCreateMutation.mutate(payload)
      },
    })
    setIsDialogOpen(true)
  }

  const onEditFormSubmit = (data: BudgetList[0]) => {
    if (hack) {
      setHack(false)
      return
    }
    const payload: BudgetUpdate = {
      id: budgetQuery.data.budget[isInEditMode].id,
      amount: +data.budgetedAmount,
      categoryId: data.category.id,
    }
    setDialogProps({
      title: 'Confirmation',
      buttonColor: 'success',
      message: 'Do you want to edit this budget?',
      onConfirm: () => {
        budgetUpdateMutation.mutate(payload)
      },
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (i: number) => {
    editForm.reset(budgetQuery.data.budget[i])
    setIsInEditMode(i)
    setHack(true)
  }

  const handleDelete = (id: string) => {
    setDialogProps({
      title: 'Confirmation',
      buttonColor: 'danger',
      message: 'Do you want to delete this budget?',
      onConfirm: () => {
        budgetDeleteMutation.mutate({ id })
      },
    })
    setIsDialogOpen(true)
  }

  if (budgetQuery.isLoading) {
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
        <form id="createForm" hidden onSubmit={createForm.handleSubmit(onCreateFormSubmit)}></form>
        <form id="editForm" hidden onSubmit={editForm.handleSubmit(onEditFormSubmit)}></form>
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
              placeholder="Search budgets"
            ></input>
          </div>
          <div className="ml-6 mt-4 sm:mr-6 sm:mt-0">
            <Datetime
              timeFormat={false}
              onChange={(value: moment.Moment) => setSelectedMonth(value)}
              value={selectedMonth}
              dateFormat="MMMM, YYYY"
              className="w-40"
              inputProps={{
                form: 'createForm',
                placeholder: 'Select date',
                className:
                  'block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500',
              }}
            />
          </div>
        </div>

        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <TableHeader title="Category"></TableHeader>
                <TableHeader title="Budgeted" isSortable></TableHeader>
                <TableHeader title="Spent" isSortable></TableHeader>
                <TableHeader></TableHeader>
                <TableHeader></TableHeader>
              </tr>
            </thead>
            <tbody>
              {props?.isCreateMode && (
                <tr className="border-b bg-white dark:border-gray-700 dark:bg-gray-800 ">
                  <td scope="row" className="px-1 py-4">
                    <ControlledSelect
                      control={createForm.control}
                      name="category"
                      form="createForm"
                      options={categoriesQuery.data.categories}
                    ></ControlledSelect>
                  </td>
                  <td className="px-1 py-4">
                    <ControlledInputMoney
                      form="createForm"
                      control={createForm.control}
                      name="budgetedAmount"
                      inputProps={{
                        placeholder: 'Budgeted',
                        required: true,
                      }}
                    ></ControlledInputMoney>
                  </td>
                  <td className="px-1 py-4">N/A</td>
                  <td className="px-1 py-4">N/A</td>
                  <td className="px-1 py-4 text-right">
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
                        onClick={props?.handleCreateModeCancel}
                      ></BaseButton>
                    </BaseButtons>
                  </td>
                </tr>
              )}
              {budgetQuery.data.budget?.map((budget, i) => (
                <tr
                  key={budget.id}
                  className="border-b bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <th
                    scope="row"
                    className="whitespace-nowrap px-1 py-4 font-medium text-gray-900 dark:text-white"
                  >
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
                  </th>
                  <td className="px-1 py-4">
                    {isInEditMode === i ? (
                      <ControlledInputMoney
                        form="editForm"
                        control={editForm.control}
                        name="budgetedAmount"
                        inputProps={{
                          placeholder: 'Budgeted',
                          required: true,
                        }}
                      ></ControlledInputMoney>
                    ) : (
                      <span>
                        <NumberDynamic value={budget?.budgetedAmount} prefix={`₹`}></NumberDynamic>
                      </span>
                    )}
                  </td>
                  <td className="px-1 py-4">
                    <span
                      className={`${getColorOfRemaining(
                        Math.round(budget?.spent / budget?.budgetedAmount)
                      )} font-bold`}
                    >
                      <NumberDynamic value={budget?.spent} prefix={`₹`}></NumberDynamic>
                    </span>
                  </td>
                  <td className="px-1 py-4">
                    <div className="mb-1 flex justify-end">
                      <span className="text-sm font-medium text-black dark:text-white">{`${Math.round(
                        (budget?.spent / budget?.budgetedAmount) * 100
                      )}%`}</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className={`h-2.5 rounded-full ${getColorOfRemaining(
                          Math.round(budget?.spent / budget?.budgetedAmount)
                        )}`}
                        style={{
                          width: `${Math.min(
                            Math.round((budget?.spent / budget?.budgetedAmount) * 100),
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default BudgetTableView
