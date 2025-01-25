'use client'
// MUI Imports
import MuiTabList from '@mui/lab/TabList'
import { styled } from '@mui/material/styles'
import type { TabListProps } from '@mui/lab/TabList'

// Type Imports
import type { ThemeColor } from '@core/types'
import { dark } from '@mui/material/styles/createPalette'

export type CustomTabListProps = TabListProps & {
  color?: ThemeColor
  pill?: 'true' | 'false'
  overRideColor?: string
}

const TabList = styled(MuiTabList)<CustomTabListProps>(({ color, theme, pill, orientation, overRideColor }) => ({
  ...(pill === 'true' && {
    minHeight: 38,
    ...(orientation === 'vertical'
      ? {
          minWidth: 130,
          borderInlineEnd: 0
        }
      : {
          borderBlockEnd: 0
        }),
    '&, & .MuiTabs-scroller': {
      ...(orientation === 'vertical' && {
        boxSizing: 'content-box'
      }),
      margin: `${theme.spacing(-1, -1, -1.5, -1)} !important`,
      padding: theme.spacing(1, 1, 1.5, 1)
    },
    '& .MuiTabs-indicator': {
      display: 'none'
    },
    '& .MuiTabs-flexContainer': {
      gap: theme.spacing(3)
    },
    '& .Mui-selected': {
      backgroundColor: overRideColor || `${dark ? '#7112B7 !important' : '#4B0082 !important'}`,
      color: `var(--mui-palette-${color}-contrastText) !important`,
      boxShadow: overRideColor ? `0px 3px 5px rgba(0, 0, 0, 0.2)` : `var(--mui-customShadows-${color}-sm)`,
      // Prevent hover effect on active tab
      '&:hover': {
        backgroundColor: overRideColor || `var(--mui-palette-${color}-main)`
      }
    },
    '& .MuiTab-root': {
      minHeight: 38,
      padding: theme.spacing(2, 5),
      borderRadius: 'var(--mui-shape-borderRadius)',
      backgroundColor: overRideColor
        ? `${overRideColor}33` // Default background color for inactive tabs
        : `${'#666CFF'}20`, // Use light opacity of the theme color
      color: overRideColor || `var(--mui-palette-${color}-main)`,
      '&:hover': {
        border: 0,
        backgroundColor: overRideColor
          ? `${overRideColor}33` // Light opacity for hover
          : `var(--mui-palette-${color}-lightOpacity)`,
        color: overRideColor || `var(--mui-palette-${color}-main)`,
        ...(orientation === 'vertical'
          ? {
              paddingInlineEnd: theme.spacing(5)
            }
          : {
              paddingBlockEnd: theme.spacing(2)
            })
      }
    }
  })
}))

const CustomTabList = (props: CustomTabListProps) => {
  // Props
  const { color = 'primary', overRideColor, ...rest } = props

  // Pass overRideColor to the styled component
  return <TabList color={color} overRideColor={overRideColor} {...rest} />
}

export default CustomTabList
