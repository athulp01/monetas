import { IncomeCategoryPie } from './IncomeCategoryPie'
import { IncomeLine } from './IncomeLine'
import { IncomePayeePie } from './IncomePayeePie'

export const IncomeAnalytics = () => {
  return (
    <div className="grid grid-cols-1  gap-y-16">
      <div className="h-72">
        <IncomeLine></IncomeLine>
      </div>
      <div className="h-96 grid grid-cols-2">
        <div className="h-96">
          <p className="text-lg text-center text-gray-900 dark:text-white">Categories</p>
          <IncomeCategoryPie />
        </div>
        <div className="h-96">
          <IncomePayeePie />
        </div>
      </div>
    </div>
  )
}
