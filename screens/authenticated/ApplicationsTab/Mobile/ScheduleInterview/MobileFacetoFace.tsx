/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/rules-of-hooks */
import {
  Col, Form, Modal,
  Progress, Row,
  Typography,
} from 'antd';
import snackBar from 'components/Notifications';
import CustomImage from 'components/Wrappers/CustomImage';
import {
  convertTime12to24, InterviewTimingsArray,
} from 'constants/enum-constants';
import moment from 'moment';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import { OrganizationDetailsType } from 'screens/authenticated/ApplicationsTab/Common/ApplicationTabUtils';
import { createJobSlot, scheduleInterview } from 'service/application-service';
import { pushClevertapEvent } from 'utils/clevertap';

require('screens/authenticated/ApplicationsTab/Mobile/ScheduleInterview/addSlotsIntro.less');

const CorouselHelper = dynamic(() => import('screens/authenticated/ApplicationsTab/Mobile/ScheduleInterview/CorouselHelper'), { ssr: false });
const InterviewType = dynamic(() => import('screens/authenticated/ApplicationsTab/Mobile/ScheduleInterview/InterviewType'), { ssr: false });
const InterviewSlots = dynamic(() => import('screens/authenticated/ApplicationsTab/Mobile/ScheduleInterview/InterviewSlots'), { ssr: false });
const ConfirmedByCandidate = dynamic(() => import('screens/authenticated/ApplicationsTab/Mobile/ScheduleInterview/ConfirmedByCandidate'), { ssr: false });
const InterviewTime = dynamic(() => import('screens/authenticated/ApplicationsTab/Mobile/ScheduleInterview/InterviewTime'), { ssr: false });
const InterviewAddress = dynamic(() => import('screens/authenticated/ApplicationsTab/Mobile/ScheduleInterview/InterviewAddress'), { ssr: false });
const InterviewVideo = dynamic(() => import('screens/authenticated/ApplicationsTab/Mobile/ScheduleInterview/InterviewVideo'), { ssr: false });

