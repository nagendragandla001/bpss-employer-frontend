import {
  Button,
  Card,
  Col, FormInstance, Row, Typography,
} from 'antd';
import { IJobPost } from 'common/jobpost.interface';
import CustomImage from 'components/Wrappers/CustomImage';
import React, { useState } from 'react';
import { pushClevertapEvent } from 'utils/clevertap';
import SalaryReviewModal from './SalaryReviewModal';

const { Paragraph } = Typography;

export interface IJobReviewJobDetails {
  job: IJobPost;
  form: FormInstance;
  updateJob: (value) => void;
  jobPosting?:boolean;
  isNewUser?:boolean;
}

const SalaryReview = (props: IJobReviewJobDetails): JSX.Element => {
  const {
    job, form, updateJob, jobPosting, isNewUser,
  } = props;
  const [visible, setVisible] = useState(false);

  const updateVisbleHandler = (): void => {
    setVisible(false);
  };

  const salarySubmitHandler = (data): void => {
    updateJob(data);
    setVisible(false);
  };

  const handleEditSalaryDetails = (): void => {
    setVisible(true);
    if (!jobPosting) { pushClevertapEvent('Special Click', { Type: 'Edit Job Details' }); }
  };

  return (
    <Card
      title="Salary &amp; Work Hours"
      className="review-job-card"
      bordered={false}
      extra={job?.state !== 'J_C' && (
        <Button
          type="link"
          icon={<CustomImage src="/images/job-details/jd-edit.svg" width={18} height={18} alt="edit" />}
          onClick={handleEditSalaryDetails}
          className="ct-edit-btn"
        />
      )}
    >
      <Row gutter={[0, 10]}>
        <Col span={24}>
          <Row>
            <Col className="feature-name" xs={{ span: 10 }} lg={{ span: 6 }}>In hand Salary</Col>
            <Col xs={{ span: 12 }} lg={{ span: 18 }}>
              <Paragraph>{`₹${job?.minOfferedSalary} To ₹${job?.maxOfferedSalary} per month`}</Paragraph>
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <Row>
            <Col className="feature-name" xs={{ span: 10 }} lg={{ span: 6 }}>Working Days</Col>
            <Col xs={{ span: 12 }} lg={{ span: 18 }}>{`${job?.workDays?.length} per week`}</Col>
          </Row>
        </Col>
        <Col span={24}>
          <Row>
            <Col className="feature-name" xs={{ span: 10 }} lg={{ span: 6 }}>Shift Timings</Col>
            <Col xs={{ span: 12 }} lg={{ span: 18 }}>{job?.shiftStartTime ? `${job?.shiftStartTime} - ${job?.shiftEndTime}` : ''}</Col>
          </Row>
        </Col>
      </Row>
      {
        visible && (
          <SalaryReviewModal
            visible={visible}
            form={form}
            job={job}
            onClose={updateVisbleHandler}
            onSubmit={salarySubmitHandler}
            isNewUser={isNewUser as boolean}
          />
        )
      }
    </Card>
  );
};

export default SalaryReview;
