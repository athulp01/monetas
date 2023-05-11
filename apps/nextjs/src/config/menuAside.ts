import {
  mdiAccountCash,
  mdiBank,
  mdiCashMultiple,
  mdiChartBar,
  mdiMonitor,
  mdiPiggyBank,
  mdiWallet,
} from '@mdi/js'
import { type MenuAsideItem } from "~/interfaces"

const menuAside: MenuAsideItem[] = [
  {
    href: '/',
    icon: mdiMonitor,
    label: 'Dashboard',
  },
  {
    label: 'TransactionsScreen',
    icon: mdiCashMultiple,
    href: '/transactions',
  },
  {
    href: '/accounts',
    label: 'AccountsScreen',
    icon: mdiBank,
  },
  {
    href: '/budget',
    label: 'BudgetScreen',
    icon: mdiWallet,
  },
  {
    href: '/payees',
    label: 'PayeesScreen',
    icon: mdiAccountCash,
  },
  {
    href: '/investment',
    label: 'InvestmentsScreen',
    icon: mdiPiggyBank,
  },

  {
    href: 'analytics',
    label: 'Analytics',
    icon: mdiChartBar,
  },
]

export default menuAside
