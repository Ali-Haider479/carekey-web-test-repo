// MUI Imports
import type { Theme } from '@mui/material/styles'

const switchOverrides: Theme['components'] = {
  MuiSwitch: {
    defaultProps: {
      disableRipple: true
    },
    styleOverrides: {
      root: ({ theme, ownerState }) => ({
        '&:has(.Mui-disabled)': {
          opacity: 0.45
        },
        ...(ownerState.size !== 'small'
          ? {
              width: 46,
              height: 36,
              padding: theme.spacing(2.25, 2)
            }
          : {
              width: 42,
              height: 30,
              padding: theme.spacing(1.75, 2),
              '& .MuiSwitch-thumb': {
                width: 12,
                height: 12
              },
              '& .MuiSwitch-switchBase': {
                padding: 7,
                left: 3,
                '&.Mui-checked': {
                  left: -3
                }
              }
            })
      }),
      switchBase: ({ theme, ownerState }) => ({
        top: 2,
        left: 1,
        '&.Mui-checked': {
          left: -7,
          color: 'var(--mui-palette-common-white)',
          '& + .MuiSwitch-track': {
            opacity: 1,
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.main
          }
        },
        '&.Mui-checked:not(.Mui-disabled) + .MuiSwitch-track': {
          boxShadow: `var(--mui-customShadows-${ownerState.color}-sm)`
        },
        '&:not(.Mui-checked) + .MuiSwitch-track': {
          boxShadow: '0 0 4px rgb(0 0 0 / 0.16) inset'
        },
        '&.Mui-disabled + .MuiSwitch-track': {
          opacity: 1
        },
        '&:hover:not(:has(span.MuiTouchRipple-root))': {
          backgroundColor: 'transparent'
        }
      }),
      thumb: () => ({
        width: 14,
        height: 14,
        boxShadow: 'var(--mui-customShadows-xs)'
      }),
      track: ({ theme }) => ({
        opacity: 1,
        borderRadius: 10,
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.action.focus
      })
    }
  }
}

export default switchOverrides
