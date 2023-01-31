import config from 'config';
import AppConstants from 'constants/constants';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';

const HeadComponent: React.FunctionComponent = () => {
  const SEO_TITLE = `Free & Paid Job Posting Services - Free Job Posting Portal in India | ${AppConstants.APP_NAME}`;
  const SEO_DESCRIPTION = `${AppConstants.APP_NAME}, the leading job posting site for employers and recruiters to hire blue, grey collar and entry level candidates. Use our Free & Premium Job posting plans to close your hiring requirements faster!`;
  const router = useRouter();
  const baseURL = `${config.BASE_URL}${router.asPath}`;

  return (
    <Head>
      <title>
        {SEO_TITLE}
      </title>
      <meta
        name="description"
        content={SEO_DESCRIPTION}
        key="description"
      />
      <meta itemProp="name" content={SEO_TITLE} />
      <meta
        itemProp="description"
        content={SEO_DESCRIPTION}
      />
      <meta
        name="twitter:description"
        content={SEO_DESCRIPTION}
      />
      <meta
        property="og:description"
        content={SEO_DESCRIPTION}
      />
      <meta property="og:url" content={baseURL} />
    </Head>
  );
};

export default HeadComponent;
