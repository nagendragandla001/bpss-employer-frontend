import {
  Button, Col, FormInstance, Row,
} from 'antd';
import React from 'react';
import { pushClevertapEvent } from 'utils/clevertap';
import { modalFooterBtnText, resendOtp, SettingsStateI } from './settingsPageUtils';

interface ModalFooterProps {
  state: SettingsStateI;
  dispatch: ({ type: string, payload: any }) => void;
  form: FormInstance;
}
const ModalFooter = ({ state, dispatch, form }: ModalFooterProps): JSX.Element | null => {
  if (state?.showModal) {
    if (state?.showModal === 'verifyMobileNo') {
      return (
        <>
          <Button
            type="link"
            className="link-btn"
            onClick={(): Promise<void> => {
              pushClevertapEvent('Mobile Change', { Type: 'Resend' });
              return resendOtp(true, state, dispatch);
            }}
          >
            {state?.resendingOtp ? 'Sending…' : ' Resend OTP'}
          </Button>
          <Button
            className="form-btn"
            type="primary"
            onClick={(): void => form.submit()}
            loading={state?.requestInProgress}
          >
            Verify
          </Button>
        </>
      );
    }
    if (state?.showModal === 'changePwd') {
      return (
        <Row gutter={[0, 16]}>
          <Col span={24}>
            <Button
              className="form-btn"
              type="primary"
              block
              onClick={(): void => form.submit()}
              loading={state?.requestInProgress}
            >
              {modalFooterBtnText[state?.showModal]}
            </Button>
          </Col>
          <Col span={24}>
            <Button
              type="link"
              block
              onClick={(): void => dispatch({ type: 'UPDATESTATE', payload: { showModal: 'forgotPassword' } })}
            >
              Forgot Password?
            </Button>
          </Col>
        </Row>
      );
    }
    if (Object.keys(modalFooterBtnText).indexOf(state?.showModal) !== -1) {
      return (
        <Button
          className="form-btn"
          type="primary"
          block
          onClick={(): void => {
            if (['verifyEmail', 'mobileNoUpdated', 'mobileNoVerified'].indexOf(state?.showModal) !== -1) {
              dispatch({ type: 'UPDATESTATE', payload: { showModal: '' } });
            } else {
              form.submit();
            }
          }}
          loading={state?.requestInProgress}
        >
          {modalFooterBtnText[state?.showModal]}
        </Button>
      );
    }
  }
  return null;
};

export default ModalFooter;
