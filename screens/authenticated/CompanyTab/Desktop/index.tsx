/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-expressions */
import {
  Alert,
  Button, Col, Modal, Popover, Row, Space, Typography,
} from 'antd';
import Container from 'components/Layout/Container';
import config from 'config';
import AppConstants from 'constants/constants';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
// import AboutModal from 'screens/authenticated/CompanyTab/Common/AboutModal';
// import CompanyAddDetails from 'screens/authenticated/CompanyTab/Common/ComapanyAddDetailsModal';
import {
  AddDetailsModal, companyType, employeeCountLabel,
  generalDetailsModal, getOrganizationData, OrganizationDetailsType,
  stripHtmlTags,
} from 'screens/authenticated/CompanyTab/Common/CompanyTabUtils';
import Locality from 'screens/authenticated/CompanyTab/Common/Locality';
import Logo from 'screens/authenticated/CompanyTab/Common/Logo';
import OfficePhotos from 'screens/authenticated/CompanyTab/Common/OfficePhotos';
import Profile from 'screens/authenticated/CompanyTab/Common/Profile';
import { pushClevertapEvent } from 'utils/clevertap';
import EmptyLayout from 'screens/authenticated/CompanyTab/Desktop/CompanyEmptyLayout';
import UnverifiedEmailNotification from 'components/UnverifiedEmailNotification/UnverifiedEmailNotification';
import CustomImage from 'components/Wrappers/CustomImage';
import dynamic from 'next/dynamic';
import { getLoggedInUser } from 'service/accounts-settings-service';
import Link from 'next/link';

const AboutModal = dynamic(() => import('screens/authenticated/CompanyTab/Common/AboutModal'), { ssr: false });
const CompanyAddDetails = dynamic(() => import('screens/authenticated/CompanyTab/Common/ComapanyAddDetailsModal'), { ssr: false });
const WorkModal = dynamic(() => import('screens/authenticated/CompanyTab/Common/WorkModal'), { ssr: false });
const CompanyDetails = dynamic(() => import('screens/authenticated/CompanyTab/Desktop/CompanyDetailsModal'), { ssr: false });

require('screens/authenticated/CompanyTab/Desktop/company.less');

const { Paragraph, Text, Title } = Typography;

type UserDetailsType = {
  emailVerified: boolean;
  verificationStatus: string;
}

const ORGTYPES = {
  SME: 'Company',
  HR: 'Recruitment Agency',
  IND: 'Freelancer',
};

