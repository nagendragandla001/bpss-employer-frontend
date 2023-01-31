/* eslint-disable no-nested-ternary */
/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
import {
  CheckOutlined,
  CloseOutlined, DownOutlined, EllipsisOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import {
  Button,
  Checkbox, Col,
  DatePicker, Dropdown,
  Form, Input, Menu,
  Modal,
  Row,
  Typography,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import dayjs from 'dayjs';
import has from 'lodash/has';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import {
  ApplicationDataInterface, getFlatOrgData, OrganizationDetailsType,
  recommmendTemplatesType, CMSInterface,
} from 'screens/authenticated/ApplicationsTab/Common/ApplicationTabUtils';
import {
  candidateLeftJob,
  getRejectionReasons, markAbsent,
  markAsOnHold, markJoined,
  rejectCandidate, selectCandidate, shortlistApplication,
} from 'service/application-card-service';
import { getOrgSlotTemplates, getSlotsDetails } from 'service/application-service';
import { getOrgDetails } from 'service/organization-service';
import { pushClevertapEvent } from 'utils/clevertap';
import snackBar from 'components/Notifications';

require('screens/authenticated/ApplicationsTab/Desktop/applicationActions.less');

const ScheduleInterview = dynamic(() => import('screens/authenticated/ApplicationsTab/Desktop/ScheduleInterview/index'), { ssr: false });

const { Text, Paragraph } = Typography;

// Stage-wise actions for Desktop
const applicationCardActions = {
  CAP: [
    { display: 'Reject', value: 'reject' },
    { display: 'Shortlist', value: 'shortlist' },
  ],
  TBSI_WITHSLOTS: [

    { display: 'Suggested Slots on:  ', value: '' },
    { display: 'Reschedule', value: 'rescheduleInterview' },
    { display: 'Reject', value: 'reject' },

  ],
  TBSI_NOSLOTS_NCAR: [
    { display: 'Reject', value: 'reject' },
    { display: 'Add Interview Slots', value: 'scheduleInterview' },

  ],
  TBSI_NOSLOTS_CAR: [
    { display: 'Reject', value: 'reject' },
    { display: 'Schedule Interview', value: 'scheduleInterview' },

  ],
  SFI_INTERVIEW_PENDING: [
    { display: 'Interview details:', value: '' },
    { display: 'Reschedule', value: 'rescheduleInterview' },
    { display: '', value: '' },
  ],
  SFI_INTERVIEW_DONE: [
    { display: 'Reject', value: 'reject' },
    { display: 'Select', value: 'select' },
    { display: 'Absent for Interview', value: 'absent' },
    { display: 'Reschedule', value: 'rescheduleInterview' },
  ],
  SFI_PRESENT: [
    { display: 'Reject', value: 'reject' },
    { display: 'Select', value: 'select' },
  ],
  SFI_ABSENT: [
    { display: 'Reject', value: 'reject' },
    { display: 'Reschedule', value: 'rescheduleInterview' },
    { display: 'Select', value: 'select' },

  ],
  SEL: [
    { display: 'Joining on:', value: '' },
    { display: 'Change Offer', value: 'changeOffer' },
    { display: '', value: '' },
  ],
  ATJ: [
    { display: 'Joining on:', value: '' },
    { display: 'Joined', value: 'joined' },
    { display: '', value: '' },
  ],
  DNATJ: [
    { display: 'Joining on:', value: '' },
    { display: 'Change Offer', value: 'changeOffer' },
    { display: '', value: '' },
  ],
  J: [
    { display: 'Joined on:', value: '' },
    { display: 'Left Job', value: 'leftJob' },
    { display: '', value: '' },
  ],
};

const modalTitles = {
  select: 'Mark As Selected',
  changeOffer: 'Change Offer',
  joined: 'Mark As Joined',
  reject: 'Mark As Rejected',
  leftJob: 'Mark As Left',
};

const stageIcons = {
  select: 'congratsIcon.svg',
  changeOffer: 'congratsIcon.svg',
  joined: 'congratsIcon.svg',
  leftJob: 'leftJobIcon.png',
  reject: 'rejectedIcon.png',
};

type rejectionReason={
  id: number;
  reason: string;
}

interface setApplicationDataI{
  applicationData: Array<ApplicationDataInterface>;
  totalApplications: number;
  loading: boolean,
  offset: number,
  downloadCount: number,
}
interface PropsInterface{
  applicationStage: string;
  applicationId: string;
  appliedJobType: string;
  suggestedSlotTemplateName: string;
  candidateJoiningDate: string;
  interviewStartTime: string;
  interviewEndTime: string;
  interviewAttendance: string;
  name:string;
  appliedJobTitle:string;
  appliedJobLocation: string;
  appliedJobId:string,
  setApplicationData: React.Dispatch<React.SetStateAction<setApplicationDataI>>;
  profileAvatarIndex: number;
  gender: string;
  contactUnlocked:boolean;
  updateCandidateInfo: (id: string) => void;
  cms: CMSInterface;
  preSkilled: boolean;
}

type selectPutObjectType={
  date_of_joining?: string;
  salary_offered?: string;
  id: string;
}

const ApplicationCardActions = (props:PropsInterface):JSX.Element => {
  const {
    applicationStage, appliedJobType, candidateJoiningDate, appliedJobId, suggestedSlotTemplateName,
    interviewAttendance, interviewStartTime, interviewEndTime, name,
    appliedJobTitle, applicationId, appliedJobLocation, contactUnlocked,
    setApplicationData, profileAvatarIndex, gender, updateCandidateInfo, cms, preSkilled,
  } = props;
  const [form] = Form.useForm();
  const [showModal, setShowModal] = useState('');
  const [rejectionReasons, setRejectionReasons] = useState<Array<rejectionReason>>([]);
  const [requestInProgress, setRequestInProgress] = useState<''|'skip'|'submit'>('');
  const [scheduleInterviewType, setScheduleInterviewType] = useState('');
  const [orgData, setOrgData] = useState<OrganizationDetailsType>({
    id: '',
    managers: [],
    offices: [],
  });
  const [state, setstate] = useState({
    reason: false,
  });
  const [othersId, setothersId] = useState(0);
  const [recommmendTemplates,
    setRecommmendTemplates] = useState<recommmendTemplatesType|null>(null);
  const [showScheduleInterview, setShowScheduleInterview] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);

  const showSnackbar = (title:string, description:string,
    iconName:string, notificationType: string) :void => {
    snackBar({
      title,
      description,
      iconName,
      notificationType,
      placement: 'bottomRight',
      duration: 5,
    });
  };

  const updateApplicationData = (updateObject):void => {
    setApplicationData((prevState) => {
      const applicationDataCopy = [...prevState.applicationData];
      const index = applicationDataCopy.findIndex(
        (item) => item.applicationId === applicationId,
      );
      if (index !== -1) {
        const dataCopy = { ...applicationDataCopy[index], ...updateObject };
        applicationDataCopy[index] = dataCopy;
      }
      return {
        ...prevState,
        applicationData: applicationDataCopy,
      };
    });
  };

  const shortlist = async (): Promise<void> => {
    if (props.applicationId) {
      // pushClevertapEvent('Special Click', { Type: 'Shortlist', cms_match: cms?.score });
      const apiCall = await shortlistApplication(props.applicationId);
      if ([200, 201, 202].indexOf(apiCall.status) > -1) {
        showSnackbar('Candidate Shortlisted',
          'SMS/Email has been sent to candidate', 'congratsIcon.svg',
          'info');
        // const response = await apiCall.data;
        // const applicationUpdateObject = {
        //   applicationStage: (has(response, '_source.stage') && response._source.stage) || '',
        //   suggestedSlotTemplateName:
        // (has(response, '_source.suggested_slot_template.template.name')
        //   && response._source.suggested_slot_template.template.name) || '',
        //   suggestedSlotTemplateId: (has(response, '_source.suggested_slot_template.template.id')
        //   && response._source.suggested_slot_template.template.id) || '',
        //   applicationOnHold: (has(response, '_source.on_hold')
        //     && response._source.on_hold) || false,
        // };
        pushClevertapEvent('Special Click', {
          Type: 'Shortlist',
          cms_match: cms?.score,
          'pre-skilled': preSkilled,
        });
        setActionInProgress(false);
        // updateApplicationData(applicationUpdateObject);
        updateCandidateInfo(applicationId);
      } else {
        setActionInProgress(false);
      }
    }
  };
  const markAsRejected = async (action) : Promise<void> => {
    pushClevertapEvent('Special Click', {
      Type: 'Reject',
      cms_match: cms?.score,
      'pre-skilled': preSkilled,
    });
    const apiCall = await getRejectionReasons(applicationStage, 'RJ');
    if ([200, 201, 202].indexOf(apiCall.status) > -1) {
      const response = await apiCall.data;
      const tempReasons = response.objects.map((item) => ({
        id: item.id,
        reason: item.name,
      }));
      setRejectionReasons(tempReasons);
      setShowModal(action);
      const otherReason = tempReasons.filter(((reason) => reason.reason === 'Other'));
      setothersId(otherReason[0].id);
    }
    setActionInProgress(false);
    // updateCandidateInfo(applicationId);
  };

  const getJobSuggestedSlots = async (orgId) :Promise<recommmendTemplatesType|null> => {
    const apiCall1 = await getOrgSlotTemplates(orgId);
    if (apiCall1) {
      const response = await apiCall1.data;
      if (Object.prototype.hasOwnProperty.call(response, appliedJobId)) {
        const slotsIds:Array<string> = response[appliedJobId].reduce((acc, template) => {
          const templateSlotIds = template.slots.map((slot) => slot.id);
          return acc.concat(templateSlotIds);
        }, []);
        const apiCall2 = await getSlotsDetails(slotsIds);
        if (apiCall2) {
          const slotDetailsResponse = await apiCall2.data;

          const RecommmendTemplates = response[appliedJobId].map((template) => {
            let maxTime = -Infinity;
            let minTime = Infinity;
            let startTime; let endTime;
            let interviewType = 'FACE'; let
              suggestedTo = '1';
            let interviewAddress;
            let poccontact;
            let pocname;
            const interviewDates:Array<{d:string, m:string, date: string, day: string}> = [];

            let SortedInterviewDates:Array<{d:string, m:string, date: string, day: string}> = [];
            for (let i = 0; i < template.slots.length; i += 1) {
              const interviewTime = dayjs(template.slots[i].start).valueOf();
              const obj = {
                d: dayjs(template.slots[i].start).format('YYYY-MM-DD'),
                m: dayjs(template.slots[i].start).format('D MMM'),
                date: dayjs(template.slots[i].start).format('DD'),
                day: dayjs(template.slots[i].start).format('dd'),
              };
              const found = interviewDates.some((el) => el.date === obj.date);
              if (!found) interviewDates.push(obj);
              if (interviewTime > maxTime) {
                maxTime = interviewTime;
                startTime = template.slots[i];
              }
              if (interviewTime < minTime) {
                minTime = interviewTime;
                endTime = template.slots[i];
              }
            }
            SortedInterviewDates = interviewDates.sort((a, b) => dayjs(a.d).diff(b.d));
            const StartDate = SortedInterviewDates[0].m;
            const EndDate = SortedInterviewDates[SortedInterviewDates.length - 1].m;
            if (slotDetailsResponse && slotDetailsResponse.objects
            && Array.isArray(slotDetailsResponse.objects)
            && slotDetailsResponse.objects.length) {
              const firstSlot = slotDetailsResponse.objects.filter(
                (slot) => parseInt(slot._id, 10) === template.slots[0].id,
              );
              interviewType = (has(firstSlot[0], '_source.interview_type') && firstSlot[0]._source.interview_type) || 'FACE';
              suggestedTo = (has(firstSlot[0], '_source.application_ids') && Array.isArray(firstSlot[0]._source.application_ids)
              && firstSlot[0]._source.application_ids.length) || 1;
              interviewAddress = (has(firstSlot[0], '_source.org_slot.location.place.short_formatted_address') && firstSlot[0]._source.org_slot.location.place.short_formatted_address) || ' ';
              poccontact = (has(firstSlot[0], '_source.poc.contact') && firstSlot[0]._source.poc.contact) || ' ';
              pocname = (has(firstSlot[0], '_source.poc.name') && firstSlot[0]._source.poc.name) || ' ';
              // startDate =
              // (has(firstSlot[0], '_source.date') && firstSlot[0]._source.date) || ' ';
            }
            return {
              interviewStartTime: startTime.start,
              interviewEndTime: endTime.end,
              interviewAddress,
              pocname,
              poccontact,
              StartDate,
              EndDate,
              interviewDuration: startTime.duration,
              templateId: template.id,
              SortedInterviewDates,
              interviewType,
              suggestedTo,
              applicationId,
              appliedJobId,
            };
          });
          return RecommmendTemplates;
        }
      }
    }
    return null;
  };

  const scheduleInterview = async (rescheduleInterview): Promise<void> => {
    // CleverTap Event Push
    if (!rescheduleInterview) {
      if (appliedJobType === 'NCAR') {
        pushClevertapEvent('Special Click', { Type: 'Add Interview Slots' });
        setScheduleInterviewType('Add Interview Slots');
      } else {
        pushClevertapEvent('Special Click', { Type: 'Schedule Interview', cms_match: cms?.score });
        setScheduleInterviewType('Schedule Interview');
      }
    } else {
      pushClevertapEvent('Special Click', { Type: 'Reshedule', cms_match: cms?.score });
      setScheduleInterviewType('Reshedule');
    }

    const apiCall = await getOrgDetails();
    if (apiCall) {
      const response = await apiCall.data;
      const flatOrgData = getFlatOrgData(response);
      setOrgData(flatOrgData);
      const jobSuggestedSlots = await getJobSuggestedSlots(flatOrgData.id);
      if (jobSuggestedSlots) {
        setRecommmendTemplates(jobSuggestedSlots);
      }
      setShowScheduleInterview(true);
    }
    setActionInProgress(false);
  };

  const markAsAbsent = async (): Promise<void> => {
    if (applicationId) {
      const apiCall = await markAbsent(applicationId, true);
      if ([200, 201, 202].indexOf(apiCall.status) > -1) {
        showSnackbar('Marked Absent',
          `${name} was marked as absent for Interview`, 'congratsIcon.svg',
          'error');
        const response = await apiCall.data;
        // const applicationUpdateObject = {
        //   interviewAttendance: (has(response, '_source.interview.attendance')
        //     && response._source.interview.attendance) || '',
        // };
        setActionInProgress(false);
        // updateApplicationData(applicationUpdateObject);
        updateCandidateInfo(applicationId);
      } else {
        setActionInProgress(false);
      }
    }
  };
  const markOnHold = async (): Promise<void> => {
    if (applicationId) {
      pushClevertapEvent('Special Click', { Type: 'Keep on hold', cms_match: cms?.score });
      const apiCall = await markAsOnHold(applicationId);
      if ([200, 201, 202].indexOf(apiCall.status) > -1) {
        showSnackbar('On Hold',
          'Candidate has been put on hold. No update will be sent to candidate', 'congratsIcon.svg',
          'info');
        const response = await apiCall.data;
        const applicationUpdateObject = {
          applicationOnHold: (has(response, '_source.on_hold')
            && response._source.on_hold) || false,
        };
        pushClevertapEvent('Special Click', { Type: 'Keep on hold', cms_match: cms?.score });
        setActionInProgress(false);

        // updateApplicationData(applicationUpdateObject);
        updateCandidateInfo(applicationId);
      } else {
        setActionInProgress(false);
      }
    }
  };
  const clevertapTrigger = (text:string):void => {
    pushClevertapEvent('Special Click', { Type: `${text}`, cms_match: cms?.score });
  };
  const selectTrigger = ():void => {
    pushClevertapEvent('Make an offer', { Type: 'Selection modal', cms_match: cms?.score });
  };
  const callAction = (action:string) : void => {
    if (['shortlist', 'reject', 'scheduleInterview',
      'rescheduleInterview', 'absent', 'keepOnHold'].indexOf(action) !== -1) {
      setActionInProgress(true);
    }
    switch (action) {
      case 'shortlist':
        shortlist();
        break;
      case 'reject':
        markAsRejected(action);
        break;
      case 'scheduleInterview':
        scheduleInterview(false);
        break;
      case 'rescheduleInterview':
        scheduleInterview(true);
        break;
      case 'absent':
        markAsAbsent();
        break;
      case 'keepOnHold':
        markOnHold();
        break;
      case 'select':
        selectTrigger();
        setShowModal(action);
        break;
      case 'changeOffer':
        clevertapTrigger('changeOffer');
        setShowModal(action);
        break;
      case 'joined':
        setShowModal(action);
        break;
      case 'leftJob':
        clevertapTrigger('Left Job');
        setShowModal(action);
        break;
      default:
        break;
    }
  };

  const getFormattedInfo = (info):JSX.Element | string => {
    if (info) {
      if (['SEL', 'ATJ', 'DNATJ', 'J'].indexOf(applicationStage) !== -1) {
        const displayDay = dayjs(info).format('DD MMM YYYY');
        return (
          <Col className="m-left-4">
            <CustomImage
              src="/images/application-tab/calendarIcon.svg"
              alt="icon"
              width={10}
              height={10}
              className="format-class format-calendar-icon"
            />
            <span className="display-date-f">{displayDay}</span>

          </Col>
        );
      }
      if (applicationStage === 'TBSI') {
        return (
          <Col className="m-left-4">
            <CustomImage
              src="/images/application-tab/calendarIcon.svg"
              alt="icon"
              width={10}
              height={10}
              className="format-class format-calendar-icon"
            />
            <span className="format-display-date">{info.split(' -')[0]}</span>
          </Col>
        );
      }
      if (applicationStage === 'SFI') {
        const displayDate = dayjs(info).format('DD MMM - hh:mm A');
        return (
          <>
            <CustomImage
              src="/images/application-tab/timerIcon.svg"
              width={13}
              height={13}
              alt="icon"
            />
            <span
              style={{ fontSize: '11px', fontWeight: 'bold', color: '#001443' }}
            >
              {displayDate}
            </span>
          </>
        );
      }
    }
    return '--';
  };
  const getCTA = (stage, btnType, info?) : JSX.Element | null => {
    if (Object.keys(applicationCardActions).indexOf(stage) !== -1) {
      if (applicationCardActions[stage].length > 2) {
        const menuItems = (
          <Menu>
            {applicationCardActions[stage].map(
              (item, index) => {
                if (!index || (item.display === '')) {
                  return null;
                }

                return (
                  <Menu.Item key={item.value} onClick={(): void => callAction(item.value)}>
                    {item.display}
                  </Menu.Item>
                );
              },
            )}
          </Menu>
        );

        return (
          <>
            {btnType === 'actionBtn'
              ? (
                <>
                  <Button
                    shape="round"
                    hidden={btnType === 'infoBtn'}
                    onClick={():void => {
                      callAction(applicationCardActions[stage][0].value);
                    }}
                    icon={(
                      <CloseOutlined style={{
                        strokeWidth: '90', // --> higher value === more thickness the filled area
                        stroke: '#a51616',
                      }}
                      />
                    )}
                    className="app-actions-two-btn"
                  >
                    Reject
                  </Button>
                  <Button shape="circle" className="app-actions-circle-btn">
                    <Dropdown
                      className="ac-dropdown-button"
                      overlay={menuItems}
                      trigger={['click']}
                      getPopupContainer={(triggerNode: HTMLElement):HTMLElement => triggerNode}
                      disabled={actionInProgress}
                    >
                      {actionInProgress ? <LoadingOutlined /> : <DownOutlined />}
                    </Dropdown>
                  </Button>
                </>
              )
              : (
                <Dropdown.Button
                  className={`${btnType === 'infoBtn' ? 'ac-dropdown-info-button' : 'ac-dropdown-button'} 
              ${stage === 'TBSI_WITHSLOTS' ? 'ac-dropdown-info-button-grey' : null}`}
                  overlay={menuItems}
                  icon={actionInProgress ? <LoadingOutlined /> : btnType === 'infoBtn'
                    ? <EllipsisOutlined /> : <DownOutlined />}
                  trigger={['click']}
                  getPopupContainer={(triggerNode: HTMLElement):HTMLElement => triggerNode}
                  onClick={():void => {
                    callAction(applicationCardActions[stage][0].value);
                  }}
                  disabled={actionInProgress}
                >
                  {applicationCardActions[stage][0].display}
                  <br />
                  {(btnType === 'infoBtn') ? getFormattedInfo(info) : null}
                </Dropdown.Button>
              )}
          </>
        );
      }

      return (
        <>

          <Button
            shape="round"
            onClick={():void => {
              callAction(applicationCardActions[stage][0].value);
            }}
            icon={(
              <CloseOutlined style={{
                strokeWidth: '90', // --> higher value === more thickness the filled area
                stroke: '#a51616',
              }}
              />
            )}
            className="app-actions-two-btn"
          >
            {applicationCardActions[stage][0].display }
          </Button>

          <Col span={1} />
          {contactUnlocked
            ? (
              <Button
                shape="round"
                onClick={():void => {
                  callAction(applicationCardActions[stage][1].value);
                }}
                icon={applicationCardActions[stage][1].value === 'scheduleInterview' ? (
                  <CustomImage
                    src="/images/application-tab/interview-slot.svg"
                    width={14}
                    height={14}
                    className="margin-excel"
                    alt="interview"
                  />
                )
                  : <CheckOutlined style={{ stroke: ' #36992e', strokeWidth: '90' }} />}
                className="app-actions-two-btn"
              >
                {applicationCardActions[stage][1].display }
              </Button>
            ) : null}
        </>
      );
    }
    return null;
  };
  const getButtonsOfStage = () : JSX.Element | null => {
    switch (applicationStage) {
      case 'ES':
        return (
          <Button className="app-actions-info-btn">
            Awaiting

            Candidate Response
          </Button>
        );
      case 'CAP':
        return getCTA(applicationStage, 'actionBtn');
      case 'TBSI':
        return getCTA(suggestedSlotTemplateName ? 'TBSI_WITHSLOTS'
          : `${applicationStage}_NOSLOTS_${appliedJobType}`,
        suggestedSlotTemplateName ? 'infoBtn' : 'actionBtn', suggestedSlotTemplateName);
      case 'SFI':
        if (interviewAttendance === 'A') return getCTA('SFI_ABSENT', 'actionBtn');
        if (interviewAttendance === 'P') return getCTA('SFI_PRESENT', 'actionBtn');
        if (interviewEndTime) {
          const interviewEndTimeDayJs = dayjs(interviewEndTime);
          const currentTime = dayjs(new Date());
          const diff = currentTime.diff(interviewEndTimeDayJs, 'm');
          if (diff >= 0) {
            return getCTA('SFI_INTERVIEW_DONE', 'actionBtn');
          }
          return getCTA('SFI_INTERVIEW_PENDING', 'infoBtn', interviewStartTime);
        }
        return null;
      case 'SEL':
        return getCTA(applicationStage, 'infoBtn', candidateJoiningDate);
      case 'ATJ':
        return getCTA(applicationStage, 'infoBtn', candidateJoiningDate);
      case 'DNATJ':
        return getCTA(applicationStage, 'infoBtn', candidateJoiningDate);
      case 'J':
        return getCTA(applicationStage, 'infoBtn', candidateJoiningDate);
      default:
        return null;
    }
  };
  const getSFIinterviewDetails = () : JSX.Element | null => {
    if (interviewEndTime && applicationStage === 'SFI') {
      const interviewEndTimeDayJs = dayjs(interviewEndTime);
      const currentTime = dayjs(new Date());
      const diff = currentTime.diff(interviewEndTimeDayJs, 'm');
      if (diff >= 0) {
        const displayDate = dayjs(interviewStartTime).format('DD MMM - hh:mm A');
        return (
          <div className="app-actions-sfi-text">
            Interview Details:
            <br />
            <CustomImage
              src="/images/application-tab/timerIcon.svg"
              width={13}
              height={13}
              alt="icon"
            />
            <span style={{ fontSize: '11px', color: '#001443' }}>{displayDate}</span>
          </div>
        );
      }
    }
    return null;
  };
  const validateLeftDate = (_rule, value): Promise<void> => {
    const leftDate = dayjs(value);
    const joiningDate = dayjs(candidateJoiningDate);
    if (joiningDate && leftDate) {
      const diff = leftDate.diff(joiningDate, 'm');
      if (diff <= 0) {
        return Promise.reject(new Error('The date of leaving cannot be less than date of joining'));
      }
    }
    return Promise.resolve();
  };
  const validateSalary = (_rule, value): Promise<void> => {
    const val = !Number.isNaN(Number(value)) ? parseInt(value, 10) : null;
    if (val && val < 60000) {
      return Promise.reject(new Error('Annual CTC cannot be less than 60,000'));
    }
    if (val && val > 20000000) {
      return Promise.reject(new Error('Annual CTC cannot be greater than 2,00,00,000'));
    }
    return Promise.resolve();
  };

  const validateJoiningDate = async (_rule, value): Promise<void> => {
    if (!value) {
      return Promise.resolve();
    }
    const putObject : selectPutObjectType = {
      date_of_joining: value.format('YYYY-MM-DD'),
      salary_offered: undefined,
      id: applicationId,
    };
    const apiCall = await selectCandidate(putObject);
    if (apiCall && apiCall.response && apiCall.response.status === 400) {
      return Promise.reject(new Error(apiCall.response.data.message));
    }
    return Promise.resolve();
  };

  const getModalContent = ():JSX.Element | null => {
    if (['select', 'changeOffer', 'joined'].indexOf(showModal) !== -1) {
      return (
        <div>
          <Row>
            <Col span={24}>
              <Form.Item
                label="Offered Salary (Annual CTC)"
                name="salaryOffered"
                rules={[
                  { validator: validateSalary },
                  {
                    required: (showModal === 'joined' || showModal === 'changeOffer'),
                    message: 'Please provide annual CTC',
                  },
                ]}
              >
                <Input
                  type="number"
                  prefix={(
                    <CustomImage
                      src="/images/application-tab/rupeeIcon.svg"
                      width={22}
                      height={22}
                      alt="rupee icon"
                    />
                  )}
                  size="large"
                  className="app-actions-feedback-input"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item
                label="Joining Date"
                name="joiningDate"
                className="app-actions-feedback-datepicker"
                rules={[
                  { validator: validateJoiningDate },
                  {
                    required: (showModal === 'joined' || showModal === 'changeOffer'),
                    message: 'Please provide the date of joining',
                  },
                ]}
              >
                <DatePicker
                  showToday={false}
                  placeholder="DD/MM/YYYY"
                  size="large"
                  getPopupContainer={(triggerNode: HTMLElement):HTMLElement => triggerNode}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
          </Row>
        </div>
      );
    }
    if (showModal === 'leftJob') {
      return (
        <div>
          <Row>
            <Col span={24}>
              <Form.Item
                label="When did he leave the job?"
                name="dateOfLeaving"
                className="app-actions-feedback-datepicker"
                rules={[
                  {
                    validator: validateLeftDate,
                  },
                  {
                    required: true,
                    message: 'Please provide the date of leaving',
                  },
                ]}
              >
                <DatePicker
                  placeholder="DD/MM/YYYY"
                  format="DD/MM/YYYY"
                  showToday={false}
                  size="large"
                  disabledDate={(current): boolean => {
                    const currentTime = dayjs(current.format());
                    const time = dayjs(new Date());
                    const diff = time.diff(currentTime, 'm');
                    return diff < 0;
                  }}
                  getPopupContainer={(triggerNode: HTMLElement):HTMLElement => triggerNode}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>
      );
    }
    if (showModal === 'reject') {
      return (
        <>
          <div className="app-actions-rejection-reasons">
            <Row>
              <Col>
                <Text className="title">What was the reason for rejecting?</Text>
              </Col>
            </Row>
            <>
              <Form.Item
                name="rejectionReasons"
                className="p-top-sm"
              >
                <Checkbox.Group onChange={(value):void => {
                  if (value.indexOf(othersId) > -1) {
                    setstate((prevState) => ({
                      ...prevState,
                      reason: true,
                    }));
                  } else {
                    setstate((prevState) => ({
                      ...prevState,
                      reason: false,
                    }));
                  }
                }}
                >
                  {rejectionReasons.map((item) => (
                    <Row key={item.id}>
                      <Col span={24} className="checkbox">
                        <Checkbox
                          value={item.id}
                          onClick={():void => {
                            pushClevertapEvent('Special Click', {
                              Type: 'Rejection Reasons',
                              Value: `${item.reason}`,
                              cms_match: cms?.score,
                              'pre-skilled': preSkilled,
                            });
                          }}
                        >
                          {item.reason}

                        </Checkbox>
                      </Col>
                    </Row>
                  ))}
                </Checkbox.Group>

              </Form.Item>
              {state.reason
                ? (

                  <Form.Item
                    name="comment"
                    rules={[{
                      required: true,
                      message: 'Please enter the reason',
                    }]}
                  >

                    <Input size="small" placeholder="Enter The reason" />
                  </Form.Item>
                )

                : null}

            </>
          </div>

        </>
      );
    }

    return null;
  };
  const getModalFooterButtons = ():JSX.Element| null => {
    if (showModal) {
      return (
        <div className="feedback-modal-footer">
          {['leftJob', 'joined', 'changeOffer'].indexOf(showModal) !== -1 ? null
            : (
              <Button
                key="back"
                type="link"
                loading={requestInProgress === 'skip'}
                disabled={requestInProgress === 'submit'}
                className="link-btn"
                onClick={(): void => {
                  setRequestInProgress('skip');
                  form.submit();
                }}
              >
                {showModal === 'select' ? 'Skip for Now' : 'Skip' }
              </Button>
            )}
          <Button
            key="submit"
            type="primary"
            loading={requestInProgress === 'submit'}
            disabled={requestInProgress === 'skip'}
            className="primary-btn"
            onClick={(): void => {
              form.submit();
              if (form.getFieldsError().length < 2) { setRequestInProgress('submit'); }
            }}
          >
            {showModal === 'select' ? 'Make an Offer' : 'Submit'}
          </Button>
        </div>
      );
    }
    return null;
  };
  const onFinishHandler = async (formData):Promise<void> => {
    const action = showModal;
    if (['select', 'changeOffer', 'joined'].indexOf(action) !== -1) {
      const putObject : selectPutObjectType = {
        date_of_joining: formData.joiningDate ? formData.joiningDate.format('YYYY-MM-DD') : undefined,
        salary_offered: formData.salaryOffered ? formData.salaryOffered : undefined,
        id: applicationId,
      };
      let apiCall;
      if (['select', 'changeOffer'].indexOf(action) !== -1) {
        apiCall = await selectCandidate(putObject);
      } else {
        apiCall = await markJoined(putObject);
      }
      setRequestInProgress('');
      setShowModal('');
      if ([200, 201, 202].indexOf(apiCall.status) > -1) {
        if (action === 'changeOffer') {
          showSnackbar('Offer Updated',
            'Offer Information is updated and candidate has been notified via SMS/Email', 'congratsIcon.svg',
            'info');
          // pushClevertapEvent('Special Click', { Type: 'Change Offer' });
        } else if (action === 'select') {
          showSnackbar('Made Offer',
            `${name} was selected for the job - ${appliedJobTitle} and an SMS/ Email has been sent to candidate `, 'congratsIcon.svg',
            'info');
          // pushClevertapEvent('Make an offer', { Type: 'Selection modal' });
        } else {
          showSnackbar('Candidate Joined',
            `${name} joined your company. Joining date has been updated. `, 'congratsIcon.svg',
            'info');
        }
        const response = await apiCall.data;
        const applicationUpdateObject = {
          applicationStage: (has(response, '_source.stage') && response._source.stage) || '',
          candidateJoiningDate: (has(response, '_source.selection.date_of_joining')
                    && response._source.selection.date_of_joining) || '',
          applicationOnHold: (has(response, '_source.on_hold')
                    && response._source.on_hold) || false,
        };
        updateApplicationData(applicationUpdateObject);
      }
    }
    if (action === 'leftJob' && formData.dateOfLeaving) {
      const apiCall = await candidateLeftJob(applicationId, formData.dateOfLeaving.format('YYYY-MM-DD'));
      setRequestInProgress('');
      setShowModal('');
      if ([200, 201, 202].indexOf(apiCall.status) > -1) {
        showSnackbar('Infomation Updated',
          `${name} was marked as left for the job - ${appliedJobTitle} ${appliedJobLocation ? `- ${appliedJobLocation.split(',')[0]}` : ''}`, 'leftJobIcon.png',
          'error');
        const response = await apiCall.data;
        const applicationUpdateObject = {
          applicationStage: (has(response, '_source.stage') && response._source.stage) || '',
        };
        updateApplicationData(applicationUpdateObject);
        // pushClevertapEvent('Special Click', { Type: 'Left Job' });
      }
    }
    if (action === 'reject') {
      let patchObject = [] as any;
      patchObject = {
        id: applicationId,
        reason_ids: formData.rejectionReasons,

      };
      if (formData.rejectionReasons && formData.rejectionReasons.indexOf(othersId) > -1) {
        patchObject.comment = formData.comment;
      }
      if (!formData.rejectionReasons || formData.rejectionReasons.length === 0) {
        delete patchObject.reason_ids;
      }
      const apiCall = await rejectCandidate(patchObject);
      setRequestInProgress('');
      setShowModal('');
      if ([200, 201, 202].indexOf(apiCall.status) > -1) {
        showSnackbar('Application Rejected',
          `${name} is marked as rejected for the job - ${appliedJobTitle}
      ${appliedJobLocation ? `- ${appliedJobLocation.split(',')[0]}` : ''}`, 'rejectedIcon.png',
          'error');
        const response = await apiCall.data;
        const applicationUpdateObject = {
          applicationStage: (has(response, '_source.stage') && response._source.stage) || '',
          applicationOnHold: (has(response, '_source.on_hold')
            && response._source.on_hold) || false,
        };
        updateApplicationData(applicationUpdateObject);
      }
    }
  };
  return (
    <>
      {/* {(['CAP'].indexOf(applicationStage) !== -1 && !applicationOnHold)
        ? (
          <Button
            className="ac-button"
            onClick={():Promise<void> => markOnHold()}
          >
            Reject
          </Button>
        ) : null} */}
      {/* If the appliaction is in SFI stage, showing the interview details */}

      {/* Buttons which are visible on the application Card */}
      {getSFIinterviewDetails()}
      {getButtonsOfStage()}

      {/* common modal for select, reject, joined, change offer, left job */}
      {['select', 'changeOffer', 'joined', 'leftJob', 'reject'].indexOf(showModal) !== -1 ? (
        <Modal
          title={<Text>{modalTitles[showModal]}</Text>}
          visible={!!showModal}
          onCancel={():void => setShowModal('')}
          destroyOnClose
          closeIcon={<CloseOutlined style={{ color: '#284e52', fontSize: '1.5rem' }} />}
          className="app-actions-modal"
          maskStyle={{ background: 'rgb(0, 20, 67,0.8)' }}
          footer={getModalFooterButtons()}
        >
          <Form
            name="FeedbackForm"
            layout="vertical"
            size="large"
            form={form}
            onFinish={onFinishHandler}
            className="feedback-modal-content"
            hideRequiredMark
          >
            <Row className="margin-bottom-20">
              <Col>
                <CustomImage
                  src={`/images/application-tab/${gender || 'F'}avatar${gender ? profileAvatarIndex : '0'}.svg`}
                  alt="icon"
                  width={48}
                  height={48}
                  className="width-height-48"
                />
              </Col>
              <Col span={17}>
                <Row className="p-left-8">
                  <Col span={20}>
                    <Paragraph
                      className="feedback-modal-candidate-name"
                      ellipsis
                    >
                      {name}
                    </Paragraph>
                  </Col>
                </Row>
                <Row className="p-left-8">
                  <Col span={20}>
                    <Paragraph className="display-flex">
                      <Text className="ac-light-gray-text ac-display-inline word-break text-small">
                        {`for ${appliedJobTitle} ${appliedJobLocation ? `- ${appliedJobLocation.split(',')[0]}` : ''}`}
                      </Text>
                    </Paragraph>
                  </Col>
                </Row>
              </Col>
              <Col span={2}>
                <CustomImage
                  src={`/icons/notification-icons/${stageIcons[showModal]}`}
                  alt="icon"
                  width={48}
                  height={48}
                  className="width-height-48"
                />
              </Col>
            </Row>
            {getModalContent()}
          </Form>
        </Modal>
      ) : null}
      {showScheduleInterview ? (
        <ScheduleInterview
          closeModal={():void => setShowScheduleInterview(false)}
          orgDetails={orgData}
          applicationId={applicationId}
          jobId={appliedJobId}
          jobType={appliedJobType}
          recommenedTemplates={recommmendTemplates}
          candidateName={name}
          updateApplicationData={updateCandidateInfo}
          clevertype={scheduleInterviewType}
          cms={cms}
        />
      ) : null}
    </>
  );
};

export default ApplicationCardActions;
