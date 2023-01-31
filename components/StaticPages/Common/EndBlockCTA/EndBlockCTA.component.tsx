import {
  Button, Col, Row, Typography,
} from 'antd';
import Container from 'components/Layout/Container';
import Link from 'next/link';
import React from 'react';
import { trackStartPostingJob } from 'service/clevertap/common-events';

require('components/StaticPages/Common/EndBlockCTA/EndBlockCTA.component.less');

const { Title } = Typography;

const EndBlockCTA: React.FunctionComponent = () => (
  <Row className="end-block-cta">
    <Container>
      <Row justify="center" align="middle">
        <Col span={24}>
          <Title level={2} className="text-center end-block-title">
            Start your hassle-free recruitment
            <br />
            journey now!
          </Title>
        </Col>
      </Row>
      <Row align="middle" justify="center">
        <Col xs={{ span: 12 }} lg={{ span: 24 }} style={{ marginTop: 40 }} className="text-center">
          <Link href="/register/" prefetch={false}>
            <Button
              className="job-post-btn br-8"
              onClick={(): void => trackStartPostingJob('Footer')}
            >
              Post Job in 2 mins
            </Button>
          </Link>
        </Col>
      </Row>
    </Container>
  </Row>
);

export default EndBlockCTA;
