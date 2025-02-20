import React, { useState } from 'react'
import { IconButton, Menu, MenuItem } from '@mui/material'
import Link from 'next/link'
import { MoreVert } from '@mui/icons-material'
import { Locale } from '@/configs/i18n'

interface ActionConfig {
  icon: React.ReactNode
  label: string
  color?: string
  className?: string
  show?: boolean
}

interface ActionButtonProps {
  row: any
  locale?: Locale
  getLocalizedUrl: (path: string, locale: Locale) => string
  onViewClick?: (row: any) => void
  onDelete?: (row: any) => void
  onEdit?: (row: any) => void
  onDownload?: (row: any) => void
  showView?: boolean
  showEdit?: boolean
  showDelete?: boolean
  showDownload?: boolean
  actions?: string[]
}

const TenantActionButton: React.FC<ActionButtonProps> = ({
  row,
  locale,
  getLocalizedUrl,
  onViewClick,
  onDelete,
  onEdit,
  onDownload,
  actions = ['view', 'edit', 'delete', 'download'],
  showView = true,
  showEdit = true,
  showDelete = true,
  showDownload = true
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleViewClick = () => {
    handleClose()
    if (onViewClick) {
      onViewClick(row)
    }
    localStorage.setItem('view-tenant', JSON.stringify(row))
  }

  const actionConfigs: Record<string, ActionConfig> = {
    view: {
      icon: <i className='bx-show text-textSecondary text-[22px]' />,
      label: 'View',
      className: 'flex items-center gap-2 text-textSecondary',
      show: showView
    },
    edit: {
      icon: <i className='bx-edit text-textSecondary text-[22px]' />,
      label: 'Edit',
      className: 'flex items-center gap-2 text-textSecondary',
      show: showEdit
    },
    delete: {
      icon: <i className='bx-trash text-textSecondary text-[22px]' />,
      label: 'Delete',
      className: 'flex items-center gap-2 text-textSecondary',
      show: showDelete
    },
    download: {
      icon: <i className='bx-download text-textSecondary text-[22px]' />,
      label: 'Download',
      className: 'flex items-center gap-2 text-textSecondary',
      show: showDownload
    }
  }

  const handleAction = (action: string) => {
    handleClose()
    switch (action) {
      case 'view':
        handleViewClick()
        break
      case 'edit':
        onEdit?.(row)
        break
      case 'delete':
        onDelete?.(row)
        break
      case 'download':
        onDownload?.(row)
        break
    }
  }

  const menuItems = Object.entries(actionConfigs)
    .filter(([_, config]) => config.show)
    .map(([action, config]) => {
      if (action === 'view') {
        return (
          <MenuItem key={action} className={config.className}>
            <Link
              href={getLocalizedUrl(`/apps/accounts/${row.id}/detail`, locale as Locale)}
              className='flex items-center gap-2'
              onClick={handleViewClick}
            >
              {config.icon}
              {config.label}
            </Link>
          </MenuItem>
        )
      }

      return (
        <MenuItem key={action} onClick={() => handleAction(action)} className={config.className}>
          {config.icon}
          {config.label}
        </MenuItem>
      )
    })

  return (
    <div className='flex items-center'>
      <IconButton onClick={handleClick}>
        <MoreVert className='text-textSecondary' />
      </IconButton>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {menuItems}
      </Menu>
    </div>
  )
}

export default TenantActionButton
