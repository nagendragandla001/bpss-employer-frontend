import LinksConstants from 'constants/links-constants';

const FooterConstants = {
  categories: [
    {
      name: 'Browse Jobs',
      links: [
        { label: 'Browse Jobs', href: LinksConstants.ALL_JOBS },
        { label: 'Browse All Jobs', href: LinksConstants.ALL_JOBS },
        { label: 'Find Sarkari Jobs', href: LinksConstants.SARKARIJOBS },
        { label: 'Jobs by category', href: LinksConstants.JOBS_BY_CATEGORY },
        { label: 'Jobs by location', href: LinksConstants.JOBS_BY_COMPANIES },
        { label: 'Jobs by skills', href: LinksConstants.ALL_JOBS },
        { label: 'Jobs by company', href: LinksConstants.JOBS_BY_COMPANIES },
        { label: 'Jobs by Designation', href: LinksConstants.JOBS_BY_CATEGORY },
      ],
    },
    {
      name: 'For Candidates',
      links: [
        { label: 'Search Jobs', href: LinksConstants.ALL_JOBS },
        { label: 'Register Now', href: LinksConstants.AJ_URL },
        { label: 'Candidate\'s Login', href: LinksConstants.AJ_URL },

        { label: 'Free Job Alerts', href: LinksConstants.SUBSCRIBE_JOB_ALERT },
        { label: 'Knowledge Base', href: LinksConstants.KNOWLEDGE_BASE_BY_CANDIDATE },
        { label: 'Skill Training courses', href: LinksConstants.SKILL_TRAINING },
        { label: 'FAQs', href: LinksConstants.EMPLOYEE_FAQ },
        { label: 'Report a Problem', href: LinksConstants.CONTACT },
      ],
    },
    {
      name: 'For Employers',
      links: [
        {
          label: 'Post Jobs',
          href: LinksConstants.REGISTER,
          internal: true,
        },
        {
          label: 'Register Now',
          href: LinksConstants.REGISTER,
          internal: true,
        },
        {
          label: "Employer's Login",
          href: '',
          internal: true,
        },
        {
          label: 'Free Job Posting',
          href: LinksConstants.REGISTER,
          internal: true,
        },
        {
          label: 'Premium Job Posting',
          href: LinksConstants.PREMIUM_POST,
          internal: true,
          as: '/products/job-posting/',
        },
        {
          label: 'Knowledge Base',
          href: LinksConstants.KNOWLEDGE_BASE_BY_EMPLOYER,
          internal: true,
          as: '/knowledge-base/recruiter/',
        },
        {
          label: 'FAQs',
          href: LinksConstants.EMPLOYER_FAQ,
          internal: true,
        },
        { label: 'Report a Problem', href: LinksConstants.CONTACT },

      ],
    },
    {
      name: 'Information',
      links: [
        {
          label: 'About us',
          href: LinksConstants.ABOUT,
          internal: true,
        },

        { label: 'Contact us', href: LinksConstants.CONTACT },
        { label: 'Sitemap', href: LinksConstants.SITEMAP },
      ],
    },
  ],
  media: [
    {
      label: 'Facebook',
      key: 'facebook',
      href: LinksConstants.FACEBOOK_LINK,
    },
    {
      label: 'Twitter',
      key: 'twitter',
      href: LinksConstants.TWITTER_LINK,
    },
    {
      label: 'linkedin',
      key: 'linkedin',
      href: LinksConstants.LINKEDIN_LINK,
    },
    {
      label: 'Instagram',
      key: 'instagram',
      href: LinksConstants.INSTA_LINK,
    },
    {
      label: 'Youtube',
      key: 'youtube',
      href: LinksConstants.YOUTUBE_LINK,
    },
  ],
};

export default FooterConstants;
