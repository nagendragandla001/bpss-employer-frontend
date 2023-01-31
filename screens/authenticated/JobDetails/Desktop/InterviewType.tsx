import { Space, Card, Typography } from 'antd';
import { IJobPost } from 'common/jobpost.interface';
import CustomImage from 'components/Wrappers/CustomImage';
import React from 'react';

const { Text } = Typography;

interface IInterviewType {
  job: IJobPost
}
const InterviewType = (props: IInterviewType): JSX.Element => {
  const { job } = props;

  return (
    <Card className="jd-side-layout-card">
      {
        job?.clientApprovalRequired ? (
          <Space align="center">
            <CustomImage
              src="/images/job-details/walk-in-job.svg"
              width={48}
              height={48}
              alt="call-hr"
            />
            <Text className="text-medium text-bold">Direct Interviews Allowed</Text>
            <CustomImage
              src="/images/job-details/jd-callhr-tick.svg"
              width={24}
              height={24}
              alt="call-hr"
            />
          </Space>
        ) : (
          <Space align="center">
            <CustomImage
              src="/images/job-details/car-job.png"
              width={27}
              height={27}
              alt="car-job"
            />
            <Text className="text-medium text-semibold">Candidate shortlisting mandatory</Text>
          </Space>
        )
      }
    </Card>
  );
};
export default InterviewType;
