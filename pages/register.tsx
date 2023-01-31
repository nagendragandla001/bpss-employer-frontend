/* eslint-disable max-len */
import { NextPage } from 'next';
import React from 'react';
import dynamic from 'next/dynamic';

const EmployerRegistrationComponent = dynamic(() => import('screens/public/EmployerRegistration/EmployerRegistration.component'));

const EmployerRegistration: NextPage = () => <EmployerRegistrationComponent />;

export default EmployerRegistration;
