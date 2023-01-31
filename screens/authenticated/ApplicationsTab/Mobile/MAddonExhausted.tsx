/* eslint-disable react/require-default-props */
import {
  Button, Col, Modal, Row, Typography,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import Link from 'next/link';
import React from 'react';
import { pushClevertapEvent } from 'utils/clevertap';

require('screens/authenticated/ApplicationsTab/Desktop/AddonExhausted.less');

const { Paragraph, Text } = Typography;
interface propsI {
  visible:boolean;
  title:string;
  description?: string;
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
      width={310}
    >
      <Row align="middle">
        <Row
          className="modal-section-image"
          style={{ backgroundColor: 'black', width: '100%' }}
        >

          <Col offset={1} style={{ display: 'flex' }}>
            <Paragraph
              style={{
                fontSize: '18px',
                fontWeight: 'bold',
                textAlign: 'start',
                paddingTop: '6rem',

              }}
            >
              {title}
            </Paragraph>
            <CustomImage
              src="/images/application-tab/m-addons-exhaust.svg"
              alt="Unverified Email"
              width={184}
              height={171}
            />
          </Col>
        </Row>
        <Row
          className="modal-section-actions text-center"
          style={{ width: '100%', marginLeft: '0px', marginTop: '-2px' }}
        >
          <Paragraph
            className="modal-upgrade-btn"
          >
            {
              description || (
                <Text>
                  Upgrade your plan, or buy add ons
                  {' '}
                  <br />
                  {' '}
                  to get more unlock credits
                </Text>
              )
            }
          </Paragraph>
          <Paragraph
            style={{ paddingLeft: '3rem', paddingBottom: '2rem' }}
          >
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
        </Row>
      </Row>
    </Modal>
  );
};

export default AddonExhaustedModal;
