// src/features/plan/persistedPlanReducer.ts
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // <-- uses localStorage
import { planSlice } from './plan'

const persistConfig = {
  key: 'plan', // key in localStorage
  storage,
  whitelist: ['current']
}

export const persistedPlanReducer = persistReducer(persistConfig, planSlice.reducer)
