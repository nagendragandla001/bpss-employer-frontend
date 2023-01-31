import {
  Button,
  Card, Col, FormInstance, Row,
} from 'antd';
import { IJobPost } from 'common/jobpost.interface';
import CustomImage from 'components/Wrappers/CustomImage';
import { constants } from 'constants/enum-constants';
import React, { useState } from 'react';
import { createMarkup, JobDetailsType } from 'screens/authenticated/JobDetails/Common/JobDetails.utils';
import { pushClevertapEvent } from 'utils/clevertap';
import BasicDetailsReviewModal from './BasicDetailsReviewModal';

export interface IJobReviewJobDetails {
  job: IJobPost;
  form: FormInstance;
  updateJob: (value) => void;
  jobPosting?:boolean;
  isNewUser?: boolean;
}

const BasicDetailsReview = (props: IJobReviewJobDetails): JSX.Element => {
  const {
    job, form, updateJob, jobPosting, isNewUser,
  } = props;
  const [state, setState] = useState({
    visible: false,
  });

  const handleEditBasicDetails = (): void => {
    if (!jobPosting) { pushClevertapEvent('Special Click', { Type: 'Edit Job Details' }); }
    setState((prev) => ({
      ...prev,
      visible: true,
    }));
  };

  const updateVisbleHandler = (): void => {
    setState((prev) => ({
      ...prev,
      visible: false,
    }));
  };

  const basicDetailsSubmitHandler = (data): void => {
    updateJob(data);
    setState((prev) => ({
      ...prev,
      visible: false,
    }));
  };

  return (
    <Card
      title="Job details"
      className="review-job-card"
      bordered={false}
      extra={job?.state !== 'J_C' && (
        <Button
          type="link"
          icon={<CustomImage src="/images/job-details/jd-edit.svg" width={18} height={18} alt="edit" />}
          onClick={handleEditBasicDetails}
          className="ct-edit-btn"
        />
      )}
    >
      <Row gutter={[30, 10]}>
        <Col span={24}>
          <Row>
            <Col className="feature-name" xs={{ span: 10 }} lg={{ span: 6 }}>Job Category</Col>
            <Col className="text-disabled" xs={{ span: 12 }} lg={{ span: 18 }}>{job?.functionalArea?.name}</Col>
          </Row>
        </Col>
        <Col span={24}>
          <Row>
            <Col className="feature-name" xs={{ span: 10 }} lg={{ span: 6 }}>Employment Type</Col>
            <Col xs={{ span: 12 }} lg={{ span: 18 }}>{constants[job?.employmentType]}</Col>
          </Row>
        </Col>
        <Col span={24}>
          <Row>
            <Col className="feature-name" xs={{ span: 10 }} lg={{ span: 6 }}>Allow Direct Interviews</Col>
            <Col xs={{ span: 12 }} lg={{ span: 18 }}>{job?.clientApprovalRequired ? 'Yes' : 'No'}</Col>
          </Row>
        </Col>
        <Col span={24}>
          <Row>
            <Col className="feature-name" xs={{ span: 10 }} lg={{ span: 6 }}>Job Description</Col>
            <Col
              xs={{ span: 14 }}
              lg={{ span: 18 }}
              dangerouslySetInnerHTML={
                createMarkup(job?.description)
              }
            />
          </Row>
        </Col>
      </Row>
      {
        state.visible && (
          <BasicDetailsReviewModal
            visible={state.visible}
            form={form}
            job={job}
            onClose={updateVisbleHandler}
            onSubmit={basicDetailsSubmitHandler}
            isNewUser={isNewUser as boolean}
          />
        )
      }
    </Card>
  );
};

export default BasicDetailsReview;
