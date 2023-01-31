import {
  Checkbox, Col, Divider, Form, Radio, Row, Select, Typography,
} from 'antd';
import { FormInstance } from 'antd/lib/form';
import { ICandidateRequirements, IJobPost } from 'common/jobpost.interface';
import Education from 'components/JobPosting/Education';
import LanguageProficiency from 'components/JobPosting/LanguageProficiency';
import Assessments from 'components/JobPosting/TagsContainer/Assessments';
import DocumentsContainer from 'components/JobPosting/TagsContainer/Documents';
import Container from 'components/Layout/Container';
import CustomImage from 'components/Wrappers/CustomImage';
import {
  ageList, EXPERIENCE_RANGE, GENDER,
} from 'constants/enum-constants';
import { AppConstants } from 'constants/index';
import { ADD, notificationContext } from 'contexts/notificationContext';

import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import router from 'routes';
import { patchJobChanges, patchJobOpen } from 'screens/authenticated/JobDetails/Common/JobDetails.service';
import PushFormCleverTapEvents from 'screens/authenticated/JobPostingForm/CandidateRequiremntsForm/PushFormClevertapEvents.util';
import {
  assessmentInfo, getDocumentsAndAssetsSuggestions, getJobDetailsData, getSkillSuggestions,
} from 'service/job-posting-service';
import { logEvent, logGtagEvent } from 'utils/analytics';
import { pushClevertapEvent } from 'utils/clevertap';
import { prepareCandidateRequirementPatchObj } from 'utils/index';

require('screens/authenticated/JobPostingForm/CandidateRequiremntsForm/CandidateRequirements.less');

const { Option } = Select;
const { Title, Paragraph, Text } = Typography;
interface PropsInterface {
  form: FormInstance;
  orgStore: any;
  isNewUser: boolean;
  jpCredits: number;
}
// interface ITag {
//   id: number;
//   name: string;
// }

interface IAssessmentData{
  active: boolean;
  description: string;
  id: string;
  title: string;
  skills: Array<string>;
}

