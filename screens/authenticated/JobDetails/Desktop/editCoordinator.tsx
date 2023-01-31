import {
  Button, Card, Col, Form, Modal, Row, Select, Typography,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import React, { useState } from 'react';
import { patchJobChanges } from 'screens/authenticated/JobDetails/Common/JobDetails.service';
import {
  JobDetailsType,
} from 'screens/authenticated/JobDetails/Common/JobDetails.utils';
import { OrgDetailsType } from 'screens/authenticated/JobsTab/Common/JobsTabUtils';
import { pushClevertapEvent } from 'utils/clevertap';

require('screens/authenticated/JobDetails/Desktop/jobDetails.less');

const { Option } = Select;
const { Paragraph } = Typography;
interface titleI{
  visible:boolean,
  onCancel:()=>void;
  data:JobDetailsType;
  orgdata:OrgDetailsType;
  patchrequest:(string)=>void,
}
const JobCoordinator = (props:titleI):JSX.Element => {
  const {
    visible, onCancel, data, patchrequest, orgdata,
  } = props;
  const [submitInProgress, setSubmitInProgress] = useState(false);
  const [form] = Form.useForm();
  interface PocListInterface{
    name: string;
    email: string;
    mobile: string;
    id:any;
  }
  interface stateInterface{
    InterviewersList: Array<PocListInterface>;
    SelectedInterviewer:any;
  }
  function comparer(otherArray) {
    return function (current) {
      return otherArray.filter(
        (other) => other.id === current.id,
      ).length === 0;
    };
  }
  const initPocList = (): Array<PocListInterface> => {
    if (orgdata && orgdata?.managers && orgdata?.managers.length > 0) {
      const managersList = orgdata.managers;
      const onlyInA = data.pocList.filter(comparer(managersList));
      const onlyInB = managersList.filter(comparer(data.pocList));

      const result = onlyInA.concat(onlyInB);

      return result.map((x) => ({
        name: `${x.name}`,
        email: x.email ? x.email : '',
        mobile: x.mobile ? x.mobile : '',
        id: x.id,
      }));
    }
    return [];
  };

  const [state, setState] = useState<stateInterface>({
    InterviewersList: initPocList(),
    SelectedInterviewer: null,
  });
  const ids = (mangdata):Array<number> => {
    if (mangdata.length > 0) {
      return mangdata.map((d) => (
        d.id
      ));
    }
    return [];
  };
  const finishHandler = async ():Promise<void> => {
    setSubmitInProgress(true);
    const arr = ids(data.pocList);
    if (state.SelectedInterviewer) { arr.push(state.SelectedInterviewer.id); }
    const obj = {
      id: data.id,
      point_of_contact_ids: arr,
    };
    // console.log(obj);
    const apiCall = await patchJobChanges(data.id, obj);
    if ([200, 201, 202].indexOf(apiCall.status) > -1) {
      patchrequest('success');
      setSubmitInProgress(false);
      onCancel();
    } else {
      setSubmitInProgress(false);
    }
  };
  // const onSearchHandler = (searchTerm): void => {
  //   if (searchTerm && EmailRegexPattern.test(searchTerm)) {
  //     for (let i = 0; i < state.InterviewersList.length; i += 1) {
  //       if (state.InterviewersList[i].email === searchTerm) { return; }
  //     }
  //     const ManagerListTemp = [...state.InterviewersList];

  //     ManagerListTemp.push({
  //       name: searchTerm, email: searchTerm, mobile: '', id: 0,
  //     });

  //     setState((prevState) => ({
  //       ...prevState,
  //       InterviewersList: ManagerListTemp,
  //     }));
  //   }
  // };
  const onSelectHandler = (value):void => {
    // console.log(value);
    const selectedManager = [] as Array<PocListInterface>;
    for (let i = 0; i < state.InterviewersList.length; i += 1) {
      if (state.InterviewersList[i].email === value) {
        selectedManager.push({
          name: state.InterviewersList[i].name,
          email: state.InterviewersList[i].email,
          mobile: state.InterviewersList[i].mobile,
          id: state.InterviewersList[i].id,
        });
      }
    }

    setState((prevState) => ({
      ...prevState,
      SelectedInterviewer: selectedManager[0],
    }));
    // console.log(state.SelectedInterviewer);
    // selectedManager.push({
    //   name: state.InterviewersList[i].name,
    //   email: state.InterviewersList[i].email,
    //   mobile: state.InterviewersList[i].mobile,
    // });
  };

  return (
    <Modal
      visible={!!visible}
      footer={null}
      onCancel={onCancel}
      width={400}
      title="Add Job Coordinators"
      className="ct-modal-title"
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={finishHandler}
      >
        <Row>
          <Col span={24} className="p-all-0">
            <Row align="middle" justify="space-between">
              <Col className="label">
                Specify the account manager whom you want to send job notifications:
              </Col>

            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  label=" "
                  name="Interviewers"
                  className="form-label"
                  style={{ marginBottom: 0 }}
                >
                  <Select
                    showArrow
                    // showSearch
                    optionFilterProp="title"
                    optionLabelProp="label"
                    placeholder="Select from dropdown"
                    // onSearch={onSearchHandler}
                    onSelect={onSelectHandler}
                    // notFoundContent="Type the Complete Email"
                    className="text-base"
                  >
                    {state.InterviewersList.map((item) => <Option key={item.email} value={item.email} title={item.name} label={`${item.name} (${item.email})`}>{item.name}</Option>)}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Col>

          {state.SelectedInterviewer
            ? (
              <Col span={24} style={{ marginTop: '1rem', backgroundColor: '#fafbfb' }}>
                <Card>
                  <Row>
                    Contact Details
                  </Row>
                  <Row>
                    <CustomImage
                      src="/svgs/mail-icon.svg"
                      alt="mail icon"
                      width={20}
                      height={20}
                    />
                    <Paragraph style={{ paddingLeft: '0.2rem' }}>
                      {state.SelectedInterviewer.email}
                    </Paragraph>
                  </Row>
                  <Row>
                    {state.SelectedInterviewer.mobile
                      ? (
                        <>
                          <CustomImage src="/svgs/callbutton.svg" width={20} height={20} alt="call button icon" />
                          <Paragraph style={{ paddingLeft: '0.2rem' }}>

                            91-
                            {state.SelectedInterviewer.mobile}
                          </Paragraph>
                        </>
                      )
                      : null}
                  </Row>
                </Card>
              </Col>
            ) : null}
        </Row>
        <Form.Item>
          <Button
            htmlType="submit"
            type="primary"
            className="m-jobdetails-submit-btn"
            onClick={():void => {
              pushClevertapEvent('Job Coordinator', { Type: 'Save' });
            }}
            loading={submitInProgress}
          >
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default JobCoordinator;
