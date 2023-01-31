import {
  Card, Col, List, Modal, Row, Typography,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import React from 'react';

require('screens/authenticated/JobsTab/Mobile/Components/ActiveBoostModal.less');

const { Text, Title } = Typography;

type PropsModel = {
  visible: boolean,
  handleClose: () => void
}

const Activities = [
  {
    title: 'Unlock Candidate Contact & call them',
    key: 'active-boost-unlock',
  },
  {
    title: 'View OR Download CV',
    key: 'active-boost-cv',
  },
  {
    title: 'Shortlist or Reject the applications',
    key: 'active-boost-shortlist',
  },
  {
    title: 'Schedule Interviews with candidates',
    key: 'active-boost-calendar',
  },
  {
    title: 'Add Interview Slots for Walk-in jobs',
    key: 'active-boost-walkins',
  },
];

const ActiveBoostActions = [
  {
    title: 'Your Job is tagged as Active',
    key: 'active-boost-tag',
  },
  {
    title: 'Job is boosted to top in listings',
    key: 'active-boost-listing',
  },
  {
    title: 'Get more & quality applications',
    key: 'active-boost-applications',
  },
];

const ActiveBoostModal = (props: PropsModel): JSX.Element => {
  const { visible, handleClose } = props;
  return (
    <Modal
      key="m-active-boost-model"
      visible={visible}
      closable={false}
      className="full-screen-modal m-active-boost-model"
      footer={null}
      title={[
        <Row key={Math.random()}>
          <Col span={2} onClick={handleClose}><CustomImage src="/svgs/m-close.svg" width={24} height={24} alt="Close" /></Col>
          <Col span={20} className="m-modal-title">Active Boost</Col>
        </Row>,
      ]}
    >
      <Row className="m-top-40">
        <Col span={24}>
          <CustomImage
            src="/images/jobs-tab/m-active-boost.svg"
            width={328}
            height={125}
            alt="Active Boost"
          />
        </Col>
      </Row>
      <Row>

        <Col span={24} style={{ marginTop: '16px' }}>
          <Card
            bordered={false}
            className="m-actions-card"
            title={
              [
                <Row key={Math.random()}>
                  <Col span={24}>
                    <Text className="text-bold">Get more attention with Active Boost</Text>
                  </Col>
                </Row>,
              ]
            }
          >
            <>
              {ActiveBoostActions.map((item) => (
                <Row className="full-width">
                  <Col span={4}><CustomImage src={`/images/jobs-tab/${item.key}.svg`} layout alt={item.key} /></Col>
                  <Col span={20}><Text className="text-disabled">{item.title}</Text></Col>
                </Row>
              ))}
            </>
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: '48px' }}>
        <Col span={24}>
          <Card
            className="br-4 m-activity-card"
            title={
              [
                <Row key={Math.random()}>
                  <Col span={24}>
                    <Text className="text-bold">How to get Active Boost?</Text>
                  </Col>
                </Row>,
              ]
            }
          >
            <>
              {Activities.map((item) => (
                <Row className="full-width">
                  <Col span={4}><CustomImage src={`/images/jobs-tab/${item.key}.svg`} layout alt={item.key} /></Col>
                  <Col span={20}><Text className="text-disabled">{item.title}</Text></Col>
                </Row>
              ))}
            </>
          </Card>
        </Col>
        <Col span={24} className="active-boost-note">
          <Text className="text-small">
            Note:”ACTIVE” Boost will be removed from your job if you stop
            processing the Applications within 72 hour
          </Text>
        </Col>
      </Row>
    </Modal>
  );
};

export default ActiveBoostModal;
