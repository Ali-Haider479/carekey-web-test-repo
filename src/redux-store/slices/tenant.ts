// src/store/apps/tenant/index.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// Types
interface User {
  id: number
  userName: string
  emailAddress: string
  passwordHash: string
  additionalEmailAddress: string | null
  accountStatus: string
  joinDate: string
}

interface Client {
  id: number
  gender: string
  firstName: string
  lastName: string
  // ... add other client properties as needed
}

interface Tenant {
  id: number
  companyName: string
  billingEmail: string
  contactNumber: string
  country: string
  address: string
  vatNumber: string
  subscriptionStartDate: string
  subscriptionRenewalDate: string
  npiUmpiNumber: string | null
  taxonomyNumber: string | null
  einNumber: string | null
  faxNumber: string | null
  status: string
  users: User[]
  clients: Client[]
}

interface TenantState {
  tenants: Tenant[]
  currentViewTenant: Tenant | null
  loading: boolean
  error: string | null
}

const initialState: TenantState = {
  tenants: [],
  currentViewTenant: null,
  loading: false,
  error: null
}

// Async thunks
export const fetchTenants = createAsyncThunk('tenant/fetchTenants', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tenant`)
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data || 'Failed to fetch tenants')
  }
})

export const tenantSlice = createSlice({
  name: 'tenant',
  initialState,
  reducers: {
    setCurrentViewTenant: (state, action) => {
      state.currentViewTenant = action.payload
    },
    clearCurrentViewTenant: state => {
      state.currentViewTenant = null
    },
    updateTenant: (state, action) => {
      state.tenants = state.tenants.map(tenant => (tenant.id === action.payload.id ? action.payload : tenant))
      if (state.currentViewTenant?.id === action.payload.id) {
        state.currentViewTenant = action.payload
      }
    },
    addTenant: (state, action) => {
      state.tenants.push(action.payload)
    },
    deleteTenant: (state, action) => {
      state.tenants = state.tenants.filter(tenant => tenant.id !== action.payload)
      if (state.currentViewTenant?.id === action.payload) {
        state.currentViewTenant = null
      }
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchTenants.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTenants.fulfilled, (state, action) => {
        state.loading = false
        state.tenants = action.payload
      })
      .addCase(fetchTenants.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { setCurrentViewTenant, clearCurrentViewTenant, updateTenant, addTenant, deleteTenant } =
  tenantSlice.actions

export default tenantSlice.reducer
