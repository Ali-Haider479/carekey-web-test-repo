// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { getDictionary } from '@/utils/getDictionary'
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'
import CustomChip from '@core/components/mui/Chip'

// import { GenerateVerticalMenu } from '@components/GenerateMenu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'
import { useEffect, useState } from 'react'
import api from '@/utils/api'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux-store'
import { setChatUnReadMessageStatus } from '@/redux-store/slices/notification'
import { Box, Typography } from '@mui/material'
import { useSession } from 'next-auth/react'
import { selectPlan } from '@/redux-store/slices/plan'

// Menu Data Imports
// import menuData from '@/data/navigation/verticalMenuData'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

type Props = {
  dictionary: Awaited<ReturnType<typeof getDictionary>>
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='bx-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ dictionary, scrollMenu }: Props) => {
  const dispatch = useDispatch()
  const [tenantData, setTenantData] = useState<any>(null)
  const chatUnReadMessageStatus = useSelector((state: RootState) => state.notificationReducer.chatUnReadMessageStatus)
  // Hooks
  const theme = useTheme()
  const params = useParams()
  const verticalNavOptions = useVerticalNav()
  const { data: session } = useSession()
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')
  const plan = useSelector(selectPlan)
  // Vars
  const { transitionDuration, isBreakpointReached } = verticalNavOptions
  const { lang: locale } = params

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar
  console.log('SIDEBAR AUTH', authUser)

  // Function to check if user has a specific permission
  const hasPermission = (permissionName: string): boolean => {
    if (!authUser?.userRoles?.rolePermissions) return false

    return authUser.userRoles.rolePermissions.some((rp: any) => rp.permission?.name === permissionName)
  }

  const fetchTenantData = async () => {
    try {
      const response = await api.get(`/tenant/${authUser.tenant.id}`)
      const data = response.data
      setTenantData(data)
      return data
    } catch (error) {
      console.error('Error fetching tenant data:', error)
    }
  }

  useEffect(() => {
    fetchTenantData()
  }, [])

  useEffect(() => {
    const fetchUserUnreadMessagesCount = async () => {
      try {
        const response = await api.get(`chat/unread-messages-count/${authUser.id}`)
        dispatch(setChatUnReadMessageStatus(response.data))
      } catch (error: any) {
        console.error('Error fetching unread message count:', error)
      }
    }

    fetchUserUnreadMessagesCount()
  }, [dispatch])

  return (
    <>
      <ScrollWrapper
        {...(isBreakpointReached
          ? {
              className: 'bs-full overflow-y-auto overflow-x-hidden',
              onScroll: container => scrollMenu(container, false)
            }
          : {
              options: { wheelPropagation: false, suppressScrollX: true },
              onScrollY: container => scrollMenu(container, true)
            })}
      >
        <Menu
          popoutMenuOffset={{ mainAxis: 27 }}
          menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
          renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
          renderExpandedMenuItemIcon={{ icon: <i className='bx-bxs-circle' /> }}
          menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
        >
          {/* Dashboard - requires Dashboard permission */}
          {hasPermission('Dashboard') && (
            <MenuItem
              href={`/${locale}/apps/dashboard`}
              icon={<i className='bx-home-smile' />}
              exactMatch={false}
              activeUrl='/apps/dashboard'
            >
              {dictionary['navigation'].dashboard}
            </MenuItem>
          )}

          {/* RCM - no specific permission in the provided list, consider adding one */}
          {hasPermission('RCM') && (
            <MenuItem
              href={`/${locale}/apps/rcm`}
              icon={<i className='bx-money' />}
              exactMatch={false}
              activeUrl='/apps/rcm'
              disabled={authUser.userRoles.title !== 'Super Admin' && !plan?.id}
            >
              {dictionary['navigation'].rcm}
            </MenuItem>
          )}

          {/* Billing - requires Billing permission */}
          {hasPermission('Billing') && authUser.tenant && (
            <MenuItem
              href={`/${locale}/apps/billing`}
              icon={<i className='bx-dollar' />}
              exactMatch={false}
              activeUrl='/apps/billing'
              disabled={authUser.userRoles.title !== 'Super Admin' && !plan?.id}
            >
              {dictionary['navigation'].billing}
            </MenuItem>
          )}

          {/* Caregivers - requires Caregivers_Access permission */}
          {hasPermission('Caregivers') && authUser.tenant && (
            <MenuItem
              // href={`/${locale}/apps/caregiver/list`}
              href={
                authUser?.userRoles?.title === 'Caregiver'
                  ? `/${locale}/apps/caregiver/${authUser?.caregiver?.id}/detail`
                  : `/${locale}/apps/caregiver/list`
              }
              icon={<i className='bx-bxs-heart-circle' />}
              exactMatch={false}
              activeUrl='/apps/caregiver'
              disabled={authUser.userRoles.title !== 'Super Admin' && !plan?.id}
            >
              {dictionary['navigation'].caregivers}
            </MenuItem>
          )}

          {/* Clients - requires Client_Access permission */}
          {hasPermission('Client') && authUser.tenant && (
            <MenuItem
              href={`/${locale}/apps/client/list`}
              icon={<i className='bx-user' />}
              exactMatch={false}
              activeUrl='/apps/client'
              disabled={authUser.userRoles.title !== 'Super Admin' && !plan?.id}
            >
              {dictionary['navigation'].clients}
            </MenuItem>
          )}

          {/* Accounts - requires Accounts permission */}
          {hasPermission('Accounts') && (
            <MenuItem
              href={
                authUser?.userRoles?.title === 'Tenant Admin'
                  ? `/${locale}/apps/accounts/${authUser?.tenant?.id}/detail`
                  : `/${locale}/apps/accounts/tenant-list`
              }
              icon={<i className='bx-user-circle' />}
              exactMatch={false}
              activeUrl='/apps/accounts'
            >
              {authUser?.userRoles?.title === 'Tenant Admin' ? 'Account' : dictionary['navigation'].accounts}
            </MenuItem>
          )}

          {/* Schedules - requires Calendar permission */}
          {hasPermission('Calendar') && authUser.tenant && (
            <MenuItem
              href={`/${locale}/apps/schedules/calendar-view`}
              icon={<i className='bx-calendar-alt' />}
              exactMatch={false}
              activeUrl='/apps/schedules'
              disabled={authUser.userRoles.title !== 'Super Admin' && !plan?.id}
            >
              {dictionary['navigation'].schedules}
            </MenuItem>
          )}

          {/* EVV Tracking - requires EVV permission */}
          {hasPermission('EVV') && authUser.tenant && (
            <MenuItem
              href={`/${locale}/apps/evv-tracking`}
              icon={<i className='bx-mobile-alt' />}
              exactMatch={false}
              activeUrl='/apps/evv-tracking'
              disabled={authUser.userRoles.title !== 'Super Admin' && !plan?.id}
            >
              {dictionary['navigation'].evv}
            </MenuItem>
          )}

          {/* Timesheets - requires TimeSheets permission */}
          {hasPermission('Timesheets') && authUser.tenant && (
            <MenuItem
              href={`/${locale}/apps/timesheets`}
              icon={<i className='bx-spreadsheet' />}
              exactMatch={false}
              activeUrl='/apps/timesheets'
              disabled={authUser.userRoles.title !== 'Super Admin' && !plan?.id}
            >
              {dictionary['navigation'].timesheets}
            </MenuItem>
          )}

          {/* Chat - requires Chat permission */}
          {hasPermission('Chat') &&
            (authUser?.userRoles?.title === 'Super Admin' || plan?.features?.chat_and_messaging) && ( // Super Admin bypasses feature check
              <MenuItem
                href={`/${locale}/apps/chat`}
                icon={<i className='bx-chat' />}
                exactMatch={false}
                activeUrl='/apps/chat'
                disabled={authUser.userRoles.title !== 'Super Admin' && !plan?.id}
                suffix={
                  chatUnReadMessageStatus ? (
                    <span className='relative inline-block'>
                      <span className='absolute top-[-5] right-0 w-3 h-3 bg-red-500 rounded-full' />
                    </span>
                  ) : (
                    ''
                  )
                }
                onActiveChange={() => dispatch(setChatUnReadMessageStatus(false))}
              >
                {dictionary['navigation'].chat}
              </MenuItem>
            )}

          {/* Reports - requires Reports permission */}
          {hasPermission('Reports') && authUser.tenant && (
            <MenuItem
              href={`/${locale}/apps/reports`}
              icon={<i className='bx-alarm-exclamation' />}
              exactMatch={false}
              activeUrl='/apps/reports'
              disabled={authUser.userRoles.title !== 'Super Admin' && !plan?.id}
            >
              {dictionary['navigation'].reports}
            </MenuItem>
          )}

          {/* Advance - no specific permission in the provided list, consider adding one */}
          {hasPermission('Advance') && (
            <MenuItem
              href={`/${locale}/apps/advance`}
              icon={<i className='bx-bug-alt' />}
              exactMatch={false}
              activeUrl='/apps/advance'
              disabled={authUser.userRoles.title !== 'Super Admin' && !plan?.id}
            >
              {dictionary['navigation'].advance}
            </MenuItem>
          )}
        </Menu>
      </ScrollWrapper>
      {authUser.tenant && (
        <>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              px: 3,
              py: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper'
            }}
          >
            <Typography
              variant='h6'
              sx={{
                fontWeight: 'bold',
                color: 'text.primary'
              }}
            >
              Tenant Info
            </Typography>
            <Typography
              variant='body2'
              sx={{
                fontWeight: 'medium',
                color: 'text.secondary',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              Name: {authUser.tenant.companyName}
            </Typography>
            <Typography
              variant='body2'
              sx={{
                fontWeight: 'medium',
                color: 'text.secondary',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              Email: {authUser.tenant.billingEmail}
            </Typography>
            <Typography
              variant='body2'
              sx={{
                fontWeight: 'medium',
                color: 'text.secondary',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              Phone: {authUser.tenant.contactNumber}
            </Typography>
          </Box>
        </>
      )}
    </>
  )
}

export default VerticalMenu
