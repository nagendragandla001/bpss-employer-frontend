import { ArrowLeftOutlined } from '@ant-design/icons/lib/icons';
import {
  Button,
  Checkbox,
  Col, Divider, Form, FormInstance, Modal, Radio, Row, Select, Space, Typography,
} from 'antd';
import { IJobPost } from 'common/jobpost.interface';
import Education from 'components/JobPosting/Education';
import LanguageProficiency from 'components/JobPosting/LanguageProficiency';
import Assessments from 'components/JobPosting/TagsContainer/Assessments';
import DocumentsContainer from 'components/JobPosting/TagsContainer/Documents';
import SkillsContainer from 'components/JobPosting/TagsContainer/Skills';
import CustomImage from 'components/Wrappers/CustomImage';
import {
  ageList, EXPERIENCE_RANGE, GENDER,
} from 'constants/enum-constants';
import { isMobile } from 'mobile-device-detect';
import React, { useEffect, useState } from 'react';
import { IAssessmentData } from 'screens/authenticated/JobDetails/Common/JobDetails.utils';
import { assessmentInfo, getDocumentsAndAssetsSuggestions, getSkillSuggestions } from 'service/job-posting-service';
import { pushClevertapEvent } from 'utils/clevertap';

const { Text, Title, Paragraph } = Typography;

require('screens/authenticated/JobDetails/Mobile/editJobDetails/editJobDetails.less');

interface ICandidateReqModal {
  visible: boolean;
  form: FormInstance;
  job: IJobPost;
  onClose: (value) => void;
  onSubmit: (value) => void;
  isNewUser: boolean;
  assessmentData: Array<IAssessmentData>;
  setAssessmentData: (value: Array<IAssessmentData>) => void;
}

const { Option } = Select;

