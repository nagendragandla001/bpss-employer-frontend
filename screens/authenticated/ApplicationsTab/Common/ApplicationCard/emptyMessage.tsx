import { Row, Card, Col } from 'antd';
import React from 'react';
import { isMobile } from 'mobile-device-detect';
import CustomImage from 'components/Wrappers/CustomImage';
// import img from 'next/image';

interface PropsType {
  selectedTab: string
}

const EmptyMessage = (props: PropsType): JSX.Element => {
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
          {selectedTab === 'applications' ? '' : 'We are searching for the best candidate for your job'}
        </Col>
      </Row>
    </Card>
  );
};

export default EmptyMessage;
