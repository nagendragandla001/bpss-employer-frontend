import {
  Button,
  Card,
  Col, Divider, FormInstance, Row, Space, Tag, Typography,
} from 'antd';
import { IJobPost } from 'common/jobpost.interface';
import CustomImage from 'components/Wrappers/CustomImage';
import {
  eduMapToName, gender, proficiencyToName,
} from 'constants/enum-constants';
import React, { useEffect, useState } from 'react';
import { IAssessmentData } from 'screens/authenticated/JobDetails/Common/JobDetails.utils';
import { assessmentInfo } from 'service/job-posting-service';
import { pushClevertapEvent } from 'utils/clevertap';
import CandidateRequirementsReviewModal from './CandidateRequirementsReviewModal';

const { Text } = Typography;

export interface IJobReviewJobDetails {
  job: IJobPost;
  form: FormInstance;
  updateJob: (val) => void;
  jobPosting?:boolean;
  isNewUser?:boolean;
}

const CandidateRequirementReview = (props: IJobReviewJobDetails): JSX.Element => {
  const {
    job, form, updateJob, jobPosting, isNewUser,
  } = props;

  const [visible, setVisible] = useState(false);
  const [assessmentData, setAssessmentData] = useState<Array<IAssessmentData>>([]);

  const convertExperience = (): string => {
    const min = (job?.minExperience || 0) / 12;
    const max = (job?.maxExperience || 0) / 12;
    if (min === 0 && max === 0) {
      return 'Freshers are allowed';
    }
    return `${min}yrs to ${max}yrs`;
  };

  const updateVisbleHandler = (): void => {
    setVisible(false);
  };

  const updateCandidateRequestHandler = (data): void => {
    updateJob(data);
    setVisible(false);
  };

  const getAssessmentInfo = async (faId, orgId, jobState): Promise<void> => {
    const apiRes = await assessmentInfo(faId, orgId);
    if ([200, 201, 202]?.includes(apiRes?.status)) {
      const flatData = apiRes?.data?.map((data) => ({
        id: data?.assessment_id,
        active: data?.active,
        description: data?.assessment_description,
        title: data?.assessment_title,
        skills: data?.skills,
      }));
      setAssessmentData(flatData);
    }
  };

  useEffect(() => {
    if (job && Object?.keys(job)?.length > 0) {
      getAssessmentInfo(job?.functionalArea?.id, job?.orgId, job?.state);
    }
  }, [job]);

  return (
    <Card
      title="Candidate Requirement"
      className="review-job-card"
      bordered={false}
      extra={job?.state !== 'J_C' && (
        <Button
          type="link"
          icon={<CustomImage src="/images/job-details/jd-edit.svg" width={18} height={18} alt="edit" />}
          onClick={(): void => {
            setVisible(true);
            if (!jobPosting) {
              pushClevertapEvent('Special Click', { Type: 'Edit Job Details' });
            }
          }}
          className="ct-edit-btn"
        />
      )}
    >
      <Row gutter={[0, 10]}>
        <Col span={24}>
          <Row>
            <Col xs={{ span: 10 }} lg={{ span: 6 }} className="display-flex flex-align-items-center">
              <CustomImage src="/images/job-details/jd-resume-ic.svg" width={24} height={24} alt="resume" />
              <Text className="feature-name">Resume</Text>
            </Col>
            <Col xs={{ span: 12 }} lg={{ span: 18 }}>{`Resume ${job?.isResumeSubscribed ? 'required' : 'not required'}`}</Col>
          </Row>
        </Col>
        <Divider style={{ margin: '8px 0' }} />
        <Col span={24}>
          <Row>
            <Col xs={{ span: 10 }} lg={{ span: 6 }} className="display-flex flex-align-items-center">
              <CustomImage src="/images/job-details/jd-edu-ic.svg" width={24} height={24} alt="education" />
              <Text className="feature-name">Minimum Education</Text>
            </Col>
            <Col xs={{ span: 12 }} lg={{ span: 18 }}>
              {`${eduMapToName(job?.proficiencyLevel)}`}
              {job?.proficiencyLevel > 0 ? ' required' : ' education requirement'}
            </Col>
          </Row>
        </Col>
        <Divider style={{ margin: '8px 0' }} />
        <Col span={24}>
          <Row>
            <Col xs={{ span: 10 }} lg={{ span: 6 }} className="display-flex flex-align-items-center">
              <CustomImage src="/images/job-details/jd-exp-ic.svg" width={24} height={24} alt="resume" />
              <Text className="feature-name">Experience</Text>
            </Col>
            <Col xs={{ span: 12 }} lg={{ span: 18 }}>
              {convertExperience()}
            </Col>
          </Row>
        </Col>
        <Divider style={{ margin: '8px 0' }} />
        <Col span={24}>
          <Row>
            <Col xs={{ span: 10 }} lg={{ span: 6 }} className="display-flex flex-align-items-center">
              <CustomImage src="/images/job-details/jd-dem-ic.svg" width={24} height={24} alt="resume" />
              <Text className="feature-name">Demography</Text>
            </Col>
            <Col xs={{ span: 12 }} lg={{ span: 18 }}>
              <li className="list-style">{`Gender ${gender(job?.genderPreference)}`}</li>
              <li className="list-style">{`Age ${job?.minPreferredAge}-${job?.maxPreferredAge} yrs`}</li>
            </Col>
          </Row>
        </Col>
        <Divider style={{ margin: '8px 0' }} />
        <Col span={24}>
          <Row>
            <Col xs={{ span: 10 }} lg={{ span: 6 }} className="display-flex flex-align-items-center">
              <CustomImage src="/images/job-details/jd-com-ic.svg" width={24} height={24} alt="resume" />
              <Text className="feature-name">English</Text>
            </Col>
            <Col xs={{ span: 12 }} lg={{ span: 18 }}>
              {`${proficiencyToName(job?.englishProficiency)} English`}
            </Col>
          </Row>
        </Col>
        <Divider />
        <Col span={24}>
          <Row>
            <Col className="display-flex flex-align-items-center" xs={{ span: 10 }} lg={{ span: 6 }}>
              <CustomImage src="/images/job-details/jd-doc-ic.svg" width={24} height={24} alt="resume" />
              <Text className="feature-name">Documents and Assets</Text>
            </Col>
            <Col xs={{ span: 12 }} lg={{ span: 18 }} className="job-tags-container">
              {
                job?.documents?.map((tag) => (
                  <Tag
                    key={tag.id}
                    color="default"
                  >
                    {tag.name}
                  </Tag>
                ))
              }
            </Col>
          </Row>
        </Col>
        {assessmentData?.length > 0 && (
          <>
            <Divider style={{ margin: '8px 0' }} />
            <Col span={24}>
              <Row>
                <Col xs={{ span: 10 }} lg={{ span: 6 }} className="display-flex flex-align-items-center">
                  <CustomImage src="/images/job-details/jd-skill-ic.svg" width={24} height={24} alt="resume" />
                  <Text className="feature-name">Skill Assessment</Text>
                </Col>
                <Col xs={{ span: 12 }} lg={{ span: 18 }} className="job-tags-container">
                  {/* {
                job?.skills?.map((tag) => (
                  <Tag
                    key={tag.id}
                    color="default"
                  >
                    {tag.name}
                  </Tag>
                ))
              } */}
                  {job?.assessment?.length > 0 ? (
                    <Space direction="vertical">
                      <Text>{job?.assessment?.[0]?.title}</Text>
                      <Text type="secondary">{job?.assessment?.[0]?.description}</Text>
                    </Space>
                  ) : (
                    <Space direction="vertical">
                      <Text>No Assessment selected</Text>
                    </Space>
                  )}

                </Col>
              </Row>
            </Col>
          </>
        )}

      </Row>
      {
        visible && (
          <CandidateRequirementsReviewModal
            visible={visible}
            form={form}
            job={job}
            onClose={updateVisbleHandler}
            onSubmit={updateCandidateRequestHandler}
            isNewUser={isNewUser as boolean}
            assessmentData={assessmentData}
            setAssessmentData={setAssessmentData}
          />
        )
      }
    </Card>
  );
};

export default CandidateRequirementReview;
