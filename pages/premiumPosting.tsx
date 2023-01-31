import React from 'react';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';

const PremiumJobPostingComponent = dynamic(() => import('screens/public/PremiumJobPosting/PremiumJobPosting.component'));

const PremiumJobPosting: NextPage = () => <PremiumJobPostingComponent />;

export default PremiumJobPosting;
