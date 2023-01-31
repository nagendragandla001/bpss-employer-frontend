import { Form, Tag } from 'antd';
import { IKeyValue } from 'common/jobpost.interface';
import { WORKDAYS } from 'constants/enum-constants';
import JobPostingConfig from 'constants/job-posting-constants';
import React from 'react';

const { CheckableTag } = Tag;

interface IWorkDay {
  workDays: Array<IKeyValue>;
  updateWorkDay: (tag, selected) => void;
}

const WorkDay = (props: IWorkDay): JSX.Element => {
  const { workDays, updateWorkDay } = props;
  return (
    <Form.Item
      label={JobPostingConfig.workingDays.label}
      className="work-timings"
    >
      {WORKDAYS.map((tag) => (
        <Form.Item key={tag.id} name={JobPostingConfig.workingDays.name} noStyle>
          <CheckableTag
            key={tag.id}
            checked={!!workDays?.find((day) => day.key === tag.key)}
            onChange={(checked): void => updateWorkDay(tag, checked)}
          >
            {tag.value}
          </CheckableTag>
        </Form.Item>
      ))}
    </Form.Item>
  );
};

export default WorkDay;
