import {
  Col,
  Form, Row, Select, Space, Typography,
} from 'antd';
import React from 'react';
import { VerificationInterface } from './settingsPageUtils';

const { Text } = Typography;
const { Option } = Select;

const CATEGORIES = {
  SME: 'Company',
  HR: 'Recruitment Agency',
  IND: 'Freelancer',
};

const CategorySettings = (props: VerificationInterface): JSX.Element => {
  const {
    state, toggleState, dispatch,
  } = props;
  const handleChange = (type): void => {
    dispatch?.({
      type: 'UPDATESTATE',
      payload: {
        type,
      },
    });
  };
  return (
    <Row className="p-all-16">
      <Col xs={{ span: 24 }} lg={{ span: 16 }}>
        {
          toggleState ? (
            <Form.Item
              name="type"
              label={<Text className="label-header">Category</Text>}
              rules={[
                {
                  required: true,
                  message: 'Please select a category!',
                },
              ]}
              style={{ marginBottom: 0 }}
            >
              <Select
                placeholder="Select a category"
                onSelect={handleChange}
              >
                <Option value="SME">Company</Option>
                <Option value="HR">Recruitment Agency</Option>
                <Option value="IND">Freelancer</Option>
              </Select>
            </Form.Item>
          ) : (
            <Space direction="vertical" size={0}>
              <Text className="label-header">Category</Text>
              <Text type="secondary">{CATEGORIES[state.type]}</Text>
            </Space>
          )
        }
      </Col>
    </Row>
  );
};
export default CategorySettings;
