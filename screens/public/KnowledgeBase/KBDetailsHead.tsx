/* eslint-disable camelcase */
import config from 'config';
import AppConstants from 'constants/constants';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';

interface SEOObject{
  title:string;
  meta_title: string;
  meta_description:string;
  meta_keywords: string;
  og_title:string;
  og_description: string;
  twitter_title:string;
  twitter_description: string;
}

const HeadComponent = (_props: {seo: SEOObject}): JSX.Element => {
  const { seo } = _props;
  const SEO_TITLE = seo?.title || `Find Job descriptions, hiring requirements and responsibilities for different job roles - ${AppConstants.APP_NAME}`;
  const SEO_DESCRIPTION = seo?.meta_description || `Get detailed Job descriptions for posting jobs for different job roles. Also, know about hiring requirements and job responsibilities for job categories - ${AppConstants.APP_NAME}`;
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
