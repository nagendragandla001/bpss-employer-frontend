import {
  Button, Card, Col, Progress, Row, Space, Typography,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import config from 'config';
import { profileLinksConst } from 'constants/enum-constants';
import { isMobile } from 'mobile-device-detect';
import React from 'react';
import { OrganizationDetailsType, profileLinks } from 'screens/authenticated/CompanyTab/Common/CompanyTabUtils';
import { pushClevertapEvent } from 'utils/clevertap';
import Verification from './Verification';

const { Text, Paragraph } = Typography;

interface ProfileI {
  score:number|undefined;
  data: OrganizationDetailsType;
  handler:(string)=>void;
  emailVerified: boolean;
}

const Profile = (props:ProfileI):JSX.Element => {
  const {
    score, data, handler, emailVerified,
  } = props;
  let link = profileLinks(data);

  if (link.length > 3) { link = link.slice(0, 3); }

  const profileCard = (x):string => {
    if (isMobile) {
      if (x <= 14) { return 'm-ct-profile-welcome-card'; }
      return 'm-ct-profile-card';
    }
    if (x <= 14) { return 'ct-profile-welcome-card'; }
    return 'ct-profile-card';
  };
  return (
    <Space direction="vertical" size={8}>
      <Verification
        type={data?.type}
        verificationInfo={data?.verificationInfo}
        emailVerified={emailVerified}
      />
      {score
        ? (
          <Card
            className={profileCard(score)}
          >
            {isMobile ? (
              <Row align="middle" justify="space-between" className="ct-padding-bottom-32">
                <Col>
                  <Text className="font-bold text-base m-ct-profile-title">YOUR PROFILE</Text>
                </Col>
                <Col>
                  <Button
                    type="ghost"
                    className="ct-preview"
                    href={`${config.AJ_URL}org/${data.slug}/${data.id}`}
                    onClick={():void => { pushClevertapEvent('Special Click', { Type: 'Preview as candiate' }); }}
                  >
                    <Text className="ct-preview-text">Preview</Text>
                  </Button>
                </Col>
              </Row>
            ) : (
              <>
                <Paragraph className="ct-profile-title">YOUR PROFILE</Paragraph>
                <Paragraph className="ct-profile-sub-title">Profile Completion</Paragraph>
              </>
            )}
            <Row justify="space-between">
              <Col span={21}>
                <Progress
                  success={{ percent: score }}
                  percent={score}
                  size="small"
                  showInfo={false}
                  type="line"
                  className="ct-profile-progress"
                />
              </Col>
              <Col span={2} style={{ color: 'black', marginLeft: '5px' }}>
                {score}
                %
              </Col>
            </Row>

            {score <= 99
              ? (
                <Paragraph className="ct-profile-msg">
                  We promote the jobs posted by companies with 100% completion rate.
                </Paragraph>
              ) : null}

            {score <= 14 ? (
              <Row align="middle" justify="center">
                {isMobile ? (
                  <Col>
                    <CustomImage
                      src="/images/company-tab/welcome-profile-company.svg"
                      width={190}
                      height={150}
                      alt="welcome"
                    />
                    {/* <Text className="m-ct-profile-completion-score-overlay">
                      {`${score}%`}
                    </Text> */}
                  </Col>
                )
                  : (
                    <Col>
                      <CustomImage
                        src="/images/company-tab/welcome-profile-company.svg"
                        alt="welcome"
                        width={208}
                        height={192}
                      />
                      <Text className="ct-profile-completion-score-overlay">
                        {`${score}%`}
                      </Text>
                    </Col>
                  )}
              </Row>
            )
              : (
                <>
                  {score <= 99 ? (
                    <>
                      {isMobile
                        ? (
                          <div className="m-ct-list-links">
                            { link.map((btnlink) => (
                              <Card key={Math.random()} className={btnlink ? '' : 'm-ct-card-display'}>
                                <Button
                                  type="link"
                                  key={Math.random() + 1}
                                  block
                                  onClick={():void => {
                                    handler(btnlink);
                                    pushClevertapEvent('Complete profile', { Type: profileLinksConst(`${btnlink}`) });
                                  }}
                                  className="list-link-btn"
                                >
                                  {`+ ${btnlink}`}
                                </Button>
                              </Card>
                            ))}
                          </div>
                        )
                        : (link.map((btnlink) => (
                          <Button
                            type="link"
                            key={Math.random()}
                            block
                            onClick={():void => {
                              handler(btnlink);
                              pushClevertapEvent('Complete profile', { Type: profileLinksConst(`${btnlink}`) });
                            }}
                            className="ct-add-links"
                          >
                            {btnlink ? <>+</> : null}
                            {' '}
                            {btnlink}
                          </Button>
                        )))}

                    </>
                  ) : null}
                  {score === 100
                    ? (
                      <Row align="middle" justify="center" style={{ marginTop: '1.5rem' }}>
                        <CustomImage
                          src="/images/company-tab/company-completion.svg"
                          height={182}
                          alt="welcome"
                        />
                      </Row>
                    ) : null}
                </>
              )}
          </Card>
        ) : (
          <Card
            className={profileCard(score)}
          >
            {isMobile ? (
              <Row align="middle" justify="space-between" className="p-bottom-md">
                <Col>
                  <Text className="m-ct-profile-title">Your Profile</Text>
                </Col>
                <Col>
                  <Button
                    type="ghost"
                    className="ct-preview"
                    href={`${config.AJ_URL}org/${data.slug}/${data.id}`}
                    onClick={():void => { pushClevertapEvent('Special Click', { Type: 'Preview as candiate' }); }}
                  >
                    <Text className="ct-preview-text">Preview</Text>
                  </Button>
                </Col>

              </Row>
            ) : <Paragraph className="ct-profile-title">Your Profile</Paragraph>}
            <Row>
              <Col span={22}>
                <Progress
                  success={{ percent: score }}
                  percent={score}
                  size="small"
                  showInfo={false}
                  type="line"
                  className="ct-profile-progress"
                />
              </Col>
              <Col span={1} style={{ color: 'black', marginLeft: '5px' }}>
                {`${score}%`}
              </Col>
            </Row>
            <Paragraph className="ct-profile-msg">
              We
              {' '}
              <b>promote</b>
              {' '}
              the jobs posted by companies with
              <b> 100% completion </b>
              {' '}
              rate.
            </Paragraph>
            <Row align="middle" justify="center" style={{ marginTop: '1rem' }}>
              {isMobile ? (
                <div>
                  <CustomImage
                    src="/images/company-tab/welcome-profile-company.svg"
                    width={184}
                    height={129}
                    alt="welcome"
                  />
                  <Col span={1} className="overlay-profile ">
                    {`${score}%`}
                  </Col>
                </div>
              )
                : (
                  <div>
                    <CustomImage
                      src="/images/company-tab/welcome-profile-company.svg"
                      width={208}
                      height={192}
                      alt="welcome"
                    />
                    <Col span={1} className="overlay-profile ">
                      {`${score}%`}
                    </Col>
                  </div>
                )}
            </Row>
          </Card>
        )}
    </Space>
  );
};
export default Profile;
