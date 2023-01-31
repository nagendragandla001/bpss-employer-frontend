import {
  Button, Col, Modal, Row, Typography,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import React from 'react';

require('screens/authenticated/ApplicationsTab/Common/CreditInfoModal.less');

const { Paragraph } = Typography;
interface propsI {
  visible:boolean;
  title:string;
  description: string;
  handleCancel: () => void;
  action: string
}

const ACTIONS = {
  getMoreCredits: {
    title: 'Get More Credits',
    id: 'getMoreCredits',
  },
};

const CreditInfoModal = (props:propsI): JSX.Element => {
  const {
    visible, handleCancel, title, description, action,
  } = props;

  return (
    <Modal
      title={null}
      footer={null}
      visible={visible}
      keyboard={false}
      onCancel={handleCancel}
      className="credit-info-modal"
    >
      <Row align="top">
        <Col xs={{ span: 24 }} lg={{ span: 14 }} className="exaust-content">
          <Row>
            <Col span={24} className="m-b-11">
              <Paragraph className="title">{title}</Paragraph>
            </Col>
            <Col span={24} className="description m-b-16">
              {description}
            </Col>
            <Col span={24}>
              <Button size="small" type="primary" className="br-4">{ACTIONS[action]?.title}</Button>
            </Col>
          </Row>
        </Col>
        <Col xs={{ span: 24 }} lg={{ span: 10 }} className="exaust-banner">
          <CustomImage src="/images/assets/candidates/credit-exaust.svg" width={184} height={171} alt="exaust" />
        </Col>
      </Row>
    </Modal>
  );
};

export default CreditInfoModal;
