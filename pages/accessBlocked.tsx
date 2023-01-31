import React from 'react';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';

const AccessBlockedComponent = dynamic(() => import('screens/public/AccessBlocked/AccessBlocked'));

const AccessBlocked: NextPage = () => <AccessBlockedComponent />;

export default AccessBlocked;
