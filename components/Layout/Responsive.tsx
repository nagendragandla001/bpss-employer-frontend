/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable react/prop-types */
import { Col, Row } from 'antd';
import React from 'react';

export const Desktop = ({ children }): JSX.Element => (
  <Row>
    <Col xs={{ span: 0 }} sm={{ span: 0 }} md={{ span: 24 }} lg={{ span: 24 }}>
      {children}
    </Col>
  </Row>
);

export const Mobile = ({ children }): JSX.Element => (
  <Row>
    <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 0 }} lg={{ span: 0 }}>
      {children}
    </Col>
  </Row>
);
