import React, { type ReactElement } from "react";
import Head from "next/head";
import {
  mdiCashMultiple,
  mdiConnection,
  mdiGmail,
  mdiPlusThick,
} from "@mdi/js";

import { getPageTitle } from "~/config/config";
import BaseButton from "../components/common/buttons/BaseButton";
import BaseButtons from "../components/common/buttons/BaseButtons";
import SectionMain from "../components/common/sections/SectionMain";
import SectionTitleLineWithButton from "../components/common/sections/SectionTitleLineWithButton";
import LayoutAuthenticated from "../components/layout";
import "flowbite";
import TelegramLoginButton from "react-telegram-login";
import { toast } from "react-toastify";

import { api } from "~/utils/api";
import CardBox from "~/components/common/cards/CardBox";
import IconRounded from "~/components/common/icon/IconRounded";
import { ActiveIndicator } from "~/components/common/indicators/ActiveIndicator";
import { InActiveIndicator } from "~/components/common/indicators/InActiveIndicator";
import { env } from "~/env.mjs";

const scopes = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "email",
  "profile",
];

const PayeesPage = () => {
  const gmailIntegrationQuery = api.integration.getGmailIntegration.useQuery();
  const telegramIntegrationQuery =
    api.integration.getTelegramIntegration.useQuery();
  const telegramIntegrationMutation =
    api.integration.addTelegramIntegration.useMutation({
      onSuccess: () => {
        toast.success("Telegram integration added successfully");
      },
      onError: (err) => {
        toast.error("Error adding telegram integration");
        console.log(err);
      },
    });

  const addTelegramIntegration = (chatId: string) => {
    telegramIntegrationMutation.mutate({ chatId });
  };

  const authenticate = () => {
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${
      env.NEXT_PUBLIC_GMAIL_OAUTH_CLIENT_ID
    }&redirect_uri=${
      env.NEXT_PUBLIC_GMAIL_OAUTH_REDIRECT_URL
    }&response_type=code&scope=${scopes.join("%20")}&access_type=offline`;
  };

  return (
    <>
      <Head>
        <title>{getPageTitle("Settings")}</title>
      </Head>
      <SectionMain>
        <SectionTitleLineWithButton
          icon={mdiCashMultiple}
          title={"Settings"}
          main
        >
          <BaseButtons>
            <BaseButton icon={mdiPlusThick} color="contrast" label="Add new" />
          </BaseButtons>
        </SectionTitleLineWithButton>
        <section>
          <div className="mb-3 flex items-center justify-start">
            <IconRounded
              icon={mdiConnection}
              color="white"
              className="mr-3"
              bg
            />
            <h1 className={`leading-tight`}>Integrations</h1>
          </div>
          <CardBox>
            <div className={"flex justify-between"}>
              <span className={"text-xl"}>Telegram</span>
              {telegramIntegrationQuery.data?.isConnected && (
                <ActiveIndicator />
              )}
              {!telegramIntegrationQuery.data?.isConnected && (
                <InActiveIndicator />
              )}
            </div>
            <div className={"mb-3 mt-3 text-sm font-light"}>
              Integrate Telegram to receive real-time transaction notifications,
              allowing you to conveniently edit and verify transactions directly
              from Telegram.
            </div>
            {!telegramIntegrationQuery.data?.isConnected && (
              <TelegramLoginButton
                bottonSize="medium"
                dataOnauth={(data) => {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
                  addTelegramIntegration(data.id);
                }}
                botName="monetas_notification_bot"
              />
            )}
            <div className={"mt-12 flex justify-between"}>
              <span className={"text-xl"}>Gmail</span>
              {gmailIntegrationQuery.data?.isConnected && <ActiveIndicator />}
              {!gmailIntegrationQuery.data?.isConnected && (
                <InActiveIndicator />
              )}
            </div>
            <div className={"mb-3 mt-3 text-sm font-light"}>
              Effortlessly extract transaction information by integrating with
              Gmail, streamlining the process of gathering transaction details
              automatically.
            </div>
            {!gmailIntegrationQuery.data?.isConnected && (
              <BaseButton
                onClick={authenticate}
                label={"Authorize"}
                icon={mdiGmail}
                iconSize={28}
                color={"success"}
                small
              ></BaseButton>
            )}
            {gmailIntegrationQuery.data?.isConnected && (
              <BaseButton
                label={"Revoke access"}
                icon={mdiGmail}
                iconSize={28}
                color={"danger"}
                small
              ></BaseButton>
            )}
          </CardBox>
        </section>
      </SectionMain>
    </>
  );
};

PayeesPage.getLayout = function getLayout(page: ReactElement) {
  return <LayoutAuthenticated>{page}</LayoutAuthenticated>;
};

export default PayeesPage;
