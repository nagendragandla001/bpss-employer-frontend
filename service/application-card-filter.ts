/* eslint-disable import/no-cycle */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable dot-notation */
/* eslint-disable import/prefer-default-export */

import moment from 'moment';
import { genderFilters, educationFilters, applicationCreatedOnFilters } from 'screens/authenticated/ApplicationsTab/Common/ApplicationTabUtils';

const walkInSubFilter = {
  'job.client_approval_required': { eq: 'false', nin: [] },
};

const onHoldFilter = {
  on_hold: { eq: 'true' }, stage: { inq: ['SFI', 'TBSI', 'CAP'] },
};
const allApplications = {
  'job.stage': { inq: ['J_A'] },
  stage: { nin: ['RJ', 'NI'] },
  'interview.attendance': { neq: 'A' },
  'job.state': { inq: ['J_O'] },
  'nested_bool.1': {
    or: {
      'job.pricing_plan_type': { inq: ['FR', 'JP'] },
      'nested_bool.2': {
        and: {
          'job.pricing_plan_type': {
            inq: [
              'PR',
              'PO',
              'TS',
            ],
          },
          'job.client_approval_required': {
            eq: 'true',
          },
          screen_status: {
            eq: 'SS',
          },
        },
      },
      'nested_bool.3': {
        and: {
          'job.pricing_plan_type': {
            inq: [
              'PR',
              'PO',
              'TS',
            ],
          },
          'job.client_approval_required': {
            eq: 'false',
          },
        },
      },
    },
  },
};

const pending = {
  stage: {
    inq: ['SFI'],
  },
  'interview.attendance_by_employer': {
    exists: false,
  },
  'interview.attendance_by_primary_agency': {
    neq: 'A',
  },
  'interview.duration.upper': {
    lte: moment().format('YYYY-MM-DDTHH:mm:ss'),
  },

};
// will get all the applicaationss on landing default state
export const applicationFilter = (limit, offset, sortBy) => {
  // const { education } = filtersValue;
  const request = {
    filter: JSON.stringify({
      and: {
        'job.stage': { inq: ['J_A'] },
      },
    }),
    order_by: '-created',
    limit,
    offset,
  };
  if (sortBy === 'recent_slots') {
    request['recent_slots'] = 'True';
  } else {
    request['sort_by_cms'] = 'True';
  }
  return request;
};
// all jobs open pause and closed
export const allJobFilter = () => {
  const request = {
    filter: JSON.stringify({
      and: {
        stage: { inq: ['J_A'] },
        state: { inq: ['J_O', 'J_P', 'J_C'] },

      },
    }),
    limit: '200',
  };
  return request;
};

// particular job filter for particular id
export const selectJobFilter = (jobId, sortBy) => {
  const request = {
    filter: JSON.stringify({
      and: {
        'job.stage': { inq: ['J_A'] },
        stage: { nin: ['RJ', 'NI'] },
        'interview.attendance': { neq: 'A' },
        'job.id': { inq: [jobId] },
      },
    }),
    order_by: '-created',
    limit: '20',
    offset: '0',
  };

  if (sortBy === 'recent_slots') {
    request['recent_slots'] = 'True';
  } else {
    request['sort_by_cms'] = 'True';
  }

  return request;
};

