import {
  Button, Card, Col, FormInstance, Row, Typography,
} from 'antd';
import { IJobPost } from 'common/jobpost.interface';
import CustomImage from 'components/Wrappers/CustomImage';
import React, { useState } from 'react';
import { pushClevertapEvent } from 'utils/clevertap';
import LocationReviewModal from './LocationReviewModel';

const { Paragraph } = Typography;

export interface IJobReviewJobDetails {
  job: IJobPost;
  form: FormInstance;
  updateJob: (value) => void;
  jobPosting?:boolean;
  isNewUser?: boolean;
}

const LocationReview = (props: IJobReviewJobDetails): JSX.Element => {
  const {
    job, form, updateJob, jobPosting, isNewUser,
  } = props;
  const [visible, setVisible] = useState(false);

  const handleEditLocationDetails = (): void => {
    setVisible(true);
    if (!jobPosting) { pushClevertapEvent('Special Click', { Type: 'Edit Job Details' }); }
  };
  const updateVisbleHandler = (): void => {
    setVisible(false);
  };

  const locationSubmitHandler = (data): void => {
    updateJob(data);
    setVisible(false);
  };

  return (
    <Card
      title="Job Location &amp; Openings"
      className="review-job-card"
      bordered={false}
      extra={job?.state !== 'J_C' && (
        <Button
          type="link"
          icon={<CustomImage src="/images/job-details/jd-edit.svg" width={18} height={18} alt="edit" />}
          onClick={handleEditLocationDetails}
          className="ct-edit-btn"
        />
      )}
    >
      <Row gutter={[0, 8]}>
        <Col span={24}>
          <Row>
            <Col className="feature-name" xs={{ span: 10 }} lg={{ span: 6 }}>Job Location(s)</Col>
            <Col xs={{ span: 12 }} lg={{ span: 18 }}>
              <Paragraph>{job?.cityName}</Paragraph>
              <Paragraph key={job?.locality?.value}>{job?.locality?.label}</Paragraph>
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <Row>
            <Col className="feature-name" xs={{ span: 10 }} lg={{ span: 6 }}>Total Openings</Col>
            <Col xs={{ span: 12 }} lg={{ span: 18 }}>{job?.vacancies}</Col>
          </Row>
        </Col>
      </Row>
      {
        visible && (
          <LocationReviewModal
            visible={visible}
            form={form}
            job={job}
            onClose={updateVisbleHandler}
            onSubmit={locationSubmitHandler}
            isNewUser={isNewUser as boolean}
          />
        )
      }
    </Card>
  );
};

export default LocationReview;
