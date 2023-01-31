/* eslint-disable no-underscore-dangle */
import {
  Alert, Button, Checkbox, Col, Form, Modal, Progress, Row, Typography,
} from 'antd';
import snackBar from 'components/Notifications';
import CustomImage from 'components/Wrappers/CustomImage';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import InterviewAddress from 'screens/authenticated/ApplicationsTab/Mobile/ScheduleInterview/InterviewAddress';
import InterviewTime from 'screens/authenticated/ApplicationsTab/Mobile/ScheduleInterview/InterviewTime';
import InterviewType from 'screens/authenticated/ApplicationsTab/Mobile/ScheduleInterview/InterviewType';
import InterviewVideo from 'screens/authenticated/ApplicationsTab/Mobile/ScheduleInterview/InterviewVideo';
import { OrgDetailsType, updateSlotsDataObjectType } from 'screens/authenticated/JobsTab/Common/JobsTabUtils';
import { addSlots } from 'service/job-service';
import { pushClevertapEvent } from 'utils/clevertap';
import { has } from 'utils/common-utils';

require('screens/authenticated/ApplicationsTab/Mobile/ScheduleInterview/addSlotsIntro.less');

dayjs.extend(isoWeek);

const { Paragraph } = Typography;

type PropsModel = {
  visible: boolean,
  closeModal: () => void,
  store: OrgDetailsType,
  jobId: string,
  updateJobsSlotsData: (updateObject:updateSlotsDataObjectType, jobId: string) => void;
}
interface PocListInterface{
  name: string;
  email: string;
  mobile: string;
  id?:string | number | any;
}
interface InterviewRepeatDaysInterface{
  displayDate: string;
  displayMonth: string;
  displayDay: string;
  value: string;
  date: string;
}
interface InterviewLocationsInterface{
  address: string; id: number; mapsLink: string;
}

