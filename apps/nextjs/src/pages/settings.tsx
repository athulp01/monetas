import React, { useEffect, type ReactElement } from "react";
import Head from "next/head";
import { mdiConnection, mdiGmail, mdiTune } from "@mdi/js";

import { getPageTitle } from "~/config/config";
import BaseButton from "../components/common/buttons/BaseButton";
import SectionMain from "../components/common/sections/SectionMain";
import LayoutAuthenticated from "../components/layout";
import "flowbite";
import TelegramLoginButton from "react-telegram-login";
import { toast } from "react-toastify";

import { api } from "~/utils/api";
import CardBox from "~/components/common/cards/CardBox";
import IconRounded from "~/components/common/icon/IconRounded";
import { ActiveIndicator } from "~/components/common/indicators/ActiveIndicator";
import { InActiveIndicator } from "~/components/common/indicators/InActiveIndicator";
import { DefaultLoading } from "~/components/common/loading/DefaultLoading";
import { env } from "~/env.mjs";

const scopes = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "email",
  "profile",
];

const SettingsPage = () => {
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
  const revokeGmailIntegrationMutation =
    api.integration.revokeGmailIntegration.useMutation();
  const verifyGmailIntegrationQuery =
    api.integration.verifyGmailIntegration.useQuery();

  const addTelegramIntegration = (chatId: string) => {
    telegramIntegrationMutation.mutate({ chatId });
  };

  useEffect(() => {
    if (gmailIntegrationQuery.data?.isConnected) {
      void verifyGmailIntegrationQuery.refetch();
    }
  }, [gmailIntegrationQuery.data, verifyGmailIntegrationQuery]);

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
        <section>
          <div className="mb-3 flex items-center justify-start">
            <IconRounded
              icon={mdiConnection}
              color="transparent"
              className="mr-3"
              bg
            />
            <h1 className={`leading-tight`}>Integrations</h1>
          </div>
          <CardBox>
            {gmailIntegrationQuery.isLoading ||
            telegramIntegrationQuery.isLoading ? (
              <DefaultLoading />
            ) : (
              <>
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
                  Integrate Telegram to receive real-time transaction
                  notifications, allowing you to conveniently edit and verify
                  transactions directly from Telegram.
                </div>
                {!telegramIntegrationQuery.data?.isConnected && (
                  <TelegramLoginButton
                    bottonSize="medium"
                    dataOnauth={(data) => {
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
                      addTelegramIntegration(data.id.toString());
                    }}
                    botName={env.NEXT_PUBLIC_TELEGRAM_BOT_NAME}
                  />
                )}
                <div className={"mt-12 flex justify-between"}>
                  <span className={"text-xl"}>Gmail</span>
                  {gmailIntegrationQuery.data?.isConnected && (
                    <ActiveIndicator />
                  )}
                  {!gmailIntegrationQuery.data?.isConnected && (
                    <InActiveIndicator />
                  )}
                </div>
                <div className={"mb-3 mt-3 text-sm font-light"}>
                  Effortlessly extract transaction information by integrating
                  with Gmail, streamlining the process of gathering transaction
                  details automatically.
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
                    onClick={() => revokeGmailIntegrationMutation.mutate()}
                    label={"Revoke"}
                    icon={mdiGmail}
                    iconSize={28}
                    color={"danger"}
                    small
                  ></BaseButton>
                )}
              </>
            )}
          </CardBox>

          <div className="mb-3 mt-3 flex items-center justify-start">
            <IconRounded
              icon={mdiTune}
              color="transparent"
              className="mr-3"
              bg
            />
            <h1 className={`leading-tight`}>Preferences</h1>
          </div>

          <CardBox>
            <div className={"flex justify-between"}>
              <div className={"text-xl"}>Theme</div>
              <div className={"text-gray-500"}>Light</div>
            </div>
          </CardBox>
        </section>
      </SectionMain>
    </>
  );
};

SettingsPage.getLayout = function getLayout(page: ReactElement) {
  return <LayoutAuthenticated>{page}</LayoutAuthenticated>;
};

export default SettingsPage;
