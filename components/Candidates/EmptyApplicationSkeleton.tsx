import {
  Card, Col, Row, Skeleton, Space,
} from 'antd';
import React from 'react';

require('screens/authenticated/ApplicationsTab/Desktop/applicationsTabDesktop.less');

const rows = [1, 2, 3, 4];
const EmptyApplicationSkeleton = (): JSX.Element => (
  <div className="at-desktop-container database-tab">
    <Row gutter={[12, 12]}>
      {
        rows.map((row) => (
          <Col span={24} key={row}>
            <Card key={row} className="ac-container">
              <Skeleton active avatar={{ shape: 'square', size: 'small' }} />
              <Row justify="space-between">
                <Col>
                  <Space>
                    <Skeleton.Button style={{ width: 150 }} size="small" active shape="round" />
                    <Skeleton.Button style={{ width: 150 }} size="small" />
                  </Space>
                </Col>
                <Col>
                  <Space>
                    <Skeleton.Button size="default" />
                    <Skeleton.Button size="default" />
                  </Space>
                </Col>
              </Row>
            </Card>
          </Col>
        ))
      }
    </Row>
  </div>
);

export default EmptyApplicationSkeleton;
