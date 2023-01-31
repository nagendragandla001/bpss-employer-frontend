/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/prop-types */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { CloseOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import {
  Button, Col, Dropdown, Menu, Row, Space, Typography,
} from 'antd';
import MobileJPGuideLines from 'components/Guidelines/Mobile/MobileJPGuideLines';
import JobPostingGuidelines from 'components/JobPostingGuidelinesModal';
import Container from 'components/Layout/Container';
import CustomImage from 'components/Wrappers/CustomImage';
import { AppConstants } from 'constants/index';
import { isMobile } from 'mobile-device-detect';
import Link from 'next/link';
import Router, { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import router from 'routes';
import { pushClevertapEvent } from 'utils/clevertap';

require('components/StaticPages/Common/LoggedInNav/LoggedInNav.component.less');

const { Text } = Typography;

// Disabling certain menu links when user is on specific pages
// List down the route name and set route-names which need
// to be disabled when user is on that route as true as below example.

const disabledRoutes = {
  // settings: { company: true, applications: true },
};

const LoggedInNav = (): JSX.Element => {
  const [showJPGuidelinesModal, setShowJPGuidelinesModal] = useState(false);
  const [enableMobileGuidelines, setEnableMobileGuidelines] = useState(false);
  const [isMobileBannerVisible, setMobileBannerVisible] = useState(false);

  const nextRouter = useRouter();
  const backPages = {
    jobPostFormCandidateRequirements: 'JobSpecs',
    jobPostFormReviewJob: 'CandidateSpecs',
  };

  const CurrentRoute = nextRouter && nextRouter.route && nextRouter.route.replace('/', '');
  const isJobPostingForm = nextRouter
    && nextRouter.asPath
    && nextRouter.asPath.includes('job-posting');
  const mobileMenu = !!isMobile;

  const handleClose = (): void => {
    Router.push('/employer-zone/jobs/');
  };

  const handleBack = (): void => {
    if (backPages[CurrentRoute]) {
      router.Router.pushRoute(backPages[CurrentRoute], {
        id: nextRouter.query.id,
      });
    }
  };

  const renderTitle = (): JSX.Element => {
    if (isJobPostingForm) {
      if (CurrentRoute === 'jobPostFormStep4') {
        return <div />;
      }
      if (CurrentRoute === 'jobPostFormBasicDetails') {
        return (
          <Button
            type="link"
            disabled={(window?.localStorage?.getItem('new_user') === '1')}
            icon={<CloseOutlined style={{ color: 'white' }} />}
            onClick={handleClose}
          />
        );
      }
      return (
        <Button
          type="link"
          icon={(
            <CustomImage
              src="/svgs/m-back.svg"
              width={24}
              height={24}
              alt="Back"
            />
          )}
          onClick={handleBack}
        />
      );
    }
    return <Text className="menu-title">{CurrentRoute}</Text>;
  };

  const getMenuItems = (): JSX.Element => (
    <Menu className="dropdown-menu-container">
      <Menu.Item
        key="1"
        onClick={(): void => {
          pushClevertapEvent('General Click', {
            Type: 'Profile',
            value: 'Settings',
          });
        }}
        disabled={(window?.localStorage?.getItem('new_user') === '1')}
      >
        <Link href="/settings" as="/employer-zone/settings">
          <a>Accounts</a>
        </Link>
      </Menu.Item>

      <Menu.Item
        key="2"
        onClick={(): void => {
          pushClevertapEvent('General Click', {
            Type: 'Profile',
            value: 'logout',
          });
        }}
      >
        <Link href="/logout/">
          <a>Logout</a>
        </Link>
      </Menu.Item>
    </Menu>
  );

  const localStorageKey = 'wj-to-rocket-mobile-banner';

  const closeBanner = (): void => {
    setMobileBannerVisible(false);
    window.localStorage.setItem(localStorageKey, 'true');
  };

  useEffect(() => {
    const localStorageItem = window.localStorage.getItem(localStorageKey);
    if (!localStorageItem && localStorageItem !== 'true') {
      if (isMobile) {
        setMobileBannerVisible(true);
      }
    }
  }, []);

  return mobileMenu ? (
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
      <Row
        className={`common-nav logged-in-mobile-menu-top${
          ['settings', 'company'].indexOf(CurrentRoute) !== -1
            ? ' transparent-menu'
            : ''
        }`}
        align="middle"
        justify="space-between"
      >
        {[
          'settings',
          'company',
          'myPlan',
          'jobPostFormBasicDetails',
          'jobPostFormCandidateRequirements',
          'jobPostFormReviewJob',
        ].indexOf(CurrentRoute) !== -1
          ? null : (
            <>
              <Col span={7}>{renderTitle()}</Col>
              <Col span={9}>
                <Button
                  type="ghost"
                  shape="round"
                  className="my-plan"
                  onClick={(): void => {
                    router.Router.pushRoute('MyPlan');
                    pushClevertapEvent('My Plan', {
                      Type: 'My Plan',
                      Source: 'Navbar',
                    });
                  }}
                >
                  <CustomImage
                    src="/images/pricing-plan/plan.jpg"
                    alt="my plan"
                    width={24}
                    height={24}
                  />
                  <span className="my-plan-style">My Plan</span>
                </Button>
              </Col>

              <Col span={4}>
                <Link href="/jobs" as="/employer-zone/jobs/">
                  <CustomImage
                    src="/images/assets/logo.svg"
                    alt={AppConstants.APP_NAME}
                    width={51}
                    height={20}
                  />
                </Link>
              </Col>
            </>
          )}
      </Row>
      {[
        'jobPostFormBasicDetails',
        'jobPostFormCandidateRequirements',
        'jobPostFormReviewJob',
      ].indexOf(CurrentRoute) !== -1
        ? (
          <Row
            className={`common-nav job-posting logged-in-mobile-menu-top${
              ['settings', 'company'].indexOf(CurrentRoute) !== -1
                ? ' transparent-menu'
                : ''
            }`}
            align="middle"
            justify="space-between"
          >
            <Col span={2}>{renderTitle()}</Col>
            <Col span={7} style={{ color: 'white' }}>
              {' '}
              POST A JOB
            </Col>
            <Col span={3} className="text-right">
              <Button
                onClick={(): void => setEnableMobileGuidelines(true)}
                type="link"
                icon={(
                  <CustomImage
                    src="/svgs/m-question.svg"
                    width={24}
                    height={24}
                    alt="question"
                  />
                )}
                style={{ marginTop: 9 }}
              />
              {enableMobileGuidelines && (
                <MobileJPGuideLines
                  visible={enableMobileGuidelines}
                  updateVisible={(): void => setEnableMobileGuidelines(false)}
                />
              )}
            </Col>
            <Col span={4}>
              <Link href="/jobs" as="/employer-zone/jobs/">
                <CustomImage
                  src="/images/assets/logo.svg"
                  alt={AppConstants.APP_NAME}
                  width={51}
                  height={20}
                />
              </Link>
            </Col>
          </Row>
        ) : null}

      <Row
        className="common-nav logged-in-mobile-menu-bottom"
        align="middle"
        justify="center"
      >
        <Col span={24}>
          <Menu
            mode="horizontal"
            className="mobile-menu-logos"
            defaultSelectedKeys={[CurrentRoute]}
            disabled={(window?.localStorage?.getItem('new_user') === '1')}
          >
            <Menu.Item
              key="jobs"
              disabled={
                disabledRoutes[CurrentRoute]
                && disabledRoutes[CurrentRoute].jobs
              }
              onClick={(): void => {
                pushClevertapEvent('General Click', {
                  Type: 'Navbar',
                  value: 'My Jobs',
                });
              }}
            >
              <Link href="/jobs" as="/employer-zone/jobs/">
                <a className="mobile-menu-link">
                  <CustomImage
                    src={
                      CurrentRoute === 'jobs'
                        ? '/images/common/mobile-nav/icon-jobs-active.svg'
                        : '/images/common/mobile-nav/icon-jobs.svg'
                    }
                    alt={AppConstants.APP_NAME}
                    width={24}
                  />
                  <Text className="mobile-menu-text">Jobs</Text>
                </a>
              </Link>
            </Menu.Item>
            <Menu.Item
              key="applications"
              disabled={
                disabledRoutes[CurrentRoute]
                && disabledRoutes[CurrentRoute].candidates
              }
              onClick={(): void => {
                pushClevertapEvent('General Click', {
                  Type: 'Navbar',
                  value: 'Candidates',
                });
              }}
            >
              <Link href="/candidates" as="/employer-zone/candidates">
                <a className="mobile-menu-link">
                  <CustomImage
                    src={
                      CurrentRoute === 'candidates'
                        ? '/images/common/mobile-nav/icon-applications-active.svg'
                        : '/images/common/mobile-nav/icon-applications.svg'
                    }
                    alt={AppConstants.APP_NAME}
                    width={24}
                  />
                  <Text className="mobile-menu-text">Candidates</Text>
                </a>
              </Link>
            </Menu.Item>
            <Menu.Item
              key="company"
              disabled={
                disabledRoutes[CurrentRoute]
                && disabledRoutes[CurrentRoute].company
              }
              onClick={(): void => {
                pushClevertapEvent('General Click', {
                  Type: 'Navbar',
                  value: 'Company Profile',
                });
              }}
            >
              <Link href="/company" as="/employer-zone/profile/">
                <a className="mobile-menu-link">
                  <CustomImage
                    src={
                      CurrentRoute === 'company'
                        ? '/images/common/mobile-nav/icon-company-active.svg'
                        : '/images/common/mobile-nav/icon-company.svg'
                    }
                    alt={AppConstants.APP_NAME}
                    width={24}
                  />
                  <Text className="mobile-menu-text">Company</Text>
                </a>
              </Link>
            </Menu.Item>
            <Menu.Item
              key="settings"
              disabled={
                disabledRoutes[CurrentRoute]
                && disabledRoutes[CurrentRoute].settings
              }
              onClick={(): void => {
                pushClevertapEvent('General Click', {
                  Type: 'Profile',
                  value: 'settings',
                });
              }}
            >
              <Link href="/settings" as="/employer-zone/settings">
                <a className="mobile-menu-link">
                  <CustomImage
                    src={
                      CurrentRoute === 'settings'
                        ? '/images/common/mobile-nav/icon-settings-active.svg'
                        : '/images/common/mobile-nav/icon-settings.svg'
                    }
                    alt={AppConstants.APP_NAME}
                    width={24}
                  />
                  <Text className="mobile-menu-text">Settings</Text>
                </a>
              </Link>
            </Menu.Item>
          </Menu>
        </Col>
      </Row>
    </Container>
  ) : (
    <Row className="navgiator-shadow">
      <Col span={24}>
        <Container>
          <Row align="middle" justify="space-between" className="common-nav">
            <Col span={16}>
              {[
                'jobPostFormBasicDetails',
                'jobPostFormCandidateRequirements',
                'jobPostFormReviewJob',
                'pricingPlans',
              ].indexOf(CurrentRoute) !== -1
                ? (
                  <Menu
                    mode="horizontal"
                    className="logged-in-desktop-menu"
                    defaultSelectedKeys={[CurrentRoute]}
                  >
                    <Menu.Item
                      key="logo"
                      disabled={
                        (disabledRoutes[CurrentRoute]
                      && disabledRoutes[CurrentRoute].logo) || (window?.localStorage?.getItem('new_user') === '1')
                      }
                      onClick={(): void => {
                        pushClevertapEvent('General Click', {
                          Type: 'Navbar',
                          value: 'My Jobs',
                        });
                      }}
                      className="desktop-logo"
                    >
                      <Link href="/jobs" as="employer-zone/jobs/">
                        <a>
                          <CustomImage
                            src="/images/assets/logo.svg"
                            alt={AppConstants.APP_NAME}
                            width={89}
                            height={35}
                          />
                        </a>
                      </Link>
                    </Menu.Item>
                  </Menu>
                ) : (
                  <Menu
                    mode="horizontal"
                    className="logged-in-desktop-menu"
                    defaultSelectedKeys={[CurrentRoute]}
                    selectedKeys={[CurrentRoute]}
                  >
                    <Menu.Item
                      key="logo"
                      disabled={
                        disabledRoutes[CurrentRoute]
                      && disabledRoutes[CurrentRoute].logo
                      }
                      onClick={(): void => {
                        pushClevertapEvent('General Click', {
                          Type: 'Navbar',
                          value: 'My Jobs',
                        });
                      }}
                    >
                      <Col span={24} className="desktop-logo">
                        <Link href="jobs" as="/employer-zone/jobs/">
                          <a className="desktop-logo">
                            <CustomImage
                              src="/images/assets/logo.svg"
                              alt={AppConstants.APP_NAME}
                              width={112}
                              height={32}
                            />
                          </a>
                        </Link>
                      </Col>
                    </Menu.Item>

                    <Menu.Item
                      key="jobs"
                      disabled={
                        disabledRoutes[CurrentRoute]
                      && disabledRoutes[CurrentRoute].applications
                      }
                      onClick={(): void => {
                        pushClevertapEvent('General Click', {
                          Type: 'Navbar',
                          value: 'My Jobs',
                        });
                      }}
                    >
                      <Link href="/jobs" as="/employer-zone/jobs/">
                        <a>Jobs</a>
                      </Link>
                    </Menu.Item>
                    <Menu.Item
                      key="candidates"
                      disabled={
                        disabledRoutes[CurrentRoute]
                      && disabledRoutes[CurrentRoute].applications
                      }
                      onClick={(): void => {
                        pushClevertapEvent('General Click', {
                          Type: 'Navbar',
                          value: 'Application',
                        });
                      }}
                    >
                      <Link href="/candidates" as="/employer-zone/candidates">
                        <a>Candidates</a>
                      </Link>
                    </Menu.Item>
                    <Menu.Item
                      key="company"
                      disabled={
                        disabledRoutes[CurrentRoute]
                      && disabledRoutes[CurrentRoute].company
                      }
                      onClick={(): void => {
                        pushClevertapEvent('General Click', {
                          Type: 'Navbar',
                          value: 'Company Profile',
                        });
                      }}
                    >
                      <Link href="/company" as="/employer-zone/profile/">
                        <a>Company Profile</a>
                      </Link>
                    </Menu.Item>
                  </Menu>
                )}
            </Col>
            <Col span={8}>
              <Row align="middle" justify="end">
                <Col className="display-flex flex-align-items-center">
                  {[
                    'jobPostFormBasicDetails',
                    'jobPostFormCandidateRequirements',
                    'jobPostFormReviewJob',
                  ].indexOf(CurrentRoute) !== -1
                    ? (
                      <Button
                        onClick={(): void => setShowJPGuidelinesModal(true)}
                        className="job-posting-help-btn"
                        icon={<QuestionCircleOutlined className="help" />}
                      >
                        Help
                      </Button>
                    ) : (
                      <Row align="middle">
                        <Col style={{ marginRight: '18px' }}>
                          <Button
                            type="ghost"
                            shape="round"
                            className={
                              CurrentRoute === 'myPlan'
                                ? 'logged-my-plan'
                                : 'my-plan'
                            }
                            disabled={
                              disabledRoutes[CurrentRoute]
                            && disabledRoutes[CurrentRoute].myPlan
                            }
                            onClick={(): void => {
                              router.Router.pushRoute('MyPlan');
                              pushClevertapEvent('My Plan', {
                                Type: 'My Plan',
                                Source: 'Navbar',
                              });
                            }}
                          >
                            <CustomImage
                              src="/images/pricing-plan/plan.jpg"
                              alt="my plan"
                              width={16}
                              height={16}
                            />
                            <span className="my-plan-style text-small">
                              My Plan
                            </span>
                          </Button>
                        </Col>

                        {/* style={{ marginTop: '1rem' }} */}
                        <Col className="padding-right-24 flex-all-center">
                          <Button
                            className="post-a-job-btn"
                            onClick={(): void => {
                              router.Router.pushRoute('NewJobPosting');
                              pushClevertapEvent('New Job Post', {
                                Type: 'New Job Post',
                              });
                            }}
                          >
                            <CustomImage
                              src="/svgs/post-a-job-icon24x24.svg"
                              alt="Post A Job"
                              width={13}
                              height={17}
                            />
                            <span className="my-plan-style">Post A Job</span>
                          </Button>
                        </Col>
                      </Row>
                    )}
                </Col>
                <Col className="nav-dropdown">
                  <Dropdown
                    overlay={getMenuItems()}
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <a>
                      <Space size={6.5} align="center">
                        <CustomImage
                          src="/images/common/icon-user-profile.svg"
                          height={20}
                          width={20}
                          className="nav-right"
                          alt="user-profile"
                        />
                        {/* <DownOutlined style={{ color: '#fff', verticalAlign: '0em' }} /> */}
                        <CustomImage
                          src="/images/common/icon-down-arrow.svg"
                          height={12}
                          width={8}
                          alt="down-arrow"
                          className="vertical-align-0"
                        />
                      </Space>
                    </a>
                  </Dropdown>
                </Col>
              </Row>
            </Col>
          </Row>
          {showJPGuidelinesModal ? (
            <JobPostingGuidelines
              onCloseHandler={(): void => setShowJPGuidelinesModal(false)}
            />
          ) : null}
        </Container>
      </Col>
    </Row>
  );
};

export default LoggedInNav;