const initPocList = (orgData, IspocList): Array<PocListInterface> => {
  if (orgData && orgData.managers && orgData.managers.length > 0) {
    const managersList = IspocList ? orgData.managers.filter((x) => x.mobile) : orgData.managers;
    return managersList.map((x) => ({
      name: x?.name,
      email: x.email ? x.email : '',
      mobile: x.mobile ? x.mobile : '',
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

const initrep = [] as any;
const createRepeatSlots = (startDate?): Array<InterviewRepeatDaysInterface> => {
  const currentDate = startDate ? moment(startDate) : moment().add(1, 'd');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const repeatdays: any = [];
  for (let i = 0; i < 7; i += 1) {
    repeatdays.push(moment(currentDate.add(1, 'd')));
  }
  return repeatdays.map((d) => ({
    label: d.format('D MMM'),
    repeatSlotsDate: d.format('YYYY-MM-DD'),
    repeatSlotsDay: d.format('dddd'),
    value: d.isoWeekday() - 1,
    display: d.format('D MMM'),
    dated: d.format('DD'),
    dayDisplay: d.format('D MMM'),
    dateDisplay: d.format('ddd'),
  }));
};

interface StateInterface{
  InterviewRepeatDates: Array<InterviewRepeatDaysInterface>;
  ShowInterviewModal: boolean;
  ShowPocModal: boolean;
  SelectedPoc: Array<string>;
  SelectedInterviewAddress: Array<number>;
  PocList: Array<PocListInterface>;
  InterviewersList: Array<PocListInterface>;
  InterviewLocations: Array<InterviewLocationsInterface>;
  InterviewStartTime: string,
  InterviewEndTime: string
}

interface PocListInterface{
  name: string;
  email: string;
  mobile: string;
}

interface InterviewRepeatDaysInterface{
  label: string;
  repeatSlotsDate: string;
  repeatSlotsDay: string;
  value: string;
  display: string;
  dayDisplay: string;
  dated:string;
  dateDisplay: string;
}

const hint = 'This will ensure that candidates always have interview slots available to book';

const AddMobileWalkinSlots = (props: PropsModel): JSX.Element => {
  const {
    visible, closeModal, store, jobId, updateJobsSlotsData,
  } = props;

  const [currentScreen, setCurrentScreen] = useState('interviewType');
  const [interviewTypeFormat, setinterviewTypeFormat] = useState('FACE');
  const [first, setFirst] = useState() as any;
  const [second, setSecond] = useState() as any;
  const [warningMsg, setWarningMsg] = useState(false);
  const [slotInProgress, setSlotInProgress] = useState(false);
  const [form] = Form.useForm();

  const [state, setState] = useState<StateInterface>({
    InterviewRepeatDates: createRepeatSlots(),
    ShowInterviewModal: false,
    ShowPocModal: false,
    SelectedPoc: getInitialSelectedPoc(store),
    SelectedInterviewAddress: store && store.offices
    && store.offices.length > 0 ? [store.offices[0].id] : [],
    PocList: initPocList(store, true),
    InterviewersList: initPocList(store, false),
    InterviewLocations: initLocationList(store),
    InterviewStartTime: '',
    InterviewEndTime: '',
  });

  const handleScreenChange = (screen: string):void => {
    if (screen) {
      switch (screen) {
        case 'intro':
          setCurrentScreen('intro');
          break;
        case 'interviewType':
          setCurrentScreen('interviewType');
          break;
        case 'first':
          setCurrentScreen('first');
          break;
        case 'second':
          setCurrentScreen('second');
          break;
        case 'third':
          setCurrentScreen('third');
          break;
        case 'video':
          setCurrentScreen('video');
          break;
        default:
          setCurrentScreen('first');
      }
    }
  };

  const handleBack = (): void => {
    let target = '';
    if (currentScreen === 'first') {
      target = 'interviewType';
    } else if (currentScreen === 'second') {
      target = 'first';
    } else if (currentScreen === 'third' || currentScreen === 'video') {
      target = 'second';
    } else {
      target = 'interviewType';
    }

    handleScreenChange(target);
  };

  const getPercent = (screen): number => {
    let percent = 10;
    if (screen === 'interviewType') {
      percent = 10;
    } else if (screen === 'first') {
      percent = 20;
    } else if (screen === 'second') {
      percent = 50;
    } else if (screen === 'third') {
      percent = 80;
    } else if (screen === 'video') {
      percent = 80;
    }

    return percent;
  };

  const getTitle = (screen): string => {
    let title = '';
    if (screen === 'interviewType') {
      title = 'Select Interview Type';
    } else if (screen === 'first') {
      title = 'On which days candidates can walk-in for interviews?';
    } else if (screen === 'second') {
      title = 'During what time will you be available?';
    } else if (screen === 'third') {
      title = 'Where should candidate come for the interview?';
    } else if (screen === 'video') {
      title = 'What will be the mode of video call?';
    }

    return title;
  };

  const getSelectedPoc = (selectedContact, formData): any => {
    const selectedPoc = state.PocList.filter((item) => item.mobile === selectedContact);
    if (selectedPoc) {
      return {
        name: selectedPoc[0].name,
        contact: formData.videoValue ? formData.videoValue : selectedPoc[0].mobile,
        email: selectedPoc[0].email,
      };
    }
    return {};
  };

  const success = (obj):void => {
    Modal.success({
      icon: false,
      okButtonProps: {
        type: 'default',
        className: 'm-invite-success',
      },
      content: (
        <div>
          <Paragraph className="m-carousel-content">Interview slots added!</Paragraph>
          <div className="invite-img">
            <CustomImage src="/svgs/slot.svg" width={200} height={200} alt="second" className="invite-img" />
            <Paragraph style={{ textAlign: 'center' }}>
              We’ve also sent out notification to all candidates waiting for interview slots
            </Paragraph>
          </div>
        </div>),
      onOk() { updateJobsSlotsData(obj, jobId); },
    });
  };

  const createSlotObjForWalkIn = async (formData):Promise<void> => {
    setSlotInProgress(true);
    let numberofslots = 0;

    if (formData.repdate && Array.isArray(formData.repdate)) {
      formData.repdate.sort((a, b) => (dayjs(a).isAfter(dayjs(b)) ? 1 : -1));

      let templatedate = (moment(formData.repdate[0])).format('D MMM');
      const startTime = moment(formData.startTime, 'HH:mm:SS');
      const endTime = moment(formData.endTime, 'HH:mm:SS');

      const diff = endTime.diff(startTime, 'minutes');
      if (diff >= 15 && diff >= parseInt(formData.InterviewDuration, 10)) {
        const duration = parseInt(formData.InterviewDuration, 10);
        numberofslots = Math.floor(diff / duration);
      }
      templatedate += ` - ${numberofslots * formData.repdate.length} slots`;
      const putObject = {
        date: formData.repdate[0],
        job_id: jobId,
        org_slot: {
          start: formData.startTime,
          end: formData.endTime,
          days: formData.repcheck ? formData.repdate.map(
            (d) => dayjs(d).isoWeekday() - 1,
          ) : [0, 1, 2, 3, 4],
          org_id: store.orgId,
          location_id: formData.InterviewAddress || null,
        },
        duration: parseInt(formData.InterviewDuration, 10),
        interviewers: [state.InterviewersList[0].email],
        invite_employer: true,
        poc_data: getSelectedPoc(state.PocList[0].mobile, formData),
        template: templatedate,
        start: startTime,
        end: endTime,
        interview_type: formData.interviewFormat || interviewTypeFormat,
      };
      if (interviewTypeFormat !== 'FACE') { delete putObject.org_slot.location_id; }

      const apiCall = await addSlots([putObject]);
      if ([200, 201, 202].indexOf(apiCall.status) > -1) {
        setSlotInProgress(false);
        const response = await apiCall.data;
        if (response && Array.isArray(response) && response.length
        && response[0]._source) {
          const updateObject:updateSlotsDataObjectType = {
            interviewType: (has(response[0]._source, 'interview_type') && response[0]._source.interview_type.toString())
            || interviewTypeFormat,
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
          pushClevertapEvent('Add Innterview Slots', { Type: formData.interviewFormat || interviewTypeFormat, status: 'success' });
          success(updateObject);
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
        setSlotInProgress(false);
        pushClevertapEvent('Add Innterview Slots', { Type: formData.interviewFormat || interviewTypeFormat, status: 'Failed' });
      }
    }
  };

  const handleTele = (obj?):void => {
    const teleObj = {
      repdate: first.repeatSlots,
      repcheck: first.repeatcheck || false,
      InterviewDuration: 30,
      startTime: obj.startTime,
      endTime: obj.endTime,
    };
    closeModal();
    createSlotObjForWalkIn(teleObj);
  };

  const onFirstScreenFinishHandler = async (formData): Promise<void> => {
    const arr = [] as any;

    formData.repeatSlots.map((slot) => {
      if (!(arr.indexOf(slot) > -1)) { arr.push(slot); }
      return true;
    });
    const firstScreenData = {
      repeatSlots: arr,
      repeatcheck: formData.repeatcheck,
    };
    setFirst(firstScreenData);
    handleScreenChange('second');
  };

  const onSecondScreenFinishHandler = async (formData): Promise<void> => {
    const obj = {
      startTime: formData.InterviewStartTime,
      endTime: formData.InterviewEndTime,
      duration: formData.InterviewDuration,
    };
    setSecond(obj);
    if (interviewTypeFormat === 'FACE') {
      handleScreenChange('third');
    } else if (interviewTypeFormat === 'HANG_VID') {
      handleScreenChange('video');
    } else {
      handleTele(obj);
    }
  };

  const initRepeatSlotDates = ():void => {
    state.InterviewRepeatDates.map((s) => {
      if ((s.dateDisplay !== 'Sat') && (s.dateDisplay !== 'Sun')) { initrep.push(s.repeatSlotsDate); }
      return true;
    });
  };

  const onThirdScreenFinishHandler = async (formData): Promise<void> => {
    const obj = {
      InterviewAddress: typeof (formData) === 'object' ? formData.InterviewAddress : formData,
      repdate: first.repeatSlots,
      repcheck: first.repeatcheck || false,
      InterviewDuration: second.duration,
      startTime: second.startTime,
      endTime: second.endTime,
    };

    closeModal();
    createSlotObjForWalkIn(obj);
  };

  const onVideoScreenFinishHandler = async (formData): Promise<void> => {
    const obj = {
      interviewFormat: formData.mode,
      videoValue: formData.videoValue,
      repdate: first.repeatSlots,
      repcheck: first.repeatcheck || false,
      InterviewDuration: second.duration,
      startTime: second.startTime,
      endTime: second.endTime,
    };
    closeModal();
    createSlotObjForWalkIn(obj);
  };

  const onChangeHandlerAddress = (e): void => {
    setState((prevState) => ({
      ...prevState,
      SelectedInterviewAddress: e.target.value,
    }));
    form.setFieldsValue({
      InterviewAddress: e.target.value,
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { initRepeatSlotDates(); }, []);

  const getContent = (type): JSX.Element => {
    switch (type) {
      case 'interviewType': {
        return (
          <InterviewType
            handleScreenChange={handleScreenChange}
            setinterviewTypeFormat={setinterviewTypeFormat}
            mode="facetoface"
          />
        );
      }

      case 'first': {
        return (
          <Form
            name="InterviewSlotsForm"
            layout="vertical"
            size="large"
            hideRequiredMark
            form={form}
            onFinish={onFirstScreenFinishHandler}
            initialValues={{
              repeatSlots: initrep,
              repeatcheck: true,
            }}
          >
            <Row>
              <Col span={24}>
                <Form.Item
                  name="repeatSlots"
                  label="Available days:"
                  rules={[{
                    required: true,
                    message: 'Please select at least one date',
                  }]}
                  validateTrigger={['onBlur']}
                  style={{ marginBottom: 0 }}
                >

                  <Checkbox.Group
                    className="repeat-slots-checkbox-interview"
                    onChange={(value):void => {
                      if (value.length < 3) {
                        setWarningMsg(true);
                      } else { setWarningMsg(false); }
                    }}
                  >
                    <Row>
                      {state.InterviewRepeatDates.map((item: InterviewRepeatDaysInterface) => (
                        <Col key={item.value}>
                          <Checkbox key={item.repeatSlotsDate} value={item.repeatSlotsDate}>
                            <div className="m-interview-dates" style={{ fontSize: '10px' }}>
                              {item.dateDisplay.toUpperCase()}
                            </div>
                            <div className="m-interview-dates">
                              {item.dated}
                            </div>
                          </Checkbox>
                        </Col>
                      ))}
                    </Row>
                  </Checkbox.Group>
                </Form.Item>
              </Col>
              <Form.Item label="msg" noStyle>
                <Form.Item name="repeatcheck" valuePropName="checked" className="repeact-check">
                  <Col>
                    <Checkbox
                      onChange={(e):void => {
                        if (e.target.checked) {
                          setWarningMsg(false);
                        } else { setWarningMsg(true); }
                      }}
                    >
                      Repeat same days every week for a month
                    </Checkbox>
                  </Col>
                </Form.Item>
                {warningMsg ? (
                  <Alert
                    message={hint}
                    banner
                    className="text-small info"
                    showIcon
                    icon={(
                      <CustomImage
                        src="/svgs/error-icon.svg"
                        width={40}
                        height={40}
                        className="tip-image"
                        alt="second"
                      />
                    )}
                  />
                ) : ''}

              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                block
                className="interview-btn"
              >
                Next
                <CustomImage
                  src="/svgs/m-right-arrow.svg"
                  height={24}
                  width={24}
                  alt="Right arrow"
                />
              </Button>

            </Row>
          </Form>
        ); }

      case 'second': {
        return (
          <InterviewTime
            form={form}
            onSecondScreenFinishHandler={onSecondScreenFinishHandler}
          />
        );
      }
      case 'third': {
        return (
          <InterviewAddress
            SelectedInterviewAddress={state.SelectedInterviewAddress[0]}
            form={form}
            InterviewLocations={state.InterviewLocations}
            onThirdScreenFinishHandler={onThirdScreenFinishHandler}
            onChangeHandlerAddress={onChangeHandlerAddress}
            loading={slotInProgress}
          />
        );
      }

      case 'video': {
        return (
          <InterviewVideo
            form={form}
            onVideoScreenFinishHandler={onVideoScreenFinishHandler}
            setinterviewTypeFormat={setinterviewTypeFormat}
            interviewTypeFormat={interviewTypeFormat}
            loading={slotInProgress}
          />
        );
      }

      default: return <></>;
    }
  };

  return (
    <Modal
      visible={visible}
      width={700}
      className="full-screen-modal m-interview-actions"
      style={{ overflowY: 'auto', height: '100%' }}
      closable={false}
      footer={null}
      destroyOnClose
      title={currentScreen !== 'intro'
        ? [
          <Row key="add-slot">
            {
              currentScreen === 'interviewType'
                ? <Col span={24} onClick={closeModal}><CustomImage src="/svgs/m-close.svg" width={24} height={24} alt="Close" /></Col>
                : <Col span={24} onClick={handleBack}><CustomImage src="/svgs/m-back.svg" width={24} height={24} alt="Close" /></Col>
            }
            <Col span={24}>
              {' '}
              <Progress success={{ percent: getPercent(currentScreen) }} size="small" showInfo={false} className="m-interview-progress" />
            </Col>
            <Col span={24}>
              <Paragraph className="title">
                {getTitle(currentScreen)}
              </Paragraph>
            </Col>
          </Row>,
        ] : null}
    >
      {
        getContent(currentScreen)
      }
    </Modal>
  );
};

export default AddMobileWalkinSlots;
