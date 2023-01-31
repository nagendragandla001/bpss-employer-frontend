import React from 'react';
import dynamic from 'next/dynamic';

const HomeComponent = dynamic(() => import('screens/public/Home/Home.component'), { ssr: false });

const EmployerZoneBase: React.FunctionComponent = () => <HomeComponent />;

export default EmployerZoneBase;
