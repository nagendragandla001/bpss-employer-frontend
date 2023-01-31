import {
  Card, Col, Row, Typography,
} from 'antd';
import React from 'react';
import RegistrationFormComponent from 'screens/public/EmployerRegistration/RegistrationFormComponent';

const { Text, Title } = Typography;

const MobileRegistrationComponent = (): JSX.Element => (
  <Row align="middle" className="m-registration-container" gutter={[0, 20]}>
    <Col span={24}>
      <Title level={4}>
        Welcome! Register Now To Find Your
        <Text className="text-orange"> Next Great Hire.</Text>
      </Title>
    </Col>
    <Col span={24}>
      <Card bordered={false} className="m-testimonal-card">
        <Row align="middle" justify="center">
          <Col span={8} className="text-white text-small">
            <Row align="middle" justify="center" gutter={[0, 15]}>
              <Col span={24} className="text-center">
                <img
                  src={`/images/static-pages/registration/testimonal_${1}.svg`}
                  alt="candidate"
                />
              </Col>
              <Col span={24} className="text-center testimonial-content">
                Hire
                {' '}
                <Text className="text-bold text-white">Fast</Text>
                {' '}
                within 3 days
              </Col>
            </Row>
          </Col>
          <Col span={8} className="text-white text-small">
            <Row align="middle" justify="center" gutter={[0, 15]}>
              <Col span={24} className="text-center">
                <img
                  src={`/images/static-pages/registration/testimonal_${2}.svg`}
                  alt="candidate"
                />
              </Col>
              <Col span={24} className="text-center testimonial-content">
                Reach
                {' '}
                <Text className="text-bold text-white">6 cr+ </Text>
                {' '}
                candidates
              </Col>
            </Row>
          </Col>
          <Col span={8} className="text-white text-small">
            <Row align="middle" justify="center" gutter={[0, 15]}>
              <Col span={24} className="text-center ">
                <img
                  src={`/images/static-pages/registration/testimonal_${3}.svg`}
                  alt="candidate"
                />
              </Col>
              <Col span={24} className="text-center testimonial-content">
                Hire the
                <Text className="text-bold text-white"> perfect candidates</Text>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
    </Col>
    <Col span={24} className="m-top-24 m-b-16">
      <RegistrationFormComponent />
    </Col>
  </Row>
);

export default MobileRegistrationComponent;