const CandidateRequirementsCpmponent = (props: PropsInterface): JSX.Element => {
  const {
    form, orgStore, isNewUser, jpCredits,
  } = props;
  const nextRouter = useRouter();
  const { dispatchNotification } = useContext(notificationContext);

  // Hoooks
  const [isFormFilled, setIsFormFilled] = useState(true);

  const [cleverTapElements, setCleverTapElements] = useState({
    // education: true,
    experience: true,
    industry: true,
    gender: true,
    age: true,
    documents: true,
    skills: true,
  });

  const [formInteractedWith, setFormInteractedWith] = useState<boolean>(false);

  const [state, setState] = useState<IJobPost>({} as IJobPost);
  const [documentSuggestions, setDocumentSuggestions] = useState([] as any);
  const [skillSuggestions, setSkillSuggestions] = useState([] as any);
  const [assessmentData, setAssessmentData] = useState<Array<IAssessmentData>>([]);

  const AGES = ageList();

  const onSubmit = async (formData): Promise<void> => {
    const trackObjSubmit = {
      category: 'job_post',
      action: 'candidate_qualification_submit',
      label: 'candidate_qualification',
      nonInteraction: false,
    };
    logEvent(trackObjSubmit);

    const formObj = {
      ...formData,
      skills: state.skills,
      documents: state.documents,
      assessmentIds: state?.assessmentId,
    };

    if (formData?.experienceLevel === 'experienced') {
      const experience = formData.experienceRange ? formData.experienceRange.split('-') : [0, 0];
      formObj.minimumExperience = parseInt(experience[0], 10) * 12;
      formObj.maximumExperience = parseInt(experience[1], 10) * 12;
    } else {
      formObj.minimumExperience = 0;
      formObj.maximumExperience = 0;
    }

    const patchObj = prepareCandidateRequirementPatchObj(formObj);
    const response = await patchJobChanges(state.id, patchObj);

    if ([200, 201, 202].includes(response?.status)) {
      if (response?.data) {
        const trackObjSuccess = {
          category: 'job_post',
          action: 'candidate_qualification_success',
          label: 'candidate_qualification',
          nonInteraction: false,
        };
        logEvent(trackObjSuccess);
        const documentsList = state.documents.map((doc) => doc.name);
        const skillsList = state.skills.map((skill) => skill.name);
        pushClevertapEvent(`${isNewUser ? 'First' : 'New'} Job Post`, {
          Type: `${isNewUser ? 'First' : 'New'} Job Post Continue`,
          'Documents & Assets': documentsList?.toString() || 'NA',
          'Selected Skills': skillsList?.toString() || 'NA',
          orgId: orgStore?.id,
          assessment: state?.assessmentId?.length > 0,
        });
        router.Router.pushRoute('Review', { id: state.id });
        // }
      }
    } else {
      dispatchNotification({
        type: ADD,
        payload: {
          title: 'Job Posting Form - Candidate Requirements',
          description: 'Not able to save job right now please try again later ',
          iconName: '',
          notificationType: 'error',
          placement: 'topRight',
          duration: 4,
        },
      });
    }
  };

  const onSubmitError = (): void => {
    const formErrors = form?.getFieldsError();
    // eslint-disable-next-line @typescript-eslint/ban-types
    const errors: string | {} = formErrors && formErrors
      .filter((t) => t.errors.length)
      .map((x) => x.name && x.name[0]);
    pushClevertapEvent('candidate specs submit', { Type: 'Error', Error: (errors && errors.toString()) || 'NA' });
  };

  const validateMinAge = (_rule, value): Promise<void> => {
    if (state.maxPreferredAge && value) {
      if ((value / 12) > (state.maxPreferredAge / 12)) {
        return Promise.reject(new Error('The minimum age cannot be greater than maximum age'));
      }
    }
    return Promise.resolve();
  };

  const validateMaxAge = (_rule, value): Promise<void> => {
    if (state.minPreferredAge && value) {
      if ((value / 12) < (state.minPreferredAge / 12)) {
        return Promise.reject(new Error('The maximum age cannot be less than minimum age'));
      }
    }
    return Promise.resolve();
  };

  const onValuesChanged = (formData): void => {
    // Handle Form Values Changed Here
    if (isFormFilled) {
      const trackObj = {
        category: 'job_post',
        action: 'candidate_qualification_start',
        label: 'candidate_qualification',
        nonInteraction: false,
      };
      logEvent(trackObj);
      if (!formInteractedWith) {
        if (isNewUser) {
          pushClevertapEvent('First Job Post', {
            Type: 'First Job Post Start',
          });
        } else if (!state.id) {
          pushClevertapEvent('New Job Post', {
            Type: 'New Job Post Start',
            'JP Credits': jpCredits,
          });
        }
        setFormInteractedWith(true);
      }
      setIsFormFilled(false);
    }

    // Commented for future release, need to implement debounce here
    // PushFormCleverTapEvents(formData, cleverTapElements, setCleverTapElements, isNewUser);
  };

  const handleExperienceLevelChange = (e): void => {
    setState((prev) => ({
      ...prev,
      experienceLevel: e.target.value,
    }));
  };

  const handleExperienceRange = (e): void => {
    setState((prev) => ({
      ...prev,
      experienceRange: e.target.value,
    }));
  };

  const handleMinAgeChange = (value): void => {
    setState((prev) => ({
      ...prev,
      minPreferredAge: value,
    }));
  };

  const handleMaxAgeChange = (value): void => {
    setState((prev) => ({
      ...prev,
      maxPreferredAge: value,
    }));
  };

  const hangleGenderChange = (value): void => {
    setState((prev) => ({
      ...prev,
      genderPreference: value,
    }));
  };

  const educationChangeHandler = (value): void => {
    setState((prev) => ({
      ...prev,
      education: value,
    }));
  };

  const proficiencyLevelHandler = (value): void => {
    setState((prev) => ({
      ...prev,
      proficiencyLevel: value,
    }));
  };

  const addSkillHandler = (skill): void => {
    pushClevertapEvent(`${isNewUser ? 'First' : 'New'} Job Post`, {
      Type: `${isNewUser ? 'First' : 'New'} Job Post Modification`,
      Field: 'Selected Skills',
    });
    setCleverTapElements((prevState) => ({
      ...prevState,
      skills: false,
    }));
    setState((prev) => ({
      ...prev,
      skills: [{ id: skill.value, name: skill.label }, ...prev.skills],
    }));

    if (!skillSuggestions.find((d) => (d.id === skill.value && d.name === skill.label))) {
      setSkillSuggestions((prev) => ([{ id: skill.value, name: skill.label }, ...prev]));
    }
  };

  const removeSkillHandler = (skill, isRemove): void => {
    setState((prev) => ({
      ...prev,
      skills: [...prev.skills.filter((d) => (d.id !== skill.id && d.name !== skill.name))],
    }));
    if (isRemove) {
      const skills = skillSuggestions.filter((s) => (s.id !== skill.id && s.name !== skill.name));
      setSkillSuggestions(skills);
    }
  };

  const addAssessmentHandler = (assessmentId): void => {
    const newIdList = [...(state?.assessmentId)];
    if (newIdList?.includes(assessmentId)) {
      newIdList?.splice(newIdList.indexOf(assessmentId));
    } else {
      newIdList.push(assessmentId);
    }
    setState((prev) => ({
      ...prev,
      assessmentId: newIdList,
    }));
  };

  const addDocumentHandler = (document): void => {
    pushClevertapEvent(`${isNewUser ? 'First' : 'New'} Job Post`, {
      Type: `${isNewUser ? 'First' : 'New'} Job Post Modification`,
      Field: 'Documents and Assets',
    });
    setState((prev) => ({
      ...prev,
      documents: [
        { id: document.value, name: document.label, type: document.type },
        ...prev.documents],
    }));

    if (!documentSuggestions.find((d) => d.id === document.value && d.type === document.type)) {
      setDocumentSuggestions((prev) => ([
        { id: document.value, name: document.label, type: document.type },
        ...prev]));
    }
  };

  const removeDocumentHandler = (doc, isRemove): void => {
    setState((prev) => ({
      ...prev,
      documents: [...prev.documents.filter((d) => d.id !== doc.id)],
    }));
    if (isRemove) {
      const docs = documentSuggestions.filter((document) => document.id !== doc.id);
      setDocumentSuggestions(docs);
    }
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

    if (jobState === 'J_D') {
      const assessmentIdList = apiRes?.data?.map((data) => data?.assessment_id);
      setState((prev) => ({
        ...prev,
        assessmentId: assessmentIdList,
      }));
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (nextRouter?.query?.id) {
      getJobDetailsData(nextRouter.query.id as string).then((response) => {
        if (isMounted) {
          getAssessmentInfo(response?.functionalArea?.id, response?.orgId, response?.state);
          setState(response);
          form.setFieldsValue({
            proficiencyLevel: response?.proficiencyLevel,
            experienceLevel: response?.experienceLevel,
            experienceRange: response?.experienceRange,
            minPreferredAge: response?.minPreferredAge,
            maxPreferredAge: response?.maxPreferredAge,
            genderPreference: response?.genderPreference,
            englishProficiency: response?.englishProficiency,
            isResumeSubscribed: response?.isResumeSubscribed,
            // skills: response?.skills,
            documents: response?.documents,
          });

          getDocumentsAndAssetsSuggestions(response.functionalArea.id).then((documents) => {
            if ([200, 201, 202].includes(documents.status)) {
              if (documents?.data?.length > 0) {
                if (response?.documents) {
                  const docs = [...response.documents, ...documents.data];

                  const filteredDocs = docs.filter((f, i, self) => i === self.findIndex((t) => (
                    (t.id === f.id) && (t.type === f.type)
                  )));

                  setDocumentSuggestions([...filteredDocs]);
                } else {
                  setDocumentSuggestions([...documents.data]);
                }
              } else {
                setDocumentSuggestions([...response.documents]);
              }
            } else {
              setDocumentSuggestions([...response.documents]);
            }
          });
        }
      });
    }
    return (): any => { isMounted = false; };
  }, []);

  const checkExpRange = (_rule, value): Promise <void> => {
    if (value === '0-0') { return Promise.reject(new Error('Please select Range of Experience')); }
    return Promise.resolve();
  };

  return (
    <Container>
      {/* SEO Stuff Start */}
      <Head>
        <title>
          {`Add Candidate Details | ${AppConstants.APP_NAME}`}
        </title>
        <meta
          name="description"
          content={`Add Candidate Details | ${AppConstants.APP_NAME}`}
          key="description"
        />
      </Head>
      {/* SEO End */}
      {/* //<Candidate Requirement  /> */}
      <Row>
        <Col span={24}>
          <Title level={3}>Requirements for Profile match</Title>
          <Paragraph className="text-disabled">
            These criteria&apos;s will be used to calculate a
            profile match score for candidates.
            {' '}
          </Paragraph>
          <Divider />
        </Col>
        <Col span={24}>
          <Form
            name="employer-registration"
            form={form}
            onFinish={onSubmit}
            onFinishFailed={onSubmitError}
            layout="vertical"
            hideRequiredMark
            size="large"
            scrollToFirstError
            onValuesChange={onValuesChanged}
          >
            <Row gutter={{ md: 65, xs: 50 }} align="middle">
              <Col md={{ span: 9 }} xs={{ span: 24 }}>
                <Education updateEducation={educationChangeHandler} />
              </Col>
            </Row>
            <Row align="middle" gutter={65}>
              <Col md={{ span: 12 }} xs={{ span: 24 }}>
                <Form.Item label="Experience Level" name="experienceLevel" className="radio-experience">
                  <Radio.Group
                    size="middle"
                    onChange={handleExperienceLevelChange}
                    className="radio-buttons text-base"
                  >
                    <Radio.Button value="fresher">Fresher</Radio.Button>
                    <Radio.Button value="experienced">Experienced</Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </Col>
              {
                state.experienceLevel === 'experienced' && (
                  <Col md={{ span: 12 }} xs={{ span: 24 }} style={{ paddingRight: 0 }}>
                    <Form.Item
                      name="experienceRange"
                      label="Range of Experience in years"
                      className="radio-experience"
                      rules={[
                        { validator: checkExpRange },
                      ]}
                    >
                      <Radio.Group
                        size="middle"
                        onChange={handleExperienceRange}
                        className="text-base"
                      >
                        {
                          EXPERIENCE_RANGE.map((range) => (
                            <Radio.Button
                              key={range.key}
                              value={range.key}
                            >
                              {range.label}
                            </Radio.Button>
                          ))
                        }
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                )
              }
            </Row>
            <Row align="middle" gutter={65}>
              <Col span={24}>
                <DocumentsContainer
                  selected={state.documents}
                  tags={documentSuggestions}
                  addDocument={addDocumentHandler}
                  removeDocument={removeDocumentHandler}
                />
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Title level={3}>Other Requirements</Title>
                <Divider />
              </Col>
            </Row>
            {/* AGE */}
            <Row gutter={{ lg: 65, xs: 0 }}>
              <Col md={{ span: 12 }} xs={{ span: 24 }}>
                <Form.Item label="Age">
                  <Row align="middle" gutter={12}>
                    <Col span={8}>
                      <Form.Item
                        name="minPreferredAge"
                        noStyle
                        validateFirst
                        rules={[{ validator: validateMinAge }]}
                        className="selected-values"
                      >
                        <Select
                          className="text-base selected-values"
                          onSelect={handleMinAgeChange}
                          placeholder="From"
                          style={{ fontWeight: 'bold' }}
                        >
                          {
                            AGES.map((age) => (
                              <Option
                                value={age}
                                key={age}
                              >
                                {age}
                              </Option>
                            ))
                          }
                        </Select>
                      </Form.Item>
                    </Col>

                    {/* Divider */}
                    <Col span={2} className="text-center">
                      <CustomImage
                        src="/images/common/two-sided-arrow.svg"
                        alt="seperator"
                        height={48}
                        width={48}
                      />
                    </Col>
                    {/* MAX AGE */}
                    <Col span={8}>
                      <Form.Item
                        name="maxPreferredAge"
                        noStyle
                        rules={[{ validator: validateMaxAge }]}
                      >
                        <Select
                          placeholder="To"
                          className="text-base"
                          onSelect={handleMaxAgeChange}
                          style={{ fontWeight: 'bold' }}
                        >
                          {
                            AGES.map((age) => (
                              <Option
                                value={age}
                                key={age}
                              >
                                {age}
                              </Option>
                            ))
                          }
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form.Item>
              </Col>

              <Col
                md={{ span: 12 }}
                xs={{ span: 24 }}
                className="p-all-0"
              >
                <Form.Item
                  label="Gender"
                  name="genderPreference"
                  className="radio-experience"
                >
                  <Radio.Group
                    onChange={hangleGenderChange}
                    className="radio-buttons"
                  >
                    {
                      GENDER.map((gender) => (
                        <Radio.Button key={gender.key} value={gender.key}>
                          {gender.label}
                        </Radio.Button>
                      ))
                    }
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={{ md: 65, xs: 0 }}>
              <Col xs={{ span: 24 }} md={{ span: 12 }}>
                <LanguageProficiency updateProficiencyLevel={proficiencyLevelHandler} />
              </Col>
              <Col md={{ span: 12 }} xs={{ span: 24 }} className="p-all-0 m-v-auto">
                <Form.Item name="isResumeSubscribed" valuePropName="checked">
                  <Checkbox>This job requires resume to apply</Checkbox>
                </Form.Item>
              </Col>
            </Row>
            {assessmentData?.length > 0 && (
              <>
                <Row>
                  <Col span={24}>
                    <Title level={3}>Skill Assessment</Title>
                    <Text type="secondary">This will help in finding relevant candidates</Text>
                    <Divider />
                  </Col>
                </Row>
                <Row align="middle" gutter={65}>
                  <Col span={24}>
                    <Assessments
                      addAssessmentHandler={addAssessmentHandler}
                      assessmentData={assessmentData}
                      setAssessmentData={setAssessmentData}
                      jobState={state?.state}
                      selectedIds={state?.assessmentId}
                    />
                  </Col>
                </Row>
              </>
            )}
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default CandidateRequirementsCpmponent;
