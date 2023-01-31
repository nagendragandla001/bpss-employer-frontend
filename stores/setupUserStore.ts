/* eslint-disable @typescript-eslint/camelcase */
import { UserStore, UserDetailsStoreModel } from 'stores';
import has from 'lodash/has';

const setupUserStore = (userDetails?): {userData: UserDetailsStoreModel} => {
  const userData = UserStore.create({
    id: (has(userDetails, 'id') && userDetails.id) || '',
    firstName: (has(userDetails, 'first_name') && userDetails.first_name) || '',
    lastName: (has(userDetails, 'last_name') && userDetails.last_name) || '',
    mobile: (has(userDetails, 'mobile') && userDetails.mobile) || '',
    email: (has(userDetails, 'email') && userDetails.email) || '',
    mobileVerfied: (has(userDetails, 'mobile_verified') && userDetails.mobile_verified) || false,
    whatsappSubscribed: (has(userDetails, 'whatsapp_subscribed') && userDetails.whatsapp_subscribed) || false,
  });
  return { userData };
};

export default setupUserStore;
