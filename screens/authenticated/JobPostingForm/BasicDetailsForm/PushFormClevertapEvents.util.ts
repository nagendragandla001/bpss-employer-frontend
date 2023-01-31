/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { pushClevertapEvent } from 'utils/clevertap';
import { constants } from 'constants/enum-constants';

const PushFormCleverTapEvents = (formData, state, setState, isNewUser): void => {
  // console.log('Form Data: ', formData);

  // First Name Case
  if (formData?.firstName) {
    pushClevertapEvent(`${isNewUser ? 'First' : 'New'} Job Post`, {
      Type: `${isNewUser ? 'First' : 'New'} Job Post Modification`,
      Field: 'First Name',
    });
  }

  // Last Name Case
  if (formData?.lastName) {
    pushClevertapEvent(`${isNewUser ? 'First' : 'New'} Job Post`, {
      Type: `${isNewUser ? 'First' : 'New'} Job Post Modification`,
      Field: 'Last Name',
    });
  }

  // Job Title Case
  if (formData?.title) {
    pushClevertapEvent(`${isNewUser ? 'First' : 'New'} Job Post`, {
      Type: `${isNewUser ? 'First' : 'New'} Job Post Modification`,
      Field: 'Job Role',
    });
    setState((prevState) => ({
      ...prevState,
      jobTitle: false,
    }));
  }

  // Job category Case
  if (formData?.functionalArea) {
    pushClevertapEvent(`${isNewUser ? 'First' : 'New'} Job Post`, {
      Type: `${isNewUser ? 'First' : 'New'} Job Post Modification`,
      Field: 'Job Category',
    });
  }

  // Client approval case
  if (formData?.clientApprovalRequired !== undefined) {
    pushClevertapEvent(`${isNewUser ? 'First' : 'New'} Job Post`, {
      Type: `${isNewUser ? 'First' : 'New'} Job Post Modification`,
      Field: 'Direct Interview',
    });
  }

  // Job City start Case
  if (state?.cityName && formData?.cityName) {
    pushClevertapEvent(`${isNewUser ? 'First' : 'New'} Job Post`, {
      Type: `${isNewUser ? 'First' : 'New'} Job Post Modification`,
      Field: 'Job City',
    });
  }

  // Job Locality Case
  if (formData?.locality) {
    pushClevertapEvent(`${isNewUser ? 'First' : 'New'} Job Post`, {
      Type: `${isNewUser ? 'First' : 'New'} Job Post Modification`,
      Field: 'Job Locality',
    });
  }

  // Openings
  if (formData?.vacancies) {
    pushClevertapEvent(`${isNewUser ? 'First' : 'New'} Job Post`, {
      Type: `${isNewUser ? 'First' : 'New'} Job Post Modification`,
      Field: 'Vacancies',
    });
  }

  // Job Type Case
  if (formData?.employmentType) {
    pushClevertapEvent(`${isNewUser ? 'First' : 'New'} Job Post`, {
      Type: `${isNewUser ? 'First' : 'New'} Job Post Modification`,
      Field: 'Job Type',
    });
  }

  // Work Days Case
  if (formData?.workDays !== undefined) {
    pushClevertapEvent(`${isNewUser ? 'First' : 'New'} Job Post`, {
      Type: `${isNewUser ? 'First' : 'New'} Job Post Modification`,
      Field: 'Work Days',
    });
  }

  // Shift Type Case
  if (formData?.shiftType) {
    pushClevertapEvent(`${isNewUser ? 'First' : 'New'} Job Post`, {
      Type: `${isNewUser ? 'First' : 'New'} Job Post Modification`,
      Field: 'Shift Type',
    });
  }

  // Salary period Case
  if (formData?.salaryFormat >= 0) {
    pushClevertapEvent(`${isNewUser ? 'First' : 'New'} Job Post`, {
      Type: `${isNewUser ? 'First' : 'New'} Job Post Modification`,
      Field: 'Salatry Period',
    });
  }

  // Min salary start Case
  if (formData?.minOfferedSalary) {
    pushClevertapEvent(`${isNewUser ? 'First' : 'New'} Job Post`, {
      Type: `${isNewUser ? 'First' : 'New'} Job Post Modification`,
      Field: 'Min Salary',
    });
    setState((prevState) => ({
      ...prevState,
      minOfferedSalary: false,
    }));
  }

  // Max salary start Case
  if (formData?.maxOfferedSalary) {
    pushClevertapEvent(`${isNewUser ? 'First' : 'New'} Job Post`, {
      Type: `${isNewUser ? 'First' : 'New'} Job Post Modification`,
      Field: 'Max Salary',
    });
    setState((prevState) => ({
      ...prevState,
      maxOfferedSalary: false,
    }));
  }

  // Weekly workdays Case
  if (formData?.count) {
    pushClevertapEvent(`${isNewUser ? 'First' : 'New'} Job Post`, {
      Type: `${isNewUser ? 'First' : 'New'} Job Post Modification`,
      Field: 'Weekly Workdays',
    });
  }

  // Weekly workdays comment Case
  if (state?.comments && formData?.comments) {
    pushClevertapEvent(`${isNewUser ? 'First' : 'New'} Job Post`, {
      Type: `${isNewUser ? 'First' : 'New'} Job Post Modification`,
      Field: 'Weekly Workdays comment',
    });
    setState((prevState) => ({
      ...prevState,
      comments: false,
    }));
  }

  // Job Desciption modify Case
  if (formData?.description) {
    pushClevertapEvent(`${isNewUser ? 'First' : 'New'} Job Post`, {
      Type: `${isNewUser ? 'First' : 'New'} Job Post Modification`,
      Field: 'Job Description',
    });
    setState((prevState) => ({
      ...prevState,
      description: false,
    }));
  }
};

export default PushFormCleverTapEvents;
