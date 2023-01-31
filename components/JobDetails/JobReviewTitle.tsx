import {
  Row, Col, Typography, Space, Button, FormInstance,
} from 'antd';
import { IJobPost } from 'common/jobpost.interface';
import CustomImage from 'components/Wrappers/CustomImage';
import React, { useState } from 'react';
import JobReviewTitleModal from './JobReviewTitleModal';

const { Title } = Typography;

export interface IJobReviewTitle {
  job: IJobPost;
  form: FormInstance;
  orgDetails: any;
  updateJob: (data) => void;
  isNewUser?: boolean;
}

const JobReviewTitle = (props: IJobReviewTitle): JSX.Element => {
  const {
    job, form, updateJob, orgDetails, isNewUser,
  } = props;
  const [visible, setVisible] = useState(false);

  const titleSubmitHandler = async (formData): Promise<void> => {
    updateJob(formData);
    setVisible(false);
  };

  return (
    <Row>
      <Col span={24}>
        <Space>
          <Title level={4}>
            {job?.title}
          </Title>
          {
            job?.state !== 'J_C' && (
              <Button
                type="link"
                icon={(
                  <CustomImage
                    src="/images/job-details/jd-edit.svg"
                    width={18}
                    height={18}
                    alt="edit"
                  />
                )}
                className="ct-edit-btn"
                onClick={(): void => setVisible(true)}
              />
            )
          }
        </Space>
        <Title className="review-company-name" level={5}>{job?.hiringOrgName || job?.organizationPopularName}</Title>
      </Col>
      {
        visible && (
          <JobReviewTitleModal
            visible={visible}
            job={job}
            form={form}
            orgType={orgDetails?.type}
            onClose={(): void => setVisible(false)}
            onSubmit={titleSubmitHandler}
            isNewUser={isNewUser as boolean}
          />
        )
      }
    </Row>
  );
};

export default JobReviewTitle;
