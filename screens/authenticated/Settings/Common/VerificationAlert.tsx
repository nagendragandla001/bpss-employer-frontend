import { Alert } from 'antd';
import React from 'react';

const VerificationAlert = (): JSX.Element => (
  <Alert
    type="warning"
    showIcon={false}
    message="Verified companies are highlighted and get more candidates."
    description="Complete your verification now"
    className="verification-alert"
  />
);

export default VerificationAlert;
