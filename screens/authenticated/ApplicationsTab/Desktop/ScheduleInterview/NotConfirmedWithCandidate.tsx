/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeleteOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import {
  Button,
  Card, Carousel, Checkbox,
  Col, DatePicker, Form,
  Input, Row, Select, Typography,
} from 'antd';
import snackBar from 'components/Notifications';
import CustomImage from 'components/Wrappers/CustomImage';
import { AddressValidator, InterviewRangePickerValues } from 'constants/enum-constants';
import moment from 'moment';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { CMSInterface, OrganizationDetailsType } from 'screens/authenticated/ApplicationsTab/Common/ApplicationTabUtils';
import { createJobSlot } from 'service/application-service';
import { pushClevertapEvent } from 'utils/clevertap';
import { EmailRegexPattern, MobileRegexPattern, skypeIDPattern } from 'utils/constants';

require('screens/authenticated/ApplicationsTab/Desktop/ScheduleInterview/addSlots.less');

const AddNewAddressDrawer = dynamic(() => import('screens/authenticated/JobsTab/Desktop/addSlots/addNewAddressModal'), { ssr: false });
const AddNewPocModal = dynamic(() => import('screens/authenticated/JobsTab/Desktop/addSlots/addNewPocModal'), { ssr: false });

const { Paragraph, Text } = Typography;
const { Option } = Select;
interface PropsInterface {
  orgDetails:OrganizationDetailsType;
  applicationId:string,
  jobId:string,
  invite:any;
  updateApplicationData: (id: string) => void;
  closeModal:any;
  candidateName:string;
  jobtype:string;
  clevertype:string;
  cms: CMSInterface
}

interface PocListInterface{
  name: string;
  email: string;
  mobile: string;
  id: number;
}
interface InterviewLocationsInterface{
  address: string; id: number; mapsLink: string;
}
interface stateInterface{
  ShowInterviewModal: boolean;
  ShowPocModal: boolean;
  SelectedPoc: Array<string>;
  SelectedPocAddress:any;
  SelectedInterviewAddress: Array<number>;
  PocList: Array<PocListInterface>;
  InterviewersList: Array<PocListInterface>;
  InterviewLocations: Array<InterviewLocationsInterface>;
  InterviewStartDate: string;
  InterviewStartTime: string,
  InterviewEndTime: string,
  InterviewType:string,
  VideoInterviewType:string
}

interface InterviewsRangeI{
  startTime: string;
  endTime:string;
}

const InterviewDurations = [
  { value: '15', text: '15 mins' },
  { value: '30', text: '30 mins' },
  { value: '60', text: '60 mins' },
  { value: '90', text: '90 mins' },
  { value: '120', text: '120 mins' },
];

