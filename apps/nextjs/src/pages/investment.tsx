import { type ReactElement } from "react";
import Head from "next/head";

import { getPageTitle } from "~/config/config";
import CardBox from "../components/common/cards/CardBox";
import SectionMain from "../components/common/sections/SectionMain";
import LayoutAuthenticated from "../components/layout";
import "flowbite";
import InvestmentsTableView from "~/components/investments/InvestmentsTableView";

const InvestmentsPage = () => {
  return (
    <>
      <Head>
        <title>{getPageTitle("Investments`")}</title>
      </Head>
      <SectionMain>
        <CardBox hasTable>
          <InvestmentsTableView />
        </CardBox>
      </SectionMain>
    </>
  );
};

InvestmentsPage.getLayout = function getLayout(page: ReactElement) {
  return <LayoutAuthenticated>{page}</LayoutAuthenticated>;
};

export default InvestmentsPage;
