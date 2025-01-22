import React from 'react'
import CaregiverProfileHeader from './CaregiverProfileHeader'
import ProfileBanner from '@/@layouts/components/horizontal/ProfileBanner'

const TopHeader = () => {
  return (
    <div>
      <ProfileBanner
        props={{
          fullName: 'Suhanna Ibrahim',
          coverImg: '/images/pages/profile-banner.png',
          location: 'USA',
          profileImg: '/images/avatars/2.png',
          status: 'ACTIVE'
        }}
      />
    </div>
  )
}

export default TopHeader
