import React, { useState } from 'react';
import {
  Form, Row, Col, Checkbox, Button, Alert,
} from 'antd';
import { FormInstance } from 'antd/lib/form';
import CustomImage from 'components/Wrappers/CustomImage';

interface InterviewRepeatDaysInterface {
  label: string;
  repeatSlotsDate: string;
  repeatSlotsDay: string;
  value: string;
  display: string;
  dayDisplay: string;
  dated:string;
  dateDisplay: string;
}

interface PropsModel {
  onFirstScreenFinishHandler : (data) => void;
  handleScreenChange: (type) => void;
  InterviewRepeatDates: Array<InterviewRepeatDaysInterface>;
  form: FormInstance
  initrep:any;
}

const InterviewSlots = (props: PropsModel): JSX.Element => {
  const {
    onFirstScreenFinishHandler, handleScreenChange, InterviewRepeatDates, form, initrep,
  } = props;
  const [warningMsg, setWarningMsg] = useState(false);
  const hint1 = 'Providing more available days will ensure that candidates get flexibility while booking ';

  // const initrep = [] as any;

  // const onFirstScreenFinishHandler = async (formData): Promise<void> => {
  //   const arr = [] as any;
  //   formData.repeatSlots.map((slot) => {
  //     if (!(arr.indexOf(slot) > -1)) { arr.push(slot); }
  //     return true;
  //   });
  //   setFirst(arr);
  //   handleScreenChange('second');
  // };

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
                {InterviewRepeatDates.map((item: InterviewRepeatDaysInterface) => (
                  <Col key={item.value}>
                    <Checkbox value={item.repeatSlotsDate}>
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
        {warningMsg
          ? (
            <Col span={24} className="m-top-8">
              <Alert
                message={hint1}
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
            </Col>

          ) : ''}

        <Col span={24} className="slot-action-container">
          <Button
            type="link"
            htmlType="submit"
            className="slot-action"
            onClick={():void => { handleScreenChange('confirmedbycandidate'); }}
            icon={(
              <CustomImage
                src="/svgs/hint.svg"
                width={16}
                height={16}
                className="slot-hint"
                alt="hint"
              />
            )}
          >
            Already Confirmed with Candidate ?
          </Button>
        </Col>

      </Row>
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
    </Form>
  );
};

export default InterviewSlots;
