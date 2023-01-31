/* eslint-disable @typescript-eslint/no-explicit-any */
import { Row, Col } from 'antd';
import React, { useState } from 'react';
import { observer } from 'mobx-react';
import { pushClevertapEvent } from 'utils/clevertap';
import SkillSuggInput from 'components/StaticPages/Common/Skill/SkillSugg';

interface PropsModel {
  store: any;
}

const CandidateSkills = ({ store }: PropsModel): JSX.Element => {
  // const [skillSection, setSkillSection] = useState(store.mandatorySkill.length > 0
  // || store.skills.length > 0);
  const [skillsEventSent, setSkillsEventSent] = useState(false);
  const [addSkillsEventSent, setAddSkillsEventSent] = useState(false);

  return (

    <Row>
      <Col span={24}>
        <SkillSuggInput
          name="skillList"
          placeholder="e.g. Tally, Finance Principles, etc."
          labelItem="Candidate must possess following skills:"
          selectHandler={(value): void => {
            store.updateMandatorySkill(value);
            if (!skillsEventSent) {
              pushClevertapEvent('Candidate skill start', { Type: 'Job Posting' });
              setSkillsEventSent(true);
            }
          }}
        />
      </Col>
      <Col span={24}>
        <SkillSuggInput
          name="preferredSkillList"
          placeholder="e.g. Leadership, Teamwork"
          labelItem="Additionally preferred skills"
          selectHandler={(value): void => {
            store.updateSkill(value);
            if (!addSkillsEventSent) {
              pushClevertapEvent('Aditionally preferred skill start', { Type: 'Job Posting' });
              setAddSkillsEventSent(true);
            }
          }}
        />
      </Col>
    </Row>

  );
};

export default observer(CandidateSkills);
