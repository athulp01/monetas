import { mdiAccount, mdiLogout, mdiThemeLightDark } from '@mdi/js'
import { type MenuNavBarItem } from "~/interfaces"

const menuNavBar: MenuNavBarItem[] = [
  {
    icon: mdiThemeLightDark,
    label: 'Light/Dark',
    isDesktopNoLabel: true,
    isToggleLightDark: true,
  },
  {
    isCurrentUser: true,
    menu: [
      {
        icon: mdiAccount,
        label: 'My Profile',
        href: '/profile',
      },
      {
        icon: mdiLogout,
        label: 'Log Out',
        isLogout: true,
      },
    ],
  },
]

export default menuNavBar
