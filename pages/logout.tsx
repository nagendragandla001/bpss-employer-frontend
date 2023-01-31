import Loading3QuartersOutlined from '@ant-design/icons/Loading3QuartersOutlined';
import { Spin, Typography } from 'antd';
import config from 'config';
import snackBar from 'components/Notifications';
import { NextPage } from 'next';
import router from 'next/router';
import React, { useEffect } from 'react';
import { post } from 'service/api-method';
import { deleteUserCookies, getAuthToken } from 'service/auth-service';

const { Title } = Typography;

const Logout: NextPage = () => {
  const logOutUser = async (): Promise<void> => {
    const accessToken = getAuthToken();
    if (accessToken) {
      const apiCall = await post(`${config.API_ENDPOINT}api/v4/logout/`, {
        client_id: config.SOCIAL_AUTH_API_OAUTH2_KEY,
        client_secret: config.SOCIAL_AUTH_API_OAUTH2_SECRET,
        token: accessToken,
      });
      if ([200, 201, 202].indexOf(apiCall.status) > -1) {
        window?.localStorage?.removeItem('new_user');
        window?.localStorage?.removeItem('org_data');
        deleteUserCookies();
        router.push('/');
      } else if (process.browser) {
        snackBar({
          title: 'Some Error Occured!',
          description: 'Please Reload and Try Again',
          iconName: '',
          notificationType: 'error',
          placement: 'topRight',
          duration: 5,
        });
        router.push('/');
      }
    } else {
      router.push('/');
    }
  };
  useEffect(() => {
    logOutUser();
  }, []);
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '30rem',
    }}
    >
      <Title level={4} className="p-bottom-md"> Please wait a few seconds while we log you out</Title>
      <Spin indicator={<Loading3QuartersOutlined style={{ fontSize: '2rem' }} spin />} />
    </div>
  );
};

export default Logout;
