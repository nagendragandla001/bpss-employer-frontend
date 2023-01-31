/* eslint-disable no-nested-ternary */
/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
import {
  CaretDownOutlined, CloseOutlined, LoadingOutlined,
} from '@ant-design/icons';
import {
  Button, Checkbox, Col,
  DatePicker, Dropdown,
  Form, Input, Menu,
  Modal, Row,
  Spin, Typography,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import snackBar from 'components/Notifications';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import has from 'lodash/has';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import {
  ApplicationDataInterface, OrganizationDetailsType, OrgManagersType,
  OrgOfficesType, CMSInterface,
} from 'screens/authenticated/ApplicationsTab/Common/ApplicationTabUtils';
import {
  getRejectionReasons, markAbsent,
  markAsOnHold, rejectCandidate, selectCandidate, shortlistApplication,
} from 'service/application-card-service';
import { getOrgSlotTemplates, getSlotsDetails } from 'service/application-service';
import { getOrgDetails } from 'service/organization-service';
import { pushClevertapEvent } from 'utils/clevertap';

require('screens/authenticated/ApplicationsTab/Mobile/applicationActions.less');

const ScheduleInterview = dynamic(() => import('screens/authenticated/ApplicationsTab/Mobile/ScheduleInterview'), { ssr: false });

const { Text, Paragraph } = Typography;
dayjs.extend(customParseFormat);

// Stage-wise actions for mobile
const applicationCardActions = {
  CAP: [
    { display: 'Reject', value: 'reject' },
    { display: 'Shortlist', value: 'shortlist' },
  ],
  TBSI_NOSLOTS_NCAR: [
    { display: 'Reject', value: 'reject' },
    { display: 'Interview', value: 'scheduleInterview' },
  ],
  TBSI_NOSLOTS_CAR: [
    { display: 'Reject', value: 'reject' },
    { display: 'Interview', value: 'scheduleInterview' },
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
};

const modalTitles = {
  select: 'Mark As Selected',
  reject: 'Mark As Rejected',
};

const stageIcons = {
  select: 'congratsIcon.svg',
  reject: 'rejectedIcon1x.png',
};

const getManagersList = (managersList): Array<OrgManagersType> => managersList.map(
  (item) => ({
    type: item?.type || '',
    firstName: item?.user?.first_name || '',
    lastName: item?.user?.last_name || '',
    email: item?.user?.email || '',
    mobile: item?.user?.mobile || '',
  }),
);

const getOrgOfficesList = (officesList): Array<OrgOfficesType> => officesList.map(
  (item) => ({
    address: item.address || '',
    id: item.id,
    formattedAddress: (item?.place?.formatted_address) || '',
    location: (item?.place?.location) || '',
    placeId: (item?.place?.place_id) || '',
  }),
);

const getFlatOrgData = (orgData): OrganizationDetailsType => ({
  id: (orgData && orgData.objects && orgData.objects.length > 0
    && orgData.objects[0]._source && orgData.objects[0]._source.id) || '',
  managers: orgData && orgData.objects
            && orgData.objects.length > 0 && orgData.objects[0]._source
            && orgData.objects[0]._source.managers.length > 0
    ? getManagersList(orgData.objects[0]._source.managers) : [],
  offices: orgData && orgData.objects
            && orgData.objects.length > 0 && orgData.objects[0]._source
            && orgData.objects[0]._source.offices.length > 0
    ? getOrgOfficesList(orgData.objects[0]._source.offices) : [],
});

type rejectionReason={
  id: number;
  reason: string;
}
interface recommmendTemplatesType{
  interviewStartTime: string;
  interviewEndTime: string;
  interviewDuration: number;
  templateId: number;
  SortedInterviewDates: any;
  interviewType: string;
  suggestedTo: number;
  interviewAddress:string,
  pocname:string,
  poccontact:string,
  startDate:string,
}
interface setApplicationDataI{
  applicationData: Array<ApplicationDataInterface>;
  totalApplications: number;
  loading: boolean,
  offset: number,
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
  profileAvatarIndex : number;
  gender: string;
  contactUnlocked:boolean;
  cms: CMSInterface;
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
    setApplicationData, profileAvatarIndex, gender, cms,
  } = props;
  const [form] = Form.useForm();
  const [showModal, setShowModal] = useState('');
  const [rejectionReasons, setRejectionReasons] = useState<Array<rejectionReason>>([]);
  const [requestInProgress, setRequestInProgress] = useState<''|'skip'|'submit'>('');
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
  const [scheduleInterviewType, setScheduleInterviewType] = useState('');

  const showSnackbar = (description:string,
    iconName:string, notificationType: string) :void => {
    snackBar({
      title: '',
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
    setActionInProgress(false);
    if (props.applicationId) {
      pushClevertapEvent('Special Click', { Type: 'Shortlist', cms_match: cms?.score });
      const apiCall = await shortlistApplication(props.applicationId);
      if ([200, 201, 202].indexOf(apiCall.status) > -1) {
        showSnackbar('SMS/Email has been sent to candidate', 'congratsIcon.svg',
          'info');
        const response = await apiCall.data;
        const applicationUpdateObject = {
          applicationStage: (has(response, '_source.stage') && response._source.stage) || '',
          suggestedSlotTemplateName: (has(response, '_source.suggested_slot_template.template.name')
          && response._source.suggested_slot_template.template.name) || '',
          suggestedSlotTemplateId: (has(response, '_source.suggested_slot_template.template.id')
          && response._source.suggested_slot_template.template.id) || '',
          applicationOnHold: (has(response, '_source.on_hold')
            && response._source.on_hold) || false,
        };
        setActionInProgress(false);
        updateApplicationData(applicationUpdateObject);
      } else {
        setActionInProgress(false);
      }
    }
  };
  const markAsRejected = async (action) : Promise<void> => {
    setActionInProgress(false);
    pushClevertapEvent('Special Click', { Type: 'Reject', cms_match: cms?.score });
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
    } else {
      setActionInProgress(false);
    }
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
                d: dayjs(template.slots[i].start).format('DD-MM-YYYY'),
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
            }
            return {
              interviewStartTime: startTime.start,
              interviewEndTime: endTime.end,
              interviewDuration: startTime.duration,
              templateId: template.id,
              SortedInterviewDates,
              interviewType,
              suggestedTo,
              applicationId,
              appliedJobId,
              interviewAddress,
              pocname,
              poccontact,
              StartDate,
              EndDate,
            };
          });
          return RecommmendTemplates;
        }
      }
    }
    return null;
  };

  const scheduleInterview = async (rescheduleInterview): Promise<void> => {
    setActionInProgress(false);
    if (!rescheduleInterview) {
      if (appliedJobType === 'NCAR') {
        pushClevertapEvent('Special Click', { Type: 'Add Interview Slots' });
        setScheduleInterviewType('Add Interview Slots');
      } else {
        pushClevertapEvent('Special Click', { Type: 'Schedule Interview', cms_match: cms?.score });
        setScheduleInterviewType('Schedule Interview');
      }
    } else {
      pushClevertapEvent('Special Click', { Type: 'Reschedule', cms_match: cms?.score });
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
    setActionInProgress(false);
    if (applicationId) {
      const apiCall = await markAbsent(applicationId, true);
      if ([200, 201, 202].indexOf(apiCall.status) > -1) {
        showSnackbar(`${name} was marked as absent for Interview`, 'congratsIcon.svg',
          'error');
        const response = await apiCall.data;
        const applicationUpdateObject = {
          interviewAttendance: (has(response, '_source.interview.attendance')
            && response._source.interview.attendance) || '',
        };
        setActionInProgress(false);
        updateApplicationData(applicationUpdateObject);
      } else {
        setActionInProgress(false);
      }
    }
  };

  const markOnHold = async (): Promise<void> => {
    setActionInProgress(false);
    if (applicationId) {
      pushClevertapEvent('Special Click', { Type: 'Keep on hold', cms_match: cms?.score });
      setActionInProgress(false);
      const apiCall = await markAsOnHold(applicationId);
      if ([200, 201, 202].indexOf(apiCall.status) > -1) {
        showSnackbar('Candidate has been put on hold. No update will be sent to candidate', 'congratsIcon.svg',
          'info');
        const response = await apiCall.data;
        const applicationUpdateObject = {
          applicationOnHold: (has(response, '_source.on_hold')
            && response._source.on_hold) || false,
        };
        updateApplicationData(applicationUpdateObject);
      } else {
        setActionInProgress(false);
      }
    }
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
      case 'keepOnHold':
        markOnHold();
        break;
      case 'rescheduleInterview': {
        scheduleInterview(true);
        break;
      }
      case 'absent':
        markAsAbsent();
        break;
      case 'select':
        selectTrigger();
        setShowModal(action);
        break;
      default:
        break;
    }
  };

  const getCTA = (stage) : JSX.Element | null => {
    if (Object.keys(applicationCardActions).indexOf(stage) !== -1) {
      if (applicationCardActions[stage].length > 1) {
        const menuItems = (
          <Menu>
            {applicationCardActions[stage].map(
              (item) => (
                <Menu.Item
                  key={item.value}
                  hidden={item.value !== 'reject' && !contactUnlocked}
                  onClick={(): void => callAction(item.value)}
                >
                  {item.display}
                </Menu.Item>
              ),
            )}
          </Menu>
        );
        return (
          <Dropdown
            className="ac-dropdown-button"
            overlay={menuItems}
            trigger={['click']}
            getPopupContainer={(triggerNode: HTMLElement):HTMLElement => triggerNode}
          >
            <Button
              shape="circle"
              style={{ borderColor: '#abb2c1' }}
              icon={<CaretDownOutlined style={{ color: '#596685' }} />}
            />
          </Dropdown>
        );
      }
    }
    return null;
  };

  const displayJoiningInfo = (displayText):JSX.Element | null => (candidateJoiningDate ? (
    <Button disabled className="app-actions-info-btn-white-mobile">
      {displayText}
      <br />
      <CustomImage
        src="/images/application-tab/calendarIcon.svg"
        alt="icon"
        width={8}
        height={9}
        className="m-app-calendar"
      />
      {dayjs(candidateJoiningDate).format('DD MMM YYYY')}
    </Button>
  ) : null);

  const getButtonsOfStage = () : JSX.Element | null => {
    switch (applicationStage) {
      case 'ES':
        return (
          <Button disabled className="app-actions-info-btn-mobile">
            Awaiting
            Candidate Response
          </Button>
        );
      case 'CAP':
        return getCTA(applicationStage);
      case 'TBSI':
        if (suggestedSlotTemplateName) {
          const templateName = suggestedSlotTemplateName;
          return (
            <Button className="app-actions-info-btn-mobile">
              Suggested slots on:
              <br />
              <CustomImage
                src="/images/application-tab/calendarIcon.svg"
                alt="icon"
                width={8}
                height={9}
                className="m-app-calendar"
              />
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#002f34' }}>{templateName.split(' -')[0]}</span>
            </Button>
          );
        }
        return getCTA(`TBSI_NOSLOTS_${appliedJobType}`);
      case 'SFI':
        if (interviewAttendance === 'A') return getCTA('SFI_ABSENT');
        if (interviewAttendance === 'P') return getCTA('SFI_PRESENT');
        if (interviewEndTime) {
          const interviewEndTimeDayJs = dayjs(interviewEndTime);
          const currentTime = dayjs(new Date());
          const diff = currentTime.diff(interviewEndTimeDayJs, 'm');
          if (diff >= 0) {
            return getCTA('SFI_INTERVIEW_DONE');
          }
          return (
            <Button disabled className="app-actions-info-btn-white-mobile">
              Interview details:
              <br />
              <div style={{ paddingRight: '2px' }}>
                <CustomImage
                  src="/images/application-tab/timerIcon.svg"
                  alt="icon"
                  width={13}
                  height={13}
                />
                <span
                  style={{
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    fontWeight: 'bold',
                    color: '#002f34',
                  }}
                >
                  {dayjs(interviewStartTime).format('DD MMM - hh:mm A')}
                </span>
              </div>
            </Button>
          );
        }
        return null;
      case 'SEL':
        return displayJoiningInfo('Joining on:');
      case 'ATJ':
        return displayJoiningInfo('Joining on:');
      case 'J':
        return displayJoiningInfo('Joined on:');
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
          <div className="app-actions-sfi-text-mobile">
            Interview Details:
            <br />
            <div style={{ paddingRight: '1px' }}>
              <CustomImage
                src="/images/application-tab/timerIcon.svg"
                alt="icon"
                width={13}
                height={13}
              />
              <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#2c7b78' }}>{displayDate}</span>
            </div>
          </div>
        );
      }
    }
    return null;
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
  const getModalContent = ():JSX.Element | null => {
    if (showModal === 'select') {
      return (
        <div>
          <Row className="p-bottom-xs">
            <Col span={24}>
              <Form.Item
                label="Offered Salary (Annual CTC)"
                name="salaryOffered"
                rules={[
                  { validator: validateSalary },
                ]}
              >
                <Input
                  type="number"
                  prefix={(
                    <CustomImage
                      src="/images/application-tab/rupeeIcon.svg"
                      alt="rupee icon"
                      width={22}
                      height={22}
                    />
                  )}
                  size="large"
                  className="app-actions-feedback-input-mobile"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item
                label="Joining Date"
                name="joiningDate"
                className="app-actions-feedback-datepicker-mobile"
                validateTrigger={['onBlur']}
              >
                <DatePicker
                  showToday={false}
                  placeholder="DD/MM/YYYY"
                  size="small"
                  getPopupContainer={(triggerNode: HTMLElement):HTMLElement => triggerNode}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
          </Row>
        </div>
      );
    }
    if (showModal === 'reject') {
      return (
        <div className="app-actions-rejection-reasons-mobile">
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
      );
    }
    return null;
  };

  const getModalFooterButtons = ():JSX.Element| null => {
    if (showModal) {
      return (
        <div className="feedback-modal-footer-mobile">
          <Button
            key="submit"
            type="primary"
            className="green-primary-btn"
            loading={requestInProgress === 'submit'}
            disabled={requestInProgress === 'skip'}
            onClick={(): void => {
              form.submit();
              if (form.getFieldsError().length < 2) { setRequestInProgress('submit'); }
            }}
          >
            {showModal === 'select' ? 'Make an Offer' : 'Submit'}
          </Button>
          <Button
            key="back"
            type="link"
            className="green-link-btn"
            loading={requestInProgress === 'skip'}
            disabled={requestInProgress === 'submit'}
            onClick={(): void => {
              setRequestInProgress('skip');
              form.submit();
            }}
          >
            {showModal === 'select' ? 'Skip for Now' : 'Skip' }
          </Button>
        </div>
      );
    }
    return null;
  };

  const onFinishHandler = async (formData):Promise<void> => {
    const action = showModal;
    if (action === 'select') {
      const putObject : selectPutObjectType = {
        date_of_joining: formData.joiningDate ? dayjs(formData.joiningDate).format('YYYY-MM-DD') : undefined,
        salary_offered: formData.salaryOffered ? formData.salaryOffered : undefined,
        id: applicationId,
      };
      const apiCall = await selectCandidate(putObject);
      setRequestInProgress('');
      setShowModal('');
      if ([200, 201, 202].indexOf(apiCall.status) > -1) {
        showSnackbar(`${name} was selected for the job - ${appliedJobTitle} and an SMS/ Email has been sent to candidate `, 'congratsIcon.svg',
          'info');
        const response = await apiCall.data;
        const applicationUpdateObject = {
          applicationStage: (has(response, '_source.stage') && response._source.stage) || '',
          candidateJoiningDate: (has(response, '_source.selection.date_of_joining')
                    && response._source.selection.date_of_joining) || '',
          applicationOnHold: (has(response, '_source.on_hold')
                    && response._source.on_hold) || false,
        };
        pushClevertapEvent('Make an offer', {
          Type: 'Selection modal',
          cms_match: cms?.score,
        });
        updateApplicationData(applicationUpdateObject);
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
        showSnackbar(`${name} is marked as rejected for the job - ${appliedJobTitle} ${appliedJobLocation ? `- ${appliedJobLocation.split(',')[0]}` : ''}`, 'rejectedIcon1x.png',
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
    <Row>
      <Col span={24}>
        <Row>
          <Col span={24}>
            {/* If the appliaction is in SFI stage, showing the interview details */}
            {getSFIinterviewDetails()}
          </Col>
        </Row>
        <Row>
          <Col span={24} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {/* Buttons which are visible on the application Card */}
            {getButtonsOfStage()}
          </Col>
        </Row>
        {/* common modal for select, reject */}
        {['select', 'changeOffer', 'joined', 'leftJob', 'reject'].indexOf(showModal) !== -1 ? (
          <Modal
            title={<Text>{modalTitles[showModal]}</Text>}
            visible={!!showModal}
            onCancel={():void => setShowModal('')}
            destroyOnClose
            closeIcon={<CloseOutlined style={{ color: '#284e52', fontSize: '1.5rem' }} />}
            className="app-actions-modal-mobile"
            maskStyle={{ background: 'rgb(0, 47, 52,0.8)' }}
            footer={null}
          >
            <Form
              name="FeedbackForm"
              layout="vertical"
              size="large"
              form={form}
              onFinish={onFinishHandler}
              className="feedback-modal-content-mobile"
              hideRequiredMark
            >
              <Row className="feedback-modal-candidate-details-mobile">
                <Col>
                  <CustomImage
                    src={`/images/application-tab/${gender || 'F'}avatar${gender ? profileAvatarIndex : '0'}.svg`}
                    alt="icon"
                    className="width-height-48"
                    width={48}
                    height={48}
                  />
                </Col>
                <Col span={17}>
                  <Row className="p-left-8">
                    <Col span={20}>
                      <Paragraph
                        className="feedback-modal-candidate-name-mobile"
                        ellipsis
                      >
                        {name}
                      </Paragraph>
                    </Col>
                  </Row>
                  <Row className="p-left-8">
                    <Col span={20}>
                      <Paragraph ellipsis className="display-flex">
                        <p className="ac-light-gray-text ac-display-inline">
                          for&nbsp;
                          {appliedJobTitle}
                          &nbsp;
                          {appliedJobLocation ? `- ${appliedJobLocation.split(',')[0]}` : ''}
                        </p>
                      </Paragraph>
                    </Col>
                  </Row>
                </Col>
                <Col span={2}>
                  <CustomImage
                    src={`/icons/notification-icons/${stageIcons[showModal]}`}
                    alt="icon"
                    layout
                  />
                </Col>
              </Row>
              {getModalContent()}
              {getModalFooterButtons()}
              {requestInProgress ? (
                <Spin
                  className="feedback-modal-loading-state-mobile"
                  indicator={<LoadingOutlined style={{ fontSize: '2rem' }} spin />}
                />
              ) : null}
            </Form>
          </Modal>
        ) : null }

        {/* Modal for scheduling the interview */}
        {showScheduleInterview ? (
          <ScheduleInterview
            orgDetails={orgData}
            onCloseHandler={():void => setShowScheduleInterview(false)}
            applicationId={applicationId}
            jobId={appliedJobId}
            jobType={appliedJobType}
            recommmendTemplates={recommmendTemplates}
            updateApplicationData={updateApplicationData}
            clevertype={scheduleInterviewType}
            cms={cms}
          />
        ) : null}
      </Col>
    </Row>
  );
};

export default ApplicationCardActions;