const interviewTypes = [
  { value: 'FACE', text: 'Face to Face Interview' },
  { value: 'TELE', text: 'Telephonic Interview' },
  { value: 'VID', text: 'Video Interview' },
];
const videoInterviewTypes = [
  { value: 'HANG_VID', text: 'Google Hangouts' },
  { value: 'WHATSAPP_VID', text: 'Whatsapp' },
  { value: 'VID', text: 'Skype' },
  { value: 'OTHER', text: 'Others' },
];
const ToBeConfirmedWithCandidate = (props:PropsInterface):JSX.Element => {
  const {
    orgDetails, jobId, invite, applicationId, updateApplicationData, closeModal,
    candidateName, jobtype, clevertype, cms,
  } = props;
  const [form] = Form.useForm();

  const initPocList = (orgData, IspocList): Array<PocListInterface> => {
    if (orgData && orgData.managers && orgData.managers.length > 0) {
      const managersList = IspocList ? orgData.managers.filter((x) => x.mobile) : orgData.managers;
      return managersList.map((x) => ({
        name: `${x.firstName} ${x.lastName}`,
        email: x.email ? x.email : '',
        mobile: x.mobile ? x.mobile : '',
        id: x.id ? x.id : 0,
      }));
    }
    return [];
  };

  const getInitialSelectedPoc = (orgData): Array<string> => {
    if (orgData && orgData.managers && orgData.managers.length > 0) {
      const managersList = orgData.managers.filter((x) => x.mobile);
      return [managersList[0].mobile];
    }
    return [];
  };

  const initLocationList = (orgData): Array<InterviewLocationsInterface> => {
    if (orgData && orgData.offices && orgData.offices.length > 0) {
      return orgData.offices.map((x) => ({
        address: x.formattedAddress ? x.formattedAddress : '',
        mapsLink: `https://maps.google.com/?q=${x.location}`,
        id: x.id,
      }));
    }
    return [];
  };

  const [state, setState] = useState<stateInterface>({
    ShowInterviewModal: false,
    ShowPocModal: false,
    SelectedPoc: getInitialSelectedPoc(orgDetails),
    SelectedPocAddress: orgDetails && orgDetails.offices
    && orgDetails.offices.length > 0 ? [orgDetails.offices[0].formattedAddress] : [],
    SelectedInterviewAddress: orgDetails && orgDetails.offices
    && orgDetails.offices.length > 0 ? [orgDetails.offices[0].id] : [],
    PocList: initPocList(orgDetails, true),
    InterviewersList: initPocList(orgDetails, false),
    InterviewLocations: initLocationList(orgDetails),
    InterviewStartDate: moment().add(1, 'd').format('YYYY-MM-DD'),
    InterviewStartTime: '8:00:00',
    InterviewEndTime: '17:00:00',
    InterviewType: 'FACE',
    VideoInterviewType: 'HANG_VID',
  });

  // RIP - Request in Progress XD
  const [addSlotsRIP, setAddSlotsRIP] = useState(false);

  // Only to show the first selected slide in carousel
  // Just a work around
  const [pocCarouselLoaded, setPocCarouselLoaded] = useState(false);
  const [locationsCarouselLoaded, setLocationsCarouselLoaded] = useState(false);

  const [repeatedDays, setRepeatedDays] = useState<Array<string>>(['', '', '', '']);

  const defaultInterviewsRange = ():Array<InterviewsRangeI> => {
    const deafultValues:Array<InterviewsRangeI> = [];
    for (let i = 0; i < 4; i += 1) {
      deafultValues.push({ startTime: '8:00:00', endTime: '17:00:00' });
    }
    return deafultValues;
  };

  const [interviewsRange,
    setInterviewsRange] = useState<Array<InterviewsRangeI>>(defaultInterviewsRange());

  const videoTypeFormat = ['HANG_VID', 'WHATSAPP_VID', 'VID', 'OTHERS'];
  const getSelectedPoc = (selectedContact, contact?):any => {
    // console.log(selectedContact, contact);
    const selectedPoc = state.PocList.filter((item) => item.mobile === selectedContact);
    if (selectedPoc) {
      return {
        name: selectedPoc[0].name,
        contact: contact || selectedPoc[0].mobile,
        email: selectedPoc[0].email,
      };
    }
    return undefined;
  };

  const onChangeHandler = (value): void => {
    if (value && Array.isArray(value) && value.length) {
      const diff = value.filter((item) => !state.SelectedPoc.includes(item));
      setState((prevState) => ({
        ...prevState,
        SelectedPoc: diff,
      }));
      form.setFieldsValue({
        InterviewPoc: diff,
      });
    }
  };
  const createSlotObjForCandidate = async (formData, interviewDate, startTime, endTime)
  :Promise<void> => {
    const postdata = [] as any;
    const numberofslots = [] as any;
    let templatedate;
    const st = [] as any;
    const et = []as any;
    const diff = [] as any;
    if (interviewDate !== undefined) {
      let j;
      for (j = 0; j < interviewDate.length; j += 1) {
        templatedate = (moment(interviewDate[0])).format('D MMM');
        st[j] = moment(startTime[j], 'HH:mm:SS');
        et[j] = moment(endTime[j], 'HH:mm:SS');
        diff[j] = et[j].diff(st[j], 'minutes');
        if (diff[j] >= 30 && diff[j] >= parseInt(formData.InterviewDuration, 10)) {
          const duration = parseInt(formData.InterviewDuration, 10);
          numberofslots[j] = (diff[j] / duration);
        }
      }

      const sum = numberofslots.reduce((accumulator, element) => accumulator + element, 0);
      templatedate += ` - ${sum} slots`;
      for (let i = 0; i < interviewDate.length; i += 1) {
        const obj = {
          date: interviewDate[i],
          job_id: jobId,
          start: startTime[i],
          end: endTime[i],

          org_slot: {
            start: startTime[i],
            end: endTime[i],
            days: [],
            location_id: (formData.InterviewAddress
                        && formData.InterviewAddress.length > 0
                        && formData.InterviewAddress[0]) || null,
          },
          duration: parseInt(formData.InterviewDuration, 10),
          interviewers: formData.Interviewers,
          invite_employer: formData.calenderInvite,
          poc_data: videoTypeFormat.indexOf(state.VideoInterviewType) !== -1
            ? getSelectedPoc(formData.InterviewPoc[0], formData.videoValue)
            : getSelectedPoc(formData.InterviewPoc[0]),
          share_poc_contact: formData.sharePoc,
          interview_type: state.InterviewType === 'VID' ? state.VideoInterviewType : state.InterviewType,
          template: templatedate,
        };
        if (state.InterviewType !== 'FACE') { delete obj.org_slot.location_id; }
        postdata.push(obj);
      }
    }
    const res = await createJobSlot(postdata, applicationId);
    if (res.status === 202) {
      // const responseObj = await res.data;
      // const resobj = {
      //   suggestedSlotTemplateName: responseObj._source?.suggested_slot_template?.template?.name,
      //   applicationStage: 'TBSI',
      // };
      setAddSlotsRIP(false);
      updateApplicationData(applicationId);
      if (jobtype === 'NCAR') {
        invite('success');
        pushClevertapEvent(`${clevertype}`, {
          Type: `${state.InterviewType}`,
          Status: 'Success',
          cms_match: cms?.score,
        });
      } else {
        invite('success', postdata, state.SelectedPocAddress);
        pushClevertapEvent(`${clevertype}`, {
          Type: `${state.InterviewType}`,
          Status: 'Success',
          cms_match: cms?.score,
        });
      }
      closeModal();
    } else {
      if (res.status !== 409) {
        invite('info');
      }
      if (res.response.status === 400 && res.response?.data?.poc_data !== 'undefined') {
        snackBar({
          title: 'Please select poc with contact details',
          description: 'Contact details cannot be empty',
          iconName: '',
          placement: 'topRight',
          notificationType: 'error',
          duration: 8,
        });
      }
      setAddSlotsRIP(false);
      pushClevertapEvent(`${clevertype}`, {
        Type: `${state.InterviewType}`,
        Status: 'Failure',
        cms_match: cms?.score,
      });
      closeModal();
    }
    return postdata;
  };

  const onChangeHandlerAddress = (value): void => {
    if (value && Array.isArray(value) && value.length) {
      const diff = value.filter((item) => !state.SelectedInterviewAddress.includes(item));
      setState((prevState) => ({
        ...prevState,
        SelectedInterviewAddress: diff,
      }));
      form.setFieldsValue({
        InterviewAddress: diff,
      });
    }
  };

  const Arrow = ({ type, onClick }: any): JSX.Element => {
    if (type) {
      switch (type) {
        case 'left':
          return (
            <>
              <Button onClick={onClick} className="carousel-arrows">
                <LeftOutlined className="leftarrow" />
              </Button>
            </>
          );
        case 'right':
          return (
            <Button onClick={onClick} className="carousel-arrows">
              <RightOutlined className="rightarrow" />
            </Button>
          );
        default:
          return <></>;
      }
    } else {
      return <></>;
    }
  };

  const validateInterviewDate = (_rule, value): Promise<void> => {
    let val;
    if (value) {
      val = value.format('YYYY-MM-DD');
    }
    const isDuplicate = repeatedDays.filter((date) => val !== '' && date === val);
    const isDuplicate1 = repeatedDays.filter((date) => val !== '' && date === state.InterviewStartDate);
    return isDuplicate.length > 1 || isDuplicate1.length > 0 ? Promise.reject(new Error('Date already added')) : Promise.resolve();
  };

  const onSearchHandler = (searchTerm): void => {
    if (searchTerm && EmailRegexPattern.test(searchTerm)) {
      for (let i = 0; i < state.InterviewersList.length; i += 1) {
        if (state.InterviewersList[i].email === searchTerm) { return; }
      }
      const ManagerListTemp = [...state.InterviewersList];
      ManagerListTemp.push({
        name: searchTerm, email: searchTerm, mobile: '', id: 0,
      });
      setState((prevState) => ({
        ...prevState,
        InterviewersList: ManagerListTemp,
      }));
    }
  };
  const validateInterviewRange = (value, checkValueof, index): Promise<void> => {
    if (!value) {
      return Promise.reject();
    }
    const selectedValue = value.toString();
    if (index >= 0 && selectedValue) {
      if (!interviewsRange[index][checkValueof]) return Promise.resolve();
      if (interviewsRange[index][checkValueof] === selectedValue) {
        return Promise.reject(new Error('Both cannot be same'));
      }
      const startTime = parseInt(selectedValue.split(':')[0], 10) + (selectedValue.includes('30') ? 0.5 : 0);
      const endTime = parseInt(interviewsRange[index][checkValueof].split(':')[0], 10)
                      + (interviewsRange[index][checkValueof].includes('30') ? 0.5 : 0);
      if (checkValueof === 'endTime' && startTime > endTime) {
        return Promise.reject(new Error('Start time cannot be greater than end time'));
      }
      if (checkValueof === 'startTime' && startTime < endTime) {
        return Promise.reject(new Error('End time cannot be less than start time'));
      }
    }
    if (index === -1 && selectedValue) {
      if (!state[checkValueof]) return Promise.resolve();
      if (state[checkValueof] === selectedValue) {
        return Promise.reject(new Error('Both cannot be same'));
      }
      const startTime = parseInt(selectedValue.split(':')[0], 10) + (selectedValue.includes('30') ? 0.5 : 0);
      const endTime = parseInt(state[checkValueof].split(':')[0], 10)
                      + (state[checkValueof].includes('30') ? 0.5 : 0);
      if (checkValueof === 'InterviewEndTime' && startTime > endTime) {
        return Promise.reject(new Error('Start time cannot be greater than end time'));
      }
      if (checkValueof === 'InterviewStartTime' && startTime < endTime) {
        return Promise.reject(new Error('End time cannot be less than start time'));
      }
    }
    return Promise.resolve();
  };

  const addNewAddressHandler = (updateObject) :void => {
    if (updateObject && Object.keys(updateObject).length) {
      const newInterviewLocationsList = [...state.InterviewLocations];
      newInterviewLocationsList.unshift(updateObject);
      setState((prevState) => ({
        ...prevState,
        InterviewLocations: newInterviewLocationsList,
        ShowInterviewModal: false,
        SelectedInterviewAddress: [updateObject.id],
      }));
      form.setFieldsValue({
        InterviewAddress: [updateObject.id],
      });
    }
  };

  const addNewPocHandler = (updateObject) :void => {
    if (updateObject && Object.keys(updateObject).length) {
      const newPocList = [...state.PocList];
      newPocList.unshift({
        name: updateObject.name,
        email: '',
        mobile: updateObject.mobile,
        id: 0,
      });
      setState((prevState) => ({
        ...prevState,
        PocList: newPocList,
        ShowPocModal: false,
        SelectedPoc: [updateObject.mobile],
      }));
      form.setFieldsValue({
        InterviewPoc: [updateObject.mobile],
      });
    }
  };

  const onFinishHandler = (formData):void => {
    if (formData.InterviewDate !== undefined) {
      setAddSlotsRIP(true);
      const totalInterviewDates = [] as any;
      const startTime = [] as any;
      const endTime = [] as any;
      totalInterviewDates[0] = formData.InterviewDate.format('YYYY-MM-DD');
      startTime[0] = formData.InterviewStartTime;
      endTime[0] = formData.InterviewEndTime;
      repeatedDays.map((day) => {
        if (day.length !== 0) { totalInterviewDates.push(day); }
        return true;
      });
      interviewsRange.map((time) => {
        if (time.startTime.length !== 0) { startTime.push(time.startTime); }
        endTime.push(time.endTime);
        return true;
      });
      createSlotObjForCandidate(formData, totalInterviewDates, startTime, endTime);
    }
  };
  const validateInterviewDuartion = async (_rule, checkvalue): Promise<void> => {
    const start = [] as any;
    const end = [] as any;
    const mins = [] as any;
    let difference;
    for (let i = 0; i < interviewsRange.length; i += 1) {
      start[i] = moment(interviewsRange[i].startTime, 'hh:mm');
      end[i] = moment(interviewsRange[i].endTime, 'hh:mm');
      mins[i] = moment.duration(end[i].diff(start[i])).asMinutes();

      if (mins[i] >= parseInt(checkvalue, 10)) { return Promise.resolve(); }
      return Promise.reject(new Error('Interview duration can not be more than available timings'));
    }
    if (state.InterviewStartTime) {
      const endtime = moment(state.InterviewEndTime, 'hh:mm');
      const starttime = moment(state.InterviewStartTime, 'hh:mm');
      difference = moment.duration(endtime.diff(starttime)).asMinutes();
      if (difference >= parseInt(checkvalue, 10)) { return Promise.resolve(); }
      return Promise.reject(new Error('Interview duration can not be more than available timings'));
    }
    return Promise.resolve();
  };

  const addressValidator = (_rule, value):
  Promise<void> => AddressValidator(state.SelectedInterviewAddress[0], state.InterviewLocations);

  return (
    <Form
      name="InterviewSlotsForm"
      layout="vertical"
      size="large"
      form={form}
      onFinish={onFinishHandler}
      initialValues={{
        InterviewDate: moment().add(1, 'd'),
        InterviewDuration: '30',
        repeatSlots: [0, 1, 2, 3, 4, 5, 6],
        InterviewPoc: state.SelectedPoc,
        InterviewAddress: state.SelectedInterviewAddress,
        Interviewers: [state.InterviewersList[0].email],
        sharePoc: false,
        calenderInvite: false,
        InterviewType: 'FACE',
        type: 'HANG_VID',
        InterviewStartTime: '8:00:00',
        InterviewEndTime: '17:00:00',
      }}
      hideRequiredMark
      scrollToFirstError
      className="add-slots-form"
    >
      <Text className="form-header">Interview Details:</Text>
      <Row className="p-top-16">
        <Col span={7}>
          <Form.Item
            name="InterviewType"
            validateTrigger={['onBlur']}
          >
            <Select
              onChange={(value):void => {
                setState((prevState) => ({
                  ...prevState,
                  InterviewType: value?.toString() || 'FACE',
                }));
              }}
              showArrow
              placeholder="Select Type"
            >
              {interviewTypes.map((item) => (
                <Option
                  key={item.value}
                  value={item.value}
                >
                  {item.text}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      { state.InterviewType === 'VID'
        ? (
          <Row>
            <Col span={7}>
              <Form.Item
                name="type"
                label="Video Interview Tool"
              >
                <Select
                  onChange={(value):void => {
                    setState((prevState) => ({
                      ...prevState,
                      VideoInterviewType: value?.toString() || 'HANG_VID',
                    }));
                  }}
                  showArrow
                  placeholder="Select Type"
                >
                  {videoInterviewTypes.map((item) => (
                    <Option
                      key={item.value}
                      value={item.value}
                    >
                      {item.text}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={1} />
            <Col span={9}>
              <Form.Item
                label={state.VideoInterviewType === 'HANG_VID' ? 'Email Id for Hangouts calls:' : state.VideoInterviewType === 'WHATSAPP_VID' ? 'Mobile Number for WhatsApp call' : state.VideoInterviewType === 'VID' ? 'Skype ID*' : 'Video Interview Address'}
                name="videoValue"
                rules={[
                  {
                    required: true,
                    message: state.VideoInterviewType === 'HANG_VID' ? 'Please provide email Id' : state.VideoInterviewType === 'WHATSAPP_VID' ? 'Please provide mobile number' : state.VideoInterviewType === 'VID' ? 'Please provide skype Id' : 'Please provide interview address',
                  },
                  {
                    pattern: state.VideoInterviewType === 'HANG_VID' ? EmailRegexPattern : state.VideoInterviewType === 'WHATSAPP_VID' ? MobileRegexPattern : state.VideoInterviewType === 'VID' ? skypeIDPattern : EmailRegexPattern,
                    message: state.VideoInterviewType === 'HANG_VID' ? 'Please provide valid email Id' : state.VideoInterviewType === 'WHATSAPP_VID' ? 'Please provide valid mobile number' : state.VideoInterviewType === 'VID' ? 'Please provide valid skype Id' : 'Please provide valid interview address',
                  },
                ]}
              >
                <Input
                  prefix={state.VideoInterviewType === 'WHATSAPP_VID' ? '91' : null}
                  className="app-actions-feedback-input"
                  size="large"
                  allowClear

                />
              </Form.Item>
            </Col>
          </Row>
        ) : ''}
      <Row>
        <Col
          span={7}
        >
          <Form.Item
            name="InterviewDate"
            label="Available Dates"
            validateTrigger={['onBlur']}
            rules={[{
              required: true,
              message: 'Interview Date is required',
            },
            ]}
            style={{ marginBottom: 24 }}
          >
            <DatePicker
              defaultPickerValue={moment().add(1, 'd')}
              showToday={false}
              format="YYYY-MM-DD"
              getPopupContainer={(TriggerNode:HTMLElement):HTMLElement => TriggerNode}
              onChange={(value): void => {
                if (value) {
                  setState((prevState) => ({
                    ...prevState,
                    InterviewStartDate: value.format('YYYY-MM-DD'),
                  }));
                }
              }}
              disabledDate={(current): boolean => current && (current < moment() || current > moment().add(23, 'd'))}
              style={{ display: 'flex', justifyContent: 'flex-start' }}
            />
          </Form.Item>
        </Col>
        <Col span={2}>
          <div className="separator" style={{ height: '75%' }} />
        </Col>
        <Col span={14}>
          <Row>
            <Col span={10}>
              <Form.Item
                label="Available timings:"
                name="InterviewStartTime"
                rules={[{
                  required: true,
                  message: 'Start Time is required',
                },
                {
                  validator: (_rule, value):
                  Promise<void> => validateInterviewRange(value, 'InterviewEndTime', -1),
                }]}
              >
                <Select
                  showArrow
                  placeholder="Start Time"
                  getPopupContainer={(TriggerNode:HTMLElement):HTMLElement => TriggerNode}
                  onChange={(value):void => {
                    setState((prevState) => ({
                      ...prevState,
                      InterviewStartTime: value?.toString() || '',
                    }));
                  }}
                >
                  {InterviewRangePickerValues.map((item) => (
                    <Option
                      key={item.value}
                      value={item.value}
                    >
                      {item.display}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={2} className="range-picker-separator">
              To
            </Col>
            <Col span={10}>
              <Form.Item
                name="InterviewEndTime"
                rules={[{
                  required: true,
                  message: 'End Time is required',
                },
                {
                  validator: (_rule, value):
                  Promise<void> => validateInterviewRange(value, 'InterviewStartTime', -1),
                }]}
              >
                <Select
                  showArrow
                  style={{ marginTop: '27px' }}
                  placeholder="End Time"
                  getPopupContainer={(TriggerNode:HTMLElement):HTMLElement => TriggerNode}
                  onChange={(value):void => {
                    setState((prevState) => ({
                      ...prevState,
                      InterviewEndTime: value?.toString() || '',
                    }));
                  }}
                >
                  {InterviewRangePickerValues.map((item) => (
                    <Option
                      key={item.value}
                      value={item.value}
                    >
                      {item.display}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Form.List name="slotinfo">
            {(fields, { add, remove }):JSX.Element => (
              <div>
                {fields.map((field, index) => (
                  <Form.Item
                    name="repeatedSlots"
                    validateTrigger={['onBlur']}
                    style={{ marginBottom: 0 }}
                    key={`type${field.name}`}
                  >
                    <Row>
                      <Col span={7}>
                        <Form.Item
                          {...field}
                          name={[field.name, 'Interview Date']}
                          rules={[{
                            required: true,
                            message: 'Interview Date is required',
                          }, {
                            validator: validateInterviewDate,
                          }]}
                          style={{ marginBottom: 30 }}
                        >
                          <DatePicker
                            defaultPickerValue={moment().add(1, 'd')}
                            showToday={false}
                            format="YYYY-MM-DD"
                            getPopupContainer={(TriggerNode:HTMLElement):HTMLElement => TriggerNode}
                            onChange={(value): void => {
                              const repeatedDaysCopy = [...repeatedDays];
                              if (value) {
                                repeatedDaysCopy[index] = (value.format('YYYY-MM-DD'));
                              }
                              setRepeatedDays(repeatedDaysCopy);
                            }}
                            disabledDate={(current): boolean => current && (current < moment() || current > moment().add(23, 'd'))}
                            style={{ display: 'flex', justifyContent: 'flex-start' }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <div className="separator" />
                      </Col>
                      <Col span={14}>
                        <Row>
                          <Col span={10}>
                            <Form.Item
                              name={[field.name, 'Interview Start Time']}
                              rules={[{
                                required: true,
                                message: 'Start Time is required',
                              },
                              {
                                validator: (_rule, value):
                                Promise<void> => validateInterviewRange(value, 'endTime', index),
                              }]}
                            >
                              <Select
                                showArrow
                                placeholder="Start Time"
                                getPopupContainer={
                                  (TriggerNode:HTMLElement):HTMLElement => TriggerNode
                                }
                                onChange={(value):void => {
                                  if (value) {
                                    const interviewsRangeCopy = [...interviewsRange];
                                    interviewsRangeCopy[index] = {
                                      startTime: value.toString(),
                                      endTime: interviewsRangeCopy[index].startTime ? interviewsRangeCopy[index].endTime : '',
                                    };
                                    setInterviewsRange(interviewsRangeCopy);
                                  }
                                }}
                              >
                                {InterviewRangePickerValues.map((item) => (
                                  <Option
                                    key={item.value}
                                    value={item.value}
                                  >
                                    {item.display}
                                  </Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col span={2} className="range-picker-separator m-bottom-1rem">
                            To
                          </Col>
                          <Col span={10}>
                            <Form.Item
                              name={[field.name, 'Interview End Time']}
                              rules={[{
                                required: true,
                                message: 'End Time is required',
                              },
                              {
                                validator: (_rule, value):
                                Promise<void> => validateInterviewRange(value, 'startTime', index),
                              }]}
                            >
                              <Select
                                showArrow
                                placeholder="End Time"
                                getPopupContainer={
                                  (TriggerNode:HTMLElement):HTMLElement => TriggerNode
                                }
                                onChange={(value):void => {
                                  if (value) {
                                    const interviewsRangeCopy = [...interviewsRange];
                                    interviewsRangeCopy[index] = {
                                      startTime: interviewsRangeCopy[index].startTime ? interviewsRangeCopy[index].startTime : '',
                                      endTime: value.toString(),
                                    };
                                    setInterviewsRange(interviewsRangeCopy);
                                  }
                                }}
                              >
                                {InterviewRangePickerValues.map((item) => (
                                  <Option
                                    key={item.value}
                                    value={item.value}
                                  >
                                    {item.display}
                                  </Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </Col>
                        </Row>
                      </Col>
                      <Col span={1}>
                        <DeleteOutlined
                          className="dynamic-delete-button"
                          style={{ margin: '16px 8px' }}
                          onClick={():void => {
                            const repeatedDaysCopy = [...repeatedDays];
                            repeatedDaysCopy[index] = '';
                            const interviewsRangeCopy = [...interviewsRange];
                            interviewsRangeCopy[index] = {
                              startTime: '',
                              endTime: '',
                            };
                            setRepeatedDays(repeatedDaysCopy);
                            setInterviewsRange(interviewsRangeCopy);
                            remove(field.name);
                          }}
                        />
                      </Col>
                    </Row>
                  </Form.Item>
                ))}
                {fields.length < 4
                  ? (
                    <Button
                      type="link"
                      style={{
                        padding: '0px',
                        height: 20,
                        marginBottom: 24,
                        fontWeight: 'bold',
                        fontSize: 14,
                      }}
                      onClick={():void => {
                        add();
                      }}
                    >
                      + Add more dates
                    </Button>
                  ) : null}
              </div>
            )}
          </Form.List>
        </Col>
      </Row>
      <Row>
        <Col span={7}>
          <Form.Item
            label="Interview Duration:"
            name="InterviewDuration"
            validateTrigger={['onBlur']}
            style={{ marginBottom: 24 }}
            rules={[{ validator: validateInterviewDuartion }]}
          >
            <Select showArrow>
              {InterviewDurations.map((item) => (
                <Option
                  key={item.value}
                  value={item.value}
                >
                  {item.text}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <div className="page-0-btn-divider title-divider" />
      {state.InterviewType === 'FACE'
        ? (
          <Row>
            <Col span={24}>
              <Form.Item
                label={(
                  <Row align="middle" justify="space-between">
                    <Col>
                      <Text className="font-bold">
                        Interview Address:
                      </Text>
                    </Col>
                    <Col>
                      <Button
                        type="link"
                        className="add-another-btn"
                        onClick={(): void => setState(
                          (prevState) => ({ ...prevState, ShowInterviewModal: true }),
                        )}
                      >
                        + Add New Address
                      </Button>
                    </Col>
                  </Row>
                )}
                name="InterviewAddress"
                className="p-bottom-8"
                rules={[{
                  required: true,
                  message: 'Interview address is required',
                },
                {
                  validator: addressValidator,
                },
                ]}
                validateTrigger={['onBlur']}
              >
                {state.InterviewLocations.length > 0 ? (
                  <Checkbox.Group
                    className="carousel-checkboxes p-top-8 slots-display-flex"
                    onChange={onChangeHandlerAddress}
                    value={state.SelectedInterviewAddress}
                    // style={{ display: 'flex' }}
                  >
                    <Carousel
                      autoplay={false}
                      arrows
                      infinite
                      slidesToShow={state.InterviewLocations.length > 2 ? 2
                        : state.InterviewLocations.length}
                      slidesToScroll={2}
                      prevArrow={<Arrow type="left" />}
                      nextArrow={<Arrow type="right" />}
                      style={{ width: 'auto', maxWidth: '632px' }}
                      useCSS
                      useTransform
                      className="add-slots-form-drawer-carousel interview-locations-carousel"
                      variableWidth={locationsCarouselLoaded}
                      onInit={():void => setLocationsCarouselLoaded(true)}
                    >
                      {state.InterviewLocations.map((item, index) => (
                        <div key={item.id}>
                          <Checkbox
                            value={item.id}
                            className="carousel-checkbox"
                          >
                            <div className="checkbox-content text-small">
                              <Paragraph className="interview-address">
                                {item.address}
                              </Paragraph>
                              <div className="flex-align-center flex-justify-end">
                                <a
                                  href={item.mapsLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <CustomImage
                                    src={`/images/application-tab/address${index % 8}.jpg`}
                                    alt="icon"
                                    className="map-img"
                                    width={48}
                                    height={48}
                                  />
                                </a>
                              </div>
                            </div>
                          </Checkbox>
                        </div>
                      ))}
                    </Carousel>
                  </Checkbox.Group>
                ) : (
                  <Card style={{ width: 300 }}>
                    <Button
                      type="link"
                      className="form-link-btn"
                      onClick={(): void => setState(
                        (prevState) => ({ ...prevState, ShowInterviewModal: true }),
                      )}
                    >
                      + Add New Address
                    </Button>
                  </Card>
                )}
              </Form.Item>
            </Col>
          </Row>
        ) : ''}
      <Row>
        <Col span={24}>
          <Form.Item
            label={(
              <Row align="middle" justify="space-between">
                <Col>
                  <Text className="font-bold">
                    Interview Point of Contact:
                  </Text>
                </Col>
                <Col>
                  <Button
                    type="link"
                    className="add-another-btn"
                    onClick={():
                    void => setState((prevState) => ({ ...prevState, ShowPocModal: true }))}
                  >
                    + Add New Contact
                  </Button>
                </Col>
              </Row>
            )}
            name="InterviewPoc"
            className="m-all-0"
            rules={[{
              required: true,
              message: 'Interview point of contact is required',
            }]}
            validateTrigger={['onBlur']}
          >
            {state.PocList.length > 0 ? (
              <Checkbox.Group
                onChange={onChangeHandler}
                value={state.SelectedPoc}
                className="carousel-checkboxes slots-display-flex"
                // style={{ display: 'flex' }}
              >
                <Carousel
                  autoplay={false}
                  style={{ width: 'auto', maxWidth: '632px' }}
                  arrows
                  infinite
                  useCSS
                  useTransform
                  slidesToShow={state.PocList.length > 2 ? 2 : state.PocList.length}
                  slidesToScroll={2}
                  prevArrow={<Arrow type="left" />}
                  nextArrow={<Arrow type="right" />}
                  className="add-slots-form-drawer-carousel interview-poc-carousel"
                  variableWidth={pocCarouselLoaded}
                  onInit={():void => setPocCarouselLoaded(true)}
                >
                  {state.PocList.map((item) => (
                    <div key={item.mobile}>
                      <Checkbox
                        value={item.mobile}
                        className="carousel-checkbox"
                      >
                        <div className="checkbox-content">
                          <Paragraph ellipsis>
                            {item.name}
                          </Paragraph>
                          <Paragraph>
                            {item.mobile}
                          </Paragraph>
                        </div>
                      </Checkbox>
                    </div>
                  ))}
                </Carousel>
              </Checkbox.Group>
            ) : (
              <Card style={{ width: 300 }}>
                <Button
                  type="link"
                  className="add-another-btn"
                  onClick={(): void => setState(
                    (prevState) => ({ ...prevState, ShowPocModal: true }),
                  )}
                >
                  + Add New Contact
                </Button>
              </Card>
            )}
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Form.Item
            name="sharePoc"
            valuePropName="checked"
          >
            <Checkbox
              value="sharePoc"
              className="form-checkbox"
            >
              Share contact details with candidates who have fixed interviews.
            </Checkbox>
          </Form.Item>
        </Col>
      </Row>
      <Row className="interviewers-wrapper">
        <Col span={24} className="p-all-0">
          <Row align="middle" justify="space-between">
            <Col className="label">
              Send calendar invite to interviewers as well!
            </Col>
            <Col>
              <CustomImage
                src="/images/application-tab/calenderInviteIcon.svg"
                width={40}
                height={41}
                alt="calendar Invite Icon"
              />
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item
                label="Interviewers:"
                name="Interviewers"
                style={{ marginBottom: 0 }}
              >
                <Select
                  showArrow
                  mode="multiple"
                  optionFilterProp="title"
                  optionLabelProp="label"
                  placeholder="Type E-mail to invite new members"
                  onSearch={onSearchHandler}
                  notFoundContent="Type the Complete Email"
                  className="text-base"
                >
                  {state.InterviewersList.map((item) => <Option key={item.email} value={item.email} title={item.name} label={`${item.name} (${item.email})`}>{item.name}</Option>)}
                </Select>
              </Form.Item>
              <Form.Item
                name="calenderInvite"
                valuePropName="checked"
              >
                <Checkbox value="calenderInvite" className="form-checkbox">
                  Send me Calendar invite once interview are scheduled with candidates.
                </Checkbox>
              </Form.Item>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Form.Item className="form-submit-btn">
            <Button
              type="primary"
              htmlType="submit"
              onClick={onFinishHandler}
              loading={addSlotsRIP}
            >
              Send Interview Invite
            </Button>
          </Form.Item>
        </Col>
      </Row>
      {/* Add Interview Modal */}
      {state.ShowInterviewModal
        ? (
          <Form.Item>
            <AddNewAddressDrawer
              closeModal={(): void => setState(
                (prevState) => ({ ...prevState, ShowInterviewModal: false }),
              )}
              addNewAddressHandler={addNewAddressHandler}
              modalTitle={`Schedule Interview ${candidateName ? ` for ${candidateName}` : ''}`}
              submitBtnText="Save & Continue to Schedule Interview"
            />
          </Form.Item>
        )
        : null}
      {/* ADD Poc Modal */}
      {state.ShowPocModal
        ? (
          <AddNewPocModal
            closeModal={(): void => setState(
              (prevState) => ({ ...prevState, ShowPocModal: false }),
            )}
            addNewPocHandler={addNewPocHandler}
            pocList={state.PocList}
          />
        )
        : null}
    </Form>
  );
};
export default ToBeConfirmedWithCandidate;
