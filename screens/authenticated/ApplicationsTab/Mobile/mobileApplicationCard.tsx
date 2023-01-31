import {
  Card, Col, Row,
} from 'antd';
import dynamic from 'next/dynamic';
import React from 'react';
import { Waypoint } from 'react-waypoint';
import { CandidateBasicInfo, CandidateDetailsMobile } from 'screens/authenticated/ApplicationsTab/Common/ApplicationCard/candidateComponents';
import DatabaseApplicationCardActions from 'screens/authenticated/ApplicationsTab/Mobile/DatabaseApplicationActions';
import MobileMatchingScore from 'screens/authenticated/ApplicationsTab/Mobile/MobileMatchingScore';

const ViewCV = dynamic(() => import('screens/authenticated/ApplicationsTab/Common/ApplicationCard/viewCV'), { ssr: false });
const UnlockContact = dynamic(() => import('screens/authenticated/ApplicationsTab/Common/ApplicationCard/unlockContact'), { ssr: false });
const ApplicationActions = dynamic(() => import('screens/authenticated/ApplicationsTab/Mobile/applicationActions'), { ssr: false });

interface setApplicationDataI{
  applicationData: any;
  totalApplications: number;
  loading: boolean,
  offset: number,
}
interface PropsInterface {
  applications: any;
  selectedTab: string;
  getMoreApplicationData: () => void;
  setApplicationData: React.Dispatch<React.SetStateAction<setApplicationDataI>>
  updateDismissedCandidate: (id) => void;
  updateUnlockContact: (id) => void;
  orgName:string;
}

const ApplicationsMobileScreen = (props: PropsInterface): JSX.Element => {
  const {
    applications, selectedTab, updateDismissedCandidate, updateUnlockContact, orgName,
  } = props;

  const updateContactfunc = (id):void => {
    updateUnlockContact(id);
  };

  const updateDismissedCandidateHandler = (id): void => {
    updateDismissedCandidate(id);
  };

  return (
    <div className="at-mobile-application-card">
      {applications.map((data, index) => (
        <Card
          key={`${data.applicationId} - ${Math.random()}`}
          className="ac-container"
        >
          <Row gutter={[0, 8]}>
            <Col span={24}>
              <Row>
                <Col span={16}>
                  <CandidateBasicInfo
                    name={data.name}
                    age={data.age}
                    gender={data.gender}
                    appliedJobTitle={data.appliedJobTitle}
                    isNewApplication={data.isNewApplication}
                    profileAvatarIndex={data.profileAvatarIndex}
                    appliedJobID={data.appliedJobId}
                    selectedTab={selectedTab}
                    lastActiveOn={selectedTab === 'database' ? data.lastActiveOn : null}
                    active={selectedTab === 'database' ? data.activeTag : null}
                    applicationStage={data.applicationStage}
                    interviewStartTime={data.interviewStartTime}
                    interviewEndTime={data.interviewEndTime}
                    interviewAttendance={data.interviewAttendance}
                    appliedJobType={data.appliedJobType}
                    applicationOnHold={data.applicationOnHold}
                  />
                </Col>
                <Col span={8} className="text-right">
                  {selectedTab === 'database' ? (
                    <DatabaseApplicationCardActions
                      contactUnlocked={data.candidateContactUnblocked}
                      candidateId={data.candidateId}
                      jobId={data.appliedJobId}
                      jobTitle={data.appliedJobTitle}
                      updateDismissedCandidate={updateDismissedCandidateHandler}
                      cms={data.cms}
                    />
                  )
                    : (
                      <ApplicationActions
                        applicationStage={data.applicationStage}
                        applicationId={data.applicationId}
                        appliedJobType={data.appliedJobType}
                        suggestedSlotTemplateName={data.suggestedSlotTemplateName}
                        candidateJoiningDate={data.candidateJoiningDate}
                        interviewStartTime={data.interviewStartTime}
                        interviewEndTime={data.interviewEndTime}
                        interviewAttendance={data.interviewAttendance}
                        name={data.name}
                        appliedJobTitle={data.appliedJobTitle}
                        appliedJobLocation={data.appliedJobLocation}
                        setApplicationData={props.setApplicationData}
                        appliedJobId={data.appliedJobId}
                        // applicationOnHold={data.applicationOnHold}
                        profileAvatarIndex={data.profileAvatarIndex}
                        gender={data.gender}
                        contactUnlocked={data.candidateContactUnblocked}
                        cms={data.cms}
                      />
                    )}
                </Col>
              </Row>
            </Col>

            <Col span={24}>
              <MobileMatchingScore cms={data?.cms} name={data.name} />
            </Col>

            <Col span={24}>
              <Row>
                <CandidateDetailsMobile
                  candidateAddress={data.candidateAddress}
                  candidateEducation={data.candidateEducation}
                  experience={data.experience}
                  currentSalary={data.currentSalary}
                  previousCompany={data.previousCompany}
                />
                <Col xs={{ span: 10 }} sm={{ span: 8 }} style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '32px' }}>
                  {['NI'].indexOf(data.applicationStage) !== -1 || (
                    <UnlockContact
                      contactUnblocked={data.candidateContactUnblocked}
                      applicationId={selectedTab === 'applications' ? data.applicationId : data.candidateId}
                      applicationCreatedDate={data.applicationCreatedDate}
                      candidateEmail={data.candidateEmail}
                      candidateMobileNo={data.candidateMobileNo}
                      selectedTab={selectedTab}
                      updateContact={updateContactfunc}
                      cms={data.cms}
                      appliedJobId={data.appliedJobID}
                      orgName={orgName}
                      preSkilled={data?.preSkilled}
                    />
                  )}
                  <ViewCV
                    candidateResume={data.candidateResume}
                    name={data.name}
                    appliedJobTitle={data.appliedJobTitle}
                    contactUnblocked={data.candidateContactUnblocked}
                    applicationId={selectedTab === 'applications' ? data.applicationId : data.candidateId}
                    applicationCreatedDate={data.applicationCreatedDate}
                    candidateEmail={data.candidateEmail}
                    candidateMobileNo={data.candidateMobileNo}
                    profileAvatarIndex={data.profileAvatarIndex}
                    gender={data.gender}
                    selectedTab={selectedTab}
                    updateContact={updateContactfunc}
                    cms={data.cms}
                    appliedJobId={data.appliedJobID}
                    orgName={orgName}
                    preSkilled={data?.preSkilled}
                  />
                </Col>
              </Row>
            </Col>
          </Row>

          {index === (props.applications.length - 1)
            ? <Waypoint onEnter={():void => props.getMoreApplicationData()} /> : null}
        </Card>
      ))}
    </div>
  );
};

export default React.memo(ApplicationsMobileScreen);
