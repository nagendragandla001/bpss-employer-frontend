/* eslint-disable no-underscore-dangle */
import {
  LeftOutlined, RightOutlined,
} from '@ant-design/icons';
import {
  Button, Carousel, Checkbox, Col, Drawer, Form, Input,
  Row, Select, TimePicker, Typography,
} from 'antd';
import snackBar from 'components/Notifications';
import CustomImage from 'components/Wrappers/CustomImage';
import { AddressValidator } from 'constants/enum-constants';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import has from 'lodash/has';
import moment from 'moment';
import React, { useState } from 'react';
import {
  ManagersListType, OrgDetailsType, OrgOfficesListType, updateSlotsDataObjectType,
} from 'screens/authenticated/JobsTab/Common/JobsTabUtils';
import AddNewAddressModal from 'screens/authenticated/JobsTab/Desktop/addSlots/addNewAddressModal';
import AddNewPocModal from 'screens/authenticated/JobsTab/Desktop/addSlots/addNewPocModal';
import { addSlots } from 'service/job-service';
import { pushClevertapEvent } from 'utils/clevertap';
import { EmailRegexPattern, MobileRegexPattern, skypeIDPattern } from 'utils/constants';

require('screens/authenticated/JobsTab/Desktop/addSlots/addSlots.less');

dayjs.extend(isoWeek);

