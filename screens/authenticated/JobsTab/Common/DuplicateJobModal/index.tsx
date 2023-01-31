import { CloseOutlined } from '@ant-design/icons';
import {
  Button, Col, Modal, Row, Typography,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import React from 'react';
import { pushClevertapEvent } from 'utils/clevertap';
import router from 'routes';

const { Text } = Typography;

interface PropsInterface{
  setDuplicateJobModalFlag: (duplicateJobModalFlag: boolean)=>void;
  duplicateJobId: string | null;
}

const DuplicateJobModal = (props: PropsInterface) : JSX.Element => {
  const {
    setDuplicateJobModalFlag, duplicateJobId,
  } = props;
  return (
    <Modal
      title={null}
      footer={null}
      visible
      closable
      keyboard={false}
      className="unverified-email-modal"
      width="750px"
      onCancel={(): void => setDuplicateJobModalFlag(false)}
      closeIcon={<CloseOutlined className="text-white" />}
    >
      <Row align="stretch" justify="space-between">
        <Col
          xs={{ span: 0, offset: 0 }}
          md={{ span: 14, offset: 0 }}
          // className="p-all-16"
          style={{ padding: 25 }}
        >
          <Row justify="center">
            <Col xs={{ span: 20 }} md={{ span: 16 }}>
              <Row gutter={[16, 16]}>
                <Col>
                  <Text strong className="text-extra-base">Do you want to duplicate the job?</Text>
                </Col>
                <Col>
                  <Text type="secondary" className="text-small">All details will be copied from this job</Text>
                </Col>
                <Col span={24}>
                  <Row justify="space-between">
                    <Col span={6}>
                      <Button
                        type="link"
                        className="text-bold"
                        onClick={():void => {
                          pushClevertapEvent('Duplicate job popup', { Type: 'Cancel' });
                          setDuplicateJobModalFlag(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </Col>
                    <Col span={16}>
                      <Button
                        type="primary"
                        className="full-width text-bold br-4"
                        onClick={async () : Promise<void> => {
                          pushClevertapEvent('Duplicate job popup', { Type: 'Confirm' });
                          router.Router.pushRoute(
                            'NewJobPosting',
                            { duplicateId: duplicateJobId },
                          );
                        }}
                      >
                        Duplicate job and review

                      </Button>
                    </Col>
                  </Row>
                </Col>
              </Row>

            </Col>
          </Row>

        </Col>

        <Col
          xs={{ span: 24, offset: 0 }}
          md={{ span: 10, offset: 0 }}
          className="modal-section-image"
        >
          <Row justify="center">
            <Col
              xs={{ span: 11, offset: 0 }}
              md={{ span: 0, offset: 0 }}
            >
              <Text strong className="text-extra-base">Do you want to duplicate the job?</Text>
            </Col>
            <Col
              xs={{ span: 11, offset: 0 }}
              md={{ span: 24, offset: 0 }}
            >
              <CustomImage
                src="/images/jobs-tab/duplicate-job-image.svg"
                alt="Close Job Confirmation"
                height={110}
                width={169}
              />
            </Col>
          </Row>

        </Col>
        <Col
          xs={{ span: 24, offset: 0 }}
          md={{ span: 0, offset: 0 }}
          // className="p-all-16"
          style={{ padding: 20 }}
        >
          <Row justify="center">
            <Col xs={{ span: 24 }} md={{ span: 16 }}>
              <Row gutter={[16, 16]}>
                <Col>
                  <Text type="secondary" className="text-small">All details will be copied from this job</Text>
                </Col>
                <Col span={24}>
                  <Row justify="space-between">

                    <Col span={16}>
                      <Button
                        type="primary"
                        className="full-width text-bold br-4"
                        onClick={async () : Promise<void> => {
                          pushClevertapEvent('Duplicate job popup', { Type: 'Confirm' });
                          router.Router.pushRoute(
                            'NewJobPosting',
                            { duplicateId: duplicateJobId },
                          );
                        }}
                      >
                        Duplicate job and review

                      </Button>
                    </Col>
                    <Col span={6}>
                      <Button
                        type="link"
                        className="text-bold"
                        onClick={():void => {
                          pushClevertapEvent('Duplicate job popup', { Type: 'Cancel' });
                          setDuplicateJobModalFlag(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </Col>
                  </Row>
                </Col>
              </Row>

            </Col>
          </Row>

        </Col>
      </Row>
    </Modal>
  );
};

export default DuplicateJobModal;
