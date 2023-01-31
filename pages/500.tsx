import React from 'react';
import {
  Row, Col, Typography, Button,
} from 'antd';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import CustomImage from 'components/Wrappers/CustomImage';

require('components/Errors/Error.styles.less');

const Container = dynamic(() => import('components/Layout/Container'));
const HeadComponent = dynamic(() => import('components/Errors/Error500.head.component'));

const { Paragraph, Text } = Typography;

const Error500: React.FunctionComponent = () => (
  <>
    <HeadComponent />
    <Row className="error-pages">
      <Container>
        <Row gutter={0} align="middle" justify="center">
          <Col className="text-center">
            <CustomImage src="/svgs/error-500.svg" height={150} width={150} alt="Error 500" />
            <Paragraph className="error-title">
              <Text strong>Error 500</Text>
            </Paragraph>
            <Paragraph className="error-description">
              We’re sorry, the server encountered an error & was unable
              <br />
              to complete your request
            </Paragraph>
            <Paragraph>
              <Link href="/" prefetch={false}>
                <Button type="primary" ghost className="error-page-cta">
                  Go to Home
                </Button>
              </Link>
            </Paragraph>
          </Col>
        </Row>
      </Container>
    </Row>
  </>
);

export default Error500;
