/* eslint-disable import/prefer-default-export */
const banners = {
  open: {
    key: 'open',
    icon: '/images/job-details/jd-open.svg',
    text: 'This job is now',
    status: 'Open & Live',
    action: { label: 'Close Job' },
    className: 'm-jd-state-card',
  },
  unApproved: {
    key: 'unApproved',
    icon: '/images/jobs-tab/unapproved-icon-24x24.svg',
    text: 'This job is still',
    status: 'Unapproved',
    action: { label: 'Know more' },
    className: 'm-jd-state-card un-approved',
  },
  paused: {
    key: 'paused',
    icon: '/svgs/m-pause-icon.svg',
    text: 'This job is on',
    status: 'Pause',
    action: { label: 'Re-open Job' },
    className: 'm-jd-state-card paused',
  },
  rejected: {
    key: 'rejected',
    icon: '/svgs/m-closed-tab.svg',
    text: 'This job was marked',
    status: 'Rejected',
    action: { label: 'Know more' },
    className: 'm-jd-state-card un-approved',
  },
  pausedWarning: {
    key: 'pausedWarning',
    icon: '/images/jobs-tab/m-clock.svg',
    text: 'This job will pause on',
    status: '',
    action: { label: 'Know more' },
    className: 'm-jd-state-card paused-warning',
  },
  premiumPromotion: {
    key: 'open',
    icon: '/images/job-details/jd-open.svg',
    text: 'This job is now',
    status: 'Open & Live',
    action: { label: 'Close Job' },
    className: 'm-jd-state-card',
  },
  closed: {
    key: 'closed',
    icon: '/svgs/m-closed-tab.svg',
    text: 'This job is now',
    status: 'Closed',
    action: null,
    className: 'm-jd-state-card un-approved',
  },
};

export { banners };
