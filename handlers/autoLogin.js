/* eslint-disable @typescript-eslint/no-var-requires */

const fetch = require('isomorphic-unfetch');
const queryString = require('querystring');

const AutoLoginHandler = async (req, res) => {
  const params = { ...req.query };
  // Default redirection to home-page
  let redirectionUrl = '/';
  if (Object.keys(params).length && params.username && params.hash_code) {
    const patchObj = {
      username: params.username,
      hash_code: params.hash_code,
      client_id: process.env.CLIENT_ID,
    };
    const url = `${process.env.API_ENDPOINT}api/v4/auto_login/`;

    const apiCall = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(patchObj),
      headers: {
        'Content-Type': 'application/json',
        'X-AJ-PLATFORM': 0,
      },
    });
    if (apiCall.status === 200) {
      // user is successfully verified and redirecting to specified page
      const response = await apiCall.json();
      if (response && response.access_token) {
        delete params.username;
        delete params.hash_code;

        let nextURL = req.path;
        nextURL += Object.keys(params).length > 0 ? `?${queryString.stringify(params)}` : '';
        redirectionUrl = nextURL;

        res.cookie('access_token', response.access_token, {
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
          path: '/',
          domain: process.env.COOKIE_DOMAIN || 'localhost',
        });
      }
    }
  }
  res.writeHead(301, {
    Location: redirectionUrl,
    'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  });
  res.send().end();
};

module.exports = AutoLoginHandler;
