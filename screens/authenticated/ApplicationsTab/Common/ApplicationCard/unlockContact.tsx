/* eslint-disable react/require-default-props */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-nested-ternary */
import {
  Button, Col, Popover, Row,
} from 'antd';
import UnlockContext from 'components/Context/UnlockContext';
import CustomImage from 'components/Wrappers/CustomImage';
import dayjs from 'dayjs';
import { isMobile } from 'mobile-device-detect';
import React, { useEffect, useState, useContext } from 'react';
import { pushClevertapEvent } from 'utils/clevertap';
import { CMSInterface } from '../ApplicationTabUtils';

require('screens/authenticated/ApplicationsTab/Common/ApplicationCard/unlockContact.less');

interface PropsInterface {
  contactUnblocked: boolean;
  applicationId: string
  applicationCreatedDate: string;
  candidateEmail: string;
  candidateMobileNo: string;
  viewCvModal?: boolean;
  updateContact:(contactUnlock)=>void
  selectedTab: string;
  cms: CMSInterface;
  appliedJobId: string;
  orgName: string;
  preSkilled: boolean;
}
// eslint-disable-next-line consistent-return
const getTimeRemaining = (endtime:any) :any => {
  let timeLeft = {} as any;
  const difference = endtime.diff(dayjs(new Date()));
  if (difference > 0) {
    timeLeft = {
    // days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      h: Math.floor((difference / (1000 * 60 * 60))),
      m: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
    // console.log(timeLeft);
    return timeLeft;
  }
};
const UnlockContact = (props: PropsInterface) : JSX.Element => {
  const { viewCvModal } = props;
  const contactContext = useContext(UnlockContext);
  const {
    contactUnblocked, applicationId, applicationCreatedDate, selectedTab,
    candidateMobileNo, candidateEmail, updateContact, cms, appliedJobId, orgName, preSkilled,
  } = props;
  const [state, setState] = useState({
    contactUnblocked,
    freeUnlockAvaliable: false,
  });
  const [EmailVisible, setEmailVisible] = useState(false);
  const [disablebtn, setdisablebtn] = useState(false);
  const [timer, setTimer] = useState() as any;
  const [timeLeft, setTimeLeft] = useState(60) as any;
  const timerComponents = [] as any;
  useEffect(() => {
    if (candidateMobileNo) {
      setState((prevState) => ({
        ...prevState,
        contactUnblocked: true,
      }));
    }
  }, [candidateMobileNo]);
  const avalibaleForFreeUnlock = ():void => {
    const appCreatedDate = dayjs(applicationCreatedDate);
    const currentDate = dayjs(new Date());
    const dateTillFree = appCreatedDate.add(24, 'h');
    const diff = dayjs(dateTillFree).diff(currentDate, 'm');
    const diffh = dayjs(dateTillFree).diff(currentDate, 'h');
    // console.log(diffh, diff);
    if (diffh <= 24 && diff > 0) {
      setState((prevState) => ({
        ...prevState,
        freeUnlockAvaliable: true,
      }));
      setTimer(dateTillFree);
    } else {
      setTimer(0);
      setState((prevState) => ({
        ...prevState,
        freeUnlockAvaliable: false,
      }));
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { avalibaleForFreeUnlock(); }, []);
  React.useEffect(() => {
    let unmounted = false;
    setTimeout(() => {
      if (timer && !unmounted) { setTimeLeft(getTimeRemaining(timer)); }
    }, 1000);
    return () => { unmounted = true; };
  });
  if (timeLeft) {
    Object.keys(timeLeft).forEach((interval) => {
      if (timeLeft[interval] === -1) {
        return;
      }
      timerComponents.push(
        timeLeft[interval],
      );
    });
  }
  const unlockContactHandler = async ():Promise<void> => {
    setdisablebtn(true);
    if (selectedTab === 'applications') {
      pushClevertapEvent('Unlock Contact', {
        Type: state.freeUnlockAvaliable ? 'Free' : 'Credits',
        Source: viewCvModal ? 'View CV Modal' : 'App card',
        cms_match: cms?.score,
        job_id: appliedJobId,
        application_id: applicationId,
        client_name: orgName,
        'pre-skilled': preSkilled,
      });
    } else if (selectedTab === 'database') {
      pushClevertapEvent('Database Unlock', {
        Source: viewCvModal ? 'View CV Modal' : 'App card',
        cms_match: cms?.score,
        job_id: appliedJobId,
        application_id: applicationId,
        client_name: orgName,
        'pre-skilled': preSkilled,
      });
    }
    if ((contactContext?.contactUnlocksLeft === 0 && contactContext?.databaseUnlocksLeft === 0)
     && !state?.freeUnlockAvaliable) {
      pushClevertapEvent('Add Credits', {
        Type: selectedTab === 'database' ? 'Add db unlock credits' : 'Add app unlock credits',
        Source: selectedTab === 'database' ? 'DB unlock exhaust modal' : 'App unlock exhaust modal',
      });
    }
    updateContact(applicationId);
  };
  const getContactUnlockIcon = () : JSX.Element => (
    <>
      {
        state.freeUnlockAvaliable && selectedTab === 'applications' ? (isMobile
          ? (
            <Row style={{ marginTop: '1rem' }}>
              <Row>
                <Button
                  disabled={disablebtn}
                  className={disablebtn ? 'unlock-button-contact-disabled-mobile' : 'unlock-button-contact-mobile'}
                  onClick={unlockContactHandler}
                >
                  <CustomImage
                    src="/images/application-tab/unlock-button.svg"
                    width={20}
                    height={20}
                    alt="Unlock Contact locked icon"
                  />
                  Unlock Contact
                </Button>
              </Row>
              {timerComponents.length ? timerComponents > 12
                ? (
                  <Row className="m-timer" align="middle">
                    <Col>
                      <span className="text-bold">FREE&nbsp;for&nbsp;</span>
                      for
                    </Col>
                    <Col>
                      <CustomImage
                        src="/svgs/ic-timer.svg"
                        height={8}
                        width={8}
                        alt="m-timer"
                      />
                      &nbsp;
                    </Col>
                    <Col>
                      <span className="timer-grey">
                        {timerComponents[0]}
                        h
                      </span>
                    </Col>
                  </Row>
                )
                : (
                  <Row className="m-timer" align="middle">
                    <Col>
                      <span className="text-bold timer-red">FREE&nbsp;for&nbsp;</span>
                    </Col>
                    <Col>
                      <CustomImage
                        src="/svgs/ic-timer.svg"
                        width={8}
                        height={8}
                        alt="m-timer"
                      />
                    </Col>
                    <Col>
                      <span className="timer-red">
                        &nbsp;
                        {timerComponents[0] === 0 ? timerComponents[1] : timerComponents[0]}
                        {`${timerComponents[0] > 0 ? ' h' : ' m'}`}
                      </span>
                    </Col>
                  </Row>
                )
                : null}
            </Row>
          )
          : (
            <Row gutter={34} style={{ marginLeft: '0px' }}>
              <Col span={12} style={{ padding: '0' }}>
                <Popover
                  placement="right"
                  overlayClassName="popover-des popover-background-grey"
                  content="Unlock phone no. for free for first 24 hours"
                  trigger="hover"
                >
                  <Button
                    disabled={disablebtn}
                    className={disablebtn ? 'unlock-button-contact-disabled' : 'unlock-button-contact m-right-8'}
                    onClick={unlockContactHandler}
                  >
                    <CustomImage
                      src="/images/application-tab/unlock-button.svg"
                      width={20}
                      height={20}
                      alt="Unlock Contact locked icon"
                    />
                    Unlock Contact
                  </Button>
                </Popover>
              </Col>
              <Col span={10}>
                {timerComponents.length > 0 && !viewCvModal ? (
                  <div className="timer timer-desktop">
                    <span className="text-bold">FREE&nbsp;</span>
                    for&nbsp;
                    <span className={`${timerComponents[0] > 12 ? 'timer-grey' : 'timer-red'}`}>
                      {timerComponents[0] === 0 ? timerComponents[1] : (<>{`${timerComponents[0]}:${timerComponents[1]}`}</>)}
                      {`${timerComponents[0] > 0 ? ' h' : ' m'}`}
                    </span>
                  </div>
                )
                  : null}
              </Col>
            </Row>
          ))
          : isMobile
            ? (
              <Col style={{ marginTop: '18px' }}>
                <Button
                  disabled={disablebtn}
                  className={disablebtn ? 'unlock-button-contact-disabled-mobile' : 'unlock-button-contact-mobile'}
                  onClick={unlockContactHandler}
                >
                  <CustomImage
                    src="/images/application-tab/unlock-button.svg"
                    width={20}
                    height={20}
                    alt="Unlock Contact locked icon"
                  />
                  Unlock Contact
                </Button>
              </Col>
            )
            : (
              <Row>
                <Col>
                  <Popover
                    placement="right"
                    overlayClassName="popover-des popover-background-grey"
                    arrowPointAtCenter
                    content="Use 1 credit to unlock candidate application"
                  >
                    <Button
                      disabled={disablebtn}
                      className={disablebtn ? 'unlock-button-contact-disabled' : 'unlock-button-contact m-right-8'}
                      onClick={unlockContactHandler}
                    >
                      <CustomImage
                        src="/images/application-tab/unlock-button.svg"
                        width={20}
                        height={20}
                        alt="Unlock Contact locked icon"
                      />
                      Unlock Contact
                    </Button>
                  </Popover>
                </Col>
              </Row>
            )
      }
    </>
  );
  return (
    <>
      <Row>
        {
          contactUnblocked
            ? (isMobile ? (candidateMobileNo)
              ? (
                <Col className="unlock-button display-flex">
                  <Button className="unlock-button m-top-16">
                    <CustomImage
                      src="/images/application-tab/call-button.svg"
                      width={20}
                      height={20}
                      alt="call button icon"
                      className="padding-right-unlock"
                    />
                    {candidateMobileNo}
                  </Button>
                </Col>
              ) : null
              : (
                <Col>
                  {EmailVisible && !viewCvModal ? (
                    <Row align="bottom">
                      <Col className="unlock-button display-flex">
                        <Button
                          className="unlock-button m-right-8"
                          onClick={():void => { setEmailVisible(false); }}
                        >
                          <CustomImage
                            src="/images/application-tab/call-button.svg"
                            width={20}
                            height={20}
                            alt="call button icon"
                          />
                        </Button>
                        <Button className="unlock-button">
                          <CustomImage
                            src="/images/application-tab/mail-icon.svg"
                            width={20}
                            height={20}
                            alt="mail icon"
                          />
                          {candidateEmail}
                        </Button>
                      </Col>
                    </Row>
                  )
                    : (
                      <Row align="bottom">
                        <Col className="unlock-button display-flex">
                          <Button className="unlock-button m-right-8">
                            <CustomImage
                              src="/images/application-tab/call-button.svg"
                              width={20}
                              height={20}
                              alt="call button icon"
                              className="padding-right-unlock "
                            />
                            {candidateMobileNo}
                          </Button>
                          { !viewCvModal && (candidateEmail)
                            ? (
                              <Button
                                className="unlock-button"
                                onClick={():void => { setEmailVisible(true); }}
                              >
                                <CustomImage
                                  src="/images/application-tab/mail-icon.svg"
                                  width={20}
                                  height={20}
                                  alt="mail icon"
                                />
                              </Button>
                            )
                            : null}
                        </Col>
                      </Row>
                    )}
                </Col>
              ))
            : getContactUnlockIcon()
        }
      </Row>
    </>
  );
};
export default UnlockContact;
