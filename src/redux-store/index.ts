// Third-party Imports
import { configureStore } from '@reduxjs/toolkit'

// Slice Imports
import chatReducer from '@/redux-store/slices/chat'
import calendarReducer from '@/redux-store/slices/calendar'
import kanbanReducer from '@/redux-store/slices/kanban'
import emailReducer from '@/redux-store/slices/email'
import tenantReducer from '@/redux-store/slices/tenant'
import notificationReducer from '@/redux-store/slices/notification'
import planReducer from '@/redux-store/slices/plan'
import { persistedPlanReducer } from './slices/persistedPlan'
import { persistStore } from 'redux-persist'

export const store = configureStore({
  reducer: {
    tenantReducer,
    chatReducer,
    calendarReducer,
    kanbanReducer,
    emailReducer,
    notificationReducer,
    plan: persistedPlanReducer
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false })
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const persistor = persistStore(store)
