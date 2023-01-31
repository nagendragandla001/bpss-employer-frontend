import React from 'react';
import {
  Row, Card, Button, Col,
} from 'antd';
import config from 'config';
import { isMobile } from 'mobile-device-detect';
import CustomImage from 'components/Wrappers/CustomImage';

const EmptyApplicationCard = (props:any): any => {
  const { selectedTab } = props;
  return (
    <Card className="ac-container">
      <Row align="middle" justify="center">
        <CustomImage
          src="/svgs/applications-empty-state.svg"
          alt="empty"
          width={327}
          height={244}
        />
        <Col
          span={24}
          style={{
            textAlign: 'center',
            fontSize: '18px',
            paddingLeft: isMobile ? '0px' : '3em',
          }}
        >
          {selectedTab === 'applications' ? 'No Applications for the selected Filters' : 'There are no candidates for this job'}
        </Col>
        <Col
          span={24}
          style={{
            textAlign: 'center',
            paddingLeft: isMobile ? '0px' : '3em',
          }}
        >
          <Button
            type="link"
            href={`${config.BASE_URL}/employer-zone/candidates`}
            style={{ fontSize: '16px', color: 'blue' }}
          >
            {selectedTab === 'applications' ? 'View all applications on your jobs' : ''}
          </Button>
        </Col>
      </Row>
    </Card>
  );
};
export default EmptyApplicationCard;