// open job filter
export const openJobFilter = () => {
  const request = {
    filter: JSON.stringify({
      and: {

        'job.state': {
          inq: ['J_O'],
        },

        'job.stage': {
          inq: ['J_A'],
        },
        stage: {
          nin: ['RJ', 'NI'],
        },
        'interview.attendance': {
          neq: 'A',
        },
        'nested_bool.1': {
          or: {
            'job.pricing_plan_type': {
              inq: ['FR', 'JP'],
            },
            'nested_bool.2': {
              and: {
                'job.pricing_plan_type': {
                  inq: ['PR', 'PO', 'TS'],
                },
                'job.client_approval_required': {
                  eq: 'true',
                },
                screen_status: {
                  eq: 'SS',
                },
              },
            },
            'nested_bool.3': {
              and: {
                'job.pricing_plan_type': {
                  inq: ['PR', 'PO', 'TS'],
                },
                'job.client_approval_required': {
                  eq: 'false',
                },
              },
            },
          },

        },
      },
    }),
  };
  return request;
};
// close job filter
export const closeJobFilter = () => {
  const request = {
    filter: JSON.stringify({
      and: {
        'job.state': {
          inq: ['J_C'],
        },
      },
    }),
  };
  return request;
};
// pause jobs filter
export const pauseJobFilter = () => {
  const request = {
    filter: JSON.stringify({
      and: {
        'job.state': {
          inq: ['J_P'],
        },
      },
    }),
  };
  return request;
};
// cv available option
const publicResume = { 'candidate.public_resume': { neq: '' } };

// Pre-Skilled
const preSkilledFilter = { pre_skilled: { eq: true } };

// for applied status filter
const appliedStatusFilter = {
  'job.stage': { inq: ['J_A'] },
  'nested_bool.1': {
    or: {
      'nested_bool.2': {
        and: {
          stage: {
            inq: ['CAP'],
          },
          'job.client_approval_required': {
            eq: true,
          },
        },
      },
      'nested_bool.3': {
        and: {
          stage: {
            inq: ['TBSI'],
          },
          'job.client_approval_required': {
            eq: false,
          },
        },
      },
      stage: {
        eq: 'ES',
      },
    },
  },
};

// for shortlist filter
const shortlistedStatusFilter = {
  'job.stage': { inq: ['J_A'] },
  'nested_bool.4': {
    or: {
      'nested_bool.5': {
        and: {
          stage: {
            inq: ['ES'],
          },
        },
      },
      'nested_bool.6': {
        and: {
          stage: {
            inq: ['TBSI'],
          },
          'job.client_approval_required': {
            eq: true,
          },
        },
      },
    },
  },
};

// interview status filter
export const interviewStatusFilter = {
  'job.stage': { inq: ['J_A'] },
  'nested_bool.21': {
    and: {
      stage: {
        inq: ['SFI'],
        nin: ['RJ', 'NI'],
      },

    },
  },
};

// selected status filter
const selectedStatusFilter = {
  'job.stage': { inq: ['J_A'] },
  stage: {
    inq: ['SEL', 'ATJ', 'J'],
  },
};
const rejectedStageFilter = {
  'job.stage': { inq: ['J_A'] },
  stage: {
    inq: ['DNJ', 'DNATJ', 'LJ', 'NI'],
  },
};
// for rejected status filter
const rejectedStatusFilter = {
  'job.stage': { inq: ['J_A'] },
  'nested_bool.19': {
    or: {
      'nested_bool.20': {
        and: {
          stage: {
            inq: ['RJ', 'NI', 'DNJ'],
          },
        },
      },
      // 'nested_bool.21': {
      //   and: {
      //     stage: {
      //       inq: ['SFI'],
      //     },
      //     'interview.attendance': {
      //       eq: 'A',
      //     },
      //   },
      // },
    },
  },
};

function formatDate(date) {
  const d = date;
  let month = `${d.getMonth() + 1}`;
  let day = `${d.getDate()}`;
  const year = d.getFullYear();

  if (month.length < 2) { month = `0${month}`; }
  if (day.length < 2) { day = `0${day}`; }

  return [year, month, day].join('-');
}
// interview Today
const interviewTodaySubFilter = {
  'interview.duration.upper': {
    between: [`${formatDate(new Date())}T00:00:00`, `${formatDate(new Date())}T23:59:59`],
  },
};
// interview Tommorrow
const tomorrow = new Date(); // Or Date.today()
tomorrow.setDate(new Date().getDate() + 1);

