// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { Locale } from '@configs/i18n'
import type { ShortcutsType } from '@components/layout/shared/ShortcutsDropdown'
import type { NotificationsType } from '@components/layout/shared/NotificationsDropdown'

// Component Imports
import NavToggle from './NavToggle'
import Logo from '@components/layout/shared/Logo'
import NavSearch from '@components/layout/shared/search'
import LanguageDropdown from '@components/layout/shared/LanguageDropdown'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import ShortcutsDropdown from '@components/layout/shared/ShortcutsDropdown'
import NotificationsDropdown from '@components/layout/shared/NotificationsDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'

// Hook Imports
import useHorizontalNav from '@menu/hooks/useHorizontalNav'

// Util Imports
import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses'
import { getLocalizedUrl } from '@/utils/i18n'

// Vars
const shortcuts: ShortcutsType[] = [
  {
    url: '/apps/calendar',
    icon: 'bx-calendar',
    title: 'Calendar',
    subtitle: 'Appointments'
  },
  {
    url: '/apps/invoice/list',
    icon: 'bx-food-menu',
    title: 'Invoice App',
    subtitle: 'Manage Accounts'
  },
  {
    url: '/apps/user/list',
    icon: 'bx-user',
    title: 'Users',
    subtitle: 'Manage Users'
  },
  {
    url: '/apps/roles',
    icon: 'bx-group',
    title: 'Role Management',
    subtitle: 'Permissions'
  },
  {
    url: '/',
    icon: 'bx-pie-chart-alt-2',
    title: 'Dashboard',
    subtitle: 'User Dashboard'
  },
  {
    url: '/pages/account-settings',
    icon: 'bx-cog',
    title: 'Settings',
    subtitle: 'Account Settings'
  }
]


const NavbarContent = () => {
  // Hooks
  const { isBreakpointReached } = useHorizontalNav()
  const { lang: locale } = useParams()

  return (
    <div
      className={classnames(horizontalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}
    >
      <div className='flex items-center gap-4'>
        <NavToggle />
        {/* Hide Logo on Smaller screens */}
        {!isBreakpointReached && (
          <Link href={getLocalizedUrl('/', locale as Locale)}>
            <Logo />
          </Link>
        )}
      </div>

      <div className='flex items-center'>
        <NavSearch />
        <LanguageDropdown />
        <ModeDropdown />
        <ShortcutsDropdown shortcuts={shortcuts} />
        <NotificationsDropdown />
        <UserDropdown />
        {/* Language Dropdown, Notification Dropdown, quick access menu dropdown, user dropdown will be placed here */}
      </div>
    </div>
  )
}

export default NavbarContent
