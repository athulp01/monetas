import { useEffect } from "react";
import { useRouter } from "next/router";

import { api } from "~/utils/api";
import { DefaultLoading } from "~/components/common/loading/DefaultLoading";
import { StepCard } from "~/components/dashboard/StepCard";
import { useLocalStorage } from "~/hooks/useLocalStorage";

export const GET_STARTED_IN_PROGRESS_KEY = "get-started-in-progress";
export const GET_STARTED_STEP_KEY = "get-started-step";
export const GetStarted = () => {
  const router = useRouter();
  const accountsQuery = api.account.listAccounts.useQuery();
  const [getStartedInProgess, setGetStartedInProgress] = useLocalStorage(
    GET_STARTED_IN_PROGRESS_KEY,
    true,
  );
  const [currentStep, setCurrentStep] = useLocalStorage<number>(
    GET_STARTED_STEP_KEY,
    1,
  );

  useEffect(() => {
    setGetStartedInProgress(true);
  }, []);

  if (accountsQuery.isLoading) {
    return <DefaultLoading></DefaultLoading>;
  }

  // if (accountsQuery.data?.totalCount > 0) {
  //   setCurrentStep(2);
  // }

  return (
    <>
      <div className="mb-24 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
          Get Started
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Follow these steps to get started with your financial management
          journey
        </p>
      </div>
      <div className="ml-3 grid grid-cols-3">
        <StepCard
          isCompleted={currentStep > 1}
          heading="Setup Accounts"
          description={`The first essential step in getting started is setting up your
            accounts. During setup, simply provide details such as account type,
            account provider, account name, current balance, and the last 4
            digits of the account number. These last 4 digits help us correlate
            transactions parsed from your email, ensuring seamless and accurate
            tracking of your financial activities`}
          imageSrc={"/emptyAccounts.svg"}
          actionName="Setup Accounts"
          actionHandler={() => {
            setCurrentStep(2);
            router.push("/accounts");
          }}
        ></StepCard>
        <StepCard
          isCompleted={currentStep > 2}
          heading="Add Payees"
          description={`The next step in the process is to add payees to the financial
            management tool. For each payee, you should assign a category to
            help organize and track expenses efficiently. Payee names are
            crucial as they are used to correlate transactions parsed from your
            email, ensuring accurate identification and categorization of your
            financial transactions.`}
          imageSrc={"/emptyPayees.svg"}
          actionName="Add Payees"
          actionHandler={() => {
            setCurrentStep(3);
            router.push("/payees");
          }}
        ></StepCard>
        <StepCard
          isCompleted={currentStep > 3}
          heading="Setup Integrations"
          description={`The final step involves adding integrations. By integrating with
            Gmail, the tool can monitor transactional emails for any financial
            activities. Additionally, with Telegram integration, users will
            receive real-time notifications of new transactions, and they can
            conveniently edit, add, or ignore them as needed. These integrations
            provide a seamless and efficient way to stay on top of your finances
            and maintain accurate records.`}
          imageSrc={"/emptyIntegrations.svg"}
          actionName="Setup Integrations"
          actionHandler={() => {
            setGetStartedInProgress(false);
            router.push("/settings");
          }}
        ></StepCard>
      </div>
    </>
  );
};
