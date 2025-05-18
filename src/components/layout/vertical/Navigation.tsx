'use client'

// React Imports
import { useEffect, useRef } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import { styled, useTheme } from '@mui/material/styles'

// Type Imports
import type { getDictionary } from '@/utils/getDictionary'
import type { Mode } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports
import VerticalNav, { NavHeader, NavCollapseIcons } from '@menu/vertical-menu'
import VerticalMenu from './VerticalMenu'
import CareKeyLogoDark from '@/@core/svg/LogoDark'
import CareKeyLogoLight from '@/@core/svg/LogoLight'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import navigationCustomStyles from '@core/styles/vertical/navigationCustomStyles'
import KeyLogoDark from '@/@core/svg/KeyLogoDark'
import KeyLogoLight from '@/@core/svg/KeyLogoLight'

type Props = {
  dictionary: Awaited<ReturnType<typeof getDictionary>>
  mode: Mode
}

const StyledBoxForShadow = styled('div')(({ theme }) => ({
  top: 72,
  zIndex: 2,
  opacity: 0,
  position: 'absolute',
  pointerEvents: 'none',
  width: '100%',
  height: theme.mixins.toolbar.minHeight,
  transition: 'opacity .15s ease-in-out',
  background: `linear-gradient(var(--mui-palette-background-paper) ${
    theme.direction === 'rtl' ? '95%' : '5%'
  }, rgb(var(--mui-palette-background-paperChannel) / 0.85) 30%, rgb(var(--mui-palette-background-paperChannel) / 0.5) 65%, rgb(var(--mui-palette-background-paperChannel) / 0.3) 75%, transparent)`,
  '&.scrolled': {
    opacity: 1
  }
}))

const MenuToggle = (
  <div className='icon-wrapper'>
    <i className='bx-bxs-chevron-left' />
  </div>
)

const Navigation = (props: Props) => {
  // Props
  const { dictionary } = props

  // Hooks
  const verticalNavOptions = useVerticalNav()
  const { updateSettings, settings } = useSettings()
  const { lang: locale } = useParams()
  const theme = useTheme()

  // Refs
  const shadowRef = useRef(null)

  // Vars
  const { isCollapsed, isHovered, collapseVerticalNav, isBreakpointReached } = verticalNavOptions
  const isSemiDark = settings.semiDark

  const scrollMenu = (container: any, isPerfectScrollbar: boolean) => {
    container = isBreakpointReached || !isPerfectScrollbar ? container.target : container

    if (shadowRef && container.scrollTop > 0) {
      // @ts-ignore
      if (!shadowRef.current.classList.contains('scrolled')) {
        // @ts-ignore
        shadowRef.current.classList.add('scrolled')
      }
    } else {
      // @ts-ignore
      shadowRef.current.classList.remove('scrolled')
    }
  }

  useEffect(() => {
    if (settings.layout === 'collapsed') {
      collapseVerticalNav(true)
    } else {
      collapseVerticalNav(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.layout])

  return (
    // Sidebar Vertical Menu
    <VerticalNav
      customStyles={navigationCustomStyles(verticalNavOptions, theme, settings)}
      collapsedWidth={85}
      backgroundColor='var(--mui-palette-background-paper)'
      // Apply data-dark attribute only when semiDark is enabled and app mode is light
      {...(isSemiDark &&
        settings.mode === 'light' && {
          'data-dark': ''
        })}
    >
      {/* Nav Header including Logo & nav toggle icons */}
      <NavHeader>
        <Link href={getLocalizedUrl('/', locale as Locale)} className='-ml-3'>
          {/* Render logo based on app's settings.mode */}
          {settings.mode === 'dark' || theme.palette.mode === 'dark' ? (
            <span className={`cursor-pointer duration-500 ${!isCollapsed && 'rotate-[360deg]'}`}>
              {isCollapsed && !isHovered ? <KeyLogoDark /> : <CareKeyLogoDark />}
            </span>
          ) : (
            <span className={`cursor-pointer duration-500 ${!isCollapsed && 'rotate-[360deg]'}`}>
              {isCollapsed && !isHovered ? <KeyLogoLight /> : <CareKeyLogoLight />}
            </span>
          )}
        </Link>
        {!(isCollapsed && !isHovered) && (
          <NavCollapseIcons
            lockedIcon={MenuToggle}
            unlockedIcon={MenuToggle}
            closeIcon={MenuToggle}
            onClick={() => updateSettings({ layout: !isCollapsed ? 'collapsed' : 'vertical' })}
          />
        )}
      </NavHeader>
      <StyledBoxForShadow ref={shadowRef} />
      <VerticalMenu dictionary={dictionary} scrollMenu={scrollMenu} />
    </VerticalNav>
  )
}

export default Navigation
