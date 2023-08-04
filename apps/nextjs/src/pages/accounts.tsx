import { type ReactElement } from "react";
import Head from "next/head";

import { getPageTitle } from "~/config/config";
import CardBox from "../components/common/cards/CardBox";
import SectionMain from "../components/common/sections/SectionMain";
import LayoutAuthenticated from "../components/layout";
import "flowbite";
import AccountsTableView from "../components/accounts/AccountsTableView";

const AccountsPage = () => {
  return (
    <>
      <Head>
        <title>{getPageTitle("Accounts")}</title>
      </Head>
      <SectionMain>
        <CardBox hasTable>
          <AccountsTableView />
        </CardBox>
      </SectionMain>
    </>
  );
};

AccountsPage.getLayout = function getLayout(page: ReactElement) {
  return <LayoutAuthenticated>{page}</LayoutAuthenticated>;
};

export default AccountsPage;
