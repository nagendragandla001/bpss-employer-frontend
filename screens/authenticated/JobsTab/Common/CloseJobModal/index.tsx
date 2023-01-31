import CloseOutlined from '@ant-design/icons/CloseOutlined';
import {
  Button, Col, Modal, Row, Typography,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import React, { useState } from 'react';
import { changeJobState } from 'screens/authenticated/JobDetails/Common/JobDetails.service';
import { pushClevertapEvent } from 'utils/clevertap';
import { IJobsTabDispatch } from '../JobsTabUtils';

const { Text } = Typography;

interface PropsInterface{
  setCloseJobModalFlag: (closeJobModalFlag: boolean)=>void;
  closeJobId: string | null;
  refresh: boolean;
  // setRefresh: (refresh: boolean) => void;
  dispatch: (data: IJobsTabDispatch) =>void;
}

const CloseJobModal = (props: PropsInterface) : JSX.Element => {
  const {
    setCloseJobModalFlag, closeJobId, refresh, dispatch,
  } = props;
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

  const closeJobHandler = async (): Promise<void> => {
    setButtonLoading(true);
    const res = await changeJobState(closeJobId, 'close');
    if ([200, 201, 202].indexOf(res.status) > -1) {
      setCloseJobModalFlag(false);
      // setRefresh(!refresh);
      dispatch({
        type: 'UPDATEJOBSTABSTATE',
        payload: {
          refresh: !refresh,
        },
      });
    }
    setButtonLoading(false);
  };
  return (
    <Modal
      title={null}
      footer={null}
      visible
      closable
      keyboard={false}
      className="unverified-email-modal"
      width="750px"
      onCancel={(): void => setCloseJobModalFlag(false)}
      closeIcon={<CloseOutlined className="text-white" />}
    >
      <Row align="stretch" justify="space-between">
        <Col
          xs={{ span: 0, offset: 0 }}
          md={{ span: 14, offset: 0 }}
          // className="p-all-16"
          style={{ padding: 30 }}
        >
          <Row justify="center">
            <Col span={16}>
              <Row gutter={[16, 16]}>
                <Col>
                  <Text strong className="text-extra-base">Sure you want to close this job?</Text>
                </Col>
                <Col>
                  <Text type="secondary" className="text-small">It will stop showing the job to candidates and this action cannot be undone</Text>
                </Col>
                <Col span={24}>
                  <Row>
                    <Col span={12}>
                      <Button
                        type="primary"
                        className="full-width text-bold br-4"
                        onClick={():void => {
                          pushClevertapEvent('Close job popup', { Type: 'Cancel' });
                          setCloseJobModalFlag(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </Col>
                    <Col span={12}>
                      <Button
                        type="link"
                        className="text-bold"
                        onClick={async () : Promise<void> => {
                          pushClevertapEvent('Close job popup', { Type: 'Close job' });
                          closeJobHandler();
                        }}
                        loading={buttonLoading}
                      >
                        Close the job

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
              <Text strong className="text-extra-base">Sure you want to close this job?</Text>
            </Col>
            <Col
              xs={{ span: 11, offset: 0 }}
              md={{ span: 24, offset: 0 }}
            >
              <CustomImage
                src="/images/jobs-tab/close-job-image.svg"
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
          style={{ padding: 15 }}
        >
          <Row justify="center">
            <Col span={16}>
              <Row gutter={[16, 16]}>
                <Col>
                  <Text type="secondary" className="text-small">It will stop showing the job to candidates and this action cannot be undone</Text>
                </Col>
                <Col span={24}>
                  <Row>
                    <Col span={12}>
                      <Button
                        type="primary"
                        className="full-width text-bold br-4"
                        onClick={():void => {
                          pushClevertapEvent('Close job popup', { Type: 'Cancel' });
                          setCloseJobModalFlag(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </Col>
                    <Col span={12}>
                      <Button
                        type="link"
                        className="text-bold"
                        onClick={async () : Promise<void> => {
                          pushClevertapEvent('Close job popup', { Type: 'Close job' });
                          closeJobHandler();
                        }}
                        loading={buttonLoading}
                      >
                        Close the job

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

export default CloseJobModal;
