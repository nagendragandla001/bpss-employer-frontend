/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */

import CloseOutlined from '@ant-design/icons/CloseOutlined';
import {
  Alert, Button, Col, Divider, Drawer, Form, Row, Space, Typography,
} from 'antd';
import UnverifiedContext from 'components/Context/UnverifiedContext';
import CustomImage from 'components/Wrappers/CustomImage';
import AppConstants from 'constants/constants';
import Head from 'next/head';
import React, { useContext, useEffect } from 'react';
import router from 'routes';
import {
  getSettingPageData, modalTitles,
  onCloseHandler, onEditHandler, onFinishSettingsHandler, SettingsStateI,
} from 'screens/authenticated/Settings/Common/settingsPageUtils';
import SettingsSkeleton from 'screens/authenticated/Settings/Mobile/settingsSkeleton';
import { pushClevertapEvent } from 'utils/clevertap';
import ManagerSettings from '../Common/ManagerSettings';
import ModalContent from '../Common/ModalContent';
import ModalFooter from '../Common/ModalFooter';
import UserDetails from '../Common/UserDetails';
import UserSettings from '../Common/UserSettings';
import VerificationAlert from '../Common/VerificationAlert';
import VerificationDetails from '../Desktop/VerificationDetails';
import Logout from './Logout';

require('screens/authenticated/Settings/Mobile/settings.less');

const { Text, Paragraph } = Typography;
interface SettingsI {
  state: SettingsStateI;
  dispatch: (payload) => void;
}

const Settings = ({ state, dispatch }: SettingsI):JSX.Element => {
  const [form] = Form.useForm();
  const verifyStatus = useContext(UnverifiedContext);

  const initData = async (): Promise<void> => {
    const data = await getSettingPageData();
    dispatch({ type: 'INIT', payload: data });
  };

  useEffect(() => {
    initData();
  }, []);

  const onFinishHandler = async (formData): Promise<void> => {
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
      <Row className="m-settings-page-container">
        {
          (state?.emailVerified && state?.verificationInfo?.status !== 'V') && (
            <Col span={24} className="p-all-16">
              <VerificationAlert />
            </Col>
          )
        }
        <Col span={24}>
          {state.dataLoading ? <SettingsSkeleton /> : (
            <Row className="settings-wrapper" gutter={[0, 16]}>
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
                <section className="p-left-16">
                  <UserSettings
                    state={state}
                    onEdit={(type): void => onEditHandler(type, state, dispatch)}
                  />
                </section>
              </Col>
              <Divider style={{ margin: 0 }} />
              <Col span={24}>
                <section className="p-left-16">
                  <Logout />
                </section>
              </Col>
              <Divider style={{ margin: 0 }} />
              <Col span={24}>
                <Button
                  type="link"
                  shape="round"
                  onClick={(): void => {
                    router.Router.pushRoute('MyPlan');
                    pushClevertapEvent('General Click', { Type: 'Navbar', value: 'Passbook' });
                  }}
                >
                  <Space align="center">
                    <div className="display-flex">
                      <CustomImage
                        src="/images/pricing-plan/plan.jpg"
                        alt="my plan"
                        width={24}
                        height={24}
                      />
                    </div>
                    <Text className="text-bold text-medium">My Plan</Text>
                  </Space>
                </Button>
              </Col>
              <Divider style={{ margin: 0 }} />

              <Col span={24}>
                <ManagerSettings
                  state={state}
                  onEdit={(type, index): void => onEditHandler(type, state, dispatch, index)}
                />
              </Col>
            </Row>
          )}
        </Col>
      </Row>
      <Drawer
        title={<Text className="text-center">{modalTitles[state?.showModal]}</Text>}
        visible={!!state?.showModal}
        placement="bottom"
        onClose={(): void => onCloseHandler(state, dispatch)}
        destroyOnClose
        closeIcon={<CloseOutlined style={{ color: '#284e52', fontSize: '1.5rem' }} />}
        className={`settings-drawer ${state?.showModal === 'passbook' ? 'padding-all-0' : ''}`}
        maskStyle={{ background: 'rgb(0, 47, 52,0.8)' }}
        footer={<ModalFooter state={state} dispatch={dispatch} form={form} />}
        height="100%"
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
      </Drawer>
    </>
  );
};

export default Settings;
