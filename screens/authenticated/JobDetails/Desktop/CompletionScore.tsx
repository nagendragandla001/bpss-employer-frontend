import {
  Card, Col, Progress, Row, Typography,
} from 'antd';
import React from 'react';
import { IJobPost } from 'common/jobpost.interface';

const { Text } = Typography;

interface ICompletionScore {
  job: IJobPost
}

const CompletionScore = (props: ICompletionScore): JSX.Element => {
  const { job } = props;
  return (
    <Card
      className="jd-score-card"
      title={<Text className="text-semibold">Job Completion</Text>}
      extra={(
        <Text className="text-semibold text-medium">
          {`${Math.ceil(job?.completionScore || 0)}%`}
        </Text>
      )}
    >
      <Row>
        <Col span={24}>
          <Progress
            percent={Math.ceil(job?.completionScore || 0)}
            showInfo={false}
            strokeWidth={4}
            success={{
              percent: Math.ceil(job?.completionScore || 0),
              strokeColor: '#7353DD',
            }}
          />
        </Col>
        <Col span={24} className="score-info text-small">
          Created on:
          {' '}
          {job?.created}
        </Col>
        <Col span={24} className="score-info text-small">
          Last Modified on:
          {' '}
          {job?.modified}
        </Col>
      </Row>

    </Card>
  );
};

export default CompletionScore;
