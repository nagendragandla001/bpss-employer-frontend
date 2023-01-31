import config from 'config';
import AppConstants from 'constants/constants';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';

const HeadComponent: React.FunctionComponent = () => {
  const SEO_TITLE = 'FAQs - All You Need to Know About Our Job Posting Plans & Services';
  const SEO_DESCRIPTION = `Find the answers for all your queries on ${AppConstants.APP_NAME} free and paid job posting plans and services. Read now!`;
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
