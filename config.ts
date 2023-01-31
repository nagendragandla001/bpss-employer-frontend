// In case of changes in the environment variables (addition/deletion), changes have to be made here
//  as well for client side accessiblity
const config = {
  GRAPHQL_ENDPOINT: process.env.GRAPHQL_ENDPOINT as string,
  API_ENDPOINT: process.env.API_ENDPOINT as string,
  SOCIAL_AUTH_API_OAUTH2_KEY: process.env.SOCIAL_AUTH_API_OAUTH2_KEY as string,
  SOCIAL_AUTH_API_OAUTH2_SECRET: process.env.SOCIAL_AUTH_API_OAUTH2_SECRET as string,
  BASE_URL: process.env.BASE_URL as string,
  AJ_URL: process.env.AJ_URL as string,
  OLXPEOPLE_URL: process.env.OLXPEOPLE_URL as string,
  IS_PROD: process.env.IS_PROD as string,
  MAINTENANCE_MODE: process.env.MAINTENANCE_MODE as string,
  ACCESS_TOKEN: process.env.ACCESS_TOKEN as string,
  MOBILE_SITE_ADDRESS: process.env.MOBILE_SITE_ADDRESS as string,
  MAPS_API_KEY_FRONTEND: process.env.MAPS_API_KEY_FRONTEND as string,
  MAPS_API_KEY_BACKEND: process.env.MAPS_API_KEY_BACKEND as string,
  NOTIFICATION_HUB_SQS_URL: process.env.NOTIFICATION_HUB_SQS_URL as string,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
  GOOGLE_OPTIMIZE_ID: process.env.GOOGLE_OPTIMIZE_ID as string,
  OPTIMIZE_EXPERIMENT_ID: process.env.OPTIMIZE_EXPERIMENT_ID as string,
  GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID as string,
  GOOGLE_TAG_MANAGER_ID: process.env.GOOGLE_TAG_MANAGER_ID as string,
  CLIENT_ID: process.env.CLIENT_ID as string,
  TRACKJS_TOKEN: process.env.TRACKJS_TOKEN as string,
  TRACKJS_APP: process.env.TRACKJS_APP as string,
  CLEVERTAP_TRACKER_ID: process.env.CLEVERTAP_TRACKER_ID as string,
  INSPECTLET_ID: process.env.INSPECTLET_ID as string,
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN as string,
  CORS_ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS as string,
};

export default config;
