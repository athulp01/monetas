/* eslint-disable @typescript-eslint/no-misused-promises */
import { mdiCancel, mdiCheck, mdiPencil, mdiPlus, mdiTrashCan } from '@mdi/js'
import { useState } from 'react'
import BaseButton from '../common/buttons/BaseButton'
import BaseButtons from '../common/buttons/BaseButtons'
import 'flowbite'
import TableLoading from '../common/loading/TableLoading'
import NumberDynamic from '../common/misc/NumberDynamic'
import 'react-datetime/css/react-datetime.css'
import CardBoxModal, { type DialogProps } from '../common/cards/CardBoxModal'
import Image from 'next/image'
import { ControlledInput } from '../forms/ControlledInput'
import { ControlledSelect } from '../forms/ControlledSelect'
import { api, type RouterInputs, type RouterOutputs } from '~/utils/api'
import { useTable } from '~/hooks/useTable'
import { toast } from 'react-toastify'
import { TableHeader } from '../common/table/TableHeader'
import { ControlledInputMoney } from '../forms/ControlledInputMoney'

export type AccountList = RouterOutputs['account']['listAccounts']['accounts']
export type AccountCreate = RouterInputs['account']['addAccount']
export type AccountUpdate = RouterInputs['account']['updateAccount']

export type ProviderList = RouterOutputs['account']['listAccountProviders']
export type TypeList = RouterOutputs['account']['listAccountTypes']

interface Props {
  isCreateMode: boolean
  handleCreateModeCancel: () => void
}

