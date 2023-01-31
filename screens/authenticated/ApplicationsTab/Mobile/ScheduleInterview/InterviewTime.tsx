import React, { useState } from 'react';
import {
  Form, Row, Col, Select, Radio, Button,
} from 'antd';
import { InterviewRangePickerValues } from 'constants/enum-constants';
import { FormInstance } from 'antd/lib/form';
import DownOutlined from '@ant-design/icons/DownOutlined';
import moment from 'moment';
import CustomImage from 'components/Wrappers/CustomImage';

const { Option } = Select;

interface PropsModel {
  onSecondScreenFinishHandler: (data) => void;
  form: FormInstance
}

interface StateModel {
  InterviewStartTime: string,
  InterviewEndTime: string,
  InterviewDuration: string
}

const InterviewTime = (props: PropsModel): JSX.Element => {
  const { onSecondScreenFinishHandler, form } = props;

  const [state, setState] = useState<StateModel>({
    InterviewStartTime: '8:00:00',
    InterviewEndTime: '17:00:00',
    InterviewDuration: '30',
  });

  const validateInterviewRange = (value, checkValueof, index): Promise<void> => {
    const selectedValue = value.toString();
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
  const validateInterviewDuartion = async (_rule, checkvalue): Promise<void> => {
    const start = moment(state.InterviewStartTime, 'hh:mm');
    const end = moment(state.InterviewEndTime, 'hh:mm');

    // const duration = moment(state.InterviewStartTime) - moment(state.InterviewEndTime);
    const duration = moment.duration(end.diff(start));
    const mins = duration.asMinutes();
    if (mins >= parseInt(checkvalue, 10)) { return Promise.resolve(); }
    return Promise.reject(new Error('Interview duration cannot be more than available timings'));
  };
  return (
    (
      <>
        <Form
          onFinish={onSecondScreenFinishHandler}
          form={form}
          initialValues={{
            InterviewDuration: '30',
            InterviewStartTime: '8:00:00',
            InterviewEndTime: '17:00:00',
          }}
        >
          <Row className="form-title">
            <Col span={24}>
              Available hours
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item
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
                  className="m-dropdown"
                  placeholder="Start Time"
                  suffixIcon={<DownOutlined />}
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

            <Col span={12}>
              <Form.Item
                name="InterviewEndTime"
                className="m-dropdown"
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
            <Col span={24}>
              <Form.Item
                label="Interview Duration:"
                name="InterviewDuration"
                className="form-item-title-grey"
                validateTrigger={['onBlur']}
                style={{ marginBottom: 30 }}
                rules={[{ validator: validateInterviewDuartion }]}
              >
                <Radio.Group className="radio-buttons-interview text-base">
                  <Radio.Button value="15">15 mins</Radio.Button>
                  <Radio.Button value="30">30 mins</Radio.Button>
                  <Radio.Button value="60">1 hr</Radio.Button>
                  <Radio.Button value="90">1.5 hr</Radio.Button>
                </Radio.Group>
              </Form.Item>
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
      </>
    )
  );
};

export default InterviewTime;
