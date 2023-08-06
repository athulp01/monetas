export const EmptyBudget = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <h3 className="mt-20 text-xl font-medium text-gray-900 dark:text-gray-100">
          No budgets found
        </h3>
        <p className="mb-20 text-sm text-gray-500 dark:text-gray-400">
          Get started by creating a new budget for this month.
        </p>
        <img
          className="mb-4 h-72 rounded-t-lg"
          src={"/emptyBudget.svg"}
          alt=""
        />
      </div>
    </div>
  );
};