interface interviewFacetoFaceI{
  visible:boolean,
  closeModal:() => void;
  store:OrganizationDetailsType,
  applicationId:string,
  jobId:string
  invite:any;
  updateApplicationData:any;
  jobtype:string;
  clevertype:string;
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

interface InterviewLocationsInterface{
  address: string; id: number; mapsLink: string;
}
const { Paragraph } = Typography;

const initPocList = (orgData, IspocList): Array<PocListInterface> => {
  if (orgData && orgData.managers && orgData.managers.length > 0) {
    const managersList = IspocList ? orgData.managers.filter((x) => x.mobile) : orgData.managers;
    return managersList.map((x) => ({
      name: `${x.firstName} ${x.lastName}`,
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
  SelectedPocAddress:any;
  PocList: Array<PocListInterface>;
  InterviewersList: Array<PocListInterface>;
  InterviewLocations: Array<InterviewLocationsInterface>;
  InterviewStartTime: string,
  InterviewEndTime: string,
}

const MobileFacetoFace = (props: interviewFacetoFaceI): JSX.Element => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const {
    visible, closeModal, store, applicationId, jobId, invite, updateApplicationData,
    jobtype, clevertype,
  } = props;

  const [form] = Form.useForm();
  // const [visitedIntro, setVisitedInro] = usePersistedState('visited_intro', '');
  const [CurrentScreen, setCurrentScreen] = useState('interviewType');
  // const [pocAddress, setPocaddress] = useState() as any;
  const [interviewTypeFormat, setinterviewTypeFormat] = useState('FACE');
  const [First, setFirst] = useState() as any;
  const [second, setSecond] = useState() as any;
  const [third, setThird] = useState() as any;
  const [confirm, setconfirm] = useState(false);
  const [slotInProgress, setSlotInProgress] = useState(false);
  const [state, setState] = useState<StateInterface>({
    InterviewRepeatDates: createRepeatSlots(),
    ShowInterviewModal: false,
    ShowPocModal: false,
    SelectedPoc: getInitialSelectedPoc(store),
    SelectedInterviewAddress: store && store.offices
    && store.offices.length > 0 ? [store.offices[0].id] : [],
    SelectedPocAddress: store && store.offices
    && store.offices.length > 0 ? [store.offices[0].formattedAddress] : [],
    PocList: initPocList(store, true),
    InterviewersList: initPocList(store, false),
    InterviewLocations: initLocationList(store),
    InterviewStartTime: '',
    InterviewEndTime: '',
  });

  const initRepeatSlotDates = () :void => {
    state.InterviewRepeatDates.map((s) => {
      if ((initrep.indexOf(s.repeatSlotsDate) === -1)
      && (s.dateDisplay !== 'Sat') && (s.dateDisplay !== 'Sun')) { initrep.push(s.repeatSlotsDate); }
      return true;
    });
  };

  const handleScreenChange = (screen: string):void => {
    if (screen) {
      switch (screen) {
        case 'intro':
          // setVisitedInro('intro');
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
          setconfirm(false);
          break;
        case 'third':
          setCurrentScreen('third');
          break;
        case 'confirmedbycandidate':
          setCurrentScreen('confirmedbycandidate');
          setconfirm(true);
          break;
        case 'video':
          setCurrentScreen('video');
          break;
        default:
          setCurrentScreen('first');
      }
    }
  };

  const hours = InterviewTimingsArray();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getSelectedPoc = (selectedContact, contact?): any => {
    const selectedPoc = state.PocList.filter((item) => item.mobile === selectedContact);
    if (selectedPoc) {
      return {
        name: selectedPoc[0].name,
        contact: contact || selectedPoc[0].mobile,
        email: selectedPoc[0].email,
      };
    }
    return {};
  };

  const videoTypeFormat = ['HANG_VID', 'WHATSAPP_VID', 'VID', 'OTHER'];
  const createSlotObjForCandidate = async (formData):Promise<void> => {
    setSlotInProgress(true);
    // let templatedate = (moment().add(1, 'd')).format('D MMM');
    // templatedate += ' - 140 slots';
    const startTiming = formData.startTime;
    const { endTime } = formData;
    const postdata = [] as any;
    let numberofslots;
    if (formData.repdate) {
      let templatedate = (moment(formData.repdate[0])).format('D MMM');
      const st = moment(startTiming, 'HH:mm:SS');
      const et = moment(endTime, 'HH:mm:SS');

      const diff = et.diff(st, 'minutes');
      if (diff >= 30 && diff >= parseInt(formData.InterviewDuration, 10)) {
        const duration = parseInt(formData.InterviewDuration, 10);

        numberofslots = (diff / duration);
      }
      // console.log(numberofslots * formData.repeatSlots.length);
      templatedate += ` - ${numberofslots * formData.repdate.length} slots`;
      for (let i = 0; i < formData.repdate.length; i += 1) {
        const obj = {
          date: formData.repdate[i],
          // job_id: store.id,
          job_id: jobId,
          start: startTiming,
          end: endTime,
          interview_type: interviewTypeFormat,
          org_slot: {
            start: startTiming,
            end: endTime,
            days: [],
            location_id: formData.InterviewAddress,

          },
          duration: parseInt(formData.InterviewDuration, 10),
          interviewers: [state.InterviewersList[0].email],
          invite_employer: true,
          poc_data: videoTypeFormat.indexOf(interviewTypeFormat) > -1
            ? getSelectedPoc(state.PocList[0].mobile, formData.contact)
            : getSelectedPoc(state.PocList[0].mobile),
          template: templatedate,
        // share_poc_contact: formData.sharePoc,
        // interview_type: formData.InterviewType,
        };

        if (interviewTypeFormat !== 'FACE') { delete obj.org_slot.location_id; }
        postdata.push(obj);
      }
    }
    // invite('success', postdata, state.SelectedPocAddress);
    // console.log(postdata);
    // invite('success', postdata, state.SelectedPocAddress);
    const res = await createJobSlot(postdata, applicationId);
    if (res.status === 202 || res.status === 201) {
      setSlotInProgress(false);
      // console.log('ok');
      const responseObj = await res.data;
      // console.log(responseObj);
      const resobj = {
        // eslint-disable-next-line no-underscore-dangle
        suggestedSlotTemplateName: responseObj?._source?.suggested_slot_template?.template?.name,
        applicationStage: 'TBSI',
      };
      // console.log(resobj);
      updateApplicationData(resobj);
      pushClevertapEvent(`${clevertype}`, { Type: interviewTypeFormat, status: 'success' });
      if (jobtype === 'NCAR') { invite('success'); } else { invite('success', postdata, state.SelectedPocAddress); }
    } else {
      setSlotInProgress(false);
      // eslint-disable-next-line no-lonely-if
      if (res.status !== 409) { invite('info'); }
      if (res.response.status === 400 && res.response.data.poc_data !== 'undefined') {
        snackBar({
          title: 'Please select poc with contact details',
          description: 'Contact details cannot be empty',
          iconName: '',
          placement: 'topRight',
          notificationType: 'error',
          duration: 8,
        });
      }
      pushClevertapEvent(`${clevertype}`, { Type: interviewTypeFormat, status: 'error' });
    }

    return postdata;
  };
  const onScheduleInterviewHandler = async (formData):Promise<void> => {
    setSlotInProgress(true);
    const startTiming = formData.startTime;
    const { endTime } = formData;
    const postdata = [] as any;
    const obj = {
      date: formData.repdate,
      // job_id: store.id,
      // job_id: jobId,
      id: applicationId,
      start: startTiming,
      end: endTime,
      interview_type: interviewTypeFormat,
      location_id: formData.InterviewAddress,
      interviewers: [state.InterviewersList[0].email],
      invite_employer: true,
      poc_data: videoTypeFormat.indexOf(interviewTypeFormat) > -1
        ? getSelectedPoc(state.PocList[0].mobile, formData.contact)
        : getSelectedPoc(state.PocList[0].mobile),
      share_poc_contact: true,
    };
    if (interviewTypeFormat !== 'FACE') { delete obj.location_id; }
    postdata.push(obj);
    // console.log(postdata);
    // invite('success', postdata, state.SelectedPocAddress);
    const res = await scheduleInterview(obj);
    if (res.status === 202 || res.status === 201) {
      setSlotInProgress(false);
      // console.log('ok');
      const responseObj = await res.data;
      // console.log(responseObj);
      const resobj = {
        // eslint-disable-next-line no-underscore-dangle
        interviewStartTime: responseObj._source.interview.duration.lower,
        // eslint-disable-next-line no-underscore-dangle
        interviewEndTime: responseObj._source.interview.duration.upper,
        applicationStage: 'SFI',
      };
      // console.log(resobj);
      updateApplicationData(resobj);
      invite('success', postdata, state.SelectedPocAddress);
    } else {
      setSlotInProgress(false);
      if (res.status !== 409) { invite('info'); }
    }

    // return postdata;
  };
  const onFirstScreenFinishHandler = async (formData): Promise<void> => {
    // console.log(formData);
    const arr = [] as any;
    formData.repeatSlots.map((slot) => {
      if (!(arr.indexOf(slot) > -1)) { arr.push(slot); }
      return true;
    });
    setFirst(arr);
    handleScreenChange('second');
  };
  const handleTele = (obj?):void => {
    let teleObj;
    if (third === undefined || second === undefined) {
      teleObj = {
        repdate: First === undefined ? obj.InterviewDate : First,
        InterviewDuration: obj.InterviewDuration,
        startTime: obj.startTime,
        endTime: obj.endTime,

      };
    } else {
      teleObj = {
        repdate: First === undefined ? third.InterviewDate : First,
        InterviewDuration: second === undefined
          ? third.InterviewDuration : second.InterviewDuration,
        startTime: second === undefined ? third.startTime : second.startTime,
        endTime: second === undefined ? third.endTime : second.endTime,

      };
    }
    closeModal();
    if (First === undefined) {
      onScheduleInterviewHandler(teleObj);
    } else { createSlotObjForCandidate(teleObj); }
  };
  const onSecondScreenFinishHandler = async (formData): Promise<void> => {
    // console.log(formData);
    const obj = {
      startTime: formData.InterviewStartTime,
      endTime: formData.InterviewEndTime,
      InterviewDuration: formData.InterviewDuration,
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
  const onThirdScreenFinishHandler = async (formData): Promise<void> => {
    // console.log(formData);
    const obj = {
      InterviewAddress: typeof (formData) === 'object' ? formData.InterviewAddress : formData,
      repdate: First === undefined ? third.InterviewDate : First,
      InterviewDuration: second === undefined
        ? third.InterviewDuration : second.InterviewDuration,
      startTime: second === undefined ? third.startTime : second.startTime,
      endTime: second === undefined ? third.endTime : second.endTime,

    };
    // console.log(obj);
    closeModal();
    if (First === undefined) {
      onScheduleInterviewHandler(obj);
    } else { createSlotObjForCandidate(obj); }
  };
  const confirmedbycandidateHandler = async (formData):Promise<void> => {
    let s = hours.indexOf(formData.startTime);
    if (s === hours.length - 1) { s = -1; }
    if (s === hours.length - 2) {
      s = -2;
    }

    const endTime = hours[s + 2];
    const obj = {
      InterviewDate: moment(formData.InterviewDate).format('YYYY-MM-DD'),
      startTime: convertTime12to24(formData.startTime),
      endTime: convertTime12to24(endTime),
      InterviewDuration: 60,
    };
    // console.log(obj);
    setThird(obj);
    if (interviewTypeFormat === 'FACE') {
      handleScreenChange('third');
    } else if (interviewTypeFormat === 'HANG_VID') {
      handleScreenChange('video');
    } else {
      handleTele(obj);
    }
  };
  const onVideoScreenFinishHandler = async (formData):Promise<void> => {
    const obj = {
      repdate: First === undefined ? third.InterviewDate : First,
      InterviewDuration: second === undefined
        ? third.InterviewDuration : second.InterviewDuration,
      startTime: second === undefined ? third.startTime : second.startTime,
      endTime: second === undefined ? third.endTime : second.endTime,
      interview_type: interviewTypeFormat,
      contact: formData.videoValue,
    };
    closeModal();
    if (First === undefined) {
      onScheduleInterviewHandler(obj);
    } else { createSlotObjForCandidate(obj); }
  };

  const onChangeHandlerAddress = (e): void => {
    const address = state.InterviewLocations.filter((item) => item.id === e.target.value);

    // console.log(value);
    // const diff = value.filter((item) => !state.SelectedInterviewAddress.includes(item));
    setState((prevState) => ({
      ...prevState,
      SelectedInterviewAddress: e.target.value,
      SelectedPocAddress: address[0].address,
    }));
    form.setFieldsValue({
      InterviewAddress: e.target.value,
    });
  };

  const getPercent = (screen): number => {
    let percent = 10;
    if (screen === 'interviewType') {
      percent = 10;
    } else if (screen === 'first') {
      percent = 20;
    } else if (screen === 'confirmedbycandidate') {
      percent = 50;
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
    } else if (screen === 'first' && jobtype === 'NCAR') {
      title = 'On which days candidates can walk-in for interviews?';
    } else if (screen === 'first' && jobtype === 'CAR') {
      title = 'On which days you are free to take interview?';
    } else if (screen === 'confirmedbycandidate') {
      title = 'If already confirmed with Candidate, add interview details here';
    } else if (screen === 'second') {
      title = 'During what time will you be available?';
    } else if (screen === 'third') {
      title = 'Where should candidate come for the interview?';
    } else if (screen === 'video') {
      title = 'What will be the mode of video call?';
    }

    return title;
  };

  const renderContent = (type): any => {
    switch (type) {
      case 'intro': {
        return (
          <CorouselHelper handleScreenChange={handleScreenChange} />
        );
      }
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
          <InterviewSlots
            form={form}
            onFirstScreenFinishHandler={onFirstScreenFinishHandler}
            handleScreenChange={handleScreenChange}
            InterviewRepeatDates={state.InterviewRepeatDates}
            initrep={initrep}
          />
        );
      }
      case 'confirmedbycandidate': {
        return (
          <ConfirmedByCandidate
            confirmedbycandidateHandler={confirmedbycandidateHandler}
            form={form}
          />
        );
      }

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
      default:
        return '';
    }
  };

  const handleBack = (): void => {
    let target = '';
    if (CurrentScreen === 'first') {
      target = 'interviewType';
    } else if (CurrentScreen === 'second' || CurrentScreen === 'confirmedbycandidate') {
      target = 'first';
    } else if (CurrentScreen === 'third' || CurrentScreen === 'video') {
      if (confirm) { target = 'confirmedbycandidate'; } else { target = 'second'; }
    } else {
      target = 'interviewType';
    }

    handleScreenChange(target);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { initRepeatSlotDates(); }, []);

  return (
    <Modal
      visible={!!visible}
      width={700}
      className="full-screen-modal m-interview-actions"
      closable={false}
      title={CurrentScreen !== 'intro'
        ? [
          <Row key="actions">
            {
              CurrentScreen === 'interviewType'
                ? <Col span={24} onClick={closeModal}><CustomImage src="/svgs/m-close.svg" height={24} width={24} alt="Close" /></Col>
                : <Col span={24} onClick={handleBack}><CustomImage src="/svgs/m-back.svg" height={24} width={24} alt="Back" /></Col>
            }
            <Col span={24}>
              {' '}
              <Progress success={{ percent: getPercent(CurrentScreen) }} size="small" showInfo={false} className="m-interview-progress" />
            </Col>
            <Col span={24}>
              <Paragraph className="title">
                {getTitle(CurrentScreen)}
              </Paragraph>
            </Col>
            {
              CurrentScreen === 'confirmedbycandidate' && (
                <Col span={24} className="sub-title">
                  We’ll send out interview reminders accordingly
                </Col>
              )
            }
          </Row>,
        ] : null}
      footer={null}
    >
      { renderContent(CurrentScreen) }
    </Modal>
  );
};
export default MobileFacetoFace;
