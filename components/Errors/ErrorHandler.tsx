/* eslint-disable react/prop-types */
import { useRouter } from 'next/router';
import React, {
  useContext, useEffect, useState,
} from 'react';
import { ADD, notificationContext } from 'contexts/notificationContext';
import Error500 from 'pages/500';
import errorStore from 'stores/ErrorStoreRxjs';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const ErrorHandler = ({ children }) : JSX.Element => {
  const { dispatchNotification } = useContext(notificationContext);
  const [errorObj, setErrorObj] = useState(errorStore.intitialState);
  const router = useRouter();

  // Initialize RxJs errorStore subscription
  useEffect(() => {
    errorStore.subscribe(setErrorObj);
    errorStore.init();
  }, []);

  // reset the rxjs errorStore when the route changes so that errorPage is not rendered again
  useEffect(() => {
    router.events.on('routeChangeComplete', () => {
      errorStore.resetError();
    });
  }, [router.events]);

  useEffect(() => {
    if ((errorObj.errorCode !== undefined) && (errorObj.errorCode < 500)) {
    // Error Notification for errors other than 500
      dispatchNotification({
        type: ADD,
        payload: {
          title: errorObj.errorType,
          description: errorObj.errorMessage,
          iconName: '',
          notificationType: 'error',
          placement: 'topRight',
          duration: 5,
        },
      });
      errorStore.resetError();
    }
  });

  // Render error page for 500 API errors
  if (errorObj.errorCode >= 500) {
    return <Error500 />;
  }

  return children;
};

export default ErrorHandler;
