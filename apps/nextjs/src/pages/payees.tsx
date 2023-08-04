import { useState, type ReactElement } from "react";
import Head from "next/head";

import CardBox from "../components/common/cards/CardBox";
import SectionMain from "../components/common/sections/SectionMain";
import LayoutAuthenticated from "../components/layout";
import { getPageTitle } from "../config/config";
import "flowbite";
import PayeeTableView from "../components/payees/PayeeTableView";

const PayeesPage = () => {
  const [createMode, setCreateMode] = useState(false);

  return (
    <>
      <Head>
        <title>{getPageTitle("Payees")}</title>
      </Head>
      <SectionMain>
        <CardBox hasTable>
          <PayeeTableView />
        </CardBox>
      </SectionMain>
    </>
  );
};

PayeesPage.getLayout = function getLayout(page: ReactElement) {
  return <LayoutAuthenticated>{page}</LayoutAuthenticated>;
};

export default PayeesPage;
