import config from 'config';

const ApiConstants = {
  RECOGNIZE_USER: `${config.API_ENDPOINT}api/v4/recognize_user/`,
  PASSWORD_LOGIN: `${config.API_ENDPOINT}api/v4/password_login/`,
  INITIATE_RESET_PASSWORD: `${config.API_ENDPOINT}api/v4/initiate_email_reset_password/`,
  RESET_PASSWORD: `${config.API_ENDPOINT}api/v4/user/reset_password/`,
  APPLICATION_API: `${config.API_ENDPOINT}api/v4/application/`,
  CANDIDATE_API: `${config.API_ENDPOINT}api/v4/candidate/`,
  APPLICATION_REJECT_REASONS_API: `${config.API_ENDPOINT}api/v4/application_reason/`,
  JOB_SLOT_API: `${config.API_ENDPOINT}api/v4/job_slot/`,
  SUGGEST_CITY: `${config.API_ENDPOINT}api/v4/city/`,
  COMPANY_SUGGESTION: `${config.API_ENDPOINT}api/v4/company_suggestion/`,
  GET_INVOICE: `${config.API_ENDPOINT}api/v4/invoice/`,
  JOB_FA_DESCRIOTION: `${config.API_ENDPOINT}api/v4/fa_description/`,
  JOB_TITLE_SUGGESTION: `${config.API_ENDPOINT}api/v4/job_designation_suggestions/`,
  SKILL_SUGGESTION: `${config.API_ENDPOINT}api/v4/skill_suggestion/`,
  VALIDATE_JOB_TITLE: `${config.API_ENDPOINT}api/v5/validate_job_title/`,
  VALIDATE_JOB_DESCRIPTION: `${config.API_ENDPOINT}api/v5/validate_job_description/`,
  JOB_CATEGORY_SUGGESTION: `${config.API_ENDPOINT}api/v4/fa/?limit=1000`,
  SKILL_LIST_API: `${config.API_ENDPOINT}api/v4/skill/?limit=1000`,
  INDUSTRY_TYPE: `${config.API_ENDPOINT}api/v4/industry/?limit=1000`,
  LANGUAGE_API: `${config.API_ENDPOINT}api/v4/language/?limit=1000&offset=0`,
  SKILL_API: `${config.API_ENDPOINT}api/v4/skill_suggestion/`,
  DOCUMENT_API: `${config.API_ENDPOINT}api/v4/document/?limit=1000&offset=0`,
  MOBILE_API: `${config.API_ENDPOINT}api/v4/mobile_phone/?limit=1000&offset=0`,
  VEHICLE_API: `${config.API_ENDPOINT}api/v4/vehicle_ownership/?limit=1000&offset=0`,
  SPECIALIZATION_API: `${config.API_ENDPOINT}api/v4/specialization/?limit=1000&offset=0`,
  JOB_ROLE: `${config.API_ENDPOINT}api/v4/employer_job_role/`,
  CALL_HR_DISABLED_API: `${config.API_ENDPOINT}api/v4/employer_manager/`,
  DOCUMENTS_ASSETS: `${config.API_ENDPOINT}api/v4/job/job_requirements_suggestion/`,
  SKILLS: `${config.API_ENDPOINT}api/v4/skill/`,
  ORG_MANAGERS: `${config.API_ENDPOINT}api/v1/organization_managers/`,
  DOWNLOAD_CSV: `${config.API_ENDPOINT}api/v4/download_csv/`,
  OTP_REGISTRATION: `${config.API_ENDPOINT}api/v4/user/employer_register/`,
  DOWNLOAD_LIST: `${config.API_ENDPOINT}api/v4/downloads_list/`,
  GET_ASSESSMENT: `${config.API_ENDPOINT}api/v4/list_fa_assessment/`,

  TERMS: `${config.AJ_URL}terms/`,
  PRIVACY: `${config.AJ_URL}privacy/`,
  ALL_JOBS: `${config.AJ_URL}s/jobs/`,
  CONTACT: `${config.AJ_URL}contact/`,
  ABOUT: `${config.AJ_URL}about/`,
  REGISTER: `${config.BASE_URL}/register/`,
  PREMIUM_POST: `${config.BASE_URL}/employer/products/job-posting`,

  SARKARIJOBS: `${config.AJ_URL}sarkari-jobs-results/`,
  JOBS_BY_CATEGORY: `${config.AJ_URL}jobs-by-categories-and-designation/`,
  JOBS_BY_COMPANIES: `${config.AJ_URL}jobs-by-companies/`,
  JOBS_BY_RESUME: `${config.AJ_URL}resume-format/`,
  SUBSCRIBE_JOB_ALERT: `${config.AJ_URL}subscribe/job-alerts/`,
  KNOWLEDGE_BASE_BY_CANDIDATE: `${config.AJ_URL}knowledge-base/job-seeker/`,
  SKILL_TRAINING: 'https://hunarr.co.in/',
  EMPLOYEE_FAQ: `${config.AJ_URL}employee/faq/`,
  KNOWLEDGE_BASE_BY_EMPLOYER: `${config.AJ_URL}knowledge-base/recruiter/`,
  EMPLOYER_FAQ: `${config.AJ_URL}employer/faq/`,
  STARTUPS: `${config.AJ_URL}employer/startup-to-work-for-in-2019/`,
  CAREER: `${config.AJ_URL}careers/`,
  SITEMAP: `${config.AJ_URL}sitemap/`,
  I_FRAME: 'https://www.youtube.com/embed?v=CzlQ2nKN0q0&list=PLmwCCDGYHJJfXhjQBvuM598ac2rgFdENb',
  SWIGGY_LINK: 'https://www.youtube.com/watch?v=CVqWvZhnTcs&list=PLmwCCDGYHJJfXhjQBvuM598ac2rgFdENb',
  MOTILAL_LINK: 'https://www.youtube.com/watch?v=5fZQdEGdKKM&list=PLmwCCDGYHJJfXhjQBvuM598ac2rgFdENbb',
  FOODPANDA_LINK: 'https://www.youtube.com/watch?v=CzlQ2nKN0q0&list=PLmwCCDGYHJJfXhjQBvuM598ac2rgFdENb',

  // User API's
  USER_INFO: `${config.API_ENDPOINT}api/v4/user/`,
  USER_PROFILE: `${config.API_ENDPOINT}o/profile/`,

  // Job API's
  ALL_JOB_API: `${config.API_ENDPOINT}api/v4/job/`,
  NEW_JOB_API: `${config.API_ENDPOINT}api/v4/job/draft/`,
  JOB_ID_PATCH_REQ: `${config.API_ENDPOINT}api/v4/job/`,

  // Org API's
  ORGANIZATION_DETAILS: `${config.API_ENDPOINT}api/v4/organization/`,
  CREATE_ORG_OFFICE: `${config.API_ENDPOINT}api/v4/organization/office/`,
  CREATE_INVOICE: `${config.API_ENDPOINT}api/v4/organization/create_invoice/`,
  PRICING_PRODUCT: `${config.API_ENDPOINT}api/v4/organization/pricing_products/`,
  FORWARD_RESUME_API: `${config.API_ENDPOINT}api/v4/organization/forward_resumes/`,
  BULK_UNLOCK_CONTACT: `${config.API_ENDPOINT}api/v4/candidate/unlock_contact/`,
  APP_BULK_UNLOCK_CONTACT: `${config.API_ENDPOINT}api/v4/application/unlock_contact/`,
  EMPLOYER_TICKET: `${config.API_ENDPOINT}api/v4/employer_ticket/`,
  PAY_ONLINE: `${config.API_ENDPOINT}api/v4/pay_online/`,
  PRICING_PLANS: `${config.API_ENDPOINT}api/v4/organization/pricing_products`,
  DECRYPT_CONTACT: `${config.API_ENDPOINT}api/v4/candidate/decrypt_contact/`,

  // Job Details API
  FACEBOOK_SHARE_LINK: `http://www.facebook.com/sharer.php?u=${config.BASE_URL}/`,
  LINKEDIN_SHARE_LINK: `https://www.linkedin.com/sharing/share-offsite/?url=${config.BASE_URL}/`,
  TWITTER_SHARE_LINK: `https://twitter.com/intent/tweet?url=${config.BASE_URL}/`,
  EMAIL_SHARE_LINK: `mailto:replacethis@website.com?subject=${config.BASE_URL}/`,

  // company_profile
  COMPANY_API: `${config.BASE_URL}/employer-zone/profile/`,
  APPLICATIONS_TAB: `${config.BASE_URL}/employer-zone/candidates/`,
  DATABASE_TAB: `${config.BASE_URL}/employer-zone/candidates/?tab=database`,

  // Static API's
  FAQ: `${config.API_ENDPOINT}api/v4/olx/faqs/`,
  KNOWLEDGE_BASE: `${config.API_ENDPOINT}api/v4/olx/knowledge_base/`,
};

export default ApiConstants;
