import React from 'react';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';

const KnowledgeBaseDetails = dynamic(() => import('screens/public/KnowledgeBase/KnowledgeBaseDetails'), { ssr: false });

const KBDetailsComponent: NextPage = () => <KnowledgeBaseDetails />;

export default KBDetailsComponent;
