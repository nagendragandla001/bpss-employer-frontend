import { Subject } from 'rxjs';

// RxJs errorStore intialization to keep track of API errors throughout the application

const subject = new Subject();

interface errorObjInterface {
  errorCode: number | any,
  errorMessage: string,
  errorType: string
}

const intitialState : errorObjInterface = {
  errorCode: undefined,
  errorMessage: '',
  errorType: '',
};

const state = intitialState;

const errorStore = {
  init: () => subject.next(state),
  subscribe: (setState) => subject.subscribe(setState),
  // updates errorStore with new values
  updateError: (errorObj) => {
    const newErrorObj = {
      ...state,
      errorCode: errorObj.errorCode,
      errorMessage: errorObj.errorMessage,
      errorType: errorObj.errorType,
    };
    subject.next(newErrorObj);
  },
  // resets errorStore with intialState
  resetError: () => {
    subject.next(intitialState);
  },
  intitialState,
};

export default errorStore;
