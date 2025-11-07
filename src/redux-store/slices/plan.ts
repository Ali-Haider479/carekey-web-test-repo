// src/features/plan/planSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '..'

export interface PlanFeatures {
  payroll_basics: boolean
  advanced_reports: boolean
  e_docs_and_forms: boolean
  custom_pay_period: boolean
  chat_and_messaging: boolean
  evv_compliance_mode: boolean
  third_party_api_use: boolean
  forms_library_and_filing: boolean
  expanded_service_features: boolean
  timesheets_and_scheduling: boolean
  evv_compliance_dhs_required: boolean
  client_and_caregiver_management: boolean
  client_and_caregiver_history_logs: boolean
  service_types_and_mapping_dhs_list: boolean
}

export interface Plan {
  id: number
  planId: string
  planName: string
  monthlyCost: string // kept as string because the API returns it that way
  features: PlanFeatures
}

interface PlanState {
  current: Plan | null // null = not loaded / no subscription yet
}

const initialState: PlanState = {
  current: null
}

export const planSlice = createSlice({
  name: 'plan',
  initialState,
  reducers: {
    /** Replace the whole plan object (use after a successful subscription) */
    setPlan: (state, action: PayloadAction<Plan>) => {
      state.current = action.payload
    },

    /** Optional: clear the plan (e.g. on logout) */
    clearPlan: state => {
      state.current = null
    }
  }
})

export const { setPlan, clearPlan } = planSlice.actions

export const selectPlan = (state: RootState): Plan | null => state.plan.current

export default planSlice.reducer
