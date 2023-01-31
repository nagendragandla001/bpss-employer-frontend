import { Form, Radio } from 'antd';
import { PROFICIENCY_LEVEL } from 'constants/enum-constants';
import React from 'react';
import { isMobile } from 'mobile-device-detect';

interface ILanguageProficiency {
  updateProficiencyLevel: (value) => void
}

const LanguageProficiency = (props: ILanguageProficiency): JSX.Element => {
  const { updateProficiencyLevel } = props;

  return (
    <Form.Item label="English Language Requirement" name="englishProficiency" className="radio-experience">
      <Radio.Group
        size={isMobile ? 'small' : 'middle'}
        onChange={updateProficiencyLevel}
        className="radio-buttons text-base"
      >
        {
          PROFICIENCY_LEVEL.map((proficiency) => (
            <Radio.Button key={proficiency.value} value={proficiency.value}>
              {
                proficiency.label
              }
            </Radio.Button>
          ))
        }
      </Radio.Group>
    </Form.Item>
  );
};

export default LanguageProficiency;
