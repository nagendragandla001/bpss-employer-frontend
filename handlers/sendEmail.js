// eslint-disable-next-line @typescript-eslint/no-var-requires
const fetch = require('isomorphic-unfetch');

const sendEmail = async (req, res, next) => {
  const params = { ...req.query };
  // console.log('param', params);
  if (Object.keys(params).length && params.email_hash) {
    const userEmailHash = params.email_hash;

    const url = `${process.env.API_ENDPOINT}api/v4/user/send_waahjobs_email/?email_hash=${userEmailHash}`;
    // Default redirection
    const redirectionUrl = `${process.env.BASE_URL}`;
    const apiCall = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-AJ-PLATFORM': 0,
      },
    });
    // console.log('api', apiCall);
    if ([200, 202].indexOf(apiCall.status) !== -1) {
      // console.log('api', apiCall);
      // send email to user
      // console.log('pr', process.browser);
      // console.log('win', window);
      // if (process.browser) {
      //   window.close();
      // }
    }

    res.writeHead(301, {
      Location: redirectionUrl,
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',
    });

    res.send().end();
    // if (process.browser) {
    //   window.close();
    // }
  } else {
    // handing the request to next application to handle following pages
    // 1. /verify/email/failure/
    // 2. /verify/email/expired/
    next();
  }
};
module.exports = sendEmail;
