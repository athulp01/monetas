import { mdiCashMultiple, mdiCheck, mdiCreditCardClock, mdiEye, mdiPlusThick } from '@mdi/js'
import Head from 'next/head'
import { type ReactElement, useState } from 'react'
import CardBox from '../components/common/cards/CardBox'
import LayoutAuthenticated from '../components/layout'
import SectionMain from '../components/common/sections/SectionMain'
import SectionTitleLineWithButton from '../components/common/sections/SectionTitleLineWithButton'
import TransactionsTableView from '../components/transactions/TransactionsTableView'
import { getPageTitle } from '../config/config'
import BaseButtons from '../components/common/buttons/BaseButtons'
import BaseButton from '../components/common/buttons/BaseButton'
import 'flowbite'
import NotificationBar from '../components/common/misc/NotificationBar'
import UnverifiedTransactionsTableView from '../components/transactions/UnverifiedTransactionsTableView'
import { api } from '~/utils/api'

const TransactionsPage = () => {
  const [isInReviewMode, setIsInReviewMode] = useState(false)
  const [createMode, setCreateMode] = useState(false)
  const unverifiedTranstotalCountQuery =
    api.unverifiedTransaction.getUnverifiedTransactionCount.useQuery()

  return (
    <>
      <Head>
        <title>{getPageTitle('TransactionsScreen')}</title>
      </Head>
      <SectionMain>
        <SectionTitleLineWithButton
          icon={mdiCashMultiple}
          title={isInReviewMode ? 'Recent transactions' : 'TransactionsScreen'}
          main={!isInReviewMode}
        >
          <BaseButtons>
            {!isInReviewMode && (
              <>
                <BaseButton
                  className={'mr-2'}
                  icon={mdiPlusThick}
                  color="contrast"
                  disabled={createMode}
                  label="Add new"
                  onClick={() => setCreateMode(true)}
                />
              </>
            )}
            {isInReviewMode && (
              <BaseButton
                icon={mdiCheck}
                color="contrast"
                label="Finish review"
                onClick={() => setIsInReviewMode(false)}
              />
            )}
          </BaseButtons>
        </SectionTitleLineWithButton>
        {!isInReviewMode && (
          <NotificationBar
            color="warning"
            className="hidden md:block"
            icon={mdiCreditCardClock}
            button={
              <BaseButton
                disabled={createMode}
                icon={mdiEye}
                label="Review"
                color="white"
                onClick={() => setIsInReviewMode(true)}
                small
                roundedFull
              />
            }
          >
            There are <strong>{unverifiedTranstotalCountQuery.data || 0}</strong> recently detected
            transactions.
          </NotificationBar>
        )}
        <CardBox className="mb-6 mt-6" hasTable>
          {isInReviewMode && <UnverifiedTransactionsTableView></UnverifiedTransactionsTableView>}
          {!isInReviewMode && (
            <TransactionsTableView
              handleCreateModeCancel={() => setCreateMode(false)}
              isCreateMode={createMode}
            />
          )}
        </CardBox>
      </SectionMain>
    </>
  )
}

TransactionsPage.getLayout = function getLayout(page: ReactElement) {
  return <LayoutAuthenticated>{page}</LayoutAuthenticated>
}

export default TransactionsPage
