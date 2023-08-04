export const EmptyTransactions = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <h3 className="mt-20 text-xl font-medium text-gray-900 dark:text-gray-100">
          No transactions yet
        </h3>
        <p className="mb-2 mb-20 text-sm text-gray-500 dark:text-gray-400">
          Get started by adding your first transaction for this time period
        </p>
        <img
          className="h-72 rounded-t-lg"
          src={"/emptyTransactions.svg"}
          alt=""
        />
      </div>
    </div>
  );
};
