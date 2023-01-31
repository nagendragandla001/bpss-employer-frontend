/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/prop-types */
/* eslint-disable jsx-a11y/anchor-is-valid */
import MenuOutlined from '@ant-design/icons/MenuOutlined';
import {
  Button, Col, Dropdown, Menu, Row, Typography,
} from 'antd';
import Container from 'components/Layout/Container';
import CustomImage from 'components/Wrappers/CustomImage';
import config from 'config';
import { AppConstants, LinksConstants } from 'constants/index';
import { isMobile } from 'mobile-device-detect';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Router, { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import {
  trackJobSeekers, trackNavbarLogin, trackNavbarRegister, trackPremiumPosting,
} from 'service/clevertap/common-events';
import { getUserInfo } from 'service/login-service';
import { getAccessToken } from 'utils/browser-utils';
import { pushClevertapEvent } from 'utils/clevertap';

require('components/StaticPages/Common/PublicNav/PublicNav.component.less');

const { Text } = Typography;

const LoginModal = dynamic(() => import('components/StaticPages/Common/LoginModal/LoginModal.component'), { ssr: false });

const PublicNav: React.FunctionComponent = () => {
  const router = useRouter();

  const [isModalVisible, setModalVisibility] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isLoginInProgress, setIsLoginInProgress] = useState(false);
  const [isMobileBannerVisible, setMobileBannerVisible] = useState(false);
  // const [keys, setkeys] = useState(false);
  const openLoginModal = (): void => {
    // setkeys(true);
    setModalVisibility(true);
    pushClevertapEvent('Login Modal');
  };

  const modalHandler = (text: boolean): void => {
    setModalVisibility(text);
  };

  const onMenuClose = (): void => {
    setIsMenuVisible(!isMenuVisible);
  };

  const onMenuClick = (e): void => {
    setIsMenuVisible(!isMenuVisible);
  };

  const localStorageKey = 'wj-to-rocket-mobile-banner';

  const closeBanner = (): void => {
    setMobileBannerVisible(false);
    window.localStorage.setItem(localStorageKey, 'true');
  };

  const authCheck = async (): Promise<void> => {
    setIsLoginInProgress(true);
    const accessToken = getAccessToken();
    if (accessToken) {
      // Check if access_token is valid
      const apiResponse = await getUserInfo(true);
      if (apiResponse) {
        setIsLoginInProgress(false);
        Router.push('/employer-zone/jobs');// Redirecting to Employer zone
      }
    } else {
      setIsLoginInProgress(false);
      openLoginModal();
    }
  };

  const menuItem = (props: { mode; className }): React.ReactNode => {
    const { mode, className } = props;
    return (

      <Menu
        mode={mode}
        className={!isMobile ? `common-menu ${className}` : isMenuVisible ? `common-menu ${className}` : 'menu-close'}
      >
        {/* Jobseekers Link */}
        <Menu.Item key="2" className="navbar-links" onClick={onMenuClose}>
          <a href={config.AJ_URL} onClick={(): void => trackJobSeekers('Navbar')}>
            <Text className="text-semibold">
              For Jobseekers
            </Text>
          </a>
        </Menu.Item>

        {/* Premium Posting */}
        <Menu.Item key="1" className="navbar-links" onClick={onMenuClose}>
          <Link
            href="/premiumPosting"
            as="/products/job-posting/"
            prefetch={false}
          >
            <a onClick={(): void => trackPremiumPosting('Navbar')} className="text-semibold">
              Premium Plans
            </a>
          </Link>
        </Menu.Item>

        {/* About Us Link */}
        <Menu.Item key="3" className="navbar-links" onClick={onMenuClose}>
          <Link href={LinksConstants.ABOUT}>
            <a href={LinksConstants.ABOUT} onClick={(): void => trackJobSeekers('Navbar')}>
              <Text className="text-semibold">
                About Us
              </Text>
            </a>
          </Link>
        </Menu.Item>

        {/* Register */}
        {router.pathname !== '/register' && (
          <Menu.Item key="4" className="navbar-register-btn" onClick={onMenuClose}>
            <Link href="/register/" prefetch={false}>
              <Button
                type="primary"
                size="middle"
                className="br-8 text-base text-semibold"
                onClick={(): void => trackNavbarRegister('Navbar')}
              >
                {/* { className !== 'mobile-menu'
                  ? 'Create FREE Account'
                  : 'Create Account for FREE'} */}
                Login / Register
              </Button>
            </Link>
          </Menu.Item>
        )}

        {/* Login */}
        {/* <Menu.Item key="5" className="navbar-login-btn" onClick={onMenuClose}>
          <Button
            type="default"
            size={mode === 'vertical' ? 'middle' : 'large'}
            loading={isLoginInProgress}
            className="b-radius-4 text-base text-semibold"
            onClick={(): void => { authCheck(); trackNavbarLogin('Navbar'); }}
          >
            Log in
          </Button>
        </Menu.Item> */}
      </Menu>
    );
  };

  const menu = (
    <Menu>
      {menuItem({ mode: 'vertical', className: 'mobile-menu' })}
    </Menu>
  );

  useEffect(() => {
    const localStorageItem = window.localStorage.getItem(localStorageKey);
    if (!localStorageItem && localStorageItem !== 'true') {
      if (isMobile) {
        setMobileBannerVisible(true);
      }
    }
  }, []);

  return (
    <nav className="public-nav">
      <Container>
        {isMobileBannerVisible ? (
          <Row>
            <Col span={24}>
              <a href="#" onClick={closeBanner}>
                <img
                  src="/images/static-pages/common/mobile-banner.svg"
                  alt="Mobile banner"
                  width="100%"
                />
              </a>
            </Col>
          </Row>
        ) : ''}
        <Row gutter={0} align="middle" justify="space-between" className="common-nav">
          <Col xs={{ span: 22, offset: 1 }} md={{ span: 3, offset: 0 }} lg={{ span: 3, offset: 0 }}>
            <Row align="middle">
              <Col lg={{ span: 0 }} xs={{ span: 24 }}>
                <div className="logo-align-block">
                  <Dropdown
                    overlay={menu}
                    overlayClassName="navbar-mobile-menu"
                    trigger={['click']}
                    visible={isMenuVisible}
                  >
                    <a onClick={onMenuClick} style={{ color: '#020812', paddingRight: '16px' }}><MenuOutlined /></a>
                  </Dropdown>
                  <Link href="employerHomePage" as="/" prefetch={false}>
                    <a className="mobile-logo">
                      <CustomImage
                        className={isMobile ? 'mobile-logo' : 'desktop-logo'}
                        src="/images/assets/logo.svg"
                        alt={AppConstants.APP_NAME}
                        width={89}
                        height={35}
                      />
                    </a>
                  </Link>
                </div>
              </Col>
              <Col
                xs={{ span: 0 }}
                md={{ span: 0 }}
                lg={{ span: 20 }}
                className="logo desktop-logo"
              >
                <Link href="employerHomePage" as="/" prefetch={false}>
                  {isMobile ? <></>
                    : (
                      <a>
                        <CustomImage
                          src="/images/assets/logo.svg"
                          width={89}
                          height={35}
                          alt={AppConstants.APP_NAME}
                        />
                      </a>
                    )}
                </Link>
              </Col>
            </Row>
          </Col>
          <Col xs={{ span: 0 }} md={{ span: 0 }} lg={{ span: 18 }}>
            {menuItem({ mode: 'horizontal', className: 'desktop-menu' })}
          </Col>
        </Row>
      </Container>
      {isModalVisible ? <LoginModal modalHandler={modalHandler} /> : ''}
    </nav>
  );
};

export default PublicNav;
