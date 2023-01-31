import {
  Button, Col, Row, Typography,
} from 'antd';
import UnverifiedModal from 'components/UnverifiedEmailNotification/UnverifiedModal';
import React, { useEffect, useState } from 'react';
import { getLoggedInUser } from 'service/accounts-settings-service';
import { pushClevertapEvent } from 'utils/clevertap';
import MobileJobPostingGuidelines from 'screens/authenticated/JobsTab/Mobile/Components/MobileJobPostingGuidelines';

const { Text } = Typography;

type PropsModel = {
  stage: string;
}

const UnApprovedKnowMore = ({ stage }: PropsModel): JSX.Element => {
  const [mobileVerificationFlag, setMobileVerificationFlag] = useState<boolean>(false);

  const [user, setUser] = useState() as any;

  const setLoggedInUser = async (): Promise<void> => {
    const apiCall = await getLoggedInUser();
    const response = apiCall.data;
    setUser(response?.objects[0]);
  };
  useEffect(() => {
    setLoggedInUser();
  }, []);

  return (
    <Col span={24} style={{ marginTop: 16 }}>
      {mobileVerificationFlag ? <UnverifiedModal isEmailModalVisible /> : null}
      <Row className="m-jt-closed-banner" justify="space-between">
        <Col span={16} style={{ margin: 'auto 0' }}>
          <img src="/images/jobs-tab/m-clock.svg" alt="Pause" />
          <Text className="text-small">
            {`This job ${stage === 'J_R' ? 'was marked ' : 'is still '}`}
            <Text className="color-red-8 font-bold">{stage === 'J_R' ? 'Rejected' : 'Unapproved'}</Text>
          </Text>
        </Col>
        <Col span={8} style={{ margin: 'auto 0' }}>
          {/* eslint-disable-next-line no-nested-ternary */}
          {!user ? ''
            : (user.email_verified
              ? <MobileJobPostingGuidelines />
              : (
                <Row justify="end">
                  <Button
                    className="verify-contact-btn"
                    onClick={(): void => {
                      setMobileVerificationFlag(true);
                      pushClevertapEvent('Verify Contact');
                    }}
                  >
                    Verify Contact
                  </Button>
                </Row>
              ))}
        </Col>
      </Row>
    </Col>
  );
};

export default UnApprovedKnowMore;
