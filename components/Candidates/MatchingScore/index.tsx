import {
  CheckCircleFilled,
  CloseCircleFilled,
  InfoCircleFilled,
} from '@ant-design/icons';
import {
  Col, Collapse, Row, Space, Typography,
} from 'antd';
import { eduMapToName } from 'constants/enum-constants';
import React from 'react';
import { pushClevertapEvent } from 'utils/clevertap';
import { CMSInterface } from 'screens/authenticated/ApplicationsTab/Common/ApplicationTabUtils';

require('components/Candidates/MatchingScore/MatchingScore.less');

const { Panel } = Collapse;
const { Text, Paragraph } = Typography;

interface CMSProps {
  name: string;
  label: string;
  status: string;
}

interface MatchingScoreInterface {
  cms: CMSInterface;
}

const MatchingScore = (props: MatchingScoreInterface): JSX.Element => {
  const { cms } = props;

  const handleChange = (value): void => {
    if (value.length > 0 && cms) {
      pushClevertapEvent('Open cms view', {
        Value: cms?.score,
        cms_match: cms?.score,
      });
    }
  };

  const CandidateMatchingRequirements = ({ name, label, status }: CMSProps): JSX.Element => (
    <Space direction="horizontal">
      {status === 'matched' && <CheckCircleFilled style={{ color: '#008A62' }} />}
      {status === 'un_matched' && <CloseCircleFilled style={{ color: '#A51616' }} />}
      {status === 'no_data' && <InfoCircleFilled style={{ color: '#C7C7C7' }} />}
      <Text className="text-disabled text-small">{label}</Text>
    </Space>
  );

  const getLabel = (type, name): string => {
    if (type === 'education') {
      return eduMapToName(name);
    }
    if (type === 'experience') {
      return `${(name[0] || 0) / 12}yrs to ${(name[1] || 0) / 12}yrs experience`;
    }

    return name;
  };

  return (
    <Row className="matching-score-container" align="middle">
      <Col span={24}>
        <Collapse
          expandIconPosition="end"
          className="br-4"
          onChange={handleChange}
        >
          <Panel
            key="1"
            header={(
              <Row align="middle">
                <Col span={8}>
                  <Space>
                    <Text>Profile match</Text>
                  </Space>
                </Col>
                <Col span={8} className="text-note text-small">Required criteria</Col>
                <Col span={8} className="text-note text-small">Documents/assets</Col>
              </Row>
            )}
          >
            {
              (cms?.documents_and_assets?.length === 0 && cms?.required_criteria?.length === 0) ? (
                <Row align="middle">
                  <Col span={24}>
                    <Space>
                      <Paragraph className="text-disabled">
                        No requirements added in Job Posting form for calculation
                        of Profile Match Score.
                      </Paragraph>
                    </Space>
                  </Col>
                </Row>
              ) : (
                <Row justify="center">
                  <Col span={8} offset={8}>
                    <Space direction="vertical">
                      {
                        cms?.required_criteria?.map((req) => (
                          <CandidateMatchingRequirements
                            name={req.type}
                            label={getLabel(req.type, req.name)}
                            status={req.status}
                            key={req.type}
                          />
                        ))
                      }
                    </Space>
                  </Col>
                  <Col span={8}>
                    <Space direction="vertical">
                      {
                        cms?.documents_and_assets?.map((req) => (
                          <CandidateMatchingRequirements
                            name={req.type}
                            label={getLabel(req.type, req.name)}
                            status={req.status}
                            key={req.type}
                          />
                        ))
                      }
                    </Space>
                  </Col>
                </Row>
              )
            }
          </Panel>
        </Collapse>
      </Col>
    </Row>
  );
};

export default MatchingScore;
