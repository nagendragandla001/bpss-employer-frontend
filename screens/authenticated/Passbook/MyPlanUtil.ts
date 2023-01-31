/* eslint-disable import/prefer-default-export */
import dayjs from 'dayjs';
import { PricingPlanType } from 'screens/authenticated/jobPostingStep4/commonTypes';

const getSubscriptionStatus = (plan: PricingPlanType): string => {
  let status = 'Expires on';
  if (plan.auto_renew) {
    status = 'Renews on';
  } else if (plan.subscription_status === 'EXPIRED') {
    if (plan?.offering_subscription?.[0]?.date_unsubscribed) {
      return `Expired on ${dayjs(plan.offering_subscription[0].date_unsubscribed).format('DD MMM')}`;
    }
    status = 'Expired on';
  } else if (plan.subscription_status === 'TO_BE_ACTIVATED') {
    return `Starts on ${dayjs(plan.start_date).format('DD MMM')}`;
  }

  return `${status} ${dayjs(plan.expiry_date).format('DD MMM')}`;
};

export { getSubscriptionStatus };
