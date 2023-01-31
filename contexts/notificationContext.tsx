import ShowNotification from 'components/Notifications/index';
import React, {
  createContext, useEffect, useReducer,
} from 'react';
import { mLog } from 'utils/logger';

type notificationType={
  title:string;
  description:string;
  iconName:string;
  notificationType: 'success' | 'error';
  placement: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  duration: number
};

const initialState:notificationType[] = [];

export const ADD = 'ADD';

export const notificationContext: React.Context<{
  notifications: notificationType[];
  dispatchNotification: React.Dispatch<{
    type: string;
    payload: notificationType
  }>;
}> = createContext({
  notifications: [] as notificationType[],
  dispatchNotification: (props) => { mLog(props); },
});

export const reducer = (state: notificationType[],
  action:{type:string, payload:notificationType}): notificationType[] => {
  switch (action.type) {
    case ADD:
      return [
        ...state,
        action.payload,
      ];
    default:
      return state;
  }
};

export const NotificationContextProvider = ({ children }
:{children: React.ReactNode}):JSX.Element => {
  // useReducer is used to add bit of more actions other than ADD
  const [notifications, dispatchNotification] = useReducer(reducer, initialState);
  const notificationContextData = { notifications, dispatchNotification };

  useEffect(() => {
    if (notifications && notifications.length) {
      // Can add the custom logic here to show notifications
      ShowNotification(notifications[0]);
      notifications.shift();
    }
  }, [notifications]);

  // wrappering everthing with the notification context provider,
  // so that notification can be invoked from anywhere in the application
  return (
    <notificationContext.Provider value={notificationContextData}>
      {children}
    </notificationContext.Provider>
  );
};

// How to use Notification Context

// import and get the context
// import { useNotificationContext, ADD } from 'contexts/notificationContext';
// const { dispatchNotification } = useNotificationContext();

// Dispatch a notification using the dispatchNotification Function
// dispatchNotification({
//   type: ADD,
//   payload: {
//     title: 'Applications Tab',
//     description: 'invoked from application tab',
//     iconName: '',
//     notificationType: 'error',
//     placement: 'topRight',
//     duration: 2,
//   },
// });
