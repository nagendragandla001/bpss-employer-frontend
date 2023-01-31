/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  documentMapToName, mobileToName, vehicleMapToName, eduMapToName, getProficiencyLevel,
} from 'constants/enum-constants';
import { pushClevertapEvent } from 'utils/clevertap';

const PushFormCleverTapEvents = (formData, state, setState, isNewUser): void => {
  console.log('Form data clevertap: ', formData);

  // ==== STEP 2A =======

  // Educational Requirement start Case
  if (formData?.proficiencyLevel >= 0) {
    pushClevertapEvent(`${isNewUser ? 'First' : 'New'} Job Post`, {
      Type: `${isNewUser ? 'First' : 'New'} Job Post Modification`,
      Field: 'Education Requirement',
    });
  }

  // Experience Required Case
  if (formData?.experienceLevel || formData?.experienceRange) {
    pushClevertapEvent(`${isNewUser ? 'First' : 'New'} Job Post`, {
      Type: `${isNewUser ? 'First' : 'New'} Job Post Modification`,
      Field: 'Experience Requirement',
    });
    setState((prevState) => ({
      ...prevState,
      experience: false,
    }));
  }

  // Age of candidate start Case
  if ((formData?.minPreferredAge || formData?.maxPreferredAge)) {
    pushClevertapEvent(`${isNewUser ? 'First' : 'New'} Job Post`, {
      Type: `${isNewUser ? 'First' : 'New'} Job Post Modification`,
      Field: 'Candidate Age',
    });
    setState((prevState) => ({
      ...prevState,
      age: false,
    }));
  }

  // Gender for job start Case
  if (formData?.genderPreference) {
    pushClevertapEvent(`${isNewUser ? 'First' : 'New'} Job Post`, {
      Type: `${isNewUser ? 'First' : 'New'} Job Post Modification`,
      Field: 'Candidate Gender',
    });
    setState((prevState) => ({
      ...prevState,
      gender: false,
    }));
  }

  // English Proficiency start Case
  if (formData?.englishProficiency >= 0) {
    pushClevertapEvent(`${isNewUser ? 'First' : 'New'} Job Post`, {
      Type: `${isNewUser ? 'First' : 'New'} Job Post Modification`,
      Field: 'Language Requirement',
    });
  }

  // Resume Required Case
  if ([true, false].indexOf(formData?.isResumeSubscribed) > -1) {
    pushClevertapEvent(`${isNewUser ? 'First' : 'New'} Job Post`, {
      Type: `${isNewUser ? 'First' : 'New'} Job Post Modification`,
      Field: 'Resume Required',
    });
  }

  // Educational Requirement mandatory Case
  // if ([true, false].indexOf(formData?.proficiencyMandatory) > -1) {
  //   pushClevertapEvent('Educational Requirement mandatory', {
  //     Type: formData?.proficiencyMandatory === true ? 'TRUE' : 'False',
  //   });
  // }

  // Rage of Experience start Case
  // if (state?.experience && (formData?.minExp || formData?.maxExp)) {
  //   pushClevertapEvent('Range of Experience start', { Type: 'Job Posting' });
  //   setState((prevState) => ({
  //     ...prevState,
  //     experience: false,
  //   }));
  // }

  // Experience mandatory Case
  // if ([true, false].indexOf(formData?.experienceRangeMandatory) > -1) {
  //   pushClevertapEvent('Experience mandatory', {
  //     Type: formData?.experienceRangeMandatory === true ? 'True' : 'False',
  //   });
  // }

  // Previous Industry start Case
  // if (state?.industry && formData?.industryType) {
  //   pushClevertapEvent('Previous Industry start', { Type: 'Job Posting' });
  //   setState((prevState) => ({
  //     ...prevState,
  //     industry: false,
  //   }));
  // }

  // Previous Industry mandatory Case
  // if ([true, false].indexOf(formData?.industryTypeMandatory) > -1) {
  //   pushClevertapEvent('Previous Industry mandatory', {
  //     Type: formData?.industryTypeMandatory === true ? 'True' : 'False',
  //   });
  // }

  // Gender preferred mandatory Case
  // if ([true, false].indexOf(formData?.genderMandatory) > -1) {
  //   pushClevertapEvent('Gender preferred mandatory', {
  //     Type: formData?.genderMandatory === true ? 'True' : 'False',
  //   });
  // }

  // Age of Candidate mandatory Case
  // if ([true, false].indexOf(formData?.ageMandatory) > -1) {
  //   pushClevertapEvent('Age of Candidate mandatory', {
  //     Type: formData?.ageMandatory === true ? 'True' : 'False',
  //   });
  // }

  // Vehicle requirement start Case
  // if (formData?.vehiclechecks && formData?.vehiclechecks.length) {
  //   pushClevertapEvent('Vehicle requirement start', {
  //     Type: (formData?.vehiclechecks.map((vehicle) => vehicleMapToName(vehicle)).toString()),
  //   });
  // }

  // Vehicle Requirement mandatory Case
  // if ([true, false].indexOf(formData?.vehicleMandatory) > -1) {
  //   pushClevertapEvent('Vehicle Requirement mandatory', {
  //     Type: formData?.vehicleMandatory === true ? 'TRUE' : 'False',
  //   });
  // }

  // Phone requirement start Case
  // if (formData?.Phone) {
  //   pushClevertapEvent('Phone requirement start', {
  //     Type: mobileToName(formData?.Phone),
  //   });
  // }

  // Phone Requirement mandatory Case
  // if ([true, false].indexOf(formData?.phoneMandatory) > -1) {
  //   pushClevertapEvent('Phone Requirement mandatory', {
  //     Type: formData?.phoneMandatory === true ? 'TRUE' : 'False',
  //   });
  // }

  // Laptop required start Case
  // if ([true, false].indexOf(formData?.Laptop) > -1) {
  //   pushClevertapEvent('Laptop required start', {
  //     Type: formData?.Laptop === true ? 'Yes' : 'No',
  //   });
  // }

  // Licenses start Case
  // if (formData?.licensechecks && formData?.licensechecks.length) {
  //   pushClevertapEvent('Licenses start', {
  //     Type: (formData?.licensechecks.map((vehicle) => documentMapToName(vehicle)).toString()),
  //   });
  // }

  // Govt ID Proof start Case
  // if (formData?.governmentchecks && formData?.governmentchecks.length) {
  //   pushClevertapEvent('Govt ID Proof start', {
  //     Type: (formData?.governmentchecks.map((vehicle) => documentMapToName(vehicle)).toString()),
  //   });
  // }

  // Other required start Case
  // if (formData?.otherschecks && formData?.otherschecks.length) {
  //   pushClevertapEvent('Other required start', {
  //     Type: (formData?.otherschecks.map((vehicle) => documentMapToName(vehicle)).toString()),
  //   });
  // }
};

export default PushFormCleverTapEvents;
