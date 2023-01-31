import React from 'react';
import {
  Row, Col, Typography, Button,
} from 'antd';
import Container from 'components/Layout/Container';
import HeadComponent from 'components/Errors/Error404.head.component';
import Link from 'next/link';
import CustomImage from 'components/Wrappers/CustomImage';

require('components/Errors/Error.styles.less');

const { Paragraph, Text } = Typography;

const Error404: React.FunctionComponent = () => (
  <>
    <HeadComponent />
    <Row className="error-pages">
      <Container>
        <Row gutter={0} align="middle" justify="center">
          <Col className="text-center">
            <CustomImage
              src="/svgs/error-404.svg"
              height={180}
              width={180}
              alt="Error 404"
            />
            <Paragraph className="error-title">
              <Text strong>Error 404</Text>
            </Paragraph>
            <Paragraph className="error-description">
              The page you’re looking for no longer exists.
              <br />
              Please check your URL once again
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

export default Error404;
