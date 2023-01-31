/* eslint-disable import/prefer-default-export */
import dayjs from 'dayjs';

const educationFilterDict = {
  education_less_than_10th: 'LESS_THAN_10',
  education_10th: 'TENTH',
  education_12th: 'TWELFTH',
  education_diploma: 'DIPLOMA',
  education_graduate: 'GRADUATE',
};

export const getGraphqlFiltes = (filter, orgId): any => {
  const request = { AND: [] } as any;
  const educationFilters = filter?.filter((val) => val.includes('education'));
  if (filter && filter.length > 0) {
    if (filter.includes('public_resume')) {
      request.AND.push({ public_resume__exists: '' });
    }
    if (filter.includes('unlockCandidate')) {
      request.AND.push({ unlocked_organizations__match: orgId });
    }
    if (filter.includes('lockCandidate')) {
      request.NOT = ({ unlocked_organizations__match: orgId });
    }
    if (filter.includes('activeCandidate')) {
      request.AND.push({ tags__in: ['Hot'] });
    }
    if (filter.includes('experience_filter')) {
      request.AND.push({
        total_experience__between:
        [
          (parseInt(filter.filter((val) => val.includes('experience_min'))[0]?.substring(15), 10) * 12),
          (parseInt(filter.filter((val) => val.includes('experience_max'))[0]?.substring(15), 10) * 12),
        ],
      });
    }
    if (educationFilters.length) {
      const educationGraphqlFilter = educationFilters.map((value) => educationFilterDict[value]);
      request.AND.push({ highest_proficiency_level__in: educationGraphqlFilter });
    }
    if (filter.includes('gender_male')) {
      if (request.AND.user) {
        Object.assign(request.AND.user, { gender: 'MALE' });
      } else {
        request.AND.push({ user: { gender: 'MALE' } });
      }
    }
    if (filter.includes('gender_female')) {
      if (request.AND.user) {
        Object.assign(request.AND.user, { gender: 'FEMALE' });
      } else {
        request.AND.push({ user: { gender: 'FEMALE' } });
      }
    }
    if (filter.includes('age_filter')) {
      const minAge = parseInt(filter.filter((val) => val.includes('age_min'))[0].substring(8), 10);
      const maxAge = parseInt(filter.filter((val) => val.includes('age_max'))[0].substring(8), 10);
      if (request.AND.user) {
        Object.assign(request.AND.user, { age__between: [minAge, maxAge] });
      } else {
        request.AND.push({ user: { age__between: [minAge, maxAge] } });
      }
    }
  }
  return request;
};

export const ModalTypes = {
  creditsExaust: {
    title: 'Database Unlocks Exhausted',
    description: 'Upgrade your plan, or buy add ons to get more unlock credits',
    action: 'getMoreCredits',
  },
  insufficientCredits: {
    title: 'Insufficient Database Unlocks',
    description: 'You do not have sufficient credits for this action. To unlock more candidates, please buy another plan.',
    action: 'upgradePlan',
  },
};
