import { Alert, Space, Typography } from 'antd';
import Link from 'next/link';
import React from 'react';

const { Text } = Typography;

const NoCredits = (): JSX.Element => (
  <Alert
    message={(
      <Space wrap>
        <Text className="text-semibold">Your job credits have exhausted, please upgrade your plan.</Text>
        <Link href="/pricingPlans" as="/employer-zone/pricing-plans/">
          <Text type="warning" className="text-underline">See Plans</Text>
        </Link>
      </Space>
    )}
    type="warning"
  />
);

export default NoCredits;
