/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */

const fetch = require('node-fetch');
// const querystring = require('querystring');

const autoCompleteHandler = (req, res) => {
  const [path, queries] = req.url.split('?');
  // const params = { ...querystring.parse(queries) };
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${queries}`;
  fetch(url).then((res2) => res2.json()).then((data) => {
    res.status(200).send(data);
    res.end();
  });
};

module.exports = autoCompleteHandler;
