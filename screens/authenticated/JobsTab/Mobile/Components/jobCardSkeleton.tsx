import React from 'react';
import {
  Row, Col, Skeleton, Card, Button, Typography, Badge, Progress,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';

const { Text } = Typography;

type PropsModel = {
  currentTab: string
}

const jobs = [1, 2];

const stages = ['Applied', 'Interviews', 'Selections'];

const JobCardSkeleton = ({ currentTab }: PropsModel): JSX.Element => (
  <Row className="jt-mobile-container">
    <Col span={24} className="m-show-results">
      Showing
      {' '}
      <Skeleton.Button style={{ width: 30, height: 20 }} active />
      {' '}
      jobs
    </Col>
    {
      currentTab !== 'drafts' ? (
        <Col span={24}>
          {jobs && jobs.map((job) => (
            <Card
              key={Math.random()}
              className="m-jt-card"
              style={{ marginBottom: 16 }}
              actions={[
                <Button
                  key="edit"
                  className="text-bold"
                  type="link"
                  disabled
                  icon={<CustomImage src="/images/jobs-tab/m-edit.svg" width={24} height={24} alt="edit" />}
                >
                  Edit
                  {/* <span className="align-super">Edit</span> */}
                </Button>,
                <>
                  {
                    currentTab === 'open'
                      ? (
                        <Button disabled key="share" className="text-bold" type="link" icon={<CustomImage src="/images/jobs-tab/m-share.svg" width={24} height={24} alt="share" />}>
                          Share
                          {/* <span className="align-super">Share</span> */}
                        </Button>
                      )
                      : <div />
                  }
                </>,
              ]}
            >
              <Row>
                <Col span={24}>
                  <Skeleton.Input style={{ width: 100, height: 20 }} active size="small" />
                </Col>
                <Col span={24}>
                  <Skeleton.Input style={{ width: 300, height: 20, marginTop: 8 }} active size="small" />
                </Col>
                <Col span={24}>
                  <Skeleton.Input style={{ width: 300, height: 20, marginTop: 8 }} active size="small" />
                </Col>
                <Col span={24} className="m-jt-total-applications">
                  <Text className="m-jt-card-subtitle">
                    Total Applications:
                    {' '}
                    <span className="text-bold"><Skeleton.Button style={{ width: 30, height: 20 }} active /></span>
                    {' '}
                  </Text>
                </Col>
                <Col span={24} style={{ marginBottom: 16 }}>
                  {
                    stages.map((stage) => (
                      <Badge className="m-jt-application" key={stage}>
                        <Row justify="center" align="middle" className="text-center">
                          <Col span={24} className="m-jt-application-label">{stage}</Col>
                          <Col
                            span={24}
                            className="m-jt-application-count"
                          >
                            <Skeleton.Button style={{ width: 30, height: 20 }} active />
                          </Col>
                        </Row>
                      </Badge>
                    ))
                  }
                </Col>
              </Row>

            </Card>
          ))}
        </Col>
      ) : (
        <Col span={24}>
          {jobs && jobs.map((job) => (
            <Card
              key={job}
              className="m-jt-draft-card"
              style={{ marginBottom: 16 }}
              actions={[
                <Row justify="space-between">
                  <Col span={12}>
                    <Row justify="start" style={{ textAlign: 'left', paddingLeft: 8 }}>
                      <Col span={24} className="m-jt-draft-label">You were editing</Col>
                      <Col span={24} className="m-jt-draft-page"><Skeleton.Input style={{ width: 150, height: 20 }} active size="small" /></Col>
                    </Row>
                  </Col>
                  <Col span={12} className="text-right">
                    <Button
                      key="complete_posting"
                      className="m-jt-draft-btn"
                      type="primary"
                      disabled
                    >
                      Complete Posting
                    </Button>
                  </Col>
                </Row>,
              ]}
            >
              <Row>
                <Col span={24} className="text-disabled text-bold">
                  DRAFT
                </Col>
                <Col span={24}>
                  <Skeleton.Input style={{ width: 200, height: 20, marginTop: 8 }} active size="small" />
                </Col>
                <Col span={24}>
                  <Skeleton.Input style={{ width: 200, height: 20, marginTop: 8 }} active size="small" />
                </Col>
                <Col span={24} style={{ marginBottom: 16 }}>
                  <Progress size="small" showInfo={false} className="m-job-progress" />
                </Col>
              </Row>

            </Card>
          ))}
        </Col>
      )
    }

  </Row>
);

export default JobCardSkeleton;
