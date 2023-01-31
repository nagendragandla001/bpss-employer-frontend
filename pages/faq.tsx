import React from 'react';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';

const FAQ = dynamic(() => import('screens/public/FAQ/FAQ.component'), { ssr: false });

const FAQComponent: NextPage = () => <FAQ />;

export default FAQComponent;
