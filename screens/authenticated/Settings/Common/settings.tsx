import { Form, Input } from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import React from 'react';
import {
  isUserValid,
} from 'screens/authenticated/Settings/Common/settingsPageUtils';
import { EmailRegexPattern, MobileRegexPattern, TitlePattern } from 'utils/constants';

export const FirstName = ({ state }: any): JSX.Element => (
  <Form.Item
    label="First Name"
    name="firstName"
    validateTrigger="onBlur"
    rules={[
      {
        required: true,
        message: 'Please enter First Name',
      },
      {
        pattern: TitlePattern,
        message: 'First Name is not valid',
      },
      {
        whitespace: true,
        message: 'First Name cannot be empty',
      },
      {
        max: 100,
        message: 'First Name cannot be more than 100 characters',
      },
    ]}
    initialValue={(state.loggedInManager && state.loggedInManager.firstName) || ''}
  >
    <Input
      size="large"
    />
  </Form.Item>
);

export const LastName = ({ state }: any): JSX.Element => (
  <Form.Item
    label="Last Name"
    name="lastName"
    validateTrigger="onBlur"
    rules={[
      {
        required: true,
        message: 'Please enter Last Name',
      },
      {
        pattern: TitlePattern,
        message: 'Last Name is not valid',
      },
      {
        whitespace: true,
        message: 'Last Name cannot be empty',
      },
      {
        max: 100,
        message: 'Last Name cannot be more than 100 characters',
      },
    ]}
    initialValue={state?.loggedInManager?.lastName || ''}
  >
    <Input
      size="large"
    />
  </Form.Item>
);

export const EmailInputElement = (label: string): JSX.Element => (
  <Form.Item
    label={label}
    name="email"
    validateTrigger="onBlur"
    rules={[
      {
        required: true,
        message: 'Please enter an email ID',
      },
      {
        pattern: EmailRegexPattern,
        message: 'Please input valid Email ID!',
      },
      {
        validator: isUserValid,
      },
      {
        max: 200,
        message: 'Email Id cannot be more than 200 characters',
      },
    ]}
  >
    <Input type="text" />
  </Form.Item>
);

export const MobileNoInputElement = (label: string, required: boolean): JSX.Element => (
  <Form.Item
    label={label}
    name="mobileNo"
    validateTrigger="onBlur"
    rules={[
      {
        required,
        message: 'Please enter mobile number',
      },
      {
        pattern: MobileRegexPattern,
        message: 'Please enter a valid mobile number',
      },
      {
        validator: isUserValid,
      },
    ]}
  >
    <Input
      addonBefore="+91"
      size="large"
    />
  </Form.Item>
);

export default {};
