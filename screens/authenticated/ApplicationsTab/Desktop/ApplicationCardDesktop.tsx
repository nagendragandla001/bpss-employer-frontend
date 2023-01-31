/* eslint-disable react/prop-types */
/* eslint-disable no-nested-ternary */
import {
  Badge,
  Card, Checkbox, Col, Row,
} from 'antd';
import MatchingScore from 'components/Candidates/MatchingScore';
import dynamic from 'next/dynamic';
import React, {
  forwardRef, useImperativeHandle, useState,
} from 'react';
import { CandidateBasicInfo, CandidateDetailsDesktop } from 'screens/authenticated/ApplicationsTab/Common/ApplicationCard/candidateComponents';
import DatabaseApplicationCardActions from 'screens/authenticated/ApplicationsTab/Desktop/DatabaseApplicationActions';
import { ApplicationDataInterface } from '../Common/ApplicationTabUtils';

const ViewCV = dynamic(() => import('screens/authenticated/ApplicationsTab/Common/ApplicationCard/viewCV'), { ssr: false });
const UnlockContact = dynamic(() => import('screens/authenticated/ApplicationsTab/Common/ApplicationCard/unlockContact'), { ssr: false });
const ApplicationActions = dynamic(() => import('screens/authenticated/ApplicationsTab/Desktop/applicationActions'), { ssr: false });
const ApplicationStatus = dynamic(() => import('screens/authenticated/ApplicationsTab/Common/ApplicationCard/applicationStatus'), { ssr: false });

interface setApplicationDataI {
  applicationData: any;
  totalApplications: number;
  loading: boolean,
  offset: number,
  downloadCount: number,
}
interface PropsInterface {
  applications: any;
  selectedTab: string;
  handleBulk:(any) => void;
  setApplicationData: React.Dispatch<React.SetStateAction<setApplicationDataI>>;
  jobId: string;
  updateDismissedCandidate: (id) => void;
  updateUnlockContact: (id) => void;
  updateCandidateInfo: (id) => void;
  updateDownloadOption: (option: string) => void;
  orgName: string;
}

const ApplicationCardDesktop = forwardRef((props: PropsInterface, ref) => {
  const {
    selectedTab, applications, handleBulk, jobId, updateDismissedCandidate, updateUnlockContact,
    updateCandidateInfo,
    updateDownloadOption, orgName,
  } = props;

  const [checkedval, setChecked] = useState([]) as any;

  useImperativeHandle(ref, () => ({
    bulkAction(data):void {
      setChecked(data);
    },
  }));
  const handleChange = (value):void => {
    updateDownloadOption('DISCRETE');
    setChecked(value);
    handleBulk(value);
  };

  const updateDismissedCandidateHandler = (id): void => {
    updateDismissedCandidate(id);
  };

  const Application = ({ data, index, setApplicationData }): JSX.Element => (
    <Card
      key={selectedTab === 'database' ? `${data.candidateId}-${index}` : `${data.applicationId}-${index}`}
      className={checkedval && checkedval.indexOf(selectedTab === 'database' ? data.candidateId : data.applicationId) !== -1 ? 'ac-container ac-checked' : 'ac-container'}
    >
      <Row>
        <Col span={1} className="p-top-8">
          <Checkbox
            value={selectedTab === 'database' ? data.candidateId
              : data.applicationId}
          />
        </Col>
        <Col span={23}>
          <Row gutter={[0, 16]}>
            <Col span={24}>
              <Row>
                <Col lg={{ span: 11 }}>
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
                <Col lg={{ span: 13 }}>
                  <CandidateDetailsDesktop
                    candidateAddress={data.candidateAddress}
                    candidateEducation={data.candidateEducation}
                    experience={data.experience}
                    currentSalary={data.currentSalary}
                    previousCompany={data.previousCompany}
                  />
                </Col>
              </Row>
            </Col>

            <Col span={24}>
              <MatchingScore cms={data?.cms} />
            </Col>

            <Col span={24}>
              <Row align="bottom" justify="space-between">
                <Col className="display-flex">
                  <ViewCV
                    candidateResume={data.candidateResume}
                    name={data.name}
                    appliedJobTitle={data.appliedJobTitle}
                    contactUnblocked={data.candidateContactUnblocked}
                    applicationId={data.applicationId}
                    applicationCreatedDate={data.applicationCreatedDate}
                    candidateEmail={data.candidateEmail}
                    candidateMobileNo={data.candidateMobileNo}
                    profileAvatarIndex={data.profileAvatarIndex}
                    gender={data.gender}
                    selectedTab={selectedTab}
                    updateContact={updateUnlockContact}
                    cms={data.cms}
                    appliedJobId={data.appliedJobId}
                    orgName={orgName}
                    preSkilled={data?.preSkilled}
                  />

                  {['NI'].indexOf(data.applicationStage) !== -1 ? null
                    : (
                      <UnlockContact
                        contactUnblocked={data.candidateContactUnblocked}
                        applicationId={selectedTab === 'applications' ? data.applicationId : data.candidateId}
                        applicationCreatedDate={data.applicationCreatedDate}
                        candidateEmail={data.candidateEmail}
                        candidateMobileNo={data.candidateMobileNo}
                        selectedTab={selectedTab}
                        updateContact={updateUnlockContact}
                        cms={data.cms}
                        appliedJobId={data.appliedJobId}
                        orgName={orgName}
                        preSkilled={data?.preSkilled}
                      />
                    )}
                </Col>
                <Col>
                  <Row justify="end" align="bottom">
                    <Col className="ac-interactive-buttons">
                      {selectedTab === 'database' ? (
                        <DatabaseApplicationCardActions
                          contactUnlocked={data.candidateContactUnblocked}
                          candidateId={data.candidateId}
                          jobId={data.appliedJobId}
                          jobTitle={data.appliedJobTitle}
                          updateDismissedCandidate={updateDismissedCandidateHandler}
                          cms={data.cms}
                          preSkilled={data.preSkilled}
                          applicationStage={data?.applicationStage}
                          appliedJobTitle={data.appliedJobTitle}
                          appliedJobLocation={data.appliedJobLocation}
                          candidateName={data?.name}
                          profileAvatarIndex={data.profileAvatarIndex}
                          gender={data.gender}
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
                            preSkilled={data.preSkilled}
                            appliedJobTitle={data.appliedJobTitle}
                            appliedJobLocation={data.appliedJobLocation}
                            setApplicationData={setApplicationData}
                            appliedJobId={data.appliedJobId}
                            // applicationOnHold={data.applicationOnHold}
                            profileAvatarIndex={data.profileAvatarIndex}
                            gender={data.gender}
                            contactUnlocked={data.candidateContactUnblocked}
                            updateCandidateInfo={updateCandidateInfo}
                            cms={data.cms}
                          />
                        )}
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
          </Row>

        </Col>
      </Row>
    </Card>
  );

  return (

    <div className="at-desktop-application-card">
      <Checkbox.Group
        onChange={handleChange}
        style={{ display: 'block' }}
        value={checkedval}
      >
        {
          applications.map((data: ApplicationDataInterface, index) => {
            if (data.preSkilled) {
              return (
                <Badge.Ribbon key={data.applicationId} color="#FF9518" text="Pre-skilled" placement="start">
                  <Application
                    data={data}
                    index={index}
                    setApplicationData={props.setApplicationData}
                  />
                </Badge.Ribbon>
              );
            }
            return (
              <Application
                data={data}
                index={index}
                key={data.applicationId}
                setApplicationData={props.setApplicationData}
              />
            );
          })
        }
      </Checkbox.Group>
    </div>
  );
});

export default ApplicationCardDesktop;
