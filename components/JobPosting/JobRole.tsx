/* eslint-disable camelcase */
import {
  AutoComplete, Col, Form, Row, Spin, Typography,
} from 'antd';
import React, { useCallback, useState } from 'react';
import { fetchJobRole } from 'service/job-service';
import { validatetitleAPI } from 'service/login-service';
import { Debounce } from 'utils/common-utils';
import { JobPostingConfig } from 'constants/index';
import SearchOutlined from '@ant-design/icons/SearchOutlined';

const { Text } = Typography;
const { Option } = AutoComplete;

interface IJobRole {
  updateJobRole: (obj) => void;
  disabled: boolean;
}
interface IRole {
  job_designation: string;
  functional_areas: null | number;
}

const JobRole = (props: IJobRole): JSX.Element => {
  const { updateJobRole, disabled } = props;
  const [state, setState] = useState({
    value: '',
    fetching: false,
    roles: [] as Array<IRole>,
  });

  const fetchJobRolesHandler = async (text: string): Promise<void> => {
    if (text) {
      setState((prevState) => ({
        ...prevState,
        fetching: true,
        roles: [],
      }));
      const apiResponse = await fetchJobRole(text);
      if ([200, 201, 202].includes(apiResponse.status)) {
        setState((prevState) => ({
          ...prevState,
          fetching: false,
          roles: apiResponse?.data?.objects || [],
        }));

        updateJobRole({ job_designation: text });
      }
    }
  };

  const checkTitleHandler = async (value): Promise<void> => {
    const check = await validatetitleAPI(value);
    if (check?.restricted_words) {
      return Promise.reject(new Error('Your Job posting doesn\'t meet our job posting rules'));
    }

    return Promise.resolve();
  };

  const handleChange = (value: string): void => {
    const selectedRole = state.roles.find((role: IRole) => role?.job_designation === value);
    if (selectedRole) {
      updateJobRole(selectedRole);
    }

    setState((prevState) => ({
      ...prevState,
      value,
      roles: [],
      fetching: false,
    }));
  };

  const roleValidatorDebounceHandler = useCallback(Debounce(checkTitleHandler), []);
  const roleDebounceHandler = useCallback(Debounce(fetchJobRolesHandler), []);

  const TitleValidator = async (_rule, value): Promise<void> => roleValidatorDebounceHandler(value);
  const fetchJobRoles = (text): void => roleDebounceHandler(text);

  return (
    <Form.Item
      name="title"
      label={JobPostingConfig.title.label}
      validateFirst
      rules={[
        { validator: TitleValidator },
        ...JobPostingConfig.title.rules,
      ]}
      validateTrigger={['onBlur', 'onSelect']}
    >
      <AutoComplete
        notFoundContent={state.fetching ? <Spin size="small" /> : null}
        onSearch={fetchJobRoles}
        onChange={handleChange}
        placeholder="e.g. Marketing Manager"
        suffixIcon={<SearchOutlined className="text-extra-base" />}
        className="text-base selected-values search-dropdown"
        showSearch
        showArrow
        size="large"
        disabled={disabled}
      >
        {state.roles.map((role: IRole) => (
          <Option value={role.job_designation} key={role.job_designation} className="full-width selected-values">
            <Row align="middle" justify="start">
              <Col xs={{ span: 24 }}>
                <Text style={{ width: '100%' }} ellipsis>
                  {role.job_designation}
                </Text>
              </Col>
            </Row>
          </Option>
        ))}
      </AutoComplete>
    </Form.Item>
  );
};

export default JobRole;