const { Paragraph, Text } = Typography;
const { Option } = Select;
const { RangePicker } = TimePicker;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Arrow = ({ type, onClick }: any): JSX.Element => {
  if (type) {
    switch (type) {
      case 'left':
        return (
          <>
            <Button onClick={onClick} className="carousel-arrows ">
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

interface PropsInterface{
  updateJobsSlotsData: (updateObject:updateSlotsDataObjectType, jobId: string) => void;
  jobId:string,
  closeDrawer: ()=>void
  orgDetails: OrgDetailsType
}
interface InterviewRepeatDaysInterface{
  displayDate: string;
  displayMonth: string;
  displayDay: string;
  value: string;
  date: string;
}
interface stateInterface{
  interviewType: string,
  videoInterviewType: string,
  showVideoInterviewType: boolean;
  interviewRepeatDates: Array<InterviewRepeatDaysInterface>;
  selectedPoc: Array<string>
  pocList: Array<ManagersListType>;
  interviewersList: Array<ManagersListType>;
  interviewLocations: Array<OrgOfficesListType>;
  selectedInterviewAddress: Array<number>;
  showInterviewModal: boolean;
  showPocModal: boolean;
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

const videoInterviewInputTitles = {
  HANG_VID: 'Email Id for Hangouts call:',
  WHATSAPP_VID: 'Mobile Number for WhatsApp call',
  VID: 'Skype ID*',
  OTHER: 'Video Interview Address',
};
const videoInterviewInputRules = {
  HANG_VID: { patternText: 'Please provide a valid email Id', requiredText: 'Please provide an email Id' },
  WHATSAPP_VID: { patternText: 'Please provide a valid mobile number', requiredText: 'Please provide a mobile number' },
  VID: { patternText: 'Please provide a valid skype Id', requiredText: 'Please provide skype Id' },
  OTHER: { patternText: 'Please provide a valid email Id', requiredText: 'Please provide video interview address' },
};

const WalkInInterview = (props:PropsInterface):JSX.Element => {
  const {
    closeDrawer, orgDetails, jobId, updateJobsSlotsData,
  } = props;
  const [createSlotsForm] = Form.useForm();

  const initPocList = (managersList, IspocList): Array<ManagersListType> => {
    if (managersList.length > 0) {
      const list = IspocList ? managersList.filter((x) => x.mobile)
        : [...managersList];
      return list;
    }
    return [];
  };

  const createInterviewRepeatDates = (): Array<InterviewRepeatDaysInterface> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const repeatdays: any = [];
    for (let i = 0; i < 7; i += 1) {
      repeatdays.push(dayjs(new Date()).add(i + 1, 'day'));
    }
    return repeatdays.map((d:dayjs.Dayjs) => ({
      displayDate: dayjs(d).format('DD'),
      displayMonth: dayjs(d).format('MMM'),
      displayDay: dayjs(d).format('ddd'),
      value: dayjs(d).isoWeekday() - 1,
      date: dayjs(d).format('YYYY-MM-DD'),
    }));
  };

  const getInitialSelectedPoc = (managersList): Array<string> => {
    if (managersList.length > 0) {
      const list = managersList.filter((x) => x.mobile);
      if (list && list.length) {
        return [list[0].mobile];
      }
    }
    return [];
  };

  const [state, setState] = useState<stateInterface>({
    interviewType: 'FACE',
    videoInterviewType: 'HANG_VID',
    showVideoInterviewType: false,
    interviewRepeatDates: createInterviewRepeatDates(),
    pocList: initPocList(orgDetails.managers, true),
    selectedPoc: getInitialSelectedPoc(orgDetails.managers),
    interviewersList: initPocList(orgDetails.managers, false),
    interviewLocations: orgDetails.offices,
    selectedInterviewAddress: orgDetails.offices
      && orgDetails.offices.length > 0 ? [orgDetails.offices[0].id] : [],
    showInterviewModal: false,
    showPocModal: false,
  });

  // RIP - Request in Progress XD
  const [addSlotsRIP, setAddSlotsRIP] = useState(false);

  // Only to show the first selected slide in carousel
  // Just a work around
  const [pocCarouselLoaded, setPocCarouselLoaded] = useState(false);
  const [locationsCarouselLoaded, setLocationsCarouselLoaded] = useState(false);

  const addressOnChangeHandler = (value): void => {
    const diff = value.filter((item) => !state.selectedInterviewAddress.includes(item));
    setState((prevState) => ({
      ...prevState,
      selectedInterviewAddress: diff,
    }));
    createSlotsForm.setFieldsValue({
      interviewAddress: diff,
    });
  };
  const pocOnChangeHandler = (value): void => {
    const diff = value.filter((item) => !state.selectedPoc.includes(item));
    setState((prevState) => ({
      ...prevState,
      selectedPoc: diff,
    }));
    createSlotsForm.setFieldsValue({
      interviewPoc: diff,
    });
  };

  const getSelectedPoc = (selectedContact, videoInterviewInput):
  {name:string; contact:string;email:string} | undefined => {
    const selectedPoc = state.pocList.filter((item) => item.mobile === selectedContact);
    if (selectedPoc) {
      return {
        name: selectedPoc[0].name,
        contact: state.interviewType === 'VID' ? videoInterviewInput : selectedPoc[0].mobile,
        email: selectedPoc[0].email,
      };
    }
    return undefined;
  };

  const getRepeatedDates = (dates:string[]):number[] => {
    const repeatDates:number[] = [];
    for (let i = 1; i < dates.length; i += 1) {
      repeatDates.push(dayjs(dates[i]).isoWeekday() - 1);
    }
    return repeatDates;
  };

  const addSlotsForJob = async (formData): Promise<void> => {
    let numberofslots = 0;
    if (formData.interviewDates && Array.isArray(formData.interviewDates)) {
      setAddSlotsRIP(true);
      formData.interviewDates.sort((a, b) => (dayjs(a).isAfter(dayjs(b)) ? 1 : -1));
      let templatedate = (moment(formData.interviewDates[0])).format('D MMM');
      const startTime = moment(formData.interviewTimings[0], 'HH:mm:SS');
      const endTime = moment(formData.interviewTimings[1], 'HH:mm:SS');
      const diff = endTime.diff(startTime, 'minutes');
      if (diff >= 15 && diff >= parseInt(formData.interviewDuration, 10)) {
        const duration = parseInt(formData.interviewDuration, 10);
        numberofslots = Math.floor(diff / duration);
      }
      templatedate += ` - ${numberofslots * formData.interviewDates.length} slots`;
      const putObject = {
        date: formData.interviewDates[0],
        job_id: jobId,
        org_slot: {
          start: formData.interviewTimings[0].format('HH:mm:ss'),
          end: formData.interviewTimings[1].format('HH:mm:ss'),
          days: getRepeatedDates(formData.interviewDates),
          org_id: orgDetails.orgId,
          location_id: (formData.interviewAddress
                          && formData.interviewAddress.length > 0
                          && formData.interviewAddress[0]) || null,
        },
        duration: parseInt(formData.interviewDuration, 10),
        interviewers: formData.interviewers,
        invite_employer: formData.calenderInvite,
        poc_data: getSelectedPoc(formData.interviewPoc[0], formData.videoInterviewInput),
        share_poc_contact: formData.sharePoc,
        interview_type: state.interviewType === 'VID' ? state.videoInterviewType : state.interviewType,
        template: templatedate,
      };
      if (state.interviewType !== 'FACE') {
        delete putObject.org_slot.location_id;
      }
      const apiCall = await addSlots([putObject]);

      if ([200, 201, 202].indexOf(apiCall.status) > -1) {
        const response = await apiCall.data;
        if (response && Array.isArray(response) && response.length
        && response[0]._source) {
          const updateObject:updateSlotsDataObjectType = {
            interviewType: (has(response[0]._source, 'interview_type') && response[0]._source.interview_type.toString())
            || (state.interviewType === 'VID' ? state.videoInterviewType : state.interviewType),
            startDate: (has(response[0]._source, 'start_dt') && response[0]._source.start_dt)
            || '',
            endDate: (has(response[0]._source, 'end_dt') && response[0]._source.end_dt)
            || '',
            startTime: (has(response[0]._source, 'org_slot.start') && response[0]._source.org_slot.start)
            || '',
            endTime: (has(response[0]._source, 'org_slot.end') && response[0]._source.org_slot.end)
            || '',
            interviewduration: ((has(response[0]._source, 'duration') && response[0]._source.duration.toString())
            || ''),
            pocName: (has(response[0]._source, 'poc.name') && response[0]._source.poc.name)
            || '',
            pocContact: (has(response[0]._source, 'poc.contact') && response[0]._source.poc.contact)
            || '',
            interviewDates: formData.interviewDates,
          };
          updateJobsSlotsData(updateObject, jobId);
          pushClevertapEvent('Add Interview Slots', { Type: `${state.interviewType}`, Status: 'Success' });
          setAddSlotsRIP(false);
          closeDrawer();
        }
      } else {
        if (apiCall.response.status === 400 && apiCall.response.data.poc_data !== 'undefined') {
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
        pushClevertapEvent('Add Interview Slots', { Type: `${state.interviewType}`, Status: 'Failure' });
      }
    }
  };
  const interviewersOnSearchHandler = (searchTerm): void => {
    if (searchTerm && EmailRegexPattern.test(searchTerm)) {
      for (let i = 0; i < state.interviewersList.length; i += 1) {
        if (state.interviewersList[i].email === searchTerm) { return; }
      }
      const ManagerListTemp = [...state.interviewersList];
      ManagerListTemp.push({
        name: searchTerm, email: searchTerm, mobile: '', id: 0,
      });
      setState((prevState) => ({
        ...prevState,
        interviewersList: ManagerListTemp,
      }));
    }
  };

  const videoInterviewInputRegex = ():RegExp => {
    if (state.videoInterviewType === 'HANG_VID' || state.videoInterviewType === 'OTHER') return EmailRegexPattern;
    if (state.videoInterviewType === 'WHATSAPP_VID') return MobileRegexPattern;
    if (state.videoInterviewType === 'VID') return skypeIDPattern;
    return EmailRegexPattern;
  };

  const validateInterviewDuartion = async (_rule, checkvalue): Promise<void> => {
    const interviewTimings = createSlotsForm.getFieldValue('interviewTimings');
    if (interviewTimings) {
      const start = moment(interviewTimings[0], 'hh:mm');
      const end = moment(interviewTimings[1], 'hh:mm');
      const duration = moment.duration(end.diff(start));
      const mins = duration.asMinutes();
      if (mins >= parseInt(checkvalue, 10)) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('Interview duration cannot be more than available timings'));
    }
    return Promise.resolve();
  };

  const initInterviewDate = () : string[] => {
    const initialInterviewDates:string[] = [];
    state.interviewRepeatDates.map((s) => {
      if ((s.displayDay !== 'Sat') && (s.displayDay !== 'Sun')) {
        initialInterviewDates.push(s.date);
      }
      return null;
    });
    return initialInterviewDates;
  };

  const addNewPocHandler = (updateObject:ManagersListType) :void => {
    if (updateObject && Object.keys(updateObject).length) {
      const newPocList = [...state.pocList];
      newPocList.unshift({
        name: updateObject.name,
        email: '',
        mobile: updateObject.mobile,
        id: 0,
      });
      setState((prevState) => ({
        ...prevState,
        pocList: newPocList,
        showPocModal: false,
        selectedPoc: [updateObject.mobile],
      }));
      createSlotsForm.setFieldsValue({
        interviewPoc: [updateObject.mobile],
      });
    }
  };

  const addNewAddressHandler = (updateObject:OrgOfficesListType) :void => {
    if (updateObject && Object.keys(updateObject).length) {
      const newInterviewLocationsList = [...state.interviewLocations];
      newInterviewLocationsList.unshift(updateObject);
      setState((prevState) => ({
        ...prevState,
        interviewLocations: newInterviewLocationsList,
        showInterviewModal: false,
        selectedInterviewAddress: [updateObject.id],
      }));
      createSlotsForm.setFieldsValue({
        interviewAddress: [updateObject.id],
      });
    }
  };

  const onFinishHandler = (formData):void => {
    addSlotsForJob(formData);
  };

  const addressValidator = ():
  Promise<void> => AddressValidator(state.selectedInterviewAddress[0], state.interviewLocations);

  return (
    <>
      <Drawer
        visible
        width={640}
        className="add-slots-drawer"
        title="Add Interview Slots"
        onClose={():void => closeDrawer()}
        maskStyle={{ background: 'rgb(0, 20, 67,0.8)' }}
      >
        <Form
          name="InterviewSlotsForm"
          layout="vertical"
          size="large"
          form={createSlotsForm}
          onFinish={onFinishHandler}
          initialValues={{
            interviewType: 'FACE',
            videoInterviewType: 'HANG_VID',
            interviewDates: [...initInterviewDate()],
            interviewTimings: [moment('08:00:00', 'HH:mm:ss'), moment('17:00:00', 'HH:mm:ss')],
            interviewPoc: state.selectedPoc,
            interviewAddress: state.selectedInterviewAddress,
            interviewers: [],
            sharePoc: false,
            calenderInvite: false,
          }}
          hideRequiredMark
          scrollToFirstError
          className="add-slots-form"
        >
          <Row>
            <Col span={24} className="p-bottom-24">
              <Text className="font-size-20 font-bold">
                Please add available timing for Interview
              </Text>
            </Col>
          </Row>
          {/* Interview Type */}
          <Row>
            <Col span={9}>
              <Form.Item
                name="interviewType"
                label="Interview Type:"
                style={{ marginBottom: 32 }}
              >
                <Select
                  onChange={(value):void => {
                    if (value.toString() === 'VID') {
                      createSlotsForm.setFieldsValue({
                        sharePoc: true,
                      });
                      setLocationsCarouselLoaded(false);
                    }
                    setState((prevState) => ({
                      ...prevState,
                      interviewType: value.toString(),
                    }));
                  }}
                  value={state.interviewType}
                  showArrow
                  className="flex-align-center"
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
          {/* Video Interview type and Input */}
          {state.interviewType === 'VID' ? (
            <Row>
              {/* Video Interview Type */}
              <Col span={9}>
                <Form.Item
                  name="videoInterviewType"
                  label="Video Interview Tool:"
                  style={{ marginBottom: 32 }}
                >
                  <Select
                    onChange={(value):void => {
                      setState((prevState) => ({
                        ...prevState,
                        videoInterviewType: value.toString(),
                      }));
                    }}
                    value={state.videoInterviewType}
                    showArrow
                    className="flex-align-center"
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
              <Form.Item noStyle>
                <span className="divider-addSlots" />
              </Form.Item>
              {/* Video Interview Input */}
              <Col span={10}>
                <Form.Item
                  label={videoInterviewInputTitles[state.videoInterviewType]}
                  name="videoInterviewInput"
                  rules={[
                    {
                      required: true,
                      message: videoInterviewInputRules[state.videoInterviewType].requiredText,
                    },
                    {
                      pattern: videoInterviewInputRegex(),
                      message: videoInterviewInputRules[state.videoInterviewType].patternText,
                    },
                  ]}
                >
                  <Input
                    prefix={state.videoInterviewType === 'WHATSAPP_VID' ? (
                      <CustomImage
                        src="/images/settings/mobileNoPrefix.svg"
                        width={22}
                        height={22}
                        alt="+91"
                      />
                    ) : null}
                    className={`${state.videoInterviewType === 'WHATSAPP_VID' ? 'input-with-prefix' : ''}`}
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
          ) : null}
          {/* Interview Dates */}
          <Row>
            <Col span={24}>
              <Form.Item
                name="interviewDates"
                label="Interview dates:"
                rules={[{
                  required: true,
                  message: 'Please select atleast one date',
                }]}
              >
                <Checkbox.Group className="interview-dates-checkboxes">
                  {state.interviewRepeatDates.map((item: InterviewRepeatDaysInterface) => (
                    <Checkbox
                      value={item.date}
                      className="checkbox"
                      key={item.date}
                    >
                      <Row>
                        <Col className="interview-date text-base">
                          <Text className="day">{item.displayDay.toLocaleUpperCase()}</Text>
                          <Text className="date font-size-20">{item.displayDate}</Text>
                          <Text className="month text-small text-upper-case font-bold">{item.displayMonth}</Text>
                        </Col>
                      </Row>
                    </Checkbox>
                  ))}
                </Checkbox.Group>
              </Form.Item>
            </Col>
          </Row>
          {/* Avaliable Timings & Interview Duration */}
          <Row>
            {/* Avaliable Timings */}
            <Col span={16} className="available-timings-container">
              <Form.Item
                label="Available timings:"
                name="interviewTimings"
                rules={[{
                  required: true,
                  message: 'Interview timings are required',
                }]}
              >
                <RangePicker
                  size="large"
                  format="hh:mm A"
                  separator={(
                    <span style={{ padding: '5px 15px' }}>
                      <CustomImage
                        src="/images/common/two-sided-arrow.svg"
                        alt="seperator"
                        width={24}
                        height={24}
                      />
                    </span>
                  )}
                  className="text-base"
                  suffixIcon={null}
                  placeholder={['Start Time', 'End Time']}
                />
              </Form.Item>
            </Col>
            <Form.Item noStyle>
              <span className="divider-addSlots" />
            </Form.Item>
            {/* Interview Duration */}
            <Col span={8} className="interview-duration-container">
              <Form.Item
                label="Interview duration:"
                name="interviewDuration"
                initialValue="30"
                rules={[
                  { validator: validateInterviewDuartion },
                ]}
              >
                <Select showArrow className="text-base" placeholder="Select">
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
          <Row>
            <Col span={24} className="p-y-axis-32">
              <Text className="font-size-20 font-bold">
                Provide Interview Venue & POC
              </Text>
            </Col>
          </Row>
          {/* Interview Address  */}
          {state.interviewType === 'VID' ? null : (
            <Row>
              <Col span={24}>
                <Form.Item
                  label="Interview Address:"
                  name="interviewAddress"
                  rules={[{
                    required: true,
                    message: 'Interview address is required',
                  }, {
                    validator: addressValidator,
                  }]}
                  className="p-bottom-8"
                >
                  {state.interviewLocations.length > 0 ? (
                    <Checkbox.Group
                      className="carousel-checkboxes p-top-8"
                      onChange={addressOnChangeHandler}
                      value={state.selectedInterviewAddress}
                      style={{ display: 'flex' }}
                    >
                      <Carousel
                        autoplay={false}
                        slidesToShow={state.interviewLocations.length > 2 ? 2
                          : state.interviewLocations.length}
                        slidesToScroll={2}
                        style={{ width: 'auto', maxWidth: '592px' }}
                        prevArrow={<Arrow type="left" />}
                        nextArrow={<Arrow type="right" />}
                        className="add-slots-drawer-carousel interview-locations-carousel"
                        arrows
                        useCSS
                        useTransform
                        variableWidth={locationsCarouselLoaded}
                        infinite
                        onInit={():void => setLocationsCarouselLoaded(true)}
                      >
                        {state.interviewLocations.map((item, index) => (
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
                                      alt="map-img"
                                      className="map-img"
                                      height={48}
                                      width={48}
                                    />
                                  </a>
                                </div>
                              </div>
                            </Checkbox>
                          </div>
                        ))}
                      </Carousel>
                    </Checkbox.Group>
                  ) : <div />}
                </Form.Item>

                {/* Add Another Address */}
                <Button
                  onClick={(): void => setState(
                    (prevState) => ({ ...prevState, showInterviewModal: true }),
                  )}
                  type="link"
                  size="small"
                  className="add-another-btn"
                >
                  <span className="font-bold">
                    + Add Another Address
                  </span>
                </Button>
              </Col>
            </Row>
          )}
          {/* Interview Poc */}
          <Row>
            <Col span={24}>
              <Form.Item
                label="Interview Point of Contact"
                name="interviewPoc"
                rules={[{
                  required: true,
                  message: 'Interview point of contact is required',
                }]}
                className="m-all-0"
              >
                {state.pocList.length > 0 ? (
                  <Checkbox.Group
                    onChange={pocOnChangeHandler}
                    value={state.selectedPoc}
                    className="carousel-checkboxes"
                    style={{ display: 'flex' }}
                  >
                    <Carousel
                      autoplay={false}
                      slidesToShow={state.pocList.length > 2 ? 2
                        : state.pocList.length}
                      slidesToScroll={2}
                      style={{ width: 'auto', maxWidth: '592px' }}
                      prevArrow={<Arrow type="left" />}
                      nextArrow={<Arrow type="right" />}
                      className="add-slots-drawer-carousel interview-pocs-carousel"
                      arrows
                      useCSS
                      useTransform
                      variableWidth={pocCarouselLoaded}
                      infinite
                      onInit={():void => setPocCarouselLoaded(true)}

                    >
                      {state.pocList.map((item: ManagersListType) => (
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
                ) : <div />}
              </Form.Item>

              {/* Add POC Button */}
              <Button
                type="link"
                className="add-another-btn"
                size="small"
                onClick={(): void => setState(
                  (prevState) => ({ ...prevState, showPocModal: true }),
                )}
              >
                <span className="font-bold">
                  + Add New Contact
                </span>
              </Button>
            </Col>
          </Row>

          {/* Share Poc Details */}
          <Row>
            <Col span={24}>
              <Form.Item
                name="sharePoc"
                valuePropName="checked"
              >
                <Checkbox
                  disabled={state.interviewType === 'VID'}
                  className="text-small cyan-checkbox share-poc-checkbox"
                >
                  Share contact details with candidates who have fixed interviews.
                </Checkbox>
              </Form.Item>
            </Col>
          </Row>
          {/* Interviewers List */}
          <Row className="d-interviewers-wrapper">
            <Col span={24}>
              <Row align="middle" justify="space-between">
                <Col className="label">
                  Send calendar invite to interviewers as well!
                </Col>
                <Col>
                  <CustomImage
                    src="/images/application-tab/calenderInviteIcon.svg"
                    width={10}
                    height={10}
                    alt="calendar Invite Icon"
                  />
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Form.Item
                    label="Interviewers:"
                    name="interviewers"
                    style={{ marginBottom: 0 }}
                  >
                    <Select
                      showArrow
                      mode="multiple"
                      optionFilterProp="title"
                      optionLabelProp="label"
                      placeholder="Type E-mail to invite new members"
                      onSearch={interviewersOnSearchHandler}
                      notFoundContent="Type the Complete Email"
                      className="text-base select-box"
                    >
                      {state.interviewersList.map((item) => <Option key={item.email} value={item.email} title={item.name} label={`${item.name} (${item.email})`}>{item.name}</Option>)}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="calenderInvite"
                    valuePropName="checked"
                  >
                    <Checkbox value="calenderInvite" className="cyan-checkbox">
                      Send me Calendar invite once interview are scheduled with candidates.
                    </Checkbox>
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
          {/* Submit Button */}
          <Row>
            <Col span={24}>
              <Button
                htmlType="submit"
                type="primary"
                className="submit-btn font-bold text-base"
                loading={addSlotsRIP}
              >
                Add slots
              </Button>
            </Col>
          </Row>
        </Form>

        {/* Add Interview Modal */}
        {state.showInterviewModal
          ? (
            <AddNewAddressModal
              closeModal={(): void => setState(
                (prevState) => ({ ...prevState, showInterviewModal: false }),
              )}
              addNewAddressHandler={addNewAddressHandler}
              modalTitle="Add Interview Slots"
              submitBtnText="Save & Continue to Add Slots"
            />
          )
          : null}

        {/* ADD Poc Modal */}
        {state.showPocModal
          ? (
            <AddNewPocModal
              closeModal={(): void => setState(
                (prevState) => ({ ...prevState, showPocModal: false }),
              )}
              addNewPocHandler={addNewPocHandler}
              pocList={state.pocList}
            />
          )
          : null}
      </Drawer>
    </>
  );
};
export default WalkInInterview;
