/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  Col, Divider, FormInstance, Row,
} from 'antd';
import { IJobPost } from 'common/jobpost.interface';
import BasicDetailsReview from 'components/JobDetails/BasicDetailsReview';
import CandidateRequirementReview from 'components/JobDetails/CandidateRequirementReview';
import JobReviewTitle from 'components/JobDetails/JobReviewTitle';
import LocationReview from 'components/JobDetails/LocationReview';
import PocReview from 'components/JobDetails/PocReview';
import SalaryReview from 'components/JobDetails/SalaryReview';
import Container from 'components/Layout/Container';
import UnverifiedModal from 'components/UnverifiedEmailNotification/UnverifiedModal';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { getLoggedInUser } from 'service/accounts-settings-service';
import { getJobDetailsData, patchJobChangesData } from 'service/job-posting-service';
import {
  preapreBasicDetailsPatchChanges,
  preapreLocationPatchChanges,
  preapreSalaryPatchChanges,
  prepareCandidateRequirementPatchObj,
  prepareJobRolePatchChanges,
  preparePOCPatchChanges,
} from 'utils';
import { pushClevertapEvent } from 'utils/clevertap';

require('screens/authenticated/JobPostingForm/ReviewJobForm/ReviewJobForm.less');

interface PropsInterface {
  form: FormInstance;
  userDetails: any;
  orgStore: any;
  isNewUser: boolean;
}

const JobPostFormReviewComponent = (props: PropsInterface): JSX.Element => {
  const {
    form, userDetails, orgStore, isNewUser,
  } = props;
  const router = useRouter();

  const [state, setState] = useState<IJobPost>({} as IJobPost);
  const [isJobRoleChanged, setJobRoleChanged] = useState(false);
  const [isBasicDetailsChanged, setBasicDetailsChanged] = useState(false);
  const [isLocationChanged, setLocationChanged] = useState(false);
  const [isSalaryChanged, setSalaryChanged] = useState(false);
  const [isCandidateRequirementChanged, setCandidateRequirementChanged] = useState(false);
  const [emailModalVisible, setEmailModalVisible] = useState(userDetails?.email === '');

  const updateJobRoleChangeHandler = async (data): Promise<void> => {
    if (!isJobRoleChanged) {
      pushClevertapEvent('review page changes', {
        Type: 'Job Details',
      });
      setJobRoleChanged(true);
    }
    const patchObj = prepareJobRolePatchChanges(data);
    const response = await patchJobChangesData(state.id, patchObj);
    setState(response);
  };

  const updateBasicDetailsOnEditHandler = async (data): Promise<void> => {
    if (!isBasicDetailsChanged) {
      pushClevertapEvent('review page changes', {
        Type: 'Basic Details',
      });
      setBasicDetailsChanged(true);
    }
    const patchObj = preapreBasicDetailsPatchChanges(data);
    const response = await patchJobChangesData(state.id, patchObj);
    setState(response);
  };

  const updateLocationOnEditHandler = async (data): Promise<void> => {
    if (!isLocationChanged) {
      pushClevertapEvent('review page changes', {
        Type: 'Location',
      });
      setLocationChanged(true);
    }
    const patchObj = preapreLocationPatchChanges(data);
    const response = await patchJobChangesData(state.id, patchObj);
    setState(response);
  };

  const updateSalryOnEditHandler = async (data): Promise<void> => {
    if (!isSalaryChanged) {
      pushClevertapEvent('review page changes', {
        Type: 'Salary',
      });
      setSalaryChanged(true);
    }
    const patchObj = preapreSalaryPatchChanges(data);
    const response = await patchJobChangesData(state.id, patchObj);
    setState(response);
  };

  const updateCandidateReqReviewHandler = async (data): Promise<void> => {
    if (!isCandidateRequirementChanged) {
      pushClevertapEvent('review page changes', {
        Type: 'Candidate Requirements',
      });
      setCandidateRequirementChanged(true);
    }
    const experience = data.experienceRange ? data.experienceRange.split('-') : [0, 0];
    const formObj = {
      ...data,
      minimumExperience: parseInt(experience[0], 10) * 12,
      maximumExperience: parseInt(experience[1], 10) * 12,
    };

    const patchObj = prepareCandidateRequirementPatchObj(formObj);

    const response = await patchJobChangesData(state.id, patchObj);
    setState(response);
  };

  const updatePOCDetailsHandler = async (data): Promise<void> => {
    const patchObj = preparePOCPatchChanges(data.POCDetails);
    const response = await patchJobChangesData(state.id, patchObj);
    setState(response);
  };

  useEffect(() => {
    let isMounted = true;
    if (router?.query?.id) {
      getJobDetailsData(router.query.id as string).then((data) => {
        if (isMounted) {
          setState(data);
        }
      });
    }
    return (): any => { isMounted = false; };
  }, []);

  return (
    <>
      <Row>
        {emailModalVisible ? <UnverifiedModal isEmailModalVisible /> : null}

        {/* Desktop Job Role */}
        <Col xs={{ span: 0 }} lg={{ span: 24 }} className="d-review-title">
          <Container>
            <JobReviewTitle
              job={state}
              form={form}
              orgDetails={orgStore}
              updateJob={updateJobRoleChangeHandler}
              isNewUser={isNewUser}
            />
          </Container>
        </Col>

        {/* Mobile Job Role */}
        <Col xs={{ span: 20 }} lg={{ span: 0 }} className="m-review-title">
          <Container>
            <JobReviewTitle
              job={state}
              form={form}
              orgDetails={orgStore}
              updateJob={updateJobRoleChangeHandler}
              isNewUser={isNewUser}
            />
          </Container>
        </Col>
      </Row>
      <Container>
        <Row className="review-job-container">
          <Col xs={{ span: 22 }} lg={{ span: 16 }}>
            <BasicDetailsReview
              job={state}
              form={form}
              updateJob={updateBasicDetailsOnEditHandler}
              jobPosting
              isNewUser={isNewUser}
            />
            <Divider />
            <LocationReview
              job={state}
              form={form}
              updateJob={updateLocationOnEditHandler}
              jobPosting
              isNewUser={isNewUser}
            />
            <Divider />
            <SalaryReview
              job={state}
              form={form}
              updateJob={updateSalryOnEditHandler}
              jobPosting
              isNewUser={isNewUser}
            />
            <Divider />
            <CandidateRequirementReview
              job={state}
              form={form}
              updateJob={updateCandidateReqReviewHandler}
              jobPosting
              isNewUser={isNewUser}
            />
            <Divider />
            <PocReview
              job={state}
              form={form}
              updateJob={updatePOCDetailsHandler}
            />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default JobPostFormReviewComponent;
