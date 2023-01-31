import {
  Button, Col, Row, Space, Typography,
} from 'antd';
import { IJobPost } from 'common/jobpost.interface';
import React, { useMemo } from 'react';
import config from 'config';
import { pushClevertapEvent } from 'utils/clevertap';
import { setUrlParams } from 'service/url-params-service';
import { useLazyQuery } from '@apollo/client';
import { findRecommendedCandidatesForEmployerCount } from 'screens/authenticated/ApplicationsTab/Desktop/recommendedApiQuery';
import CustomImage from 'components/Wrappers/CustomImage';

const { Text } = Typography;

interface IJobDetailsCTA {
  job: IJobPost;
  candidatePreviewVisible: boolean;
  setCandidatePreview : (value: boolean) => void;
}

const JobDetailsCTA = (props: IJobDetailsCTA): JSX.Element => {
  const {
    job, candidatePreviewVisible, setCandidatePreview,
  } = props;

  const [fetchGraphqlData, {
    data,
  }] = useLazyQuery(findRecommendedCandidatesForEmployerCount, {
    fetchPolicy: 'network-only',
    // errorPolicy: 'ignore',
  });

  const handleViewApplications = (key): void => {
    pushClevertapEvent('Special Click', { Type: 'View Applications' });
    setUrlParams([{ job: job.id, tab: key }]);
  };

  useMemo(() => {
    if (job?.state === 'J_O' && job?.stage === 'J_A') {
      fetchGraphqlData({
        variables: {
          job_id: job?.id,
          first: 0,
          after: 0,
        },
      });
    }
  }, [job?.id]);

  return (
    <Row className="jd-cta">
      <Col>
        <Space>
          {
            (job?.state === 'J_O' && job?.stage === 'J_A') && (
              <Button
                target="blank"
                // type="primary"
                className="jd-desktop-preview-application"
                // href={`${config.AJ_URL}job/${job?.slug}/${job?.id}`}
                onClick={():void => {
                  setCandidatePreview(!candidatePreviewVisible);
                  pushClevertapEvent('Special Click', { Type: 'Candidate Preview' });
                }}
              >
                <CustomImage
                  src="/images/job-details/preview-job-icon.png"
                  alt="preview job icon"
                />
                &nbsp;
                Preview Job
              </Button>
            )
          }
          <Button
            className="jd-desktop-preview-application"
            disabled={job?.totalApplications === 0}
            onClick={(): void => handleViewApplications('applications')}
          >
            View Applications
            <Text className="jd-subheading">
              {' '}
              <span className="jd-total-app">{job?.totalApplications}</span>
            </Text>
          </Button>
          {
            (job?.state === 'J_O' && job?.stage === 'J_A') && (
              <Button
                className="jd-desktop-preview-application"
                onClick={(): void => handleViewApplications('database')}
                disabled={data?.findRecommendedCandidatesForEmployer?.totalCount === 0}
              >
                View Database
                <Text className="jd-subheading">
                  {' '}
                  <span className="jd-total-app">
                    {(data?.findRecommendedCandidatesForEmployer?.totalCount) || 0}
                  </span>
                </Text>
              </Button>
            )
          }
        </Space>
      </Col>
    </Row>
  );
};

export default JobDetailsCTA;