const CandidateRequirementsReviewModal = (props: ICandidateReqModal): JSX.Element => {
  const {
    visible, form, job, onClose, onSubmit, isNewUser, assessmentData, setAssessmentData,
  } = props;

  const AGES = ageList();
  const [documentSuggestions, setDocumentSuggestions] = useState([] as any);
  const [skillSuggestions, setSkillSuggestions] = useState([] as any);

  const [state, setState] = useState({
    documents: [] as any,
    skills: [] as any,
    experienceLevel: job.maxExperience > 0 ? 'experienced' : '',
    proficiencyLevel: job?.proficiencyLevel,
    experienceRange: '',
    genderPreference: job?.genderPreference,
    maxPreferredAge: job?.maxPreferredAge,
    minPreferredAge: job?.minPreferredAge,
    state: job?.state,
    assessmentId: job?.assessmentId,
  });

  const handleCancel = (): void => {
    onClose(false);
  };

  const onSubmitError = (err): void => {
    // console.log('Form failed ---- ', err);
  };
  const onSubmitForm = (data): void => {
    const formData = {
      ...data,
      documents: state.documents,
      skills: state.skills,
      assessmentIds: state?.assessmentId,
    };
    onSubmit(formData);
  };

  const educationChangeHandler = (value): void => {
    setState((prev) => ({
      ...prev,
      education: value,
    }));
  };
  const handleExperienceLevelRange = (e): void => {
    // console.log(e.target.value);
    setState((prev) => ({
      ...prev,
      experienceLevel: e.target.value,
    }));
  };
  const handleExperienceRange = (e): void => {
    // console.log(e);
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

  const proficiencyLevelHandler = (value): void => {
    setState((prev) => ({
      ...prev,
      proficiencyLevel: value,
    }));
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

  const fetchDocumnetAndSkillInfo = async (): Promise<void> => {
    const documnetsCall = getDocumentsAndAssetsSuggestions(job.functionalArea.id);
    const skillsCall = getSkillSuggestions(job.functionalArea.id);
    const documentsRes = await documnetsCall;
    const skills = await skillsCall;

    if ([200, 201, 202].includes(documentsRes.status) && documentsRes?.data?.length > 0) {
      if (job?.documents) {
        const docs = [...job.documents, ...documentsRes.data];

        const filteredDocs = docs.filter((f, i, self) => i === self.findIndex((t) => (
          (t.id === f.id) && (t.type === f.type)
        )));

        setDocumentSuggestions([...filteredDocs]);
      } else {
        setDocumentSuggestions([...documentsRes.data]);
      }
    } else {
      setDocumentSuggestions([...job.documents]);
    }

    if ([200, 201, 202].includes(skills.status) && skills?.data?.length > 0) {
      if (job?.skills) {
        const skillsMap = [...job.skills, ...skills.data];

        const skls = skillsMap.filter((f, i, self) => i === self.findIndex((t) => (
          t.name === f.name
        )));

        setSkillSuggestions([...skls]);
      } else {
        setSkillSuggestions([...skills.data]);
      }
    } else {
      setSkillSuggestions([...job.skills]);
    }
  };

  const addSkillHandler = (skill): void => {
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

  const addDocumentHandler = (document): void => {
    setState((prev) => ({
      ...prev,
      documents: [
        { id: document.value, name: document.label, type: document.type },
        ...prev.documents],
    }));

    if (!documentSuggestions.find((d) => d.id === document.value)) {
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

  const onValuesChange = (formData): void => {
    pushClevertapEvent(`${isNewUser ? 'First' : 'New'} Job Post`, {
      Type: `${isNewUser ? 'First' : 'New'} Job Post Review`,
      field_modified: Object.keys(formData)?.[0],
    });
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

  useEffect(() => {
    if (job) {
      form.setFieldsValue({
        proficiencyLevel: job?.proficiencyLevel,
        experienceLevel: job?.experienceLevel,
        experienceRange: job?.experienceRange,
        minPreferredAge: job?.minPreferredAge,
        maxPreferredAge: job?.maxPreferredAge,
        genderPreference: job?.genderPreference,
        englishProficiency: job?.englishProficiency,
        isResumeSubscribed: job?.isResumeSubscribed,
        skills: job?.skills,
        documents: job?.documents,
      });

      setState((prev) => ({
        ...prev,
        skills: job?.skills,
        documents: job?.documents,
        proficiencyLevel: job?.proficiencyLevel,
        experienceLevel: job?.experienceLevel,
        experienceRange: job?.experienceRange,
        minPreferredAge: job?.minPreferredAge,
        maxPreferredAge: job?.maxPreferredAge,
        genderPreference: job?.genderPreference,
        englishProficiency: job?.englishProficiency,
        isResumeSubscribed: job?.isResumeSubscribed,
        state: job?.state,
        assessmentId: job?.assessmentId,
      }));
    }
    if (job?.functionalArea?.id) {
      fetchDocumnetAndSkillInfo();
    }
  }, [job]);

  return (
    <Modal
      title={isMobile
        ? [
          <Row justify="space-between" key="filter-title">
            <Col>
              <Button onClick={handleCancel} type="link">
                <ArrowLeftOutlined />
              </Button>
              <Text strong className="text-base">Edit Candidate Requirements</Text>
            </Col>
            <Col className="m-clear-all">
              <Button form="candidateRequirementsModal" type="text" htmlType="submit"><Text strong className="modal-button">Save</Text></Button>
            </Col>
          </Row>,
        ]
        : 'Edit Candidate Requirements'}
      visible={visible}
      onCancel={handleCancel}
      footer={false}
      width={isMobile ? '' : '70vw'}
      className={isMobile ? 'full-screen-modal m-jd-modal-container' : ''}
      closable={!isMobile}
    >
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
            id="candidateRequirementsModal"
            name="employer-review-details"
            form={form}
            onFinish={onSubmitForm}
            onFinishFailed={onSubmitError}
            onValuesChange={onValuesChange}
            layout="vertical"
            size="large"
          >
            <Row gutter={65}>
              <Col xs={{ span: 24 }} lg={{ span: 9 }}>
                <Education updateEducation={educationChangeHandler} />
              </Col>
            </Row>
            <Row gutter={65}>
              <Col xs={{ span: 24 }} lg={{ span: 12 }}>
                <Form.Item label="Experience Level" name="experienceLevel">
                  <Radio.Group
                    size="middle"
                    onChange={handleExperienceLevelRange}
                    className="radio-buttons text-base"
                  >
                    <Radio.Button value="fresher">Fresher</Radio.Button>
                    <Radio.Button value="experienced">Experienced</Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </Col>
              {
                state.experienceLevel === 'experienced' && (
                  <Col xs={{ span: 24 }} lg={{ span: 12 }}>
                    <Form.Item
                      name="experienceRange"
                      label="Range of Experience in years"
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
            <Row gutter={65}>
              <Col xs={{ span: 24 }} lg={{ span: 24 }}>
                <DocumentsContainer
                  tags={documentSuggestions}
                  selected={state.documents}
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
            <Row gutter={65}>
              <Col xs={{ span: 24 }} lg={{ span: 12 }}>
                <Form.Item label="Age">
                  <Row align="middle" gutter={12}>
                    <Col span={8}>
                      <Form.Item
                        name="minPreferredAge"
                        noStyle
                        validateFirst
                        rules={[{ validator: validateMinAge }]}
                      >
                        <Select
                          className="text-base"
                          onSelect={handleMinAgeChange}
                          placeholder="From"
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

              <Col xs={{ span: 24 }} lg={{ span: 12 }}>
                <Form.Item
                  label="Gender"
                  name="genderPreference"
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

            <Row gutter={65}>
              <Col xs={{ span: 24 }} lg={{ span: 12 }}>
                <LanguageProficiency updateProficiencyLevel={proficiencyLevelHandler} />
              </Col>
              <Col xs={{ span: 24 }} lg={{ span: 12 }}>
                <Form.Item name="isResumeSubscribed" valuePropName="checked">
                  <Checkbox>This job requires resume to apply</Checkbox>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={65}>
              <Col xs={{ span: 24 }} lg={{ span: 24 }}>
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
              </Col>
            </Row>
            <Row gutter={65}>
              <Col md={{ span: 24 }} xs={{ span: 0 }} className="text-center">
                <Space align="center">
                  <Button
                    size="small"
                    type="link"
                    className="text-semibold"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button size="small" type="primary" htmlType="submit">Save Changes</Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    </Modal>
  );
};

export default CandidateRequirementsReviewModal;
