export const HDFCInstructions = () => {
  return (
    <div className={"mb-10 mt-8"}>
      <h1 className={"ml-4 text-left text-2xl font-extralight leading-3"}>
        Instructions for downloading statements for HDFC Bank
      </h1>
      <div className={"mt-4 flex justify-start"}>
        <div className="m-4 block max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
          <img
            className="mx-auto mb-4 h-40 rounded-t-lg"
            src="/bank.svg"
            alt=""
          />
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Savings Account
          </h5>
          <div>
            <ol className="mt-2 list-inside list-decimal space-y-1">
              <li>Log in to your HDFC Bank net banking account</li>
              <li>
                After successfully logging in, navigate to the "Accounts" or
                "Account Summary" section.
              </li>
              <li>Click on the "Download Account Statement" option.</li>
              <li>
                Choose the account number, select the statement period and
                select the csv format to download the statement.
              </li>
              <li>Click on the "Download" button.</li>
            </ol>
          </div>
        </div>
        <div className="m-4 block max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
          <img
            className="mx-auto mb-4 h-40 rounded-t-lg"
            src="/cc.svg"
            alt=""
          />
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Credit Card
          </h5>
          <div>
            <ol className="mt-2 list-inside list-decimal space-y-1">
              <li>Log in to your HDFC Bank net banking account</li>
              <li>
                After successfully logging in, navigate to the "Cards" section.
              </li>
              <li>Click on the "Enquire" option.</li>
              <li>Click on the "Download Account Statement" option.</li>
              <li>
                Choose the account number, select the statement period and
                select the csv format to download the statement.
              </li>
              <li>Click on the "Download" button.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
