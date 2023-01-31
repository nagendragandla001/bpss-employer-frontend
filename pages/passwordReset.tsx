import dynamic from 'next/dynamic';
import React from 'react';

const PasswordResetComponent = dynamic(() => import('screens/public/PasswordReset/index'), { ssr: false });

type PropsType={
  emailId:string;
  hashCode:string;
}

const PasswordReset = ({
  emailId, hashCode,
}:PropsType):JSX.Element => (
  <PasswordResetComponent emailId={emailId} hashCode={hashCode} />
);

PasswordReset.getInitialProps = async (ctx): Promise<PropsType> => (
  {
    emailId: (ctx && ctx.query && ctx.query.username) || '',
    hashCode: (ctx && ctx.query && ctx.query.hash_code) || '',
  }
);

export default PasswordReset;
