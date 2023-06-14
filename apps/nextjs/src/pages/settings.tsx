import React, { type ReactElement } from "react";
import Head from "next/head";
import {
  mdiBellCog,
  mdiCashMultiple,
  mdiClose,
  mdiConnection,
  mdiGmail,
  mdiPlusThick,
} from "@mdi/js";

import BaseButton from "../components/common/buttons/BaseButton";
import BaseButtons from "../components/common/buttons/BaseButtons";
import SectionMain from "../components/common/sections/SectionMain";
import SectionTitleLineWithButton from "../components/common/sections/SectionTitleLineWithButton";
import LayoutAuthenticated from "../components/layout";
import { getPageTitle } from "../config/config";
import "flowbite";
import { toast } from "react-toastify";

import { api } from "~/utils/api";
import CardBox from "~/components/common/cards/CardBox";
import CardBoxComponentTitle from "~/components/common/cards/CardBoxComponentTitle";
import IconRounded from "~/components/common/icon/IconRounded";
import { ActiveIndicator } from "~/components/common/indicators/ActiveIndicator";
import { InActiveIndicator } from "~/components/common/indicators/InActiveIndicator";
import OverlayLayer from "~/components/common/sections/OverlayLayer";
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

  const [isTgSetupOpen, setIsTgSetupOpen] = React.useState(false);
  const [currentTgStep, setCurrentTgStep] = React.useState<1 | 2 | 3>(1);
  const [chatId, setChatId] = React.useState<string>();
  const [chatIdInputError, setChatIdInputError] =
    React.useState<boolean>(false);

  const nextTgStep = () => {
    if (currentTgStep === 2) {
      if (!chatId) {
        setChatIdInputError(true);
        return;
      }
      setChatIdInputError(false);
    }
    if (currentTgStep < 3) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      setCurrentTgStep(currentTgStep + 1);
    }
  };

  const previousTgStep = () => {
    if (currentTgStep > 1) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      setCurrentTgStep(currentTgStep - 1);
    }
  };

  const addTelegramIntegration = () => {
    telegramIntegrationMutation.mutate({ chatId });
    setIsTgSetupOpen(false);
  };

  const authenticate = () => {
    // Generate the URL for user consent
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${
      env.NEXT_PUBLIC_GMAIL_OAUTH_CLIENT_ID
    }&redirect_uri=${
      env.NEXT_PUBLIC_GMAIL_OAUTH_REDIRECT_URL
    }&response_type=code&scope=${scopes.join("%20")}&access_type=offline`;

    // Redirect the user to the authUrl
    window.location.href = authUrl;
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
            {telegramIntegrationQuery.data?.isConnected ? (
              <BaseButton
                label={"Remove"}
                icon={mdiBellCog}
                iconSize={20}
                small={true}
                color={"danger"}
              ></BaseButton>
            ) : (
              <BaseButton
                label={"Setup"}
                icon={mdiBellCog}
                onClick={() => setIsTgSetupOpen(true)}
                iconSize={20}
                small={true}
                color={"success"}
              ></BaseButton>
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
      {isTgSetupOpen && (
        <OverlayLayer
          onClick={() => setIsTgSetupOpen(false)}
          className={"cursor-pointer"}
        >
          <CardBox
            className={`z-50 max-h-modal w-11/12 shadow-lg transition-transform md:w-3/5 lg:w-2/5 xl:w-4/12`}
            isModal
            footer={
              <BaseButtons>
                {currentTgStep === 3 ? (
                  <BaseButton
                    label={"Confirm"}
                    color={"success"}
                    onClick={addTelegramIntegration}
                  />
                ) : (
                  <BaseButton
                    label={"Next"}
                    color={"success"}
                    onClick={nextTgStep}
                  />
                )}
                {currentTgStep !== 1 ? (
                  <BaseButton
                    label="Back"
                    color={"white"}
                    outline
                    onClick={previousTgStep}
                  />
                ) : (
                  <BaseButton
                    label="Cancel"
                    color={"white"}
                    outline
                    onClick={() => setIsTgSetupOpen(false)}
                  />
                )}
              </BaseButtons>
            }
          >
            <CardBoxComponentTitle title={"Setup Telegram"}>
              {
                <BaseButton
                  icon={mdiClose}
                  color="whiteDark"
                  onClick={() => setIsTgSetupOpen(false)}
                  small
                  roundedFull
                />
              }
            </CardBoxComponentTitle>

            <div className="space-y-3">
              <ol className="relative border-l border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400">
                <li className="mb-10 ml-6">
                  <span
                    className={`absolute -left-4 flex h-8 w-8 items-center justify-center rounded-full ${
                      currentTgStep > 1 ? "bg-green-200" : "bg-gray-100"
                    } ring-4 ring-white dark:bg-green-900 dark:ring-gray-900`}
                  >
                    <svg
                      aria-hidden="true"
                      className={`h-5 w-5 ${
                        currentTgStep > 1
                          ? "text-green-500 dark:text-green-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {currentTgStep > 1 ? (
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        ></path>
                      ) : (
                        <>
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                          <path
                            fillRule="evenodd"
                            d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                            clipRule="evenodd"
                          ></path>
                        </>
                      )}
                    </svg>
                  </span>
                  <h3 className="font-medium leading-tight">Initialize</h3>
                  {currentTgStep === 1 && (
                    <p className="pt-4 text-sm">
                      Search for @monetas-bot in the Telegram app. Open the bot
                      and type <span className={"font-mono"}>/start</span>.
                      After that click on next button.
                    </p>
                  )}
                </li>
                <li className="mb-10 ml-6">
                  <span
                    className={`absolute -left-4 flex h-8 w-8 items-center justify-center rounded-full ${
                      currentTgStep > 2 ? "bg-green-200" : "bg-gray-100"
                    } ring-4 ring-white dark:bg-green-900 dark:ring-gray-900`}
                  >
                    <svg
                      aria-hidden="true"
                      className={`h-5 w-5 ${
                        currentTgStep > 2
                          ? "text-green-500 dark:text-green-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {currentTgStep > 2 ? (
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        ></path>
                      ) : (
                        <>
                          <path
                            fill-rule="evenodd"
                            d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"
                            clip-rule="evenodd"
                          ></path>
                        </>
                      )}
                    </svg>
                  </span>
                  <h3 className="font-medium leading-tight">Verify chat ID</h3>
                  {currentTgStep === 2 && (
                    <div>
                      <p className="pt-4 text-sm">
                        The bot would reply to your earlier message with a chat
                        Id. Enter that chat Id below. After that click on next
                        button.
                      </p>
                      <input
                        placeholder={"Chat ID"}
                        value={chatId}
                        onChange={(e) => setChatId(e.target.value)}
                        required
                        className={
                          "mt-3 block min-w-0 flex-1 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500  dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 "
                        }
                      ></input>
                      {chatIdInputError && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                          <span className="font-medium">Required!</span>
                        </p>
                      )}
                    </div>
                  )}
                </li>
                <li className="mb-10 ml-6">
                  <span className="absolute -left-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-4 ring-white dark:bg-gray-700 dark:ring-gray-900">
                    <svg
                      aria-hidden="true"
                      className={`h-5 w-5 ${
                        currentTgStep > 3
                          ? "text-green-500 dark:text-green-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                      <path
                        fill-rule="evenodd"
                        d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                  </span>
                  <h3 className="font-medium leading-tight">Confirm</h3>
                  {currentTgStep === 3 && (
                    <p className="pt-4 text-sm">
                      You must have received a test notification. If you have
                      received the notification, click on the confirm button.
                    </p>
                  )}
                </li>
              </ol>
            </div>
          </CardBox>
        </OverlayLayer>
      )}
    </>
  );
};

PayeesPage.getLayout = function getLayout(page: ReactElement) {
  return <LayoutAuthenticated>{page}</LayoutAuthenticated>;
};

export default PayeesPage;
