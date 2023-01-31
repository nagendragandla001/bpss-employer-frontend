import { NextPage } from 'next';
import React from 'react';
import dynamic from 'next/dynamic';

const AutoLoginComponent = dynamic(() => import('screens/public/AutoLogin/AutoLogin.component'));

const AutoLogin: NextPage = () => <AutoLoginComponent />;

export default AutoLogin;
