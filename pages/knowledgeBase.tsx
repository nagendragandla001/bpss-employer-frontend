import React from 'react';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';

const KnowledgeBase = dynamic(() => import('screens/public/KnowledgeBase/KnowledgeBase'), { ssr: false });

const KBComponent: NextPage = () => <KnowledgeBase />;

export default KBComponent;
