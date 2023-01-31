/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import {
  Row, Col, Typography, Tag, Space,
} from 'antd';
import { isMobile } from 'mobile-device-detect';
import Link from 'next/link';
import { pushClevertapEvent } from 'utils/clevertap';
import dayjs from 'dayjs';
import CustomImage from 'components/Wrappers/CustomImage';
import ApplicationStatus from './applicationStatus';

require('screens/authenticated/ApplicationsTab/Common/ApplicationCard/candidateComponents.less');

const { Text, Paragraph } = Typography;

interface CandidateDetail{
  label: string;
  value: string;
  iconName: string;

}
interface CandidateDetails {
  candidateAddress: string;
  candidateEducation: string;
  experience: string;
  currentSalary: string;
  previousCompany: string;
}

interface CandidateBasicInfoI{
  name: string;
  age: number;
  gender: string;
  appliedJobTitle: string;
  isNewApplication: boolean;
  profileAvatarIndex: number;
  appliedJobID: string;
  selectedTab: string;
  active:boolean
  lastActiveOn:string
  applicationStage: string;
  interviewStartTime: string;
  interviewEndTime: string;
  interviewAttendance: string;
  appliedJobType: string;
  applicationOnHold: boolean;
}

const CandidateDetail = ({
  iconName, label, value,
}:CandidateDetail):JSX.Element => (
  <Row>
    <Col span={24}>
      <Space align="center" size={4}>
        <CustomImage
          src={`/images/application-tab/${iconName}Icon.svg`}
          width={24}
          height={24}
          alt="icon"
        />
        <Paragraph ellipsis className="ac-blue-grey-7-text text-small">
          {`${label} ${value}`}
        </Paragraph>
      </Space>
    </Col>
  </Row>
);

export const CandidateDetailsMobile = ({
  candidateAddress,
  candidateEducation,
  experience,
  currentSalary,
  previousCompany,
}: CandidateDetails):JSX.Element => (
  <Row>
    <Col xs={{ span: 12 }} md={{ span: 8 }} lg={{ span: isMobile ? 8 : 12 }} className="ac-candidate-details">
      {candidateAddress
        ? <CandidateDetail value={candidateAddress} label="" iconName="location" /> : null}
      {experience
        ? <CandidateDetail value={experience} label="Experience" iconName="experience" /> : null}
      {candidateEducation
        ? <CandidateDetail value={candidateEducation} label="" iconName="education" /> : null}
    </Col>
    <Col xs={{ span: 0 }} md={{ span: 6 }} lg={{ span: isMobile ? 8 : 12 }}>
      {currentSalary
        ? <CandidateDetail value={currentSalary} label="Current ₹" iconName="salary" /> : null}
      {previousCompany
        ? <CandidateDetail value={previousCompany} label="" iconName="company" /> : null}
    </Col>
  </Row>
);

export const CandidateDetailsDesktop = ({
  candidateAddress,
  candidateEducation,
  experience,
  currentSalary,
  previousCompany,
}: CandidateDetails):JSX.Element => (
  <Row gutter={2}>
    <Col xs={{ span: 14 }} md={{ span: 8 }} lg={{ span: 12 }}>
      {candidateAddress
        ? <CandidateDetail value={candidateAddress} label="" iconName="location" /> : null}
      {experience
        ? <CandidateDetail value={experience} label="Experience" iconName="experience" /> : null}
      {candidateEducation
        ? <CandidateDetail value={candidateEducation} label="" iconName="education" /> : null}
    </Col>
    <Col xs={{ span: 0 }} md={{ span: 6 }} lg={{ span: 12 }}>
      {currentSalary
        ? <CandidateDetail value={currentSalary} label="Current ₹" iconName="salary" /> : null}
      {previousCompany
        ? <CandidateDetail value={previousCompany} label="" iconName="company" /> : null}
    </Col>
  </Row>
);

export const CandidateBasicInfo = ({
  name,
  age,
  gender,
  appliedJobTitle,
  isNewApplication,
  profileAvatarIndex,
  appliedJobID,
  selectedTab,
  active,
  lastActiveOn,
  applicationStage,
  interviewStartTime,
  interviewEndTime,
  interviewAttendance,
  appliedJobType,
  applicationOnHold,
}:CandidateBasicInfoI) : JSX.Element => (
  <>
    <Row>
      {
        selectedTab !== 'database' ? (
          <Col xs={{ span: 24 }} lg={{ span: 0 }}>
            <ApplicationStatus
              applicationStage={applicationStage}
              interviewStartTime={interviewStartTime}
              interviewEndTime={interviewEndTime}
              interviewAttendance={interviewAttendance}
              appliedJobType={appliedJobType}
              applicationOnHold={applicationOnHold}
            />
          </Col>
        ) : null
      }
      <Col>
        <CustomImage
          src={`/images/application-tab/${gender || 'M'}avatar${gender ? profileAvatarIndex : '0'}.svg`}
          width={40}
          height={46}
          alt="icon"
        />
      </Col>
      <Col xs={{ span: 18 }} sm={{ span: 19 }}>
        <Row className="p-left-8" align="middle">
          <Col span={12}>
            <Paragraph className="text-capitalize" style={{ fontWeight: 'bold', fontSize: 20 }} ellipsis>
              {name}
            </Paragraph>
          </Col>
          {active
            ? (
              <Col span={4} style={{ marginTop: '4px' }}>
                <Tag color="#09b984" style={{ display: 'inline' }}>Active</Tag>
              </Col>
            ) : null}
          {
            !isMobile && selectedTab !== 'database' ? (
              <ApplicationStatus
                applicationStage={applicationStage}
                interviewStartTime={interviewStartTime}
                interviewEndTime={interviewEndTime}
                interviewAttendance={interviewAttendance}
                appliedJobType={appliedJobType}
                applicationOnHold={applicationOnHold}
              />
            ) : null
          }
        </Row>
        <Row className="p-left-8">
          <Col>
            {age ? (
              <Text className="ac-blue-grey-5-text text-small">
                Age&nbsp;
                {age}
                ,
              </Text>
            ) : null}
            {gender ? (
              <Text className="ac-blue-grey-5-text text-small">
                &nbsp;
                {gender === 'M' ? 'Male' : 'Female'}
              </Text>
            ) : null}
            {isNewApplication ? (
              <Text className="ac-new-app-tag">
                NEW
              </Text>
            ) : null}
          </Col>
        </Row>
      </Col>
    </Row>
    {
      selectedTab === 'applications' && (
        <Row className="p-top-8">
          <Col xs={{ span: 17 }} md={{ span: 14 }}>
            <Paragraph ellipsis>
              <p className="ac-blue-grey-7-text text-small ac-display-inline">Applied for :&nbsp;&nbsp;</p>
              <Link
                href={`/employer-zone/jobs/${appliedJobID}/`}
              >
                <a
                  type="link"
                  onClick={(): void => pushClevertapEvent('General Click', { Type: 'Jobs', value: appliedJobTitle })}
                  className="ac-blue-grey-7-text text-small text-bold ac-display-inline ac-applied-job-link"
                  href="#"
                >
                  {appliedJobTitle}
                </a>
              </Link>
            </Paragraph>
          </Col>
        </Row>
      )
    }
    {selectedTab === 'database' ? (
      <Space>
        <Text ellipsis className="ac-blue-grey-7-text text-small">Last Active on :</Text>
        <Text className="ac-blue-grey-7-text text-small text-bold">{dayjs(lastActiveOn).format('DD MMM YYYY')}</Text>
      </Space>
    ) : null}
  </>
);
