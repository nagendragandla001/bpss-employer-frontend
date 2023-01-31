/* eslint-disable max-len */
/* eslint-disable react/no-danger */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import config from 'config';
import Document, {
  Head, Html, Main, NextScript,
} from 'next/document';
import Script from 'next/script';
import React from 'react';

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render(): JSX.Element {
    return (
      <Html lang="en">
        <Head>
          {/* Preconnecting */}
          <link rel="manifest" href="/manifest.json" />
          <link rel="preconnect" href="https://fonts.gstatic.com/" crossOrigin="true" />

          {/* Google Fonts */}
          <link
            href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
            rel="stylesheet"
          />

          {/* Inspectlet Begins */}
          <Script
            dangerouslySetInnerHTML={{
              __html: `(function() { window.__insp = window.__insp || []; __insp.push(['wid', ${config.INSPECTLET_ID}]);
              var ldinsp = function(){ if(typeof window.__inspld != "undefined") return; window.__inspld = 1;
              var insp = document.createElement('script'); insp.type = 'text/javascript'; insp.async = true;
              insp.id = "inspsync"; insp.src = ('https:' == document.location.protocol ? 'https' : 'http') + '://cdn.inspectlet.com/inspectlet.js?wid=${config.INSPECTLET_ID}&r=' + Math.floor(new Date().getTime()/3600000);
              var x = document.getElementsByTagName('script')[0]; x.parentNode.insertBefore(insp, x); }; setTimeout(ldinsp, 0); })();`,
            }}
          />
          {/* End Inspectlet */}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
