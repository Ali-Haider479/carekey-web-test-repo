import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface NotificationData {
    title: string;
    body: string;
    data: Record<string, any>;
    created_at: string;
    is_read: boolean;
}

interface NotificationSlice {
    notificationCount: number;
    notificationsData: NotificationData[];
    chatUnReadMessageStatus: boolean;
}

const initialState: NotificationSlice = {
    notificationCount: 0,
    notificationsData: [],
    chatUnReadMessageStatus: false,
};


const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        setChatUnReadMessageStatus(state, action: PayloadAction<boolean>) {
            state.chatUnReadMessageStatus = action.payload;
        },
        setNotificationCount(state, action: PayloadAction<number>) {
            state.notificationCount = action.payload;
        },
        setNotificationsData(state, action: PayloadAction<any[]>) {
            state.notificationsData = action.payload;
        },
        addNotification(state, action: PayloadAction<any>) {
            state.notificationsData = [action.payload, ...state.notificationsData];
            state.notificationCount += 1;
        },
        resetNotificationState(state) {
            state.notificationCount = 0;
            state.notificationsData = [];
        },
    },
});


export const {
    setChatUnReadMessageStatus,
    setNotificationCount,
    setNotificationsData,
    addNotification,
    resetNotificationState,
} = notificationSlice.actions;

export default notificationSlice.reducer;
