import { ExclamationCircleFilled } from '@ant-design/icons';
import { Space, Typography } from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import React from 'react';

const StatusMessage = {
  registered_company_name: {
    P: 'In progress',
    F: 'Company name mismatch',
  },
  pan_verification: {
    P: 'In progress',
    F: 'PAN mismatch',
  },
  gst_verification: {
    P: 'In progress',
    F: 'GST mismatch',
  },
};

const VerificationStatus = ({ type, status }: any): JSX.Element => (
  status === 'V' ? (
    <CustomImage
      src="/images/settings/verifiedGreenIcon.svg"
      height={12}
      width={12}
      alt="verified icon"
    />
  ) : (
    <Space direction="horizontal" className="verification-status">
      <ExclamationCircleFilled className={`status ${status}`} />
      <Typography.Text className={`status ${status}`}>{StatusMessage[type][status]}</Typography.Text>
    </Space>
  )
);

export default VerificationStatus;
