import {
  Button, Col, Modal, Row, Typography,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import Link from 'next/link';
import React from 'react';
import { pushClevertapEvent } from 'utils/clevertap';

require('screens/authenticated/ApplicationsTab/Desktop/AddonExhausted.less');

const { Paragraph } = Typography;
interface propsI{
  visible:boolean;
  title:string;
  description: string;
  handleCancel: ()=>void;
}
const AddonExhaustedModal = (props:propsI): JSX.Element => {
  const {
    visible, handleCancel, title, description,
  } = props;

  return (
    <Modal
      title={null}
      footer={null}
      visible={visible}
      keyboard={false}
      onCancel={handleCancel}
      className="addon-modal"
      width={552}
    >
      <Row align="middle" justify="space-between">
        <Col
          xs={{ span: 22, offset: 0 }}
          md={{ span: 13, offset: 0 }}
          className="modal-section-actions"
        >
          <Paragraph className="modal-text">
            {title}
          </Paragraph>
          <br />
          <Paragraph className="modal-upgrade-description">
            {description}
          </Paragraph>
          <Paragraph style={{ float: 'left' }}>
            <Link href="pricingPlans" as="employer-zone/pricing-plans/">
              <Button
                type="primary"
                className="modal-action-btn"
                onClick={(): void => {
                  pushClevertapEvent('Special Click', {
                    Type: 'Add contact unlocks',
                    Source: 'Applications Unlocks Exhausted Modal',
                  });
                }}
              >
                Get More Credits
              </Button>
            </Link>
          </Paragraph>
        </Col>
        <Col
          xs={{ span: 24, offset: 0 }}
          md={{ span: 10, offset: 0 }}
          className="modal-section-image"
        >
          <Col xs={{ span: 10, offset: 1 }} md={{ span: 24, offset: 0 }} style={{ backgroundColor: 'black' }}>
            <CustomImage
              src="/images/application-tab/application-more-credits.svg"
              alt="Unverified Email"
              className="center-block"
              width={184}
              height={171}
            />
          </Col>
        </Col>
      </Row>
    </Modal>
  );
};

export default AddonExhaustedModal;
