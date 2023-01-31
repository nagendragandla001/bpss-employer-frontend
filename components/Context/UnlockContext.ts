/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { createContext } from 'react';

const UnlockContext = createContext({
  contactUnlocksLeft: 0,
  databaseUnlocksLeft: 0,
  totalContactUnlocks: 0,
  totalDatabaseUnlocks: 0,
  setcontactUnlocksLeft: (state:number) => {},
  setdatabaseUnlocksLeft: (state:number) => {},
  setTotalContactUnlocks: (state:number) => {},
  setTotalDatabaseUnlocks: (state:number) => {},
  // decContactUnlocksLeft: (state: number) => {}
});
export const ContactProvider = UnlockContext.Provider;
export const ContactConsumer = UnlockContext.Consumer;

export default UnlockContext;
