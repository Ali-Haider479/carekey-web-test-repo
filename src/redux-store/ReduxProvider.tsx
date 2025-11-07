'use client'

// React Imports
import type { ReactNode } from 'react'

// Third-party Imports
import { Provider } from 'react-redux'

import { persistor, store } from '@/redux-store'
import { PersistGate } from 'redux-persist/integration/react'

const ReduxProvider = ({ children }: { children: ReactNode }) => {
  return (
    <Provider store={store}>
      <PersistGate
        // loading={<div>Loading app state...</div>} // optional loading UI
        persistor={persistor}
      >
        {children}
      </PersistGate>
    </Provider>
  )
}

export default ReduxProvider
