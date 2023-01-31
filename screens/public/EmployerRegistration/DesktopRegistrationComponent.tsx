import {
  Card, Col, Row, Space, Typography,
} from 'antd';
import React from 'react';
import RegistrationFormComponent from 'screens/public/EmployerRegistration/RegistrationFormComponent';

const { Text, Title } = Typography;

const DesktopRegistrationComponent = (): JSX.Element => (
  <Row className="d-registration-container">
    <Col span={13} className="testimonal-container">
      <Row gutter={[0, 60]}>
        <Col span={24}>
          <Title>
            Welcome! Register Now To Find Your
            <Text className="text-orange"> Next Great Hire.</Text>
          </Title>
        </Col>
        <Col span={18}>
          <Card bordered={false}>
            <Row gutter={[0, 70]} className="text-extra-base">
              <Col span={24}>
                <Space align="center" size="large">
                  <img
                    src={`/images/static-pages/registration/testimonal_${1}.svg`}
                    alt="candidate"
                  />
                  <Text className="testimonial-content">
                    Fulfill your hiring requirements in
                    {' '}
                    <Text className="text-bold">3 days</Text>
                  </Text>
                </Space>
              </Col>
              <Col span={24}>
                <Space align="center" size="large">
                  <img
                    src={`/images/static-pages/registration/testimonal_${2}.svg`}
                    alt="candidate"
                  />
                  <Text className="testimonial-content">
                    Share your job opening with
                    {' '}
                    <Text className="text-bold">6cr+ candidates</Text>
                    {' '}
                    across India
                  </Text>
                </Space>
              </Col>
              <Col span={24}>
                <Space align="center" size="large">
                  <img
                    src={`/images/static-pages/registration/testimonal_${3}.svg`}
                    alt="candidate"
                  />
                  <Text className="testimonial-content">
                    Find the perfect candidate from our
                    {' '}
                    <Text className="text-bold">Database</Text>
                  </Text>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

    </Col>
    <Col span={11} className="registration-form-wrapper">
      <Row align="middle" justify="center" gutter={[0, 16]}>
        <Col span={24} className="text-center">
          <Title level={2}>Get started to hire best candidates</Title>
        </Col>
        <Col span={24}>
          <Card className="registration-form-card">
            <RegistrationFormComponent />
          </Card>
        </Col>
      </Row>
    </Col>
  </Row>
);

export default DesktopRegistrationComponent;
