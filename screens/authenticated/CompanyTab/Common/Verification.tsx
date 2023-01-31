/* eslint-disable react/require-default-props */
import {
  CheckCircleFilled, ExclamationCircleFilled, PlusCircleFilled, QuestionCircleOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card, Col, Divider, List, Popover, Row, Space, Typography,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import Link from 'next/link';
import React from 'react';
import { pushClevertapEvent } from 'utils/clevertap';
import { tooltipMessage, VerificationInfo } from './CompanyTabUtils';

const { Text, Paragraph, Title } = Typography;

interface VerificationFieldProps {
  label: string;
  value: string | null | undefined;
}
interface ActionProps {
  status: string | any;
  orgType: string;
  orgVerificationStatus: string;
  emailVerified: boolean;
}

const VerificationAction = (
  {
    status, orgType, orgVerificationStatus, emailVerified,
  }: ActionProps,
): JSX.Element => {
  switch (status) {
    case 'P':
      return <Paragraph type="warning">in progress</Paragraph>;
    case 'F':
      return <Paragraph type="danger">verification failed</Paragraph>;
    case 'V':
      return <Paragraph type="success"><CheckCircleFilled /></Paragraph>;
    case 'P_D':
    default:
      return (
        <Link href="/settings" as="/employer-zone/settings" passHref>
          <Button
            type="link"
            className="text-bold"
            onClick={(): void => {
              pushClevertapEvent('Verify Org', {
                source: 'Company Profile',
                category: orgType,
                'KYC Status': orgVerificationStatus,
                emailVerified,
              });
            }}
          >
            <PlusCircleFilled />
            ADD
          </Button>
        </Link>
      );
  }
};

const VerificationField = ({ label, value }: VerificationFieldProps): JSX.Element => (
  <Space direction="vertical">
    <Paragraph>{label}</Paragraph>
    {
      value ? (
        <Paragraph className="text-small">{value}</Paragraph>
      ) : <Paragraph type="danger">Required</Paragraph>
    }
  </Space>
);

interface VerificationProps {
  verificationInfo: VerificationInfo;
  type: string;
  emailVerified: boolean;
}

const Verification = (props: VerificationProps): JSX.Element => {
  const { verificationInfo, type, emailVerified } = props;
  return (
    <Card className={`verification ${verificationInfo?.status || 'P_D'}`}>
      <Space direction="vertical" size={30}>
        <Row gutter={[14, 0]}>
          <Col span={18}>
            <Space direction="vertical">
              <Title level={4}>Complete verification</Title>
              <Popover content={tooltipMessage(type)}>
                <Text type="secondary">
                  <Space direction="horizontal">
                    <QuestionCircleOutlined />
                    <Text type="secondary">How to verify?</Text>
                  </Space>
                </Text>
              </Popover>
            </Space>
          </Col>
          <Col span={6}>
            <CustomImage
              src="/images/company-tab/verification.svg"
              width={84}
              height={84}
              alt="verification"
            />
          </Col>
        </Row>
        <Row gutter={[0, 16]}>
          <Col span={24}>
            <Title level={5} className={`status ${verificationInfo?.status}`} type="danger">
              {verificationInfo?.status === 'V' ? 'Verified Details' : 'Pending Details'}
              {' '}
              <ExclamationCircleFilled />
            </Title>
          </Col>
          <Col span={24}>
            <Row align="middle" justify="space-between">
              <Col>
                {
                  type === 'IND' ? (
                    <VerificationField
                      label="PAN"
                      value={verificationInfo?.pan_verification?.value}
                    />
                  ) : (
                    <VerificationField
                      label="GST"
                      value={verificationInfo?.gst_verification?.value}
                    />
                  )
                }
              </Col>
              <Col>
                <VerificationAction
                  status={type === 'IND'
                    ? verificationInfo?.pan_verification?.value_status
                    : verificationInfo?.gst_verification?.value_status}
                  orgType={type}
                  orgVerificationStatus={verificationInfo?.status}
                  emailVerified={emailVerified}
                />
              </Col>
            </Row>
            <Divider style={{ margin: '16px 0' }} />
            <Row align="middle" justify="space-between">
              <Col>
                <VerificationField
                  label="Registered company name"
                  value={verificationInfo?.registered_company_name?.value}
                />
              </Col>
              <Col>
                <VerificationAction
                  status={verificationInfo?.registered_company_name?.value_status}
                  orgType={type}
                  orgVerificationStatus={verificationInfo?.status}
                  emailVerified={emailVerified}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Space>
    </Card>
  );
};

export default Verification;
