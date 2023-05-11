import { AccountBalanceLine } from './AccountBalanceLine'

export const AccountAnalytics = () => {
  return (
    <div className="grid grid-cols-1  gap-y-16">
      <div className="h-72">
        <AccountBalanceLine></AccountBalanceLine>
      </div>
    </div>
  )
}
