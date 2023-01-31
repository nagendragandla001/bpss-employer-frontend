import {
  Button, Col, Form, Modal, Row, Typography,
} from 'antd';
import SkillSuggInput from 'components/StaticPages/Common/Skill/SkillSugg';
import CustomImage from 'components/Wrappers/CustomImage';
import { isMobile } from 'mobile-device-detect';
import React, { useState } from 'react';
import { patchJobChanges } from 'screens/authenticated/JobDetails/Common/JobDetails.service';
import {
  JobDetailsType,
} from 'screens/authenticated/JobDetails/Common/JobDetails.utils';
import { getCompSkillListAPI } from 'service/login-service';
import { pushClevertapEvent } from 'utils/clevertap';
import usePersistedState from 'utils/usePersistedState';

require('screens/authenticated/JobDetails/Mobile/JobDetails.mobile.less');
require('screens/authenticated/JobDetails/Desktop/jobDetails.less');

const { Text } = Typography;

interface titleI{
  visible:boolean,
  onCancel:()=>void;
  data:JobDetailsType
  patchrequest:(string)=>void
}

const Jobskills = (props:titleI):JSX.Element => {
  const {
    visible, onCancel, data, patchrequest,
  } = props;
  const [submitInProgress, setSubmitInProgress] = useState(false);
  const [skills, setskills] = usePersistedState('skill_list', '');

  if (!skills) {
    const skillListob = getCompSkillListAPI();
    skillListob.then((res) => setskills(res.objects));
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const skillList = (skill): any => {
    const newObject: Array<number> = [];
    skills.map((x) => {
      newObject[x.name] = x.id;
      return newObject;
    });
    if (skill && skill.length > 0) {
      const skillpatchObject = skill.map((item) => ({ name: item, id: newObject[item] }));
      return skillpatchObject;
    }
    return {};
  };
  const [form] = Form.useForm();
  const finishHandler = async (formData):Promise<void> => {
    setSubmitInProgress(true);
    const obj = {
      expectation: {
        skill_list: formData.skillList || [],
        preferred_skill_list: formData.preferredSkillList || [],
        preferred_skills: skillList(formData.preferredSkillList) || [],
        skills: skillList(formData.skillList) || [],
      },
    };
    // console.log(obj);
    const apiCall = await patchJobChanges(data.id, obj);
    if ([200, 201, 202].indexOf(apiCall.status) > -1) {
      setSubmitInProgress(false);
      patchrequest('success');
      onCancel();
    } else {
      setSubmitInProgress(false);
    }
  };

  return (
    <Modal
      visible={!!visible}
      footer={null}
      onCancel={onCancel}
      width={400}
      className={isMobile ? 'full-screen-modal m-jd-modal-container m-ct-app-actions-modal-mobile' : 'ct-modal-title'}
      title={isMobile ? [
        <Row key="job-details">
          <Col onClick={onCancel}><CustomImage src="/svgs/m-close.svg" width={24} height={24} alt="Close" /></Col>
          <Col className="m-v-auto"><Text className="title">Edit Skills</Text></Col>
        </Row>,
      ] : 'Edit Skills'}
      closable={!isMobile}
    >
      <Form
        layout="vertical"
        form={form}
        initialValues={{
          skillList: data.mandatorySkills,
          preferredSkillList: data.preferredSkills,

        }}
        onFinish={finishHandler}
      >
        <Row>
          <Col span={24}>
            <SkillSuggInput
              name="skillList"
              placeholder="e.g. Tally, Finance Principles, etc."
              labelItem="Candidate must possess following skills:"
              selectHandler={(): boolean => true}
            />
          </Col>
          <Col span={24}>
            <SkillSuggInput
              name="preferredSkillList"
              placeholder="e.g. Leadership, Teamwork"
              labelItem="Additionally preferred skills"
              selectHandler={(): boolean => true}
            />
          </Col>
        </Row>
        {isMobile
          ? (
            <Form.Item className="modal-action">
              <Button type="primary" block htmlType="submit" loading={submitInProgress}>Save Changes</Button>
            </Form.Item>
          )
          : (
            <Form.Item>
              <Button
                htmlType="submit"
                type="primary"
                className="m-jobdetails-submit-btn"
                onClick={(): void => {
                  pushClevertapEvent('Candidate Requirement Save', { Type: 'Skills' });
                }}
                loading={submitInProgress}
              >
                Save Changes

              </Button>
            </Form.Item>
          ) }
      </Form>
    </Modal>
  );
};
export default Jobskills;
