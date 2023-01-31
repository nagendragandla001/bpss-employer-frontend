// eslint-disable-next-line @typescript-eslint/no-var-requires
const fetch = require('isomorphic-unfetch');

const EmailVerificationHandler = async (req, res, next) => {
  const params = { ...req.query };
  if (Object.keys(params).length && params.username && params.hash_code) {
    const patchObj = {
      email: params.username,
      hash_code: params.hash_code,
      client_id: process.env.CLIENT_ID,
    };
    const url = `${process.env.API_ENDPOINT}api/v4/user/verify_email/`;
    // Default redirection
    let redirectionUrl = `/verify/email/failed/?email=${params.username}&hashCode=${params.hash_code}`;
    const apiCall = await fetch(url, {
      method: 'PATCH',
      body: JSON.stringify(patchObj),
      headers: {
        'Content-Type': 'application/json',
        'X-AJ-PLATFORM': 0,
      },
    });
    if ([200, 202].indexOf(apiCall.status) !== -1) {
      // user is successfully verified and redirecting to job posting form
      const response = await apiCall.json();
      if (response && response.access_token) {
        res.cookie('access_token', response.access_token, {
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
          path: '/',
          domain: process.env.COOKIE_DOMAIN || 'localhost',
        });
        redirectionUrl = '/employer-zone/job-posting/add/new/';
      }
    } else if (apiCall.status === 400) {
      // checking if verfication is already done or expired
      const recognizeUserUrl = `${process.env.API_ENDPOINT}api/v4/recognize_user/?username=${params.username}`;
      const recognizeUserApiCall = await fetch(recognizeUserUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-AJ-PLATFORM': 0,
        },
      });
      if (recognizeUserApiCall.status === 200) {
        const response = await recognizeUserApiCall.json();
        if (response && response.email_verified) {
          // already verified redirect to HomePage to login
          redirectionUrl = '/';
        } else if (response && response.id) {
          // verification link is expired
          redirectionUrl = `/verify/email/expired/?email=${params.username}&userid=${response.id}`;
        }
      }
    }
    res.writeHead(301, {
      Location: redirectionUrl,
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',
    });

    res.send().end();
  } else {
    // handing the request to next application to handle following pages
    // 1. /verify/email/failure/
    // 2. /verify/email/expired/
    next();
  }
};
module.exports = EmailVerificationHandler;
