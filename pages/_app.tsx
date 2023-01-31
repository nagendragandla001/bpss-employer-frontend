/* eslint-disable react/no-danger */
/* eslint-disable react/jsx-props-no-spreading */
import { ApolloProvider } from '@apollo/client';
import { Layout } from 'antd';
import { ContactProvider } from 'components/Context/UnlockContext';
import { UnverifiedProvider } from 'components/Context/UnverifiedContext';
import ErrorHandler from 'components/Errors/ErrorHandler';
import config from 'config';
import { AppConstants, LinksConstants } from 'constants/index';
import { NotificationContextProvider } from 'contexts/notificationContext';
import dayjs from 'dayjs';
import { AppProps, NextWebVitalsMetric } from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { Router, useRouter } from 'next/router';
import Script from 'next/script';
import React, { useEffect, useState } from 'react';
import { useApollo } from 'service/apollo/init-apollo';
import { setCookie } from 'service/cookie-manager';
import { initGA, logEvent, logPageView } from 'utils/analytics';
import { pushClevertapEvent } from 'utils/clevertap';
import { activateGoogleOptimize, getVariantWithTemplate } from 'utils/GoogleOptimize';
import NavHistory from 'utils/NavHistory';

require('public/styles/main.less');

const OLXFooter = dynamic(() => import('components/Layout/OLXFooter.component'), { ssr: true });
const Navigator = dynamic(() => import('components/Navigator/index'), { ssr: true });
const CustomerSupportAction = dynamic(() => import('components/Layout/CustomerSupportAction'), { ssr: false });
const WjToRocketNotificationModal = dynamic(() => import('components/WjToRocketNotificationModal/index'), { ssr: false });
const MaintainenceComponent = dynamic(() => import('components/Maintain/Maintainence'), { ssr: false });

const { Header, Content, Footer } = Layout;

// Will pass initial state  and config like redirect etc to client creator
const DefaultHead: React.FunctionComponent = () => {
  const isProduction = !!(config.IS_PROD && config.IS_PROD === 'true');
  const LOGO = config.BASE_URL || '';
  const { AJ_URL, BASE_URL } = config;
  const location = global?.location?.href;

  return (
    <Head>
      <meta
        key="viewport"
        name="viewport"
        content="width=device-width, initial-scale=1"
      />
      <meta key="author" name="author" content={AppConstants.APP_NAME} />
      <meta property="place:location:latitude" content="12.917820" />
      <meta property="place:location:longitude" content="77.638047" />
      <meta property="business:contact_data:locality" content="Bengaluru" />
      <meta property="business:contact_data:postal_code" content="560034" />
      <meta property="business:contact_data:country_name" content="India" />
      <meta
        property="business:contact_data:email"
        content="info@myrocket.co"
      />
      <meta
        property="business:contact_data:phone_number"
        content="+912244446666"
      />
      <meta
        property="business:contact_data:website"
        content={AJ_URL}
      />
      <meta name="msvalidate.01" content="894C4A3904742319AE24E1CB021B1EB5" />
      <meta itemProp="image" content={`${LOGO}/images/assets/logo.svg`} />
      <meta property="profile:username" content={AppConstants.APP_NAME} />

      <meta property="og:title" content={AppConstants.APP_NAME} />
      <meta property="og:image" content={`${LOGO}/images/assets/logo.svg`} />
      <meta property="og:fbid" content="232556326898725" />
      <meta property="og:type" content="article" />
      <meta property="og:site_name" content={AppConstants.APP_NAME} />
      <meta property="og:see_also" content={AJ_URL} />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content={LinksConstants.TWITTER_LINK} />
      <meta name="twitter:title" content={AppConstants.APP_NAME} />
      <meta name="twitter:creator" content={AppConstants.APP_NAME} />
      <meta
        name="twitter:image:src"
        content={`${LOGO}/images/assets/logo.svg`}
      />
      <meta name="twitter:domain" content={`www.${String(AppConstants.APP_NAME).toLowerCase()}.com`} />

      <meta name="google-site-verification" content="TjOyCFnmqwY1GrlmDI7J1dWaTzgPCYi3AllJ5aiZ4b4" />

      <link rel="manifest" href={`${BASE_URL}/manifest.json`} />
      <link rel="canonical" href={location ?? BASE_URL} />
      {isProduction ? (
        <meta name="robots" content="index, follow" />
      ) : (
        <meta name="robots" content="noindex, nofollow" />
      )}
      <meta name="theme-color" content="#002f34" />
      <meta name="msapplication-navbutton-color" content="#002f34" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black" />

      {/* Favicons */}
      {/* <link rel="apple-touch-icon" sizes="180x180"
      href="/images/favicons/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/images/favicons/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/images/favicons/favicon-16x16.png" />
      <link rel="mask-icon" href="/images/favicons/safari-pinned-tab.svg" color="#1b2d93" /> */}
      <link rel="icon" href="/images/favicons/favicon.ico" />
      <meta name="msapplication-TileColor" content="#1b2d93" />
      <meta name="theme-color" content="#1b2d93" />
    </Head>
  );
};

