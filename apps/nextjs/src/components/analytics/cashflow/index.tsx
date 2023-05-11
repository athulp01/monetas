import { CashflowSankey } from './CashflowSankey'

export const CashflowAnalytics = () => {
  return (
    <div className="grid grid-cols-1  gap-y-16">
      <div className="h-72">
        <CashflowSankey></CashflowSankey>
      </div>
    </div>
  )
}
