import {
  Card, Col, FormInstance, Row,
} from 'antd';
import { IJobPost } from 'common/jobpost.interface';
import React, { useEffect, useState } from 'react';
import { getPOCManagers } from 'service/organization-service';

export interface IJobReviewJobDetails {
  job: IJobPost
  form: FormInstance
  updateJob: (value) => void;
}

interface IManagerList{
  managerId: string;
  name: string;
  mobile: string;
}

const PocReview = (props: IJobReviewJobDetails): JSX.Element => {
  const {
    job, form, updateJob,
  } = props;
  const [state, setState] = useState({
    visible: false,
    editButtonVisible: false,
  });
  const [managers, setManagers] = useState<Array<IManagerList>>([]);

  const getManagers = async (orgId: string) : Promise<void> => {
    if (orgId) {
      const response = await getPOCManagers(orgId);
      if ([200, 201, 202].includes(response.status)) {
        const managerList = response?.data?.map((manager) => (
          {
            name: `${manager?.user?.first_name} ${manager?.user?.last_name}`,
            mobile: manager?.user?.mobile,
            managerId: manager?.id,
          }
        ));
        setManagers(managerList);
        if (managerList?.length > 1) {
          setState((prevState) => ({
            ...prevState,
            editButtonVisible: true,
          }));
        }
      }
    }
  };

  useEffect(() => {
    if (job) {
      getManagers(job?.orgId);
    }
  }, [job]);

  return (
    <Card
      title="Job Coordinator"
      className="review-job-card"
      bordered={false}
    >
      <Row gutter={[0, 10]}>
        <Col span={24}>
          <Row>
            <Col className="feature-name" xs={{ span: 10 }} lg={{ span: 6 }}>POC Details</Col>
            <Col xs={{ span: 12 }} lg={{ span: 18 }}>{`${job?.pointOfContacts?.name}${job?.pointOfContacts?.mobile ? `, ${job?.pointOfContacts?.mobile}` : ''}`}</Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );
};

export default PocReview;
