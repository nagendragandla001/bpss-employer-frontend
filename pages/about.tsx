import React from 'react';
import dynamic from 'next/dynamic';

const AboutUs = dynamic(() => import('screens/public/AboutUs/AboutUs'));

const AboutUscomponent: React.FunctionComponent = () => <AboutUs />;

export default AboutUscomponent;