const Company: React.FC = ():JSX.Element => {
  // State Definition
  const [orgData, setOrgData] = useState<OrganizationDetailsType>();
  const [userData, setUserData] = useState<UserDetailsType>();
  const [generalDetails, setGeneralDetails] = useState(false);
  const [addDetails, setAddDetails] = useState(false);
  const [workModal, setworkModal] = useState(false);
  const [aboutModal, setaboutModal] = useState(false);
  const [logo, setlogo] = useState(false);
  const [office, setOffice] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const setOrganizationData = async ():Promise<void> => {
    const orgCall = await getOrganizationData();
    const userCall = await getLoggedInUser();

    if (orgCall && userCall) {
      setOrgData(orgCall);

      if ([200, 201, 202].includes(userCall.status)) {
        setUserData({
          emailVerified: userCall?.data?.objects?.[0]?.email_verified,
          verificationStatus: orgCall?.verificationInfo?.status,
        });
      }
    }
  };
  const patchrequest = (msg):void => {
    if (msg === 'success') setRefresh(!refresh);
  };

  useEffect(() => {
    setOrganizationData();
  }, [refresh]);

  const profileHandler = (link):void => {
    if (AddDetailsModal.indexOf(link) !== -1) {
      setAddDetails(true);
    } else if (generalDetailsModal.indexOf(link) !== -1) {
      setGeneralDetails(true);
    } else if (link === 'Add Why Work With Us') {
      setworkModal(true);
    } else if (link === 'Add About Your Company') {
      setaboutModal(true);
    } else if (link === 'Add Logo') {
      setlogo(true);
    } else { setOffice(true); }
  };

  const handlephotos = async (photo):Promise<void> => {
    if (photo) {
      setRefresh(!refresh);
    }
  };

  const handlelogo = async (logopic):Promise<void> => {
    if (logopic) {
      setRefresh(!refresh);
    }
  };

  return (
    <>
      <Head>
        <title>
          {`Company | ${AppConstants.APP_NAME}`}
        </title>
        <meta
          name="description"
          content={`Company | ${AppConstants.APP_NAME}`}
          key="description"
        />
      </Head>
      {orgData
        ? (
          <>

            {/* Basic Company Details */}
            <Row className="ct-desktop-header">
              <Container>
                <UnverifiedEmailNotification />
                {
                  (userData?.emailVerified && userData?.verificationStatus !== 'V') && (
                    <Alert
                      type="warning"
                      showIcon={false}
                      className="comapny-verification"
                      message={(
                        <Space direction="horizontal">
                          <Text className="text-bold">Verify your organisation</Text>
                        </Space>
                      )}
                      action={(
                        <Link href="/settings" as="/employer-zone/settings">
                          <a>
                            <Button
                              size="small"
                              type="primary"
                              className="verification-alert-btn"
                              onClick={():void => {
                                pushClevertapEvent('Verify Org', {
                                  source: 'SnackBar',
                                  category: ORGTYPES[orgData?.type],
                                  emailVerified: userData?.emailVerified,
                                  'KYC Status': orgData?.verificationInfo?.status,
                                });
                              }}
                            >
                              Verify
                            </Button>
                          </a>
                        </Link>
                      )}
                    />
                  )
                }
                <Row
                  className={orgData && orgData.profileScore > 15 ? '' : 'ct-header-background'}
                  style={{ marginTop: '30px' }}
                >
                  {/* Main info */}
                  <Col span={16}>
                    <Row gutter={20} className="ct-desktop-info">

                      {/* Company Logo */}
                      <Col span={5} className="ct-back-transparent">
                        {orgData?.id ? (
                          <Logo
                            photos={orgData?.logo}
                            id={orgData?.id}
                            size="152px"
                            handlelogo={handlelogo}
                          />
                        ) : null}
                      </Col>

                      {/* Basic Company Info */}
                      <Col span={12} className="ct-desktop-info-main ct-back-transparent">

                        {/* Company name */}
                        <Space>
                          <Paragraph strong ellipsis className="ct-company-name ct-back-transparent">
                            {orgData?.name}
                          </Paragraph>
                        </Space>

                        {/* Tagline */}
                        <Paragraph className="ct-company-tagline ct-back-transparent">
                          {orgData?.tagline ? orgData?.tagline : (
                            <Button
                              type="link"
                              onClick={():void => {
                                setGeneralDetails(true);
                                pushClevertapEvent('Special Click', { Type: 'Add Tagline' });
                              }}
                              className="ct-add-links-tagline ct-back-transparent"
                            >
                              + Add Tagline
                            </Button>
                          )}
                        </Paragraph>

                        {/* Social Links */}
                        <Paragraph className="ct-desktop-links ct-back-transparent">

                          {/* Website */}
                          <Popover
                            placement="bottom"
                            overlayClassName={orgData?.website ? 'ct-popover-none' : 'ct-popover-des ct-popover-background-grey'}
                            content={orgData?.website ? '' : 'Add Website'}
                            arrowPointAtCenter
                          >
                            <a
                              href={orgData?.website}
                              className={orgData?.website ? 'ct-links' : ''}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {orgData?.website
                                ? (
                                  <Button
                                    type="link"
                                    icon={(
                                      <CustomImage
                                        src="/images/company-tab/website-link.svg"
                                        width={18}
                                        height={17}
                                        alt="website"
                                      />
                                    )}
                                    className="ct-empty-btn"
                                    onClick={():void => {
                                      setGeneralDetails(true);
                                      pushClevertapEvent('Special Click', { Type: 'Add Website' });
                                    }}
                                  >
                                    <Text style={{ paddingLeft: 5 }}>Website</Text>
                                  </Button>

                                )
                                : (
                                  <Button
                                    type="link"
                                    icon={(
                                      <CustomImage
                                        src="/images/company-tab/website-empty-icon.svg"
                                        alt="website-empty"
                                        width={19}
                                        height={19}
                                      />
                                    )}
                                    className="ct-empty-btn"
                                    onClick={():void => {
                                      setGeneralDetails(true);
                                      pushClevertapEvent('Special Click', { Type: 'Add Website' });
                                    }}
                                  >
                                    <Text style={{ paddingLeft: 5 }}>Website</Text>
                                  </Button>
                                ) }

                            </a>
                          </Popover>
                          <Text style={{ padding: '0 10px 0 20px' }}>|</Text>

                          {/* Facebook */}
                          <Popover
                            placement="bottom"
                            overlayClassName={orgData?.facebook ? 'ct-popover-none' : 'ct-popover-des ct-popover-background-grey'}
                            content={orgData?.facebook ? '' : 'Add facebook link'}
                            arrowPointAtCenter
                          >
                            {orgData?.facebook
                              ? (
                                <a href={orgData?.facebook}>
                                  <CustomImage
                                    src="/images/company-tab/fb-link.svg"
                                    width={44}
                                    height={44}
                                    alt="facebook"
                                  />
                                </a>
                              )
                              : (
                                <Button
                                  type="ghost"
                                  icon={(
                                    <CustomImage
                                      src="/images/company-tab/fb-empty-icon.svg"
                                      width={44}
                                      height={44}
                                      alt="facebook-empty"
                                    />
                                  )}
                                  className="ct-empty-btn"
                                  onClick={():void => {
                                    setGeneralDetails(true);
                                    pushClevertapEvent('Special Click', { Type: 'Add facebook' });
                                  }}
                                />
                              )}
                          </Popover>

                          {/* Linkedin */}
                          <Popover
                            placement="bottom"
                            overlayClassName={orgData?.linkedin ? 'ct-popover-none' : 'ct-popover-des ct-popover-background-grey'}
                            content={orgData?.linkedin ? '' : 'Add linkedin link'}
                            arrowPointAtCenter
                          >
                            {orgData?.linkedin
                              ? (
                                <a href={orgData?.linkedin}>
                                  <CustomImage
                                    src="/images/company-tab/linkedin-link.svg"
                                    width={44}
                                    height={44}
                                    alt="linkedin"
                                  />
                                </a>
                              )
                              : (
                                <Button
                                  type="ghost"
                                  icon={(
                                    <CustomImage
                                      src="/images/company-tab/linked-empty-icon.svg"
                                      width={44}
                                      height={44}
                                      alt="linkedin-empty"
                                    />
                                  )}
                                  className="ct-empty-btn"
                                  onClick={():void => {
                                    setGeneralDetails(true);
                                    pushClevertapEvent('Special Click', { Type: 'Add linkedin' });
                                  }}
                                />
                              )}
                          </Popover>

                          {/* Twitter */}
                          <Popover
                            placement="bottom"
                            overlayClassName={orgData?.twitter ? 'ct-popover-none' : 'ct-popover-des ct-popover-background-grey'}
                            content={orgData?.twitter ? '' : 'Add twitter link'}
                            arrowPointAtCenter
                          >
                            {orgData?.twitter
                              ? (
                                <a href={orgData?.twitter}>
                                  <CustomImage
                                    src="/images/company-tab/twitter-link.svg"
                                    width={44}
                                    height={44}
                                    alt="twitter"
                                  />
                                </a>
                              )
                              : (
                                <Button
                                  type="ghost"
                                  icon={(
                                    <CustomImage
                                      src="/images/company-tab/twitter-empty-ic.svg"
                                      width={44}
                                      height={44}
                                      alt="twitter-empty"
                                    />
                                  )}
                                  className="ct-empty-btn"
                                  onClick={():void => {
                                    setGeneralDetails(true);
                                    pushClevertapEvent('Special Click', { Type: 'Add twitter' });
                                  }}
                                />
                              )}
                          </Popover>

                          {/* Glassdoor */}
                          <Popover
                            placement="bottom"
                            overlayClassName={orgData?.glassdoor ? 'ct-popover-none' : 'ct-popover-des ct-popover-background-grey'}
                            content={orgData?.glassdoor ? '' : 'Add glassdoor link'}
                            arrowPointAtCenter
                          >
                            {orgData?.glassdoor
                              ? (
                                <a href={orgData?.glassdoor}>
                                  <CustomImage
                                    src="/images/company-tab/glassdoor-link.svg"
                                    width={12}
                                    height={16}
                                    alt="glassdoor"
                                  />
                                </a>
                              )
                              : (
                                <Button
                                  type="ghost"
                                  icon={(
                                    <CustomImage
                                      src="/images/company-tab/glassdoor-empty-icon.svg"
                                      width={15}
                                      height={19}
                                      alt="glassdoor-empty"
                                    />
                                  )}
                                  className="ct-empty-btn"
                                  onClick={():void => {
                                    setGeneralDetails(true);
                                    pushClevertapEvent('Special Click', { Type: 'Add glassdoor' });
                                  }}
                                />
                              )}
                          </Popover>
                        </Paragraph>
                      </Col>

                      {/* Actions */}
                      <Col span={6} className="ct-desktop-info-cta">
                        <Button
                          type="link"
                          icon={(
                            <CustomImage
                              src="/svgs/edit.svg"
                              width={24}
                              height={25}
                              alt="edit"
                            />
                          )}
                          onClick={():void => {
                            setGeneralDetails(true);
                            pushClevertapEvent('Special Click', { Type: 'Edit General Details' });
                          }}
                          className="ct-edit-btn ct-back-transparent"
                        >
                          Edit
                        </Button>
                        {orgData?.id ? (
                          <Button
                            type="ghost"
                            target="blank"
                            className="ct-desktop-preview ct-back-transparent"
                            href={`${config.AJ_URL}org/${orgData.slug}/${orgData.id}`}
                            onClick={():void => { pushClevertapEvent('Special Click', { Type: 'Preview as candiate' }); }}
                          >
                            Preview as Candidate
                          </Button>
                        ) : null}
                      </Col>
                    </Row>
                  </Col>

                  {/* Profile Score & Actions */}
                  <Col span={8}>
                    {orgData ? (
                      <Profile
                        score={orgData?.profileScore}
                        data={orgData}
                        handler={profileHandler}
                        emailVerified={userData?.emailVerified as boolean}
                      />
                    ) : null}
                  </Col>
                </Row>
              </Container>
            </Row>

            {/* Additional Company info */}
            <Row className={orgData && orgData?.profileScore > 15 ? 'ct-desktop-description' : 'ct-desktop-description ct-background'}>
              <Container>
                <Row>
                  <Col span={14}>
                    <Row>

                      {/* Organization Founded */}
                      <Col span={12}>
                        <Paragraph className="ct-desktop-icons">
                          <CustomImage
                            src="/images/company-tab/startup.svg"
                            width={24}
                            height={25}
                            alt="edit"
                          />
                          {orgData?.yearOfEstablishment
                            ? (
                              <Paragraph style={{ paddingLeft: '0.5rem' }}>
                                {`Founded in ${orgData?.yearOfEstablishment}`}
                              </Paragraph>
                            ) : (
                              <Button
                                type="link"
                                onClick={():void => {
                                  setAddDetails(true);
                                  pushClevertapEvent('Special Click', { Type: 'Add Additional details' });
                                }}
                                className="ct-add-links"
                              >
                                + Add Founded Year
                              </Button>
                            )}
                        </Paragraph>
                      </Col>

                      {/* No Of Employees */}
                      <Col span={12}>
                        <Paragraph className="ct-desktop-icons">
                          <CustomImage
                            src="/images/company-tab/employee-count.svg"
                            width={24}
                            height={25}
                            alt="edit"
                          />

                          {(orgData?.employeeCount != null && orgData?.employeeCount > -1)
                            ? <Paragraph style={{ paddingLeft: '0.5rem' }}>{employeeCountLabel(orgData?.employeeCount)}</Paragraph> : (
                              <Button
                                onClick={():void => {
                                  setAddDetails(true);
                                  pushClevertapEvent('Special Click', { Type: 'Add Additional details' });
                                }}
                                type="link"
                                className="ct-add-links"
                              >
                                + Add No of Employees
                              </Button>
                            )}
                        </Paragraph>
                      </Col>

                      {/* Organization Type */}
                      {/* <Col span={12}>
                        <Paragraph className="ct-desktop-icons">
                          <CustomImage
                            src="/images/company-tab/building.svg"
                            width={24}
                            height={25}
                            alt="edit"
                          />
                          {orgData?.type
                            ? (
                              <Paragraph style={{ paddingLeft: '0.5rem' }}>
                                {companyType(orgData?.type)}
                              </Paragraph>
                            ) : (
                              <Button
                                type="link"
                                onClick={():void => {
                                  setAddDetails(true);
                                  pushClevertapEvent('Special Click',
                                  { Type: 'Add Additional details' });
                                }}
                                className="ct-add-links"
                              >
                                + Add Type
                              </Button>
                            )}
                        </Paragraph>
                      </Col> */}

                      {/* Industry Type */}
                      <Col span={12}>
                        <Paragraph className="ct-desktop-icons">
                          <CustomImage
                            src="/images/company-tab/type.svg"
                            width={24}
                            height={25}
                            alt="edit"
                          />

                          {orgData?.industry ? <span style={{ paddingLeft: '0.5rem' }}>{orgData?.industry.name}</span> : (
                            <Button
                              onClick={():void => {
                                setAddDetails(true);
                                pushClevertapEvent('Special Click', { Type: 'Add Additional details' });
                              }}
                              type="link"
                              className="ct-add-links"
                            >
                              + Add Industry
                            </Button>
                          )}
                        </Paragraph>
                      </Col>

                      {/* Headquarters */}
                      <Col span={12}>
                        <Paragraph className="ct-desktop-icons" style={{ display: 'inline-flex' }}>
                          <CustomImage
                            src="/icons/location.svg"
                            width={24}
                            height={25}
                            alt="edit"
                          />
                          {(orgData?.operatingCities && orgData?.operatingCities.length > 0)
                            ? <span style={{ paddingLeft: '0.5rem' }}>{Locality(orgData?.operatingCities)}</span>
                            : (
                              <Button
                                onClick={():void => {
                                  setAddDetails(true);
                                  pushClevertapEvent('Special Click', { Type: 'Add Additional details' });
                                }}
                                type="link"
                                className="ct-add-links"
                              >
                                + Add Headquater
                              </Button>
                            )}
                        </Paragraph>
                      </Col>
                    </Row>
                  </Col>

                  {/* Edit */}
                  <Col span={2}>
                    {orgData && (orgData?.employeeCount > -1 && orgData?.industry
                    && orgData?.operatingCities && orgData?.yearOfEstablishment && orgData?.type)
                      ? (
                        <Button
                          type="link"
                          icon={(
                            <CustomImage
                              src="/svgs/edit.svg"
                              width={24}
                              height={25}
                              alt="edit"
                            />
                          )}
                          onClick={():void => {
                            setAddDetails(true);
                            pushClevertapEvent('Special Click', { Type: 'Edit Additional Details' });
                          }}
                          className="ct-edit-btn-link"
                        >
                          Edit
                        </Button>
                      ) : ''}
                  </Col>
                </Row>
              </Container>
            </Row>

            {/* About Company */}
            <Row className={orgData?.description ? 'ct-desktop-description' : 'ct-desktop-description ct-background'}>
              <Container>
                <Row>
                  <Col span={14}>
                    <Title level={3} className="ct-title-spacing">
                      {`About ${orgData?.name}`}
                    </Title>
                  </Col>
                  <Col span={2}>
                    {orgData?.description
                      ? (
                        <Button
                          type="link"
                          icon={(
                            <CustomImage
                              src="/svgs/edit.svg"
                              width={24}
                              height={25}
                              alt="edit"
                            />
                          )}
                          onClick={():void => {
                            setaboutModal(true);
                            pushClevertapEvent('Special Click', { Type: 'Edit About Company' });
                          }}
                          className="ct-edit-btn-link"
                        >
                          <Text>Edit</Text>
                        </Button>
                      ) : ''}
                  </Col>
                </Row>
                <Row>
                  <Col span={16}>
                    {orgData?.description
                      ? (
                        <Text>
                          <Paragraph className="ct-desktop-des">{stripHtmlTags(orgData?.description)}</Paragraph>
                        </Text>
                      ) : (
                        <Paragraph>
                          <Button
                            onClick={():void => {
                              setaboutModal(true);
                              pushClevertapEvent('Special Click', { Type: 'Add About Company' });
                            }}
                            type="link"
                            className="ct-add-links-type"
                          >
                            + Add about your Company
                          </Button>
                        </Paragraph>
                      )}
                  </Col>
                </Row>
              </Container>
            </Row>

            {/* Why you should work with */}
            <Row className={orgData?.whyWorkHere ? 'ct-desktop-description' : 'ct-desktop-description ct-background'}>
              <Container>
                <Row>
                  <Col span={14}>
                    <Title level={3} className="ct-title-spacing">
                      {`Why you should work with ${orgData?.name}?`}
                    </Title>
                  </Col>
                  <Col span={2}>
                    {orgData?.whyWorkHere
                      ? (
                        <Button
                          type="link"
                          icon={(
                            <CustomImage
                              src="/svgs/edit.svg"
                              width={24}
                              height={25}
                              alt="edit"
                            />
                          )}
                          onClick={():void => {
                            setworkModal(true);
                            pushClevertapEvent('Special Click', { Type: 'Edit Why work with us' });
                          }}
                          className="ct-edit-btn-link"
                        >
                          Edit
                        </Button>
                      ) : ''}
                  </Col>
                </Row>
                <Row>
                  <Col span={16}>
                    {orgData?.whyWorkHere
                      ? (
                        <Text>
                          <Paragraph className="ct-desktop-des">{stripHtmlTags(orgData?.whyWorkHere)}</Paragraph>
                        </Text>
                      )
                      : (
                        <Button
                          onClick={():void => {
                            setworkModal(true);
                            pushClevertapEvent('Special Click', { Type: 'Add Why Work With Us' });
                          }}
                          type="link"
                          className="ct-add-links-type"
                        >
                          + Add Why Work With Us
                        </Button>
                      )}
                  </Col>
                </Row>
              </Container>
            </Row>

            {/* Office Photos */}
            <Row className="ct-desktop-description">
              <Container>
                <Row>
                  <Col span={16}>
                    <Title level={3} className="ct-title-spacing">
                      Office photos
                    </Title>
                    {orgData?.id
                      ? (
                        <OfficePhotos
                          photos={orgData?.photos}
                          id={orgData?.id}
                          handlepatch={handlephotos}
                        />
                      ) : null}
                  </Col>
                </Row>
              </Container>
            </Row>
          </>
        ) : <EmptyLayout />}
      {generalDetails && orgData
        ? (
          <CompanyDetails
            visibleModal={generalDetails}
            onCancel={():void => { setGeneralDetails(false); }}
            data={orgData}
            patchrequest={patchrequest}
          />
        ) : null}
      {addDetails && orgData
        ? (
          <CompanyAddDetails
            visibleModal={addDetails}
            onCancel={():void => { setAddDetails(false); }}
            data={orgData}
            patchrequest={patchrequest}
          />
        ) : null}
      {workModal && orgData
        ? (
          <WorkModal
            visibleModal={workModal}
            onCancel={():void => { setworkModal(false); }}
            data={orgData}
            patchrequest={patchrequest}
          />
        ) : null}
      {aboutModal && orgData
        ? (
          <AboutModal
            visibleModal={aboutModal}
            onCancel={():void => { setaboutModal(false); }}
            data={orgData}
            patchrequest={patchrequest}

          />
        ) : null}
      {logo && orgData ? (
        <Modal
          visible={logo}
          onCancel={():void => { setlogo(false); }}
          width={180}
          footer={null}
          className="ct-logo"
        >
          <Logo
            photos={orgData?.logo}
            id={orgData?.id}
            handlelogo={handlelogo}
            size="120px"
          />
        </Modal>
      ) : null}
      {office && orgData ? (
        <Modal
          visible={office}
          onCancel={():void => { setOffice(false); }}
          width={150}
          footer={null}
        >
          <OfficePhotos
            photos={orgData?.photos}
            id={orgData?.id}
            handlepatch={handlephotos}

          />
        </Modal>
      ) : null}
    </>
  );
};
export default Company;
