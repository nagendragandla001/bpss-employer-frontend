/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { createContext } from 'react';

const UnverifiedContext = createContext({
  contextInitialized: false,
  emailVerified: true,
  mobileVerified: true,
  mobile: '',
  setMobile: (state:string) => {},
  setContextInitialized: (state:boolean) => {},
  setEmailVerified: (state:boolean) => {},
  setMobileVerified: (state:boolean) => {},
});
export const UnverifiedProvider = UnverifiedContext.Provider;
export const UnverifiedConsumer = UnverifiedContext.Consumer;

export default UnverifiedContext;
