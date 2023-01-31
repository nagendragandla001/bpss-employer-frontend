/* eslint-disable react/require-default-props */
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import {
  Button, Col, Drawer, Modal, Row, Typography,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import { isMobile } from 'mobile-device-detect';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { pushClevertapEvent } from 'utils/clevertap';
import { CMSInterface } from '../ApplicationTabUtils';

require('screens/authenticated/ApplicationsTab/Common/ApplicationCard/viewCV.less');

const GoogleDocsViewer = dynamic(() => import('screens/authenticated/ApplicationsTab/Common/ApplicationCard/googleDocsViewer'), { ssr: false });
const UnlockContact = dynamic(() => import('screens/authenticated/ApplicationsTab/Common/ApplicationCard/unlockContact'), { ssr: false });

const { Paragraph } = Typography;

// interface setApplicationDataI{
//   applicationData: Array<ApplicationDataInterface>;
//   totalApplications: number;
//   loading: boolean,
//   offset: number,
// }

interface ViewCVInterface {
  candidateResume: string;
  name: string;
  appliedJobTitle: string;
  contactUnblocked: boolean;
  applicationId: string
  applicationCreatedDate: string;
  candidateEmail: string;
  gender: string;
  profileAvatarIndex: number;
  candidateMobileNo: string;
  selectedTab: string;
  updateContact: (id) => void;
  cms: CMSInterface;
  appliedJobId: string;
  orgName: string;
  preSkilled: boolean;
}

const ViewCV = (props:ViewCVInterface) : JSX.Element => {
  const {
    preSkilled,
    candidateResume, name, appliedJobTitle,
    contactUnblocked,
    applicationId,
    applicationCreatedDate,
    candidateEmail,
    candidateMobileNo,
    profileAvatarIndex,
    gender,
    selectedTab,
    updateContact, cms,
    appliedJobId,
    orgName,
  } = props;
  const [drawerVisible, setDrawerVisible] = useState(false);

  const onCloseHandler = (): void => {
    setDrawerVisible(false);
  };

  const getButtonText = (): string => {
    if (isMobile) return '';
    if (candidateResume) return 'View CV';
    return 'CV Unavailable';
  };
  const getCVButton = ():JSX.Element => (
    <Button
      className="ac-view-cv-button"
      disabled={!candidateResume}
      onClick={():void => {
        setDrawerVisible(true);
        pushClevertapEvent('View CV', { cms_match: cms?.score });
      }}
    >
      <CustomImage
        src={`/images/application-tab/${candidateResume ? 'viewCvIcon' : 'viewCvNotAvailIcon'}${(candidateResume && isMobile) ? 'Mobile' : ''}.svg`}
        alt="icon"
        width={20}
        height={20}
        className={isMobile ? '' : 'p-right-5'}
      />
      {getButtonText()}
    </Button>
  );
  const ModalContent = (CandidateDetailsStyle, googleDocsStyle): JSX.Element => (
    <>
      <Row style={CandidateDetailsStyle} align="middle">
        <Col>
          <CustomImage
            src={`/images/application-tab/${gender}avatar${gender ? profileAvatarIndex : '0'}.svg`}
            width={40}
            height={46}
            alt="icon"
          />
        </Col>
        <Col xs={{ span: 15 }} sm={{ span: 12 }}>
          <Row className="p-left-8">
            <Col span={22}>
              <Paragraph style={{ fontWeight: 'bold', fontSize: 20 }} ellipsis>
                {name}
              </Paragraph>
            </Col>
          </Row>
          <Row className="p-left-8">
            <Col span={22}>
              <Paragraph ellipsis>
                <p className="ac-blue-grey-7-text text-small ac-display-inline">Applied For:&nbsp;</p>
                <p className="ac-blue-grey-7-text text-small ac-display-inline">{appliedJobTitle}</p>
              </Paragraph>
            </Col>
          </Row>
        </Col>
        <Col xs={{ span: 6 }} sm={{ span: 10 }} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Row>
            <Col className="display-flex">
              <UnlockContact
                contactUnblocked={contactUnblocked}
                applicationId={applicationId}
                applicationCreatedDate={applicationCreatedDate}
                candidateEmail={candidateEmail}
                candidateMobileNo={candidateMobileNo}
                viewCvModal
                selectedTab={selectedTab}
                updateContact={updateContact}
                cms={cms}
                appliedJobId={appliedJobId}
                orgName={orgName}
                preSkilled={preSkilled}
              />
              {isMobile
                ? null
                : (

                  <Button
                    className="download-cv-button"
                    onClick={():void => {
                      pushClevertapEvent('Download resume', { cms_match: cms?.score });
                    }}
                  >
                    <a href={candidateResume}>
                      <CustomImage
                        src="/images/application-tab/downloadCVIconDesktop.svg"
                        alt="icon"
                        width={20}
                        height={20}
                      />
                      <span>Download CV</span>
                    </a>
                  </Button>
                )}
            </Col>
          </Row>
        </Col>
      </Row>
      <Row style={googleDocsStyle}>
        <Col span={24}>
          <GoogleDocsViewer url={candidateResume} />
        </Col>
      </Row>
      {isMobile ? (
        <Row>
          <Col span={24} className="download-cv-icon-mobile">
            <Button>
              <a href={candidateResume}>

                <CustomImage
                  src="/images/application-tab/downloadCVIconMobile.svg"
                  alt="icon"
                  className="p-right-5"
                  height={24}
                  width={24}
                />
                <span>Download CV</span>

              </a>
            </Button>
          </Col>
        </Row>
      ) : null}

    </>
  );
  return (
    <>
      {getCVButton()}
      {isMobile ? (
        <Modal
          title="Candidate CV"
          visible={drawerVisible}
          onCancel={onCloseHandler}
          footer={null}
          destroyOnClose
          closeIcon={<CloseOutlined style={{ color: '#284e52', fontSize: '1.5rem' }} />}
          className="viewCV-modal"
        >
          {ModalContent({ padding: '1rem', boxShadow: '0 2px 0 0 rgba(91, 120, 124, 0.16)', height: '92px' }, { height: 'calc(100% - 148px)' })}
        </Modal>
      ) : (
        <Drawer
          title="Candidate CV"
          visible={drawerVisible}
          onClose={onCloseHandler}
          width="670px"
          className="viewCV-drawer"
          maskStyle={{ background: 'rgb(0, 25, 64,0.8)' }}
          destroyOnClose
        >
          {ModalContent({ padding: '1rem' }, { height: '100%', padding: '0 0.7rem' })}
        </Drawer>
      )}
    </>
  );
};

export default ViewCV;
