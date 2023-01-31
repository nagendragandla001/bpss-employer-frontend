import {
  Col, Form, Row, Select, Spin, Typography,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import React, { useState } from 'react';
import { skillSuggAPI } from 'service/login-service';

const { Paragraph, Text } = Typography;

const { Option } = Select;
interface PropInterface{
  labelItem: string;
  name: string;
  placeholder: string;
  selectHandler: (string) => void;
}
const SkillSuggInput = ({
  labelItem, name, placeholder, selectHandler,
}: PropInterface): JSX.Element => {
  const [state, setState] = useState({
    jobData: [],
    value: '',
    fetching: false,
  });

  const fetchJobs = async (text: string): Promise<void> => {
    if (text) {
      setState((prevState) => ({
        ...prevState,
        jobData: [],
        fetching: false,
      }));
      const skillSuggRes = await skillSuggAPI(text);
      const obj = skillSuggRes?.data?.objects.map((job: { id: number; name: string }) => ({

        text: job.name,
        id: job.id,
      }));
      setState((prevState) => ({
        ...prevState,
        jobData: obj,
        fetching: false,
      }));
    }
  };

  const handleChange = (text: string): void => {
    setState((prevState) => ({
      ...prevState,
      value: text,
      jobData: [],
      fetching: false,
    }));
    selectHandler(text);
  };
  return (
    <Form.Item
      label={labelItem}
      name={name}
      style={{ marginBottom: 20 }}
    >
      <Select
        mode="multiple"
        value={state.value}
        notFoundContent={state.fetching ? <Spin size="small" /> : null}
        showArrow
        showSearch
        suffixIcon={(
          <div className="" style={{ marginTop: '-0.4rem', marginLeft: '-0.5rem' }}>
            <CustomImage
              src="/svgs/input-search.svg"
              alt="Search"
              // style={{ marginTop: '-0.4rem', marginLeft: '-0.5rem' }}
              height={24}
              width={24}
            />
          </div>
        )}
        onSearch={fetchJobs}
        onChange={handleChange}
        placeholder={placeholder}
        // allowClear
        className="text-base"
      >
        {state.jobData
          && state.jobData.map((d: { text: string }) => (
            <Option value={d.text} key={Math.random()} className="full-width">
              <Row gutter={0} align="middle" justify="start">
                <Col>
                  <Paragraph>
                    <Text
                      key={Math.random()}
                      ellipsis
                    >
                      {d.text}
                    </Text>
                  </Paragraph>
                </Col>
              </Row>
            </Option>
          ))}
      </Select>
    </Form.Item>
  );
};

export default SkillSuggInput;
