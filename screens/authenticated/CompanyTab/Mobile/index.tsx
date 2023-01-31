/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-expressions */
import {
  Button, Col, Modal, Popover, Row, Typography,
} from 'antd';
import Container from 'components/Layout/Container';
import UnverifiedEmailNotification from 'components/UnverifiedEmailNotification/UnverifiedEmailNotification';
import CustomImage from 'components/Wrappers/CustomImage';
import AppConstants from 'constants/constants';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
// import AboutModal from 'screens/authenticated/CompanyTab/Common/AboutModal';
// import CompanyAddDetails from
// 'screens/authenticated/CompanyTab/Common/ComapanyAddDetailsModal';
import {
  AddDetailsModal, companyType, employeeCountLabel,
  generalDetailsModal, getOrganizationData, OrganizationDetailsType,
  stripHtmlTags,
} from 'screens/authenticated/CompanyTab/Common/CompanyTabUtils';
import Locality from 'screens/authenticated/CompanyTab/Common/Locality';
import Logo from 'screens/authenticated/CompanyTab/Common/Logo';
import OfficePhotos from 'screens/authenticated/CompanyTab/Common/OfficePhotos';
import Profile from 'screens/authenticated/CompanyTab/Common/Profile';
// import WorkModal from 'screens/authenticated/CompanyTab/Common/WorkModal';
// import CompanyDetails from
// 'screens/authenticated/CompanyTab/Mobile/MobileCompanyDetailsModal';
// import img from 'next/image';
import { pushClevertapEvent } from 'utils/clevertap';
import dynamic from 'next/dynamic';
import { getLoggedInUser } from 'service/accounts-settings-service';

const WorkModal = dynamic(() => import('screens/authenticated/CompanyTab/Common/WorkModal'), { ssr: false });
const CompanyAddDetails = dynamic(() => import('screens/authenticated/CompanyTab/Common/ComapanyAddDetailsModal'), { ssr: false });
const AboutModal = dynamic(() => import('screens/authenticated/CompanyTab/Common/AboutModal'), { ssr: false });
const CompanyDetails = dynamic(() => import('screens/authenticated/CompanyTab/Mobile/MobileCompanyDetailsModal'), { ssr: false });
require('screens/authenticated/CompanyTab/Mobile/mobile-company.less');

const { Paragraph, Text } = Typography;

type UserDetailsType = {
  emailVerified: boolean;
  verificationStatus: string;
}

