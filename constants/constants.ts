const AppConstants = {
  APP_NAME: 'Rocket',
  SUPPORT_MAIL: 'employersupport@myrocket.co',
  AUTH_JWT_COOKIE_NAME: 'jwt',
  AUTH_ACCESS_COOKIE_NAME: 'access_token',
  AUTH_REFRESH_TOKEN: 'csrftoken',
  IS_AUTHENTICATED_COOKIE_NAME: 'is_authenticated',
  USER_TYPE: 'EMPLOYER',
  EMPTY_STRING: '',
  EMPTY_OBJECT: {},
  EMPTY_ARRAY: [],
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  NO_DATA: 'No Data',
  ERR_MSG: 'ERROR',
  ERR_DES: 'Unable to Fetch',
  BUT_MSG: ' GO TO HOME',
  MESSAGES: {
    LOGIN: {
      VALIDATION_MESSAGES: {
        NOT_VALID_MSG: 'This is not a vaild',
        REQUIRED_MSG: 'Please enter your',
      },
      ERROR_MESSAGES: {
        USER_NOT_FOUND: "You don't have account with us",
      },
    },
  },
  REQUIREMENT_MSG: 'Other Requirements (Please enter one requirement per box)',
  EMAILID_REGEX: /^[-a-z0-9~!$%^&*_=+}{'?]+(.[-a-z0-9~!$%^&*_=+}{'?]+)*@([a-z0-9][-a-z0-9]*(.[-a-z0-9]+)*.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|in|global|fit|[a-z][a-z])|([0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}))(:[0-9]{1,5})?$/i,
  NO_TABLE_DATA_MSG: 'There are no Challans available at the moment!',
  TABLE_ERROR_MSG: 'Unable to fetch records',
  ERRORS: {
    E_400: {
      ROUTE: '/400',
      HEAD: '400: Invalid or No platform detected',
      SUB_HEAD: 'Something’s wrong, don’t worry we will fix it in no time!',
    },
    E_404: {
      ROUTE: 'components/Errors/Error404',
      HEAD: '404: Page Not Found',
      SUB_HEAD: 'Sorry! we could not found the page you requested',
    },
    E_500: {
      ROUTE: 'components/Errors/Error500',
      HEAD: '500: Internal Server Error',
      SUB_HEAD: 'Something’s wrong, don’t worry we will fix it in no time!',
    },
    VALID_EMAIL: 'Please enter valid email ID',
    VALID_PWD: 'The passwords do not match',
    VALID_NEW_PWD: 'New password cannot be same as current password',
    CUSTOM_VALIDATION_ERR: 'Your details could not be saved right now.',
    MAX_RETRY_ERR: 'Please request for new OTP and try again after 30 minutes',
  },
  GENERIC_EMAIL_IDS: ['aol.com', 'aol.in', 'comcast.net', 'facebook.com', 'gmail.com', 'googlemail.com', 'google.com', 'hotmail.com', 'mac.com', 'me.com', 'mail.com', 'msn.com', 'live.com', 'yahoo.com', 'hushmail.com', 'icloud.com', 'inbox.com', 'lavabit.com', 'outlook.com', 'pobox.com', 'rocketmail.com', 'safe-mail.net', 'wow.com', 'ygm.com', 'ymail.com', 'fastmail.fm', 'yandex.com', 'naver.com', 'daum.net', 'nate.com', 'yahoo.co.in', 'rediffmail.co', 'yahoo.in', 'mailinator.com', 'yopmail.com', 'gmail.in', 'yahoo.ca', '45gmail.com', 'gmali.com', 'testing.com', 'gmil.com', 'gamil.com', 'gmal.com', 'dispostable.com', 'post.com', 'asia.com'],

  LOCAL_STORAGE_ITEM_KEYS: ['city_region_list', 'specialization_list', 'industry_category_list', 'job_category_list', 'language_list', 'language_list_details', 'document_list', 'skill_list', 'mobile_list', 'vehicle_list', 'pricing_data', 'search_list', 'visited_intro', 'company_industry_list', 'company_city_list', 'org_data', 'user_data', 'recent_list', 'faq',
    'knowledge_bases'],
};

export default AppConstants;
