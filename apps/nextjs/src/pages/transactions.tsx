import { useState, type ReactElement } from "react";
import Head from "next/head";
import {
  mdiCancel,
  mdiCashMultiple,
  mdiCheck,
  mdiContentSave,
  mdiCreditCardClock,
  mdiEye,
  mdiImport,
  mdiPlusThick,
} from "@mdi/js";

import BaseButton from "../components/common/buttons/BaseButton";
import BaseButtons from "../components/common/buttons/BaseButtons";
import CardBox from "../components/common/cards/CardBox";
import SectionMain from "../components/common/sections/SectionMain";
import SectionTitleLineWithButton from "../components/common/sections/SectionTitleLineWithButton";
import LayoutAuthenticated from "../components/layout";
import TransactionsTableView from "../components/transactions/TransactionsTableView";
import { getPageTitle } from "../config/config";
import "flowbite";
import { api } from "~/utils/api";
import ImportTableView from "~/components/transactions/ImportTableView";
import NotificationBar from "../components/common/misc/NotificationBar";
import UnverifiedTransactionsTableView from "../components/transactions/UnverifiedTransactionsTableView";

enum Mode {
  Review,
  Import,
  Create,
  View,
}
const TransactionsPage = () => {
  const [mode, setMode] = useState<Mode>(Mode.View);
  const unverifiedTranstotalCountQuery =
    api.unverifiedTransaction.getUnverifiedTransactionCount.useQuery();

  return (
    <>
      <Head>
        <title>{getPageTitle("Transactions")}</title>
      </Head>
      <SectionMain>
        <SectionTitleLineWithButton
          icon={mdiCashMultiple}
          title={getTitle(mode)}
        >
          <BaseButtons>
            {mode === Mode.View && (
              <>
                <BaseButton
                  className={"mr-2"}
                  icon={mdiPlusThick}
                  color="contrast"
                  label="Add new"
                  onClick={() => setMode(Mode.Create)}
                />
                <BaseButton
                  className={"mr-2"}
                  icon={mdiImport}
                  color="info"
                  label="Import"
                  onClick={() => setMode(Mode.Import)}
                />
              </>
            )}
            {mode === Mode.Import && (
              <>
                <BaseButton
                  className={"mr-2"}
                  icon={mdiCancel}
                  color="danger"
                  label="Cancel"
                  onClick={() => setMode(Mode.View)}
                />
                <BaseButton
                  className={"mr-2"}
                  icon={mdiContentSave}
                  color="success"
                  label="Save"
                  onClick={() => setMode(Mode.Import)}
                />
              </>
            )}
            {mode === Mode.Review && (
              <BaseButton
                icon={mdiCheck}
                color="contrast"
                label="Finish review"
                onClick={() => setMode(Mode.View)}
              />
            )}
          </BaseButtons>
        </SectionTitleLineWithButton>
        {mode === Mode.View && (
          <NotificationBar
            color="warning"
            className="hidden md:block"
            icon={mdiCreditCardClock}
            button={
              <BaseButton
                disabled={mode === Mode.Create}
                icon={mdiEye}
                label="Review"
                color="white"
                onClick={() => setMode(Mode.Review)}
                small
                roundedFull
              />
            }
          >
            There are{" "}
            <strong>{unverifiedTranstotalCountQuery.data || 0}</strong> recently
            detected transactions.
          </NotificationBar>
        )}
        <CardBox className="mb-6 mt-6" hasTable>
          {mode === Mode.Review && (
            <UnverifiedTransactionsTableView></UnverifiedTransactionsTableView>
          )}
          {mode === Mode.View && (
            <TransactionsTableView
              handleCreateModeCancel={() => setMode(Mode.View)}
              isCreateMode={mode === Mode.Create}
            />
          )}
          {mode === Mode.Import && <ImportTableView></ImportTableView>}
        </CardBox>
      </SectionMain>
    </>
  );
};

const getTitle = (mode: Mode) => {
  switch (mode) {
    case Mode.Review:
      return "Review Transactions";
    case Mode.Import:
      return "Import Transactions";
    case Mode.View:
      return "Transactions";
  }
};

TransactionsPage.getLayout = function getLayout(page: ReactElement) {
  return <LayoutAuthenticated>{page}</LayoutAuthenticated>;
};

export default TransactionsPage;
