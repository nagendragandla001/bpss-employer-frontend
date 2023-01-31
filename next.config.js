/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */

const withAntdLess = require('next-plugin-antd-less');
const withPlugins = require('next-compose-plugins');
const dotenv = require('dotenv');
const minimist = require('minimist');
const lessToJS = require('less-vars-to-js');
const fs = require('fs');
const path = require('path');
const bundleAnalyzer = require('@next/bundle-analyzer');
const withImages = require('next-images');
const Dotenv = require('dotenv-webpack');
// const withOffline = require('next-offline');
const withPWA = require('next-pwa');
const { URLRedirects } = require('./constants/routes-constants');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const withFonts = require('next-fonts');
// const withCSS = require('@zeit/next-css');
// const withSass = require('@zeit/next-sass');
// const withLess = require('@zeit/next-less');

// const devMode = process.env.NODE_ENV !== 'production';

// Where your custom-vars.less file lives
const themeVariables = lessToJS(
  fs.readFileSync(
    path.resolve(__dirname, 'public/styles/core/custom-vars.less'),
    'utf8',
  ),
);

// fix: prevents error when .less files are required by node
if (typeof require !== 'undefined') {
  require.extensions['.less'] = () => {};
}

const parsedArgs = minimist(process.argv.slice(2));
const envFile = parsedArgs['env-file']
  ? parsedArgs['env-file']
  : process.env.ENV_FILE_NAME;

console.log('ENVIRONMENT FILE --- ', envFile);

if (!envFile) {
  process.exit();
}
dotenv.config({ path: `./${envFile}` });

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  distDir: 'build',
  compress: true,
  poweredByHeader: false,
  trailingSlash: true,
  useFileSystemPublicRoutes: true,
  productionBrowserSourceMaps: true,
  // workboxOpts: {
  //   swDest: '../public/service-worker.js',
  // },

  // eslint: {
  // Warning: Dangerously allow production builds to successfully complete even if
  // your project has ESLint errors.
  // ignoreDuringBuilds: true,
  // },
  // typescript: {
  // !! WARN !!
  // Dangerously allow production builds to successfully complete even if
  // your project has type errors.
  // !! WARN !!
  // ignoreBuildErrors: true,
  // },

  async redirects() {
    return URLRedirects;
  },
  // async headers() {
  //   return [
  //     {
  //       source: '/.(gif|jpeg|bmp|png|jpg|svg)',
  //       locale: false,
  //       headers: [
  //         {
  //           key: 'Cache-Control',
  //           value: 'public, max-age=9999999999, must-revalidate',
  //         },
  //         {
  //           key: 'test',
  //           value: '1',
  //         },
  //       ],
  //     },
  //   ];
  // },

  // publicRuntimeConfig: getRunTimeParams(),
  images: {
    domains: ['localhost', 'stg-jobs-emp-common.s3.ap-southeast-1.amazonaws.com', 'stg-olxp-emp-nextjs-export.s3.ap-southeast-1.amazonaws.com'],
  },

  // images: {
  //   disableStaticImages: true,
  // },
  // async exportPathMap() {
  //   return {
  //     '/': { page: '/employerHomePage' },
  //   };
  // },
};

// added custom webpack inside withAntdLess since withAntdLess returns a webpack of it's own and
// because withAntdLess is nested the deepest, it's webpack is being considered
// reference doc: https://www.npmjs.com/package/next-plugin-antd-less
const AppConfig = withPlugins(
  [withAntdLess({
    modifyVars: themeVariables,
    lessVarsFilePathAppendToEndOfContent: false,
    cssLoaderOptions: {},
    webpack(config) {
      const newConfig = config;
      newConfig.resolve.alias['~'] = path.resolve(__dirname);
      newConfig.plugins = config.plugins || [];
      newConfig.plugins.push(new Dotenv({ path: `./${process.env.ENV_FILE_NAME}` }));
      return newConfig;
    },
  })],
  // [withPWA],
  // [withOffline],
  // [withPWA],
  // withOffline,
  nextConfig,
  withImages,
);

module.exports = process.env.ANALYZE === 'true' ? withBundleAnalyzer(AppConfig) : AppConfig;
