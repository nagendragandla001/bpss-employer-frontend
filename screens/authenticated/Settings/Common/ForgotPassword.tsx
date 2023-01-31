/* eslint-disable prefer-promise-reject-errors */
import React from 'react';
import { Form, FormInstance, Input } from 'antd';
import { EmailRegexPattern } from 'utils/constants';
import { LinksConstants } from 'constants/index';
import { recognizeUserAPI } from 'service/login-service';

interface PasswordProps {
  form: FormInstance;
}

const ForgotPassword = ({ form }: PasswordProps): JSX.Element => {
  const checkExistingUser = async (_rule, value: string): Promise<boolean | void> => {
    if (value && EmailRegexPattern.test(value)) {
      const response = await recognizeUserAPI(value,
        { isForm: true, withAuth: false, errorMessage: '' });
      const userData = await response.data;
      if (userData) {
        if (userData && userData.organization_status === 'O_RJ') {
          throw new Error('Your request for Account has been rejected.');
        } if (userData && userData.user_type) {
          switch (userData.user_type) {
            case 'ER':
              return Promise.resolve();
            case 'CA':
              return Promise.reject(
                <>
                  You already have an account with us as Candidate.&nbsp;
                  <a href={LinksConstants.AJ_URL} rel="noopener noreferrer" target="_blank">
                    Login as candidate
                  </a>
                </>,
              );
            case 'P':
              throw new Error('You seem to be our Partner.');
            case 'PA':
              throw new Error('You seem to have an Agency account with us.');
            default:
              throw new Error('Some Error Occured');
          }
        } else {
          if (userData && userData.code === 404) {
            throw new Error('You do not have an account with us. Please register.');
          }
          throw new Error('Some Error Occured. Please try again after some time.');
        }
      } else {
        throw new Error(response.response.data.message);
      }
    }
    return true;
  };
  return (
    <Form.Item
      label={(<span className="text-small">Your Email</span>)}
      name="fpEmail"
      rules={[
        {
          required: true,
          message: 'Please input Email ID!',
        }, {
          pattern: EmailRegexPattern,
          message: 'Please input valid Email ID!',
        }, {
          validator: checkExistingUser,
        },
      ]}
    >
      <Input
        className="text-base"
        placeholder="Your Email"
        autoFocus
      />
    </Form.Item>
  );
};

export default ForgotPassword;