const interviewTommorrowSubFilter = {
  'interview.duration.upper': {
    between: [`${formatDate(tomorrow)}T00:00:00`, `${formatDate(tomorrow)}T23:59:59`],
  },
};
// interview today and tomorrow
const interviewTodayandTommorrowSubFilter = {
  'interview.duration.upper': {
    between: [`${formatDate(new Date())}T00:00:00`, `${formatDate(tomorrow)}T23:59:59`],
  },
};

// Free Unlock Filter
const yesterday72 = new Date();
yesterday72.setDate(new Date().getDate() - 1);
const freeUnlockFilter = {
  'nested_bool.1': {
    and: {
      contact_unlocked:
  { eq: 'false' },
      created:
  {
    between:
  [`${formatDate(yesterday72)}T00:00:00`,
    `${formatDate(new Date())}T23:59:59`],
  },
    },
  },

};
const candidateLockedFilter = {
  contact_unlocked: {
    eq: 'false',
  },
};
const candidateUnlockedFilter = {
  contact_unlocked: {
    eq: 'true',
  },
};
// Male Gender Filter
const maleFilter = {
  'nested_bool.1': {
    and: {
      'candidate.user.gender':
      { eq: 'M' },
    },
  },
};

// Female Gender Filter
const femaleFilter = {
  'nested_bool.1': {
    and: {
      'candidate.user.gender':
      { eq: 'F' },
    },
  },
};

// Application created-on Filters
const appYesterday = new Date();
appYesterday.setDate(new Date().getDate() - 1);
const appLastWeek = new Date();
appLastWeek.setDate(new Date().getDate() - 7);
const appLast14Days = new Date();
appLast14Days.setDate(new Date().getDate() - 14);
const appLast30Days = new Date();
appLast30Days.setDate(new Date().getDate() - 30);
const appBefore30Days = new Date();
appBefore30Days.setDate(new Date().getDate() - 30);
const appCreatedTodayFilter = {
  created: {
    between: [`${formatDate(new Date())}T00:00:00`, `${formatDate(new Date())}T23:59:59`],
  },
};
const appCreatedYesterdayFilter = {
  created: {
    between: [`${formatDate(appYesterday)}T00:00:00`, `${formatDate(new Date())}T23:59:59`],
  },
};
const appCreatedLastWeekFilter = {
  created: {
    between: [`${formatDate(appLastWeek)}T00:00:00`, `${formatDate(new Date())}T23:59:59`],
  },
};
const appCreatedLast14Filter = {
  created: {
    between: [`${formatDate(appLast14Days)}T00:00:00`, `${formatDate(new Date())}T23:59:59`],
  },
};
const appCreatedLast30Filter = {
  created: {
    between: [`${formatDate(appLast30Days)}T00:00:00`, `${formatDate(new Date())}T23:59:59`],
  },
};
const appCreatedBefore30Filter = {
  created: {
    lte: `${formatDate(appLast30Days)}T00:00:00`,
  },
};

const EducationSelectedSubFilters = {
  education_less_than_10th: 0,
  education_10th: 1,
  education_12th: 2,
  education_graduate: 4,
  education_diploma: 7,
  education_post_graduate: 5,
};
const educationFilterValuesArray = ['education_less_than_10th', 'education_10th', 'education_12th', 'education_diploma', 'education_graduate'];

