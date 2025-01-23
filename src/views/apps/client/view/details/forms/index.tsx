'use client'
import Grid from '@mui/material/Grid2'
import React, { useState } from 'react'
import InfoCard from '../../../components/InfoCard'
import SubmittedCheckList from './ChecklistCard'
import SubmittedFormCard from './SubmitedFormCard'

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
          <SubmittedCheckList onShowForms={handleShowForms} />
        ) : (
          <SubmittedFormCard onShowChecklist={handleShowChecklist} />
        )}
      </Grid>
    </Grid>
  )
}
export default Forms
