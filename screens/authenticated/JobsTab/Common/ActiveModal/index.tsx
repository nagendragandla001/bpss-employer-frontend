import React from 'react';
import {
  Modal, Typography, Row, Col,
} from 'antd';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import CustomImage from 'components/Wrappers/CustomImage';

require('screens/authenticated/JobsTab/Common/ActiveModal/activeBoostModal.less');

const { Text } = Typography;

const activeBoostBenefits = [
  { imgName: 'tagged-active-icon', text: 'Your Job is tagged as Active' },
  { imgName: 'job-boosted-icon', text: 'Job is boosted to top in listings' },
  { imgName: 'quality-app-icon', text: 'Get more & quality applications' },
];

const howToGetActiveBoost = [
  { imgName: 'unlock-contact-icon', text: 'Unlock Candidate Contact & call them' },
  { imgName: 'view-cv-icon', text: 'View OR Download CV' },
  { imgName: 'shortlist-icon', text: 'Shortlist or Reject the applications' },
  { imgName: 'schedule-interview-icon', text: 'Schedule Interviews with candidates' },
  { imgName: 'walk-in-icon', text: 'Add Interview Slots for Walk-in jobs' },
];

const ActiveModal = ({ onCloseHandler }:{onCloseHandler: ()=>void}): JSX.Element => (
  <Modal
    visible
    title={<Text className="modal-title">Active Boost</Text>}
    onCancel={onCloseHandler}
    footer={null}
    width={556}
    destroyOnClose
    closeIcon={<CloseOutlined style={{ color: '#284e52', fontSize: '1.5rem' }} />}
    className="active-boost-modal"
    maskStyle={{ background: 'rgba(0, 20, 67, 0.8)' }}
  >
    <Row>
      <Col span={24} className="flex-all-center">
        <CustomImage
          src="/images/active-boost-modal/banner-328x125.svg"
          width={328}
          height={125}
          alt="banner"
        />
      </Col>
    </Row>
    <Row>
      <Col span={24} className="flex-all-center p-top-1rem p-bottom-8">
        <Text className="font-bold text-medium">Get more attention with Active Boost</Text>
      </Col>
    </Row>
    <Row justify="center">
      <Col>
        {activeBoostBenefits.map((item) => (
          <Row key={item.imgName}>
            <Col span={24} className="p-top-8 flex-align-center">
              <CustomImage
                src={`/images/active-boost-modal/${item.imgName}-32x32.svg`}
                alt={item.imgName}
                className="p-right-8"
                height={32}
                width={32}
              />
              <Text className="color-blue-grey-5">{item.text}</Text>
            </Col>
          </Row>
        ))}
      </Col>
    </Row>

    <Row className="grey-container">
      <Col span={24}>
        <Row>
          <Col span={24} className="flex-all-center margin-bottom-32">
            <Text className="font-bold font-size-20">How to get Active Boost?</Text>
          </Col>
        </Row>
        <Row justify="center">
          <Col>
            {howToGetActiveBoost.map((item) => (
              <Row key={item.imgName}>
                <Col span={24} className="flex-align-center p-y-axis-8 border-bottom-blue-grey-1">
                  <CustomImage
                    src={`/images/active-boost-modal/${item.imgName}-32x32.svg`}
                    alt={item.imgName}
                    className="p-right-8"
                    height={32}
                    width={32}
                  />
                  <Text>{item.text}</Text>
                </Col>
              </Row>
            ))}
          </Col>
        </Row>
        <Row className="modal-info-grey">
          <Col>
            <Text className="text-small ">
              Note:”ACTIVE” Boost will be removed from your job if you stop processing the
              Applications within 72 hour
            </Text>
          </Col>
        </Row>
      </Col>
    </Row>
  </Modal>
);
export default ActiveModal;