// dashboard  aggs query (for the application stages)
export const dashboaardAggsFilter = () => {
  const request = {
    aggs_query: JSON.stringify({

      open: {
        filter: {
          bool: {
            must: [{ term: { stage: 'J_A' } }, { term: { state: 'J_O' } }],
          },
        },
      },
      unapproved: {
        filter: {
          bool: {
            must: [{ terms: { stage: ['J_R', 'J_UA'] } }, { terms: { state: ['J_O'] } }],
          },
        },
      },
      closed: {
        filter: {
          bool: {
            must: [{ term: { state: 'J_C' } }],
          },
        },
      },
      paused: {
        filter: {
          bool: {
            must: [{ term: { state: 'J_P' } }],
          },
        },
      },
      draft: {
        filter: {
          bool: {
            must: [{ term: { state: 'J_D' } }],
          },
        },
      },
      paid_jobs: {
        filter: {
          bool: {
            must_not: [{
              term: { pricing_plan_type: 'FR' },
            }],
          },
        },
      }
      ,

    }),
  };
  return request;
};
// dashboard filter (for the application stages)
export const dashboardFilter = () => {
  const request = {
    filter: JSON.stringify({
      and: {
        'organization.id': {
        // replace with any oraganization id
          eq: 'f4dd8b7c-6845-4d5c-9937-64e29200b086',
        },
      },
    }),
    limit: '0',
  };
  return request;
};
export const applicationStagesFilter = (jobID?) => {
  if (jobID) {
    const request = {
      filter: JSON.stringify({
        and: {
          'job.stage': { inq: ['J_A'] },
          'job.id': { inq: [jobID] },
        },
      }),
    };
    return request;
  }
  const request = {
    filter: JSON.stringify({
      and: {
        'job.stage': { inq: ['J_A'] },
      },
    }),
  };
  return request;
};

const joinedSubFilter = {
  stage: {
    inq: ['J'],
    nin: ['RJ', 'NI'],
  },
};
const offerAcceptedSubFilter = {
  stage: {
    inq: ['ATJ'],
    nin: ['RJ', 'NI'],
  },
};
const offerRejectedSubFilter = {
  stage: {
    inq: ['DNATJ'],
    nin: ['RJ', 'NI'],
  },
};
const leftJobSubFilter = {
  stage: {
    inq: ['LJ'],
    nin: ['RJ', 'NI'],
  },
};
const SelectedSubFilters = {
  joined: 'J', offer_accepted: 'ATJ', offer_rejected: 'DNATJ', left_job: 'LJ', rejected: 'RJ',
};

