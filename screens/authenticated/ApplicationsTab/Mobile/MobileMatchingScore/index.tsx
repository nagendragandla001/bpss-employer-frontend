import {
  CheckCircleFilled, CloseCircleFilled, InfoCircleFilled, InfoCircleOutlined, RightOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card, Col, Row, Space, Typography,
} from 'antd';
import Modal from 'antd/lib/modal/Modal';
import { eduMapToName } from 'constants/enum-constants';
import React, { useState } from 'react';
import { CMSInterface } from 'screens/authenticated/ApplicationsTab/Common/ApplicationTabUtils';
import { pushClevertapEvent } from 'utils/clevertap';

require('screens/authenticated/ApplicationsTab/Mobile/MobileMatchingScore/MobileMatchingScore.less');

const { Text, Paragraph } = Typography;

interface IMobileMatchingScore {
  cms: CMSInterface;
  name: string;
}

interface ModalProps {
  onModalCancel: () => void;
  visible: boolean;
}

interface CMSProps {
  label: string;
  status: string;
}

interface IProfileMatchingScoreModal {
  onModalCancel: () => void;
  visible: boolean;
  cms: CMSInterface;
  name: string;
}

const CandidateMatchingRequirements = ({ label, status }: CMSProps): JSX.Element => (
  <Space direction="horizontal">
    {status === 'matched' && <CheckCircleFilled style={{ color: '#008A62' }} />}
    {status === 'un_matched' && <CloseCircleFilled style={{ color: '#A51616' }} />}
    {status === 'no_data' && <InfoCircleFilled style={{ color: '#C7C7C7' }} />}
    <Text className="text-disabled text-small">{label}</Text>
  </Space>
);

const ProfileMatchingScoreModal = (props: IProfileMatchingScoreModal): JSX.Element => {
  const {
    name, cms, visible, onModalCancel,
  } = props;

  const getLabel = (type, reqName): string => {
    if (type === 'education') {
      return eduMapToName(reqName);
    }
    if (type === 'experience') {
      return `${(reqName[0] || 0) / 12}yrs to ${(reqName[1] || 0) / 12}yrs experience`;
    }

    return reqName;
  };

  return (
    <Modal
      title={(
        <Row align="middle" justify="center" className="text-center">
          <Col span={24}>
            <Text>{`${name}'s profile match`}</Text>
          </Col>
        </Row>
      )}
      visible={visible}
      onCancel={onModalCancel}
      footer={null}
      className="m-matching-score-modal"
    >
      {
        (cms?.documents_and_assets?.length === 0 && cms?.required_criteria?.length === 0) ? (
          <Paragraph className="text-disabled">
            No requirements added in Job Posting form for calculation
            of Profile Match Score.
          </Paragraph>
        ) : (
          <Space direction="vertical">
            {
              cms?.required_criteria?.length > 0 && (
                <Space direction="vertical">
                  <Paragraph className="matching-score-label text-small">Required criteria</Paragraph>
                  <Row gutter={[0, 6]}>
                    {
                      cms?.required_criteria?.map((req) => (
                        <Col span={24} key={Math.random()}>
                          <CandidateMatchingRequirements
                            label={getLabel(req.type, req.name)}
                            status={req.status}
                          />
                        </Col>
                      ))
                    }
                  </Row>
                </Space>
              )
            }
            {
              cms?.documents_and_assets?.length > 0 && (
                <Space direction="vertical">
                  <Paragraph className="matching-score-label text-small">Documents/assets</Paragraph>
                  <Row gutter={[0, 6]}>
                    {
                      cms?.documents_and_assets?.map((req) => (
                        <Col span={24} key={Math.random()}>
                          <CandidateMatchingRequirements
                            label={getLabel(req.type, req.name)}
                            status={req.status}
                          />
                        </Col>
                      ))
                    }
                  </Row>
                </Space>
              )
            }
          </Space>
        )
      }
    </Modal>
  );
};

const MobileMatchingScore = (props: IMobileMatchingScore): JSX.Element => {
  const { cms, name } = props;

  const [openModal, setOpenModal] = useState(false);

  const handleMobileChange = (): void => {
    pushClevertapEvent('Open cms view', {
      Value: cms?.score,
      cms_match: cms?.score,
    });
    setOpenModal(true);
  };

  return (
    <Card className="m-matching-score-container">
      <Row justify="space-between" align="middle" onClick={handleMobileChange}>
        <Col>
          <Space>
            <Text>Profile match</Text>
          </Space>
        </Col>
        <Col><RightOutlined /></Col>
      </Row>
      {
        openModal
          ? (
            <ProfileMatchingScoreModal
              visible={openModal}
              onModalCancel={(): void => setOpenModal(false)}
              name={name}
              cms={cms}
            />
          )
          : null
      }
    </Card>
  );
};

export default MobileMatchingScore;
