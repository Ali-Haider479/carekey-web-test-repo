'use client'
import React from 'react'
import AccountHistoryTable from './AccountHistoryTable'
import AccountHistoryFilters from './AccountHistoryFilters'
import { CaregiverTypes } from '@/types/apps/caregiverTypes'

const AccountHistory = () => {
  return (
    <div>
      <div>
        <AccountHistoryFilters setData={() => {}} />
      </div>
      <div className='mt-5'>
        <AccountHistoryTable />
      </div>
    </div>
  )
}

export default AccountHistory
