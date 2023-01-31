import dynamic from 'next/dynamic';
import React from 'react';

const EmailVerificationComponent = dynamic(() => import('screens/public/EmailVerification/index'), { ssr: false });

type PropsType={
  status:string;
  email:string;
  userId:string;
  hashCode:string;
}

const EmailVerification = ({
  status, email, userId, hashCode,
}:PropsType):JSX.Element => (
  <EmailVerificationComponent status={status} email={email} userId={userId} hashCode={hashCode} />
);

EmailVerification.getInitialProps = async (ctx): Promise<PropsType> => (
  {
    status: (ctx && ctx.query && ctx.query.status) || '',
    email: (ctx && ctx.query && ctx.query.email) || '',
    userId: (ctx && ctx.query && ctx.query.userId) || '',
    hashCode: (ctx && ctx.query && ctx.query.hashCode) || '',
  }
);

export default EmailVerification;
