import React from 'react';
import { NextPage } from 'next';
import authenticationHOC from 'lib/authenticationHOC';
import dynamic from 'next/dynamic';

const Invoice = dynamic(() => import('screens/authenticated/Invoice/Invoice.component'), { ssr: false });

const InvoicePage: NextPage = () => <Invoice />;

export default authenticationHOC(InvoicePage);