const MobileCompany = ():JSX.Element => {
  const [orgData, setOrgData] = useState<OrganizationDetailsType>();
  const [userData, setUserData] = useState<UserDetailsType>();
  const [generalDetails, setGeneralDetails] = useState(false);
  const [addDetails, setAddDetails] = useState(false);
  const [workModal, setworkModal] = useState(false);
  const [aboutModal, setaboutModal] = useState(false);
  const [logo, setlogo] = useState(false);
  const [office, setOffice] = useState(false);
  const [refresh, setRefresh] = useState(false);
  // const orgData1 = {
  //   id: 1,
  //   name: 'abc',
  //   profileScore: 5,
  //   whyWorkHere: null,
  //   website: null,
  //   tagline: null,
  //   description: null,
  //   logo: '',
  // } as any;
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
  const handlephotos = async (photo):Promise<void> => {
    if (photo) {
      setRefresh(!refresh);
    // setOrganizationData();
    }
    // const obj = { photos: photo };
    // console.log(photo);
    // const response = await patchOrgDetails(obj, orgData?.id);
    // console.log(response);
  };
  const profileHandler = (link):void => {
    if (AddDetailsModal.indexOf(link) !== -1) {
      setAddDetails(true);
    } if (generalDetailsModal.indexOf(link) !== -1) {
      setGeneralDetails(true);
    } if (link === 'Add Why Work With Us') {
      setworkModal(true);
    } if (link === 'Add About Your Company') {
      setaboutModal(true);
    } if (link === 'Add Logo') {
      setlogo(true);
    }
    if (link === 'Add Office photos') { setOffice(true); }
  };
  const handlelogo = async (logopic):Promise<void> => {
    if (logopic) {
      setRefresh(!refresh);
    // setOrganizationData();
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
      <>
        <Row className="m-ct-desktop-header">
          <Col span={24}>
            <Row style={{ marginTop: '3.8rem' }}>
              <Col xs={{ span: 24, offset: 0 }} sm={{ span: 16, offset: 0 }}>
                <UnverifiedEmailNotification />
              </Col>
              <Col xs={{ span: 4 }} sm={{ span: 6 }}>
                {orgData?.id || orgData?.logo ? <Logo handlelogo={handlelogo} photos={orgData?.logo} id={orgData?.id} size="64px" /> : null}
              </Col>
              <Col span={16}>
                <Col className="m-ct-desktop-name" style={{ marginLeft: '0px' }}>
                  <span className="m-ct-company-name">{orgData?.name}</span>
                  <span className="m-ct-company-tagline">
                    {orgData?.tagline ? orgData?.tagline : (
                      <Button
                        type="link"
                        className="m-ct-add-links"
                        onClick={():void => {
                          pushClevertapEvent('Special Click', { Type: 'Add Tagline' });
                        }}
                      >
                        + Add Tagline
                      </Button>
                    )}
                  </span>
                </Col>
              </Col>
              <Col span={1}>
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
                  style={{
                    padding: '0px',
                    color: 'black',
                    marginLeft: '-0.6rem',
                  }}
                >
                  {/* <span className="align-super">Edit</span> */}
                  Edit
                </Button>
              </Col>
            </Row>
            <Row className="m-ct-desktop-links">
              <Popover
                placement="bottom"
                overlayClassName={orgData?.website ? 'ct-popover' : 'popover-des popover-background-grey'}
                content={orgData?.website ? '' : 'Add Website'}
                arrowPointAtCenter
              >
                <Col>
                  <a
                    href={orgData?.website}
                  >
                    {orgData?.website
                      ? (
                        <div className="m-ct-website-img">
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
                            <span className="m-ct-website-color m-ct-links ">Website    </span>
                          </Button>
                        </div>
                      )
                      : (
                        (
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
                            <span className="m-ct-website-color m-ct-links ">Website    </span>
                          </Button>
                        )
                      )}

                  </a>
                  |
                  {/* <span className="align-super">|</span> */}
                  {' '}
                </Col>
              </Popover>
              <Popover
                placement="bottom"
                overlayClassName={orgData?.facebook ? 'ct-popover' : 'popover-des popover-background-grey'}
                content={orgData?.facebook ? '' : 'Add Facebook'}
                arrowPointAtCenter
              >
                <a href={orgData?.facebook} className={orgData?.facebook ? 'm-ct-links' : ''}>
                  {orgData?.facebook
                    ? (
                      <div>
                        <CustomImage
                          src="/images/company-tab/fb-link.svg"
                          alt="facebook"
                          width={44}
                          height={44}
                        />
                      </div>
                    )
                    : (
                      <Button
                        type="link"
                        icon={(
                          <CustomImage
                            src="/images/company-tab/fb-empty-icon.svg"
                            width={44}
                            height={44}
                            alt="facebook-empty"

                          />
                        )}
                        className="ct-empty-btn"
                        style={{ marginTop: '-10px' }}
                        onClick={():void => {
                          setGeneralDetails(true);
                          pushClevertapEvent('Special Click', { Type: 'Add facebook' });
                        }}
                      />
                    )}
                </a>
              </Popover>
              <Popover
                placement="bottom"
                overlayClassName={orgData?.linkedin ? 'ct-popover' : 'popover-des popover-background-grey'}
                content={orgData?.linkedin ? '' : 'Add linkedin link'}
                arrowPointAtCenter
              >
                <a href={orgData?.linkedin} className={orgData?.linkedin ? 'm-ct-links' : ''}>
                  {orgData?.linkedin

                    ? (
                      <div className="ct-empty-btn">
                        <CustomImage
                          src="/images/company-tab/linkedin-link.svg"
                          width={44}
                          height={44}
                          alt="linkedin"
                        />
                      </div>
                    )
                    : (
                      <Button
                        type="link"
                        icon={(
                          <CustomImage
                            src="/images/company-tab/linked-empty-icon.svg"
                            width={44}
                            height={44}
                            alt="linkedin-empty"

                          />
                        )}
                        className="ct-empty-btn"
                        style={{ marginTop: '-10px' }}
                        onClick={():void => {
                          setGeneralDetails(true);
                          pushClevertapEvent('Special Click', { Type: 'Add linkedin' });
                        }}
                      />
                    )}
                </a>
              </Popover>
              <Popover
                placement="bottom"
                overlayClassName={orgData?.twitter ? 'ct-popover' : 'popover-des popover-background-grey'}
                content={orgData?.twitter ? '' : 'Add twitter link'}
                arrowPointAtCenter
              >
                <a href={orgData?.twitter} className={orgData?.twitter ? 'm-ct-links' : ''}>
                  {orgData?.twitter
                    ? (
                      <div className="ct-empty-btn">
                        <CustomImage
                          src="/images/company-tab/twitter-link.svg"
                          alt="twitter"
                          width={44}
                          height={44}
                        />
                      </div>
                    )
                    : (
                      <Button
                        type="link"
                        icon={(
                          <CustomImage
                            src="/images/company-tab/twitter-empty-ic.svg"
                            alt="twitter-empty"
                            width={44}
                            height={44}
                          />
                        )}
                        className="ct-empty-btn"
                        style={{ marginTop: '-10px' }}
                        onClick={():void => {
                          setGeneralDetails(true);
                          pushClevertapEvent('Special Click', { Type: 'Add twitter' });
                        }}
                      />
                    ) }
                </a>
              </Popover>
              <Popover
                placement="bottom"
                overlayClassName={orgData?.glassdoor ? 'ct-popover' : 'popover-des popover-background-grey'}
                content={orgData?.glassdoor ? '' : 'Add glassdoor link'}
                arrowPointAtCenter
              >
                <a
                  href={orgData?.glassdoor}
                  className={orgData?.glassdoor ? 'm-ct-links' : ''}
                >
                  {orgData?.glassdoor
                    ? (
                      <div>
                        <CustomImage
                          src="/images/company-tab/glassdoor-link.svg"
                          width={12}
                          height={16}
                          alt="glassdoor"
                          className="m-glassdoor"
                        />
                      </div>
                    )
                    : (
                      <Button
                        type="link"
                        icon={(
                          <CustomImage
                            src="/images/company-tab/glassdoor-empty-icon.svg"
                            alt="glassdoor-empty"
                            width={15}
                            height={19}
                          />
                        )}
                        className="ct-empty-btn"
                        onClick={():void => {
                          setGeneralDetails(true);
                          pushClevertapEvent('Special Click', { Type: 'Add glassdoor' });
                        }}
                      />
                    )}
                </a>
              </Popover>
            </Row>
          </Col>
        </Row>
        <Row className="m-ct-desktop-description-1">
          <Col span={18}>
            <Row>
              <Col className="m-ct-desktop-name">
                <span className="m-ct-company-description">
                  <div className="ct-desktop-icons m-ct-m-left">
                    <CustomImage
                      src="/images/company-tab/startup.svg"
                      width={24}
                      height={25}
                      alt="edit"
                    />
                    {orgData?.yearOfEstablishment
                      ? (
                        <Text>
                          <span className="m-ct-data">
                            Founded in
                            {' '}
                            {orgData?.yearOfEstablishment}
                          </span>
                        </Text>
                      ) : (
                        <Button
                          type="link"
                          onClick={():void => {
                            setAddDetails(true);
                            pushClevertapEvent('Special Click', { Type: 'Add Additional Details' });
                          }}
                          className="m-ct-add-links"
                        >
                          <span>
                            + Add Founded Year
                          </span>
                        </Button>
                      )}
                  </div>
                </span>
                {/* <span className="m-ct-company-description">
                  <div className="ct-desktop-icons m-ct-m-left">
                    <CustomImage
                      src="/images/company-tab/building.svg"
                      width={24}
                      height={25}
                      alt="edit"
                    />
                    {orgData?.type
                      ? (
                        <span className="m-ct-data">
                          {companyType(orgData?.type)}
                        </span>

                      ) : (
                        <Button
                          type="link"
                          onClick={():void => {
                            setAddDetails(true);
                            pushClevertapEvent('Special Click', { Type: 'Add Additional Details' });
                          }}
                          className="m-ct-add-links"
                        >
                          {' '}
                          <span>
                            + Add Type
                          </span>
                        </Button>
                      )}
                  </div>
                </span> */}
                <Row className="m-ct-company-description">
                  <div className="ct-desktop-icons m-ct-m-left" style={{ display: 'inline-flex' }}>
                    <CustomImage
                      src="/icons/location.svg"
                      width={24}
                      height={25}
                      alt="edit"
                    />

                    {(orgData?.operatingCities
                      && orgData?.operatingCities.length > 0)
                      ? <span className="m-ct-data">{Locality(orgData?.operatingCities)}</span>
                      : (
                        <Button
                          onClick={():void => {
                            setAddDetails(true);
                            pushClevertapEvent('Special Click', { Type: 'Add Additional Details' });
                          }}
                          type="link"
                          className="m-ct-add-links"
                        >
                          <span>
                            + Add Headquater
                          </span>
                        </Button>
                      )}
                  </div>
                </Row>

                <Row className="m-ct-company-description">
                  <div className="ct-desktop-icons m-ct-m-left">
                    <CustomImage
                      src="/images/company-tab/employee-count.svg"
                      width={24}
                      height={25}
                      alt="edit"
                    />

                    {(orgData?.employeeCount != null && orgData?.employeeCount > -1)
                      ? <span className="m-ct-data">{employeeCountLabel(orgData?.employeeCount)}</span> : (
                        <Button
                          onClick={():void => {
                            setAddDetails(true);
                            pushClevertapEvent('Special Click', { Type: 'Add Additional Details' });
                          }}
                          type="link"
                          className="m-ct-add-links"
                        >
                          <span>
                            + Add No of Employees
                          </span>
                        </Button>
                      )}
                  </div>
                </Row>
                <Row className="m-ct-company-description" style={{ marginBottom: '3rem' }}>
                  <div className="ct-desktop-icons m-ct-m-left">
                    <CustomImage
                      src="/images/company-tab/type.svg"
                      width={24}
                      height={25}
                      alt="edit"
                    />

                    {orgData?.industry ? <span className="m-ct-data">{orgData?.industry.name}</span> : (
                      <Button
                        onClick={():void => {
                          setAddDetails(true);
                          pushClevertapEvent('Special Click', { Type: 'Add Additional Details' });
                        }}
                        type="link"
                        className="m-ct-add-links"
                      >
                        <span>+ Add Industry</span>
                      </Button>
                    )}
                  </div>

                </Row>

              </Col>
            </Row>
          </Col>
          <Col span={1}>

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
                  className="m-ct-edit-btn"
                >
                  {/* <span className="align-super">Edit</span> */}
                  Edit
                </Button>

              ) : null}

          </Col>
        </Row>

        {orgData ? (
          <Profile
            score={orgData?.profileScore}
            data={orgData}
            handler={profileHandler}
            emailVerified={userData?.emailVerified as boolean}
          />
        ) : null}

        <Row className="m-ct-desktop-description-1">
          <Container>
            <Row className="m-ct-company-heading">
              <Col span={18}>
                <p className="ac-display-inline">
                  About
                  <span style={{ marginLeft: '0.5rem' }}>{orgData?.name}</span>
                </p>
              </Col>
              <Col span={1}>
                {orgData?.description
                  ? (
                    <Button
                      type="link"
                      icon={<CustomImage src="/svgs/edit.svg" height={24} width={25} alt="edit" />}
                      onClick={():void => {
                        setaboutModal(true);
                        pushClevertapEvent('Special Click', { Type: 'Edit About Company' });
                      }}
                      className="m-ct-edit-btn"
                    >
                      {/* <span className="align-super">Edit</span> */}
                      Edit
                    </Button>
                  ) : null}
              </Col>
            </Row>
            {orgData?.description
              ? (

                <Paragraph ellipsis={{ rows: 5, expandable: true, symbol: 'Read more' }} className="m-ct-desktop-des">{stripHtmlTags(orgData?.description)}</Paragraph>

              ) : (
                <Row>
                  <Button
                    onClick={():void => {
                      setaboutModal(true);
                      pushClevertapEvent('Special Click', { Type: 'Add About Company' });
                    }}
                    type="link"
                    className="m-ct-add-links-type"

                  >
                    + Add about your Company
                  </Button>
                </Row>
              )}

          </Container>

        </Row>
        <Row className="m-ct-desktop-description-1">
          <Container>
            <Row className="m-ct-company-heading">
              <Col span={18}>
                <p className="ac-display-inline">
                  Why you should work with
                  <span style={{ marginLeft: '0.5rem' }}>{orgData?.name}</span>
                  ?
                </p>
              </Col>
              <Col span={1}>
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
                        pushClevertapEvent('Special Click', { Type: 'Edit Why Work With Us' });
                      }}
                      className="m-ct-edit-btn"
                    >
                      {/* <span className="align-super">Edit</span> */}
                      Edit
                    </Button>
                  ) : null}
              </Col>
            </Row>
            {orgData?.whyWorkHere
              ? (
                <Text>

                  <Paragraph ellipsis={{ rows: 5, expandable: true, symbol: 'Read more' }} className="m-ct-desktop-des">{stripHtmlTags(orgData?.whyWorkHere)}</Paragraph>
                </Text>
              )
              : (
                <Row>
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
                </Row>
              )}

          </Container>
        </Row>
        <Row className="m-ct-desktop-description-1">

          <Row className="m-ct-company-heading">

            <p className="ac-display-inline">
              Office photos

            </p>
          </Row>
          {orgData?.id
            ? (
              <OfficePhotos
                photos={orgData?.photos}
                id={orgData?.id}
                handlepatch={handlephotos}
              />
            ) : null}

        </Row>
      </>
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
          width={150}
          footer={null}
        >
          <Logo
            photos={orgData?.logo}
            handlelogo={handlelogo}
            id={orgData?.id}
            size="100px"
          />
        </Modal>
      ) : null}
      {office && orgData ? (
        <Modal
          visible={office}
          onCancel={():void => { setOffice(false); }}
          width={180}
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
export default React.memo(MobileCompany);
