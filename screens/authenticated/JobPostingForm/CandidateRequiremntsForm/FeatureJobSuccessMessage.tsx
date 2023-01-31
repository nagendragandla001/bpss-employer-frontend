import {
  Button, Col, Row, Typography,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import React from 'react';
import router from 'routes';
import { logEvent } from 'utils/analytics';

const { Title, Text } = Typography;

interface IFeatureJobSuccessMessage {
  title: string;
  credits: number;
}
const FeatureJobSuccessMessage = (props: IFeatureJobSuccessMessage): JSX.Element => {
  const { title, credits } = props;

  const logPricingSubmitEvent = (): void => {
    const trackObj = {
      category: 'job_post',
      action: 'pricing_plan_submit',
      label: 'pricing_plan',
      nonInteraction: false,
    };
    logEvent(trackObj);
  };

  return (
    <Row className="feature-job-success-message" justify="center" align="middle" gutter={[30, 30]}>
      <Col span={24} className="text-center">
        <Title level={3}>Congratulations!</Title>
        {/* <CustomImage
          src="/images/job-posting/pricingPlan.png"
          layout
          alt="pricing plan"
        /> */}
      </Col>
      <Col span={24} className="text-center">
        <Text>
          {`
            You have successfully upgraded ‘${title}’ Job to Promoted Job Posting.`}
        </Text>
      </Col>
      <Col span={24} className="text-center">
        <Text>{`${credits} Promoted  Job Postings remaining for your account.`}</Text>
      </Col>
      <Col span={24} className="text-center">
        <Button
          className="text-semibold br-4"
          type="primary"
          onClick={(): void => {
            logPricingSubmitEvent();
            router.Router.pushRoute('MyJobs');
          }}
        >
          My Jobs
        </Button>
      </Col>
    </Row>
  );
};

export default FeatureJobSuccessMessage;