const AccountsTableView = (props: Props) => {
  const [isInEditMode, setIsInEditMode, createForm, editForm] = useTable<AccountList[0]>()

  const providersQuery = api.account.listAccountProviders.useQuery()
  const typesQuery = api.account.listAccountTypes.useQuery()
  const accountsQuery = api.account.listAccounts.useQuery()

  const accountCreateMutation = api.account.addAccount.useMutation({
    onSuccess: async () => {
      createForm.reset()
      props?.handleCreateModeCancel()
      toast.success('Account created successfully')
      await accountsQuery.refetch()
    },
    onError: (err) => {
      toast.error('Error creating account')
      console.log(err)
    },
    onSettled: () => {
      setIsDialogOpen(false)
    },
  })
  const accountUpdateMutation = api.account.updateAccount.useMutation({
    onSuccess: async () => {
      editForm.reset()
      toast.success('Account updated successfully')
      await accountsQuery.refetch()
    },
    onError: (err) => {
      toast.error('Error updating transaction')
      console.log(err)
    },
    onSettled: () => {
      setIsInEditMode(-1)
      setIsDialogOpen(false)
    },
  })
  const accountDeleteMutation = api.account.deleteAccount.useMutation({
    onSuccess: async () => {
      toast.success('Account deleted successfully')
      await accountsQuery.refetch()
    },
    onError: (err) => {
      toast.error('Error deleting account')
      console.log(err)
    },
    onSettled: () => {
      setIsDialogOpen(false)
    },
  })

  const watchProvider = editForm.watch('accountProvider')

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogProps, setDialogProps] =
    useState<Pick<DialogProps, 'title' | 'buttonColor' | 'onConfirm' | 'message' | 'warning'>>(null)

  const onCreateFormSubmit = (account: AccountList[0]) => {
    const payload: AccountCreate = {
      name: account.name,
      balance: +account.balance,
      accountTypeId: account.accountType.id,
      accountProviderId: account.accountProvider.id,
      accountNumber: account.accountNumber,
    }
    setDialogProps({
      title: 'Confirmation',
      buttonColor: 'success',
      message: 'Do you want to create this account?',
      onConfirm: () => {
        accountCreateMutation.mutate(payload)
      },
    })
    setIsDialogOpen(true)
  }

  const onEditFormSubmit = (account: AccountList[0]) => {
    const payload: AccountUpdate = {
      id: account.id,
      name: account.name,
      balance: +account.balance,
      accountTypeId: account.accountType.id,
      accountProviderId: account.accountProvider.id,
      accountNumber: account.accountNumber,
    }
    setDialogProps({
      title: 'Confirmation',
      buttonColor: 'success',
      message: 'Do you want to edit this account?',
      onConfirm: () => {
        accountUpdateMutation.mutate(payload)
      },
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (i: number) => {
    setIsInEditMode(i)
    editForm.reset(accountsQuery.data.accounts[i])
  }

  const handleDelete = (id: string) => {
    setDialogProps({
      title: 'Confirmation',
      buttonColor: 'danger',
      message: 'Do you want to delete this account?',
      warning: 'This action would delete all transactions associated with this account',
      onConfirm: () => {
        accountDeleteMutation.mutate({ id })
      },
    })
    setIsDialogOpen(true)
  }

  if (accountsQuery.isLoading) {
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
              placeholder="Search accounts"
            ></input>
          </div>
        </div>

        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <TableHeader></TableHeader>
                <TableHeader title="Name"></TableHeader>
                <TableHeader title="Account Number"></TableHeader>
                <TableHeader title="Type" isSortable></TableHeader>
                <TableHeader title="Provider" isSortable></TableHeader>
                <TableHeader title="Balance" isSortable></TableHeader>
                <TableHeader></TableHeader>
              </tr>
            </thead>
            <tbody>
              {props?.isCreateMode && (
                <tr className="border-b bg-white dark:border-gray-700 dark:bg-gray-800 ">
                  <td className="px-1 py-4">
                    {watchProvider?.icon && (
                      <Image alt="logo" width={40} height={40} src={watchProvider?.icon}></Image>
                    )}
                  </td>
                  <td scope="row" className="px-1 py-4">
                    <ControlledInput
                      control={createForm.control}
                      name="name"
                      form="createForm"
                      inputProps={{
                        placeholder: 'Name',
                        required: true,
                      }}
                    />
                  </td>
                  <td scope="row" className="px-1 py-4">
                    <ControlledInput
                      control={createForm.control}
                      name="accountNumber"
                      form="createForm"
                      inputProps={{
                        className: 'w-24',
                        width: '4',
                        placeholder: 'Last 4 digits',
                        required: true,
                      }}
                    />
                  </td>
                  <td scope="row" className="px-1 py-4">
                    <ControlledSelect
                      control={createForm.control}
                      name="accountType"
                      form="createForm"
                      options={typesQuery.data}
                    />
                  </td>
                  <td className="px-1 py-4">
                    <ControlledSelect
                      control={createForm.control}
                      name="accountProvider"
                      form="createForm"
                      options={providersQuery.data}
                    />
                  </td>
                  <td className="px-1 py-4">
                    <div className="flex w-40">
                      <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-200 px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400">
                        ₹
                      </span>
                      <input
                        form="createForm"
                        {...createForm.register('balance', { required: true })}
                        placeholder="Balance"
                        type="number"
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
              {accountsQuery.data.accounts?.map((account, i) => (
                <tr
                  key={account.id}
                  className="border-b bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <td className="px-1 py-4">
                    <Image
                      alt="logo"
                      width={40}
                      height={40}
                      src={account.accountProvider.icon}
                    ></Image>
                  </td>
                  <td className="whitespace-nowrap px-1 py-4 font-medium text-gray-900">
                    {isInEditMode === i ? (
                      <ControlledInput
                        control={editForm.control}
                        name="name"
                        form="createForm"
                        inputProps={{
                          placeholder: 'Name',
                          required: true,
                        }}
                      />
                    ) : (
                      account.name
                    )}
                  </td>
                  <td className="whitespace-nowrap px-1 py-4 font-medium text-gray-900">
                    {isInEditMode === i ? (
                      <ControlledInput
                        control={editForm.control}
                        name="accountNumber"
                        form="editForm"
                        inputProps={{
                          className: 'w-24',
                          width: '4',
                          placeholder: 'Last 4 digits',
                          required: true,
                        }}
                      />
                    ) : (
                      account.accountNumber
                    )}
                  </td>
                  <td scope="row" className="px-1 py-4  dark:text-white">
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
                  </td>
                  <td className="px-1 py-4">
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
                  </td>
                  <td className="px-1 py-4">
                    {isInEditMode === i ? (
                      <ControlledInputMoney
                        form="editForm"
                        control={editForm.control}
                        name="balance"
                        inputProps={{
                          placeholder: 'Balance',
                          required: true,
                        }}
                      />
                    ) : (
                      <span
                        className={
                          account?.balance < 0
                            ? 'font-semibold text-red-600'
                            : 'font-semibold text-green-500'
                        }
                      >
                        <NumberDynamic
                          value={Math.abs(account?.balance)}
                          prefix={`${account?.balance < 0 ? '-' : '+'} ₹`}
                        ></NumberDynamic>
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

export default AccountsTableView
