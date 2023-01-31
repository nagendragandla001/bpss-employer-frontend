import { pushClevertapEvent } from 'utils/clevertap';

const trackStartPostingJob = (source: string): void => {
  pushClevertapEvent('Public Click', {
    Type: 'Job Posting',
    Source: source || 'NA',
  });
};

const trackJobSeekers = (source: string): void => {
  pushClevertapEvent('Public Click', {
    Type: 'Jobseekers',
    Source: source || 'NA',
  });
};

const trackPremiumPosting = (source: string): void => {
  pushClevertapEvent('Public Click', {
    Type: 'Premium Plans',
    Source: source || 'NA',
  });
};

const trackNavbarLogin = (source: string): void => {
  pushClevertapEvent('Public Click', {
    Type: 'Login',
    Source: source || 'NA',
  });
};

const trackNavbarRegister = (source: string): void => {
  pushClevertapEvent('Public Click', {
    Type: 'Register',
    Source: source || 'NA',
  });
};

const trackPostJobNowClick = (source: string, type = ''): void => {
  pushClevertapEvent('Public Click', {
    Type: 'Job Posting',
    Source: source || 'NA',
    Plan: type || 'NA',
  });
};

export {
  trackStartPostingJob, trackJobSeekers, trackPremiumPosting,
  trackNavbarLogin, trackNavbarRegister, trackPostJobNowClick,
};
