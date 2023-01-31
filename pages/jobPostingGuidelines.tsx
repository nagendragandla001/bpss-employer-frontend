import React from 'react';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';

const JobPostingGuidelinesPage = dynamic(() => import('screens/public/JobPostingGuidelines/JobPostingGuidelines'), { ssr: false });

const JobPostingGuidelines: NextPage = () => <JobPostingGuidelinesPage />;

export default JobPostingGuidelines;
