/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */

import CloseOutlined from '@ant-design/icons/CloseOutlined';
import {
  Col, Divider, Form, Modal, Row, Typography,
} from 'antd';
import UnverifiedContext from 'components/Context/UnverifiedContext';
import UnverifiedEmailNotification from 'components/UnverifiedEmailNotification/UnverifiedEmailNotification';
import AppConstants from 'constants/constants';
import Head from 'next/head';
import React, { useContext, useEffect } from 'react';
import {
  getSettingPageData,
  modalTitles,
  onCloseHandler,
  onEditHandler, onFinishSettingsHandler, SettingsStateI,
} from 'screens/authenticated/Settings/Common/settingsPageUtils';
import SettingsSkeleton from 'screens/authenticated/Settings/Desktop/settingsSkeleton';
import VerificationDetails from 'screens/authenticated/Settings/Desktop/VerificationDetails';
import ManagerSettings from '../Common/ManagerSettings';
import ModalContent from '../Common/ModalContent';
import ModalFooter from '../Common/ModalFooter';
import UserDetails from '../Common/UserDetails';
import UserSettings from '../Common/UserSettings';
import VerificationAlert from '../Common/VerificationAlert';

require('screens/authenticated/Settings/Desktop/settings.less');

const { Text } = Typography;

interface SettingProps {
  state: SettingsStateI;
  dispatch: (evt) => void;
}

const Settings = ({ state, dispatch }: SettingProps):JSX.Element => {
  const [form] = Form.useForm();
  const verifyStatus = useContext(UnverifiedContext);

  const initData = async (): Promise<void> => {
    const data = await getSettingPageData();
    dispatch({ type: 'INIT', payload: data });
  };

  useEffect(() => {
    initData();
  }, []);

  const onFinishHandler = async (formData):Promise<void> => {
    onFinishSettingsHandler(formData, state, dispatch, verifyStatus, form);
  };

  return (
    <>
      {/* SEO Stuff Start */}
      <Head>
        <title>
          {`Settings | ${AppConstants.APP_NAME}`}
        </title>
        <meta
          name="description"
          content={`Settings | ${AppConstants.APP_NAME}`}
          key="description"
        />
      </Head>
      {/* SEO Stuff Ends */}
      <Row className="settings-page-container">
        <Col span={24}>
          {state?.dataLoading ? <SettingsSkeleton /> : (
            <Row gutter={[0, 24]}>
              {
                !state?.emailVerified && (
                  <Col span={24}>
                    <UnverifiedEmailNotification />
                  </Col>
                )
              }
              {
                (state?.emailVerified && state?.verificationInfo?.status !== 'V') && (
                  <Col span={24}>
                    <VerificationAlert />
                  </Col>
                )
              }
              <Col span={24}>
                <Row className="settings-wrapper" gutter={[0, 32]}>
                  <Col span={24} className="setting-container">
                    <UserDetails
                      state={state}
                      onEdit={(type): void => onEditHandler(type, state, dispatch)}
                    />
                  </Col>
                  <Col span={24}>
                    <VerificationDetails
                      state={state}
                      dispatch={dispatch}
                    />
                  </Col>
                  <Col span={24}>
                    <UserSettings
                      state={state}
                      onEdit={(type): void => onEditHandler(type, state, dispatch)}
                    />
                    <Divider className="user-settings-divider" />
                  </Col>
                  <Col span={24}>
                    <ManagerSettings
                      state={state}
                      onEdit={(type, index): void => onEditHandler(type, state, dispatch, index)}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          )}
        </Col>
        <Modal
          title={<Text>{modalTitles[state?.showModal]}</Text>}
          visible={!!state?.showModal}
          onCancel={(): void => onCloseHandler(state, dispatch)}
          destroyOnClose
          closeIcon={<CloseOutlined style={{ color: '#284e52', fontSize: '1.25rem' }} />}
          className="settings-modal"
          maskStyle={{ background: 'rgba(0, 20, 67,0.8)' }}
          footer={<ModalFooter state={state} dispatch={dispatch} form={form} />}
          width={400}
        >
          <Form
            name="settingForm"
            layout="vertical"
            size="large"
            form={form}
            onFinish={onFinishHandler}
            className="settings-modal-form"
            hideRequiredMark
            preserve={false}
            initialValues={{
              fpEmail: state?.loggedInManager?.email,
            }}
          >
            <ModalContent state={state} form={form} />
          </Form>
        </Modal>
      </Row>
    </>
  );
};

export default Settings;
