import {
  Col, Form, FormInstance, Input, Row,
} from 'antd';
import React from 'react';

interface ChangePasswordProps {
  form: FormInstance;
}

const ChangePassword = ({ form }: ChangePasswordProps): JSX.Element => {
  const validateConfirmPassword = (_rule, value): Promise<void> => {
    const newPwd = form.getFieldValue('newPwd');
    if (!value && !newPwd) return Promise.resolve();
    if (value && newPwd === value) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('The passwords do not match'));
  };
  const validateNewPassword = (_rule, value): Promise<void> => {
    const currentPwd = form.getFieldValue('currentPwd');
    if (!value && !currentPwd) return Promise.resolve();
    if (value && currentPwd === value) {
      return Promise.reject(new Error('New password cannot be same as current password'));
    }
    return Promise.resolve();
  };

  return (
    <>
      <Row>
        <Col span={24}>
          <Form.Item
            label="Enter Current Password"
            name="currentPwd"
            validateTrigger="onBlur"
            rules={[{
              required: true,
              message: 'Please enter current password',
            }, {
              min: 6,
              message: 'Password should contain atleast 6 characters',
            },
            {
              max: 255,
              message: 'Password cannot be more than 255 characters',
            }]}
          >
            <Input.Password className="pwd-input" />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Form.Item
            label="New Password"
            name="newPwd"
            validateTrigger="onBlur"
            dependencies={['currentPwd']}
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
            }, {
              validator: validateNewPassword,
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
            dependencies={['newPwd']}
            rules={[{
              required: true,
              message: 'Please enter re-enter password',
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

export default ChangePassword;
