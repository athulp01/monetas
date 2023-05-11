import {
  mdiAccountCash,
  mdiBankTransferIn,
  mdiBankTransferOut,
  mdiChartPie,
  mdiChartTimelineVariant,
  mdiCreditCardClock,
} from '@mdi/js'
import Head from 'next/head'
import type { ReactElement } from 'react'
import React from 'react'
import LayoutAuthenticated from '../components/layout'
import SectionMain from '../components/common/sections/SectionMain'
import SectionTitleLineWithButton from '../components/common/sections/SectionTitleLineWithButton'
import CardBoxWidget from '../components/common/cards/CardBoxWidget'
import NotificationBar from '../components/common/misc/NotificationBar'
import { getPageTitle } from '../config/config'
import { api } from '~/utils/api'
import { Bars } from 'react-loader-spinner'
import SectionFullScreen from '~/components/common/sections/SectionFullScreen'
import moment from 'moment'

const Dashboard = () => {
  const incomeQuery = api.reports.getTotalIncomeForMonth.useQuery({
    month: moment().startOf('day').toDate(),
  })
  const expenseQuery = api.reports.getTotalExpensesForMonth.useQuery({
    month: moment().startOf('day').toDate(),
  })
  const netWorthQuery = api.reports.getNetWorth.useQuery()

  return (
    <>
      <Head>
        <title>{getPageTitle('Dashboard')}</title>
      </Head>
      <SectionMain>
        <SectionTitleLineWithButton
          icon={mdiChartTimelineVariant}
          title="Overview"
          main
        ></SectionTitleLineWithButton>

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <CardBoxWidget
            icon={mdiAccountCash}
            iconColor="info"
            number={netWorthQuery?.data?.netWorth ?? 0}
            numberPrefix={'₹'}
            label="Net worth"
          />
          <CardBoxWidget
            icon={mdiBankTransferOut}
            iconColor="danger"
            number={expenseQuery?.data?.totalExpenses ?? 0}
            numberPrefix={'₹'}
            label="Expenses"
          />
          <CardBoxWidget
            icon={mdiBankTransferIn}
            iconColor="success"
            number={incomeQuery?.data?.totalIncome ?? 0}
            numberPrefix={'₹'}
            label="Income"
          />
        </div>
        <NotificationBar color="warning" icon={mdiCreditCardClock}>
          Credit card bill payment is pending. Last date is 28 Feb, 2023
        </NotificationBar>
        <SectionTitleLineWithButton
          icon={mdiChartPie}
          title="Trends overview"
        ></SectionTitleLineWithButton>
      </SectionMain>
    </>
  )
}

Dashboard.getLayout = function getLayout(page: ReactElement) {
  return <LayoutAuthenticated>{page}</LayoutAuthenticated>
}

export default Dashboard
