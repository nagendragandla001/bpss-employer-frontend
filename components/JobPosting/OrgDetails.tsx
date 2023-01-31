import { InfoCircleOutlined } from '@ant-design/icons';
import {
  Col, Form, Input, Popover, Radio, Row, Space, Tooltip, Typography,
} from 'antd';
import CompanySearchInput from 'components/StaticPages/Common/CompanySearchInput/CompanySearchInput.component';
import React from 'react';
import { pushClevertapEvent } from 'utils/clevertap';
import { TitlePattern } from 'utils/constants';

const { Text } = Typography;
const { Group } = Radio;

const ORG_TYPES = [
  {
    key: 'SME',
    name: 'From a company',
    description: 'If you are directly hiring for your own company',
  },
  {
    key: 'HR',
    name: 'From a recruitment agency',
    description: 'If your firm is hiring on behalf of another company',
  },
  {
    key: 'IND',
    name: 'A freelance recruiter',
    description: 'If you are working with a company or recruitment agency on an individual basis',
  }];

const ORG_TYPES_DICT = {
  SME: 'Company',
  HR: 'Recruitment Agency',
  IND: 'Freelancer',
};

interface OrgDetailsProps {
  onChange: (type) => void;
  isNewUser: boolean;
}

const OrgDetails = ({ onChange, isNewUser }: OrgDetailsProps):JSX.Element => {
  const handleOrgTypeChange = (e): void => {
    onChange(e?.target?.value);
    if (isNewUser) {
      pushClevertapEvent('First Job Post', {
        category: ORG_TYPES_DICT?.[e?.target?.value],
        type: 'Org Category',
      });
    }
  };
  return (
    <Row gutter={{ xs: 40, lg: 60 }}>
      <Col xs={{ span: 22 }} md={{ span: 12 }}>
        <CompanySearchInput
          selectHandler={(): void => {
            pushClevertapEvent('First Job Post', {
              Type: 'First Job Post Modification',
              Field: 'Company Name',
            });
          }}
        />
      </Col>
      <Col xs={{ span: 22 }} md={{ span: 12 }}>
        <Form.Item label="Account Manager Name" className="full-width">
          <Row gutter={2}>
            <Col xs={{ span: 24 }} md={{ span: 12 }}>
              <Form.Item
                label=""
                name="firstName"
                rules={[{
                  required: true,
                  message: 'Please input first name!',
                }, {
                  pattern: TitlePattern,
                  message: 'First Name is not valid!',
                }, {
                  whitespace: true,
                  message: 'First Name cannot be empty!',
                },
                {
                  max: 100,
                  message: 'First Name cannot be more than 100 characters',
                },
                ]}
                required
              >
                <Input placeholder="First Name" className="text-base" />
              </Form.Item>
            </Col>
            <Col xs={{ span: 0 }} md={{ span: 12 }}>
              <Form.Item
                name="lastName"
                label=""
                rules={[{
                  required: true,
                  message: 'Please input last name!',
                }, {
                  pattern: TitlePattern,
                  message: 'Last Name is not valid!',
                }, {
                  whitespace: true,
                  message: 'Last Name cannot be empty!',
                },
                {
                  max: 100,
                  message: 'Last Name cannot be more than 100 characters',
                },
                ]}
              >
                <Input placeholder="Last Name" className="text-base" />
              </Form.Item>
            </Col>
            <Col xs={{ span: 24 }} md={{ span: 0 }}>
              <Form.Item
                name="lastName"
                rules={[{
                  required: true,
                  message: 'Please input last name!',
                }, {
                  pattern: TitlePattern,
                  message: 'Last Name is not valid!',
                }, {
                  whitespace: true,
                  message: 'Last Name cannot be empty!',
                },
                {
                  max: 100,
                  message: 'Last Name cannot be more than 100 characters',
                },
                ]}
              >
                <Input placeholder="Last Name" className="text-base" />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

      </Col>
      <Col span={24}>
        <Form.Item
          name="type"
          label="You are:"
          rules={[{
            required: true,
            message: 'Please select any one option!',
          }]}
        >
          <Group onChange={handleOrgTypeChange}>
            <Space direction="vertical">
              {
                ORG_TYPES.map((type) => (
                  <Radio value={type.key} key={type.key}>
                    <Space direction="horizontal">
                      <Text>{type.name}</Text>
                      <Popover content={type.description}>
                        <InfoCircleOutlined />
                      </Popover>
                    </Space>
                  </Radio>
                ))
              }
            </Space>
          </Group>
        </Form.Item>
      </Col>
    </Row>
  );
};

export default OrgDetails;
