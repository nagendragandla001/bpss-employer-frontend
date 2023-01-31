import React from 'react';
import {
  Row, Col, Typography, Card, Button, Progress,
} from 'antd';
import Router from 'next/router';
import { Waypoint } from 'react-waypoint';
import router from 'routes';
import { pushClevertapEvent } from 'utils/clevertap';
import CustomImage from 'components/Wrappers/CustomImage';
import { JobType } from 'screens/authenticated/JobsTab/Common/JobsTabUtils';
import JobCardSkeleton from 'screens/authenticated/JobsTab/Mobile/Components/jobCardSkeleton';

const { Text, Paragraph } = Typography;

interface PropsModel {
  jobsData: {jobs: Array<JobType>, jobsCount: number;}
  getMoreJobsData: () => void;
  dataLoading: boolean;
}

const DraftJobCard: React.FunctionComponent<PropsModel> = (
  { jobsData, getMoreJobsData, dataLoading }: PropsModel,
) => {
  const handleCompletePosting = (id): void => {
    pushClevertapEvent('Special Click', { Type: 'Complete Posting' });
    Router.push(`/employer-zone/job-posting/edit/${id}/job-specs`);
  };
  return (
    <>
      {
        dataLoading ? (
          <JobCardSkeleton currentTab="drafts" />
        ) : (
          <Row className="jt-mobile-container">
            <Col span={24} className="m-show-results">
              Showing
              {' '}
              {jobsData.jobsCount}
              {' '}
              jobs
            </Col>
            <Col span={24}>
              {
                jobsData.jobs.map((job, index) => (
                  <Card
                    key={job.id}
                    className="m-jt-draft-card"
                    style={{ marginBottom: 16 }}
                    actions={[
                      <Row justify="space-between">
                        <Col span={12}>
                          <Row justify="start" style={{ textAlign: 'left', paddingLeft: 8 }}>
                            <Col span={24} className="m-jt-draft-label">You were editing</Col>
                            <Col span={24} className="m-jt-draft-page">Basic Job Details</Col>
                          </Row>
                        </Col>
                        <Col span={12} className="text-right">
                          <Button
                            key="complete_posting"
                            className="m-jt-draft-btn"
                            onClick={(): void => handleCompletePosting(job.id)}
                            type="primary"
                          >
                            Complete Posting
                          </Button>
                        </Col>
                      </Row>,

                    ]}
                  >
                    <Row>
                      <Col span={24}>
                        <Text className="m-jt-draft-label text-semibold">
                          DRAFT
                          <CustomImage src="/images/jobs-tab/m-edit.svg" width={24} height={24} alt="Draft" />
                        </Text>
                      </Col>
                      <Col span={24}>
                        <Button
                          type="link"
                          className="title-container p-all-0"
                          onClick={(): void => {
                            router.Router.pushRoute(`employer-zone/jobs/${job.id}/`);
                          }}
                        >
                          <Paragraph
                            ellipsis
                            className="text-large font-bold text-capitalize m-jt-card-title"
                          >
                            {job.title}
                          </Paragraph>
                        </Button>
                      </Col>
                      <Col span={24}>
                        <Text className="m-jt-card-subtitle">
                          Last updated on
                          {' '}
                          {job.lastUpdated}
                        </Text>
                      </Col>
                      <Col span={24}>
                        <Progress success={{ percent: 30 }} size="small" showInfo={false} className="m-job-progress" />
                      </Col>
                    </Row>
                    {index === (jobsData.jobs.length - 1)
                      ? <Waypoint onEnter={():void => getMoreJobsData()} /> : null}
                  </Card>
                ))
              }
            </Col>
          </Row>
        )
      }
    </>

  );
};

export default React.memo(DraftJobCard);
