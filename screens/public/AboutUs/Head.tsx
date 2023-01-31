import config from 'config';
import AppConstants from 'constants/constants';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';

const HeadComponent: React.FunctionComponent = () => {
  const SEO_TITLE = `About - ${AppConstants.APP_NAME}`;
  const SEO_DESCRIPTION = `${AppConstants.APP_NAME}: Better Jobs Better Life. An Online Job Portal Site providing end-to-end recruitment service, from job posting to hiring, for entry level jobs.`;
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
