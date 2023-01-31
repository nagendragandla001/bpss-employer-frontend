/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable camelcase */
/* eslint-disable react/prop-types */
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import {
  AutoComplete, Avatar, Col, Form, FormInstance, Row, Spin, Typography,
} from 'antd';
import { JobPostingConfig } from 'constants/index';
import React, { useState } from 'react';
import { companySuggAPI } from 'service/login-service';
import { CompanyPattern } from 'utils/constants';

const { Paragraph, Text } = Typography;
const { Option } = AutoComplete;

interface IHiringCompany {
  selectHandler: (value: string) => void;
  visible:boolean;
  form: FormInstance;
}

const HiringCompany = (props: IHiringCompany): JSX.Element => {
  const { selectHandler, visible, form } = props;
  const [state, setState] = useState({
    companyData: [],
    value: '',
    fetching: false,
    searchTerm: '',
  });

  const fetchCompanies = (text: string): void => {
    if (text && text.trim() !== '') {
      setState((prevState) => ({
        ...prevState,
        companyData: [],
        fetching: false,
        searchTerm: text,
      }));
      const companySugg = companySuggAPI(text);
      companySugg.then((body) => {
        const obj = body
            && body.objects
            && body.objects.map(
              (company: {
                popular_name: string;
                id: number;
                logo: string;
              }) => ({
                text: company.popular_name,
                value: company.id,
                logo: company.logo,
              }),
            );
        setState((prevState) => ({
          ...prevState,
          companyData: obj,
          fetching: false,
        }));
      });
    }
  };

  const deafultOption = [(
    <Option value={state.searchTerm} key={state.searchTerm} className="default-value">
      <p style={{ color: 'blue' }}>
        <PlusOutlined style={{ paddingRight: '5px' }} />
        {`Add ${state.searchTerm}`}
      </p>
    </Option>)];

  const getDropDownMenu = (): JSX.Element => {
    let dropDownOptions: any = [];
    if (state.companyData) {
      dropDownOptions = state.companyData.map(
        (d: {text: string; value: string; logo: string}) => (
          <Option value={d.text} key={d.value} data={d.logo}>
            <Row gutter={0} align="middle" justify="start">
              <Col xs={{ span: 2, offset: 0 }}>
                <Avatar shape="square" src={d.logo ? d.logo : '/images/static-pages/registration/default-company-img.svg'} />
              </Col>
              <Col xs={{ span: 20, offset: 1 }}>
                <Paragraph>
                  <Text ellipsis>{d.text}</Text>
                </Paragraph>
              </Col>
            </Row>
          </Option>
        ),
      );
    }
    dropDownOptions = state.searchTerm ? deafultOption.concat(dropDownOptions) : dropDownOptions;
    return dropDownOptions;
  };

  const handleChange = (text: string): void => {
    if (!text) {
      selectHandler('');
    }
    setState((prevState) => ({
      ...prevState,
      value: text,
      companyData: [],
      fetching: false,
      searchTerm: '',
    }));
  };

  const checkCompany = (_rule, value): Promise <void> => {
    const ownCompany = form.getFieldValue('ownCompany');
    if (visible && value === '' && ownCompany) {
      return Promise.reject(new Error('Please enter the company name'));
    }

    return Promise.resolve();
  };
  return (
    <Form.Item
      label={JobPostingConfig.hiringOrgName.label}
      name={JobPostingConfig.hiringOrgName.name}
      rules={[
        {
          required: true,
          message: 'Please input company name',
        },
        {
          validator: checkCompany,
        },
        {
          whitespace: true,
          message: 'Company name cannot be empty!',
        },
        {
          max: 50,
          message: 'Company name cannot be more than 50 characters',
        },
        {
          pattern: CompanyPattern,
          message: 'Invalid company name',
        },
      ]}
      // dependencies={['ownCompany']}
    >
      <AutoComplete
        showSearch
        showArrow
        value={state.value}
        notFoundContent={state.fetching ? <Spin size="small" /> : null}
        onSearch={fetchCompanies}
        onChange={handleChange}
        onSelect={(val): void => {
          selectHandler(val);
        }}
        placeholder="ex. Google Inc"
        clearIcon={<CloseOutlined />}
        className="text-base selected-values"
      >
        {getDropDownMenu()}
      </AutoComplete>
    </Form.Item>
  );
};

export default HiringCompany;
