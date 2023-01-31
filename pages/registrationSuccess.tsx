import React from 'react';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';

const EmployerRegistrationSuccessComponent = dynamic(() => import('screens/public/EmployerRegistrationSuccess/EmployerRegistrationSuccess.component'));

const EmployerRegistrationSuccess: NextPage = () => <EmployerRegistrationSuccessComponent />;

export default EmployerRegistrationSuccess;
