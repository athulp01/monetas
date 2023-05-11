import { mdiBank, mdiPlusThick } from '@mdi/js'
import Head from 'next/head'
import { type ReactElement, useState } from 'react'
import CardBox from '../components/common/cards/CardBox'
import LayoutAuthenticated from '../components/layout'
import SectionMain from '../components/common/sections/SectionMain'
import SectionTitleLineWithButton from '../components/common/sections/SectionTitleLineWithButton'
import { getPageTitle } from '../config/config'
import BaseButtons from '../components/common/buttons/BaseButtons'
import BaseButton from '../components/common/buttons/BaseButton'
import 'flowbite'
import InvestmentsTableView from '~/components/investments/InvestmentsTableView'

const InvestmentsPage = () => {
  const [createMode, setCreateMode] = useState(false)

  return (
    <>
      <Head>
        <title>{getPageTitle('InvestmentsScreen`')}</title>
      </Head>
      <SectionMain>
        <SectionTitleLineWithButton icon={mdiBank} title={'InvestmentsScreen'} main>
          <BaseButtons>
            <BaseButton
              icon={mdiPlusThick}
              color="contrast"
              disabled={createMode}
              label="Add new"
              onClick={() => setCreateMode(true)}
            />
          </BaseButtons>
        </SectionTitleLineWithButton>
        <CardBox className="mb-6 mt-6" hasTable>
          <InvestmentsTableView
            handleCreateModeCancel={() => setCreateMode(false)}
            isCreateMode={createMode}
          />
        </CardBox>
      </SectionMain>
    </>
  )
}

InvestmentsPage.getLayout = function getLayout(page: ReactElement) {
  return <LayoutAuthenticated>{page}</LayoutAuthenticated>
}

export default InvestmentsPage