const Scripts: React.FunctionComponent = () => (
  <>
    {/* Global site tag START (gtag.js) - Google Analytics */}
    {/* <Script
      strategy="afterInteractive"
      src={`https://www.googletagmanager.com/gtag/js?id=${config.GOOGLE_ANALYTICS_ID}`}
    /> */}

    {/* Google Tag Manager */}
    <Script
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer', '${config.GOOGLE_TAG_MANAGER_ID}');`,
      }}
    />
    {/* End Google Tag Manager */}

    <Script
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${config.GOOGLE_ANALYTICS_ID}');`,
      }}
    />
    {/* Global site tag END (gtag.js) - Google Analytics */}

    {/* Google Optimize Start */}
    <Script
      async
      src={`https://www.googleoptimize.com/optimize.js?id=${config.GOOGLE_OPTIMIZE_ID}`}
    />
    {/* Google Optimize End */}

    {/* Clevertap JS Start */}
    <Script
      dangerouslySetInnerHTML={{
        __html: `var clevertap = { event: [], profile: [], account: [], onUserLogin:  [],    notifications: [], privacy: [] };
        // replace with the CLEVERTAP_ACCOUNT_ID with the actual ACCOUNT ID value from your Dashboard -> Settings page
        clevertap.account.push({ "id": "${config.CLEVERTAP_TRACKER_ID}" });
        clevertap.privacy.push({ optOut: false }); //set the flag to true, if the user of the device opts out of sharing their data
        clevertap.privacy.push({ useIP: false }); //set the flag to true, if the user agrees to share their IP data
        (function () {
          var wzrk = document.createElement('script');
          wzrk.type = 'text/javascript';
          wzrk.async = true;
          wzrk.src = ('https:' == document.location.protocol ? 'https://d2r1yp2w7bby2u.cloudfront.net' : 'http://static.clevertap.com') + '/js/a.js';
          var s = document.getElementsByTagName('script')[0];
          s.parentNode.insertBefore(wzrk, s);
        })();`,
      }}
    />
    {/* Clevertap JS End */}

    {/* Track JS Start */}
    <Script
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `window._trackJs = {
                token: '${config.TRACKJS_TOKEN}',
                application: '${config.TRACKJS_APP}',
                window: { enabled: false },
                enabled: !(window.location.host.indexOf('localhost') >= 0)};`,
      }}
    />
    <Script
      strategy="afterInteractive"
      src="https://cdn.trackjs.com/agent/v3/latest/t.js"
    />
    {/* Track JS End */}
  </>
);

const logClevertapPageLoadView = (): void => {
  pushClevertapEvent('Page Load', {});
};

const logPageLoadEvents = (): void => {
  logPageView();
  logClevertapPageLoadView();
};