const Filters = [
  { label: 'applications', value: allApplications },
  { label: 'Applied', value: appliedStatusFilter },
  { label: 'pre_skilled', value: preSkilledFilter },
  { label: 'public_resume', value: publicResume },
  { label: 'freeUnlock', value: freeUnlockFilter },
  { label: 'Shortlisted', value: shortlistedStatusFilter },
  { label: 'Selected', value: selectedStatusFilter },
  { label: 'Rejected', value: rejectedStageFilter },
  { label: 'Interview', value: interviewStatusFilter },
  { label: 'walk_in', value: walkInSubFilter },
  { label: 'on_hold', value: onHoldFilter },
  { label: 'interviewToday', value: interviewTodaySubFilter },
  { label: 'interviewTomorrow', value: interviewTommorrowSubFilter },
  { label: 'interviewTodayAndTomorrow', value: interviewTodayandTommorrowSubFilter },
  { label: 'interview_done', value: pending },
  { label: 'rejected', value: rejectedStatusFilter },
  { label: 'joined', value: joinedSubFilter },
  { label: 'offer_accepted', value: offerAcceptedSubFilter },
  { label: 'offer_rejected', value: offerRejectedSubFilter },
  { label: 'left_job', value: leftJobSubFilter },
  { label: 'gender_male', value: maleFilter },
  { label: 'gender_female', value: femaleFilter },
  { label: 'created_today', value: appCreatedTodayFilter },
  { label: 'created_yesterday', value: appCreatedYesterdayFilter },
  { label: 'created_last7days', value: appCreatedLastWeekFilter },
  { label: 'created_last14days', value: appCreatedLast14Filter },
  { label: 'created_last30days', value: appCreatedLast30Filter },
  { label: 'created_before30days', value: appCreatedBefore30Filter },
  { label: 'candidate_locked', value: candidateLockedFilter },
  { label: 'candidate_unlocked', value: candidateUnlockedFilter },
];
const checkForSelectedSubFilters = (values:Array<string>) => {
  if (values.includes('Selected')) {
    for (let i = 0; i < values.length; i += 1) {
      if (['left_job', 'offer_accepted',
        'offer_rejected', 'joined'].indexOf(values[i]) !== -1) return true;
    }
    return false;
  }
  return false;
};
// eslint-disable-next-line consistent-return
export const combineFilters = (offset,
  limit, values, jobId, sortBy, candidateIds:Array<string> = []) => {
  let filterValues = values;

  //  checking if both interview today and tomorrow filters are present in the list,
  //  if yes, then replacing them with a combined 'interviewTodayAndTomorrow' filter
  if (values.includes('interviewToday') && values.includes('interviewTomorrow')) {
    filterValues = values.filter((val) => (val !== 'interviewToday') && val !== 'interviewTomorrow');
    filterValues.push('interviewTodayAndTomorrow');
  }
  let selectedFilter;
  let filterparams = {};
  if (jobId) {
    filterparams = {
      'job.stage': { inq: ['J_A'] },
      'job.id': { inq: [jobId] },
    };
  }
  const x = Filters.filter((f) => filterValues.includes(f.label));
  for (let i = 0; i < x.length; i += 1) {
    let obj = x[i].value;
    selectedFilter = { ...selectedFilter, ...obj };
  }
  const selectedEducations = filterValues.map(
    (value) => {
      if (educationFilterValuesArray.indexOf(value) !== -1) {
        return EducationSelectedSubFilters[value];
      }
      return null;
    },
  ).filter((value) => value !== null);
  if (filterValues.includes('education_graduate')) {
    selectedEducations.push(EducationSelectedSubFilters['education_post_graduate']);
  }

  const isAgeFilterSelected = filterValues.includes('age_filter');
  const isExperienceFilterSelected = filterValues.includes('experience_filter');

  if (checkForSelectedSubFilters(filterValues)) {
    const subFilters = filterValues.map((item) => {
      if ((['Selected', 'public_resume', 'freeUnlock', ...genderFilters, ...educationFilters, ...applicationCreatedOnFilters].indexOf(item) !== -1) || (item.includes('age') || item.includes('experience'))) return '';
      return SelectedSubFilters[item];
    }).filter((val) => !!val);
    selectedFilter = {
      ...selectedFilter,
      stage: {
        inq: subFilters,
        nin: ['RJ', 'NI'],
      },
    };
  }
  if (selectedEducations.length > 0) {
    selectedFilter = {
      ...selectedFilter,
      'candidate.education_level': {
        inq: selectedEducations,
      },
    };
  }
  if (isAgeFilterSelected) {
    selectedFilter = {
      ...selectedFilter,
      'candidate.user.age': {
        lte: parseInt(filterValues.filter((val) => val.includes('age_max'))[0]?.substring(8), 10),
        gte: parseInt(filterValues.filter((val) => val.includes('age_min'))[0]?.substring(8), 10),
      },
    };
  }
  if (isExperienceFilterSelected) {
    selectedFilter = {
      ...selectedFilter,
      'candidate.total_experience': {
        lte: parseInt(filterValues.filter((val) => val.includes('experience_max'))[0]?.substring(15), 10) * 12,
        gte: parseInt(filterValues.filter((val) => val.includes('experience_min'))[0]?.substring(15), 10) * 12,
      },
    };
  }
  if (candidateIds?.length) {
    selectedFilter = {
      ...selectedFilter,
      id: {
        inq: candidateIds,
      },
    };
  }
  const request = {
    filter: JSON.stringify({
      and: { ...filterparams, ...selectedFilter },
    }),
    order_by: '-created',
    offset,
    limit,
  };
  if (sortBy === 'recent_slots') {
    request['recent_slots'] = 'True';
  } else {
    request['sort_by_cms'] = 'True';
  }
  return request;
};
