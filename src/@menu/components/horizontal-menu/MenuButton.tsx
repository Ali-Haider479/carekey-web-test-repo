// React Imports
import { cloneElement, createElement, forwardRef } from 'react'
import type { ForwardRefRenderFunction } from 'react'

// Third-party Imports
import classnames from 'classnames'
import { css } from '@emotion/react'

// Type Imports
import type { ChildrenType, MenuButtonProps } from '../../types'

// Component Imports
import { RouterLink } from '../RouterLink'

// Util Imports
import { menuClasses } from '../../utils/menuClasses'
import { dark } from '@mui/material/styles/createPalette'

type MenuButtonStylesProps = Partial<ChildrenType> & {
  level: number
  disabled?: boolean
}

export const menuButtonStyles = (props: MenuButtonStylesProps) => {
  // Props
  const { level, disabled, children } = props

  return ({ theme }: { theme: any }) =>
    css({
      display: 'flex',
      alignItems: 'center',
      minBlockSize: '30px',
      textDecoration: 'none',
      color: theme.palette.text.primary,
      boxSizing: 'border-box',
      cursor: 'pointer',
      paddingInline: '20px',

      '&:hover': {
        backgroundColor: theme.palette.action.hover
      },

      '&:focus-visible': {
        outline: 'none',
        backgroundColor: theme.palette.action.hover
      },

      ...(disabled && {
        pointerEvents: 'none',
        cursor: 'default',
        color: theme.palette.text.disabled
      }),

      [`&.${menuClasses.active}`]: {
        ...(level === 0
          ? {
              color: theme.palette.primary.contrastText,
              backgroundColor: theme.palette.primary.main
            }
          : {
              ...(children
                ? { backgroundColor: theme.palette.action.hover }
                : {
                    color: theme.palette.primary.main,
                    backgroundColor: theme.palette.primary.light
                  })
            })
      }
    })
}

const MenuButton: ForwardRefRenderFunction<HTMLAnchorElement, MenuButtonProps> = (
  { className, component, children, ...rest },
  ref
) => {
  if (component) {
    // If component is a string, create a new element of that type
    if (typeof component === 'string') {
      return createElement(
        component,
        {
          className: classnames(className),
          ...rest,
          ref
        },
        children
      )
    } else {
      // Otherwise, clone the element
      const { className: classNameProp, ...props } = component.props

      return cloneElement(
        component,
        {
          className: classnames(className, classNameProp),
          ...rest,
          ...props,
          ref
        },
        children
      )
    }
  } else {
    // If there is no component but href is defined, render RouterLink
    if (rest.href) {
      return (
        <RouterLink ref={ref} className={className} href={rest.href} {...rest}>
          {children}
        </RouterLink>
      )
    } else {
      return (
        <a ref={ref} className={className} {...rest}>
          {children}
        </a>
      )
    }
  }
}

export default forwardRef(MenuButton)
