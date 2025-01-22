'use client'
import Grid from '@mui/material/Grid2'
import React, { useState } from 'react'
import InfoCard from '../profile/InfoCard'
import CareGiverFormCard from './CaregiverFormCard'
import CaregiverChecklist from './CaregiverChecklist'

const Forms = () => {
  const [showChecklist, setShowChecklist] = useState(false)

  const handleShowChecklist = () => {
    setShowChecklist(true)
  }

  const handleShowForms = () => {
    setShowChecklist(false)
  }

  return (
    <Grid container spacing={0}>
      <Grid size={{ xs: 12, sm: 4, md: 4 }}>
        <InfoCard />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 8 }}>
        {showChecklist ? (
          <CaregiverChecklist onShowForms={handleShowForms} />
        ) : (
          <CareGiverFormCard onShowChecklist={handleShowChecklist} />
        )}
      </Grid>
    </Grid>
  )
}

export default Forms
