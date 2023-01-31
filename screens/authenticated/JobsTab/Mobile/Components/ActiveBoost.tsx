import React, { useState } from 'react';
import {
  Row, Col, Button, Typography,
} from 'antd';
import RightOutlined from '@ant-design/icons/RightOutlined';
import ActiveBoostModal from 'screens/authenticated/JobsTab/Mobile/Components/ActiveBoostModal';
import { pushClevertapEvent } from 'utils/clevertap';
import CustomImage from 'components/Wrappers/CustomImage';

const { Text } = Typography;

const ActiveBoost = (): JSX.Element => {
  const [visible, setVisible] = useState(false);
  const handleVisible = (): void => {
    pushClevertapEvent('General Click', { Type: 'Know More - Active Tag' });
    setVisible(true);
  };
  return (
    <Col span={24} style={{ marginTop: 16 }}>
      <Row className="m-jt-active-tip">
        <Col span={2}><CustomImage src="/images/jobs-tab/m-active-tip.svg" width={32} height={32} alt="Active tip" /></Col>
        <Col span={15}>
          <Text className="text-bold text-small">Tip: </Text>
          <Text className="text-small">Call/Shortlist applicants on time to get your job an </Text>
          <Text className="text-bold text-small">Active Boost</Text>
        </Col>
        <Col span={7}>
          <Button type="link" className="p-all-0 text-small" onClick={handleVisible}>
            know more
            {' '}
            <RightOutlined />
          </Button>
        </Col>
      </Row>
      {
        visible && (
          <ActiveBoostModal
            visible={visible}
            handleClose={(): void => setVisible(false)}
          />
        )
      }
    </Col>
  );
};

export default ActiveBoost;