const MyApp = ({ Component, pageProps }: AppProps): JSX.Element => {
  const [registrationPage, setRegistrationPage] = useState(true);
  const [contactUnlocksLeft, setcontactUnlocksLeft] = useState(0);
  const [totalContactUnlocks, setTotalContactUnlocks] = useState(0);
  const [databaseUnlocksLeft, setdatabaseUnlocksLeft] = useState(0);
  const [totalDatabaseUnlocks, setTotalDatabaseUnlocks] = useState(0);

  const [emailVerified, setEmailVerified] = useState(true);
  const [mobileVerified, setMobileVerified] = useState(true);
  const [mobile, setMobile] = useState('');
  const [contextInitialized, setContextInitialized] = useState(false);

  const ismaintain = !!(config.MAINTENANCE_MODE && config.MAINTENANCE_MODE === 'true');
  const router = useRouter();
  const { query, asPath } = router;
  const CurrentRoute = router && router.route && router.route.replace('/', '');

  const apolloClient = useApollo(pageProps.initialApolloState);

  const clearLocalStorage = (): void => {
    const cacheCleared = window.localStorage.getItem('cacheCleared');
    if (!cacheCleared) {
      AppConstants.LOCAL_STORAGE_ITEM_KEYS.map((x) => window.localStorage.removeItem(x));
      window.localStorage.setItem('cacheCleared', JSON.stringify({ value: true, expiry: dayjs().add(1, 'h') }));
    } else if (cacheCleared) {
      const value = JSON.parse(cacheCleared);
      if (!value.expiry || dayjs() > dayjs(value.expiry)) {
        AppConstants.LOCAL_STORAGE_ITEM_KEYS.map((x) => window.localStorage.removeItem(x));
        window.localStorage.setItem('cacheCleared', JSON.stringify({ value: true, expiry: dayjs().add(1, 'h') }));
      }
    }
  };

  const storeUTMParameters = (): void => {
    const urlParams = new URLSearchParams(window.location.search);
    const utmCookies = [
      'utm_source',
      'utm_page',
      'utm_medium',
      'utm_campaign',
      'http_referer',
    ];
    if (query.http_referrer) {
      setCookie('http_referrer', urlParams.get('http_referrer') || '');
    }
    utmCookies.forEach((name) => {
      if (urlParams.get(name)) {
        setCookie(name, urlParams.get(name) || '');
      }
    });
  };

  const initGOVariant = async (experimentID): Promise<void> => {
    if (!window.localStorage.getItem('GOVariant')) {
      try {
        await activateGoogleOptimize(experimentID);
        const variant = getVariantWithTemplate(experimentID);
        if (variant) {
          window.localStorage.setItem('GOVariant', variant);
        } else {
          window.localStorage.setItem('GOVariant', '0');
        }
      } catch (err) {
        window.localStorage.setItem('GOVariant', '0');
      }
    }
  };

  useEffect(() => {
    // Init GA and Sending Initial Page View Event
    initGA();
    // Marketing: Setting UTM parameters
    setTimeout(() => {
      storeUTMParameters();
      logPageLoadEvents();
    });
    // To render a different Footer when a user is on registration page
    const isRegPageExist = !!(asPath && asPath.includes('/register/'));
    Router.events.on('routeChangeComplete', () => {
      storeUTMParameters();
      logPageLoadEvents();
      if (isRegPageExist) {
        setRegistrationPage(true);
      } else if (registrationPage) {
        setRegistrationPage(false);
      }
    });
    setRegistrationPage(isRegPageExist);
    // Resetting Nav History
    NavHistory.reset();
    if (window && window.location.href.includes('clearCache=true')) {
      clearLocalStorage();
    }

    initGOVariant(config.OPTIMIZE_EXPERIMENT_ID);
  }, []);

  interface IContactContextState{
    contactUnlocksLeft: number;
    databaseUnlocksLeft: number;
    totalContactUnlocks: number;
    totalDatabaseUnlocks: number;
    setcontactUnlocksLeft: (state:number) =>void;
    setdatabaseUnlocksLeft: (state:number) =>void;
    setTotalContactUnlocks: (state:number) =>void;
    setTotalDatabaseUnlocks: (state:number) =>void;
  }

  const contactContextState: IContactContextState = {
    contactUnlocksLeft,
    setcontactUnlocksLeft,
    totalContactUnlocks,
    setTotalContactUnlocks,
    databaseUnlocksLeft,
    setdatabaseUnlocksLeft,
    totalDatabaseUnlocks,
    setTotalDatabaseUnlocks,
  };

  interface IUnverifiedContextState{
    contextInitialized: boolean,
    emailVerified: boolean;
    mobileVerified: boolean;
    mobile: string;
    setMobile: (val:string) => void;
    setMobileVerified: (val:boolean)=>void;
    setEmailVerified: (val:boolean)=>void;
    setContextInitialized: (val: boolean)=>void;
  }

  const unverifiedContextState: IUnverifiedContextState = {
    contextInitialized,
    setContextInitialized,
    emailVerified,
    setEmailVerified,
    mobileVerified,
    setMobileVerified,
    mobile,
    setMobile,
  };

  const getContentClassName = () :string => {
    let className = 'top-content';
    if (['jobs', 'passbook'].indexOf(CurrentRoute) !== -1) {
      className += ' background-grey';
    }
    if (['settings', 'company'].indexOf(CurrentRoute) !== -1) {
      className += ' transparent-menu';
    }
    if (['jobPostFormBasicDetails', 'jobPostFormCandidateRequirements'].indexOf(CurrentRoute) !== -1) {
      className += ' job-posting-background';
    }
    return className;
  };

  return (
    <ApolloProvider client={apolloClient}>
      <NotificationContextProvider>
        <ContactProvider value={contactContextState}>
          <UnverifiedProvider value={unverifiedContextState}>
            {ismaintain ? <MaintainenceComponent />
              : (
                <Layout>
                  <DefaultHead />
                  <Scripts />
                  <Header className={`top-header${(['settings', 'company'].indexOf(CurrentRoute) !== -1) ? ' transparent-menu' : ''}`}>
                    <Navigator />
                  </Header>
                  <Content className={getContentClassName()}>
                    <WjToRocketNotificationModal />
                    <ErrorHandler>
                      <Component {...pageProps} />
                    </ErrorHandler>
                    <CustomerSupportAction />
                  </Content>
                  <Footer>
                    <OLXFooter />
                  </Footer>
                </Layout>
              )}
          </UnverifiedProvider>
        </ContactProvider>
      </NotificationContextProvider>
    </ApolloProvider>
  );
};

export function reportWebVitals(metric: NextWebVitalsMetric): void {
  const {
    id, name, label, value,
  } = metric;
  const trackObj = {
    category: label === 'web-vital' ? 'Web Vitals' : 'Next.js custom metric',
    action: name,
    label: id, // id unique to current page load
    value: Math.round(name === 'CLS' ? value * 1000 : value), // values must be integers
    nonInteraction: true,
  };
  setTimeout(() => {
    logEvent(trackObj);
  });
}

export default MyApp;
