import React from 'react';
import {
  Form, Row, Col, DatePicker, Select, Button,
} from 'antd';
import { InterviewTimingsArray } from 'constants/enum-constants';
import { FormInstance } from 'antd/lib/form';
import moment from 'moment';
import CustomImage from 'components/Wrappers/CustomImage';

const { Option } = Select;

interface PropsModel {
  confirmedbycandidateHandler: (data) => void;
  form: FormInstance
}

const ConfirmedByCandidate = (props: PropsModel):JSX.Element => {
  const { confirmedbycandidateHandler, form } = props;

  const hours = InterviewTimingsArray();

  return (
    <Form
      onFinish={confirmedbycandidateHandler}
      hideRequiredMark
      form={form}
      scrollToFirstError
    >
      <Row>
        <Col span={24}>
          <Form.Item
            label="Interview Date"
            name="InterviewDate"
            className="form-item-title-grey"
            rules={[{
              required: true,
              message: 'Interview timings are required',
            }]}
            validateTrigger={['onBlur']}
            style={{ marginBottom: 30 }}
          >
            <DatePicker
              defaultPickerValue={moment().add(1, 'd')}
              style={{ width: '100%' }}
              placeholder="DD/MM/YYYY"
              size="large"
              className="app-actions-feedback-input-mobile"
              disabledDate={(current): boolean => current && (current < moment() || current > moment().add(23, 'd'))}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            label="Interview Time"
            name="startTime"
            rules={[{
              required: true,
              message: 'Interview timings are required',
            }]}
            validateTrigger={['onBlur']}
          >
            <Select
              style={{ width: '100%' }}
              className="m-dropdown"
              placeholder="Start Time"
            >
              {
                hours.map((h) => (
                  <Option value={h} key={Math.random()}>
                    {h}
                  </Option>
                ))
              }
            </Select>
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
  );
};

export default ConfirmedByCandidate;
