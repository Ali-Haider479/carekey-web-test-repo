'use client'

import { NotificationProvider } from '@/components/NotificationProvider'
import { ReduxProvider } from '@/components/ReduxProvider'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

type Props = {
    children: React.ReactNode
}

const ClientWrapper = ({ children }: Props) => {
    return (
        <ReduxProvider>
            <NotificationProvider>
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                />
                {children}
            </NotificationProvider>
        </ReduxProvider>
    )
}

export default ClientWrapper
