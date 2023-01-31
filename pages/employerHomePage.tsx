import React from 'react';
import dynamic from 'next/dynamic';
import { NextPage } from 'next';

const HomeComponent = dynamic(() => import('screens/public/Home/Home.component'), { ssr: true });

const EmployerHome: NextPage = () => <HomeComponent />;

export default EmployerHome;
