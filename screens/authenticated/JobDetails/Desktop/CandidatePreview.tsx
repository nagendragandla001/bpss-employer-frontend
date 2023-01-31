import {
  Col, Divider, Drawer, Row, Space, Typography,
} from 'antd';
import { IJobPost } from 'common/jobpost.interface';
import CustomImage from 'components/Wrappers/CustomImage';
import config from 'config';
import React from 'react';

const { Text } = Typography;

interface IProps{
  job: IJobPost;
  candidatePreviewVisible: boolean;
  setCandidatePreviewVisible: (value: boolean) => void;
}

const CandidatePreview = (props: IProps) : JSX.Element => {
  const { job, candidatePreviewVisible, setCandidatePreviewVisible } = props;
  return (
    <Drawer
      title="Job Preview for candidate"
      placement="right"
      width="670px"
      onClose={():void => { setCandidatePreviewVisible(false); }}
      visible={candidatePreviewVisible}
    >
      <Row justify="center" align="middle" className="p-top-md">
        <Col style={{ position: 'fixed', top: '100px' }}>
          <CustomImage
            src="/images/job-details/candidate-mobile-frame.png"
            alt="mobile frame"
            height={660}
            width={360}
          />
        </Col>
        <Col style={{
          position: 'fixed', top: '145px', height: '560px', width: '330px',
        }}
        >
          <iframe
            title="pdf viwer"
            // onLoad={iframeLoaded}
            // onError={updateIframeSrc}
            // ref={iframeRef}
            src={`${config.AJ_URL}job/${job?.slug}/${job?.id}/?preview=true`}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
          />
        </Col>
      </Row>
    </Drawer>
  );
};

export default CandidatePreview;
