import {
  FormInstance, Row, Col, Input, Form,
} from 'antd';
import React from 'react';

interface SetPasswordProps {
  form: FormInstance;
}

const SetPassword = ({ form }: SetPasswordProps): JSX.Element => {
  const validateConfirmPassword = (_rule, value): Promise<void> => {
    const newPwd = form.getFieldValue('newPwd');
    if (!value && !newPwd) return Promise.resolve();
    if (value && newPwd === value) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('The passwords do not match'));
  };
  return (
    <>
      <Row>
        <Col span={24}>
          <Form.Item
            label="New Password"
            name="newPwd"
            validateTrigger="onBlur"
            validateFirst
            rules={[{
              required: true,
              message: 'Please enter new password',
            }, {
              min: 6,
              message: 'Password should contain atleast 6 characters',
            },
            {
              max: 255,
              message: 'Password cannot be more than 255 characters',
            },
            ]}
          >
            <Input.Password className="pwd-input" />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Form.Item
            label="Re-enter New Password"
            name="validationPwd"
            validateTrigger="onBlur"
            validateFirst
            dependencies={['newPwd']}
            rules={[{
              required: true,
              message: 'Please re-enter password',
            }, {
              min: 6,
              message: 'Password should contain atleast 6 characters',
            },
            {
              max: 255,
              message: 'Password cannot be more than 255 characters',
            },
            {
              validator: validateConfirmPassword,
            },
            ]}
          >
            <Input.Password className="pwd-input" />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};

export default SetPassword;
