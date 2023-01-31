/* eslint-disable no-nested-ternary */
/* eslint-disable react/prop-types */
import Error404 from 'pages/404';
import Error500 from 'pages/500';
import React from 'react';

const Error = (props:{statusCode:number}): JSX.Element => {
  const { statusCode } = props;
  switch (statusCode) {
    case 404:
      return <Error404 />;
    case 500:
      return <Error500 />;
    default:
      return <Error500 />;
  }
};

Error.getInitialProps = ({ res, err }): {statusCode:number} => {
  const statusCode = res
    ? res.statusCode
    : (err ? err.statusCode : 404);
  return { statusCode };
};

export default Error;
