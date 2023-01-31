/* eslint-disable no-nested-ternary */
import React, { useState } from 'react';
import {
  Form, Radio, Row, Col, Input, Button,
} from 'antd';
import { EmailRegexPattern, MobileRegexPattern, skypeIDPattern } from 'utils/constants';
import { FormInstance } from 'antd/lib/form';
import CustomImage from 'components/Wrappers/CustomImage';

interface PropsModel {
  form: FormInstance;
  onVideoScreenFinishHandler: (data) => void;
  setinterviewTypeFormat: (data) => void;
  interviewTypeFormat: string;
  loading:boolean
}

const InterviewVideo = (props: PropsModel): JSX.Element => {
  const {
    form, onVideoScreenFinishHandler,
    setinterviewTypeFormat, interviewTypeFormat, loading,
  } = props;

  const [input, setInput] = useState(false);

  const typeMap = {
    WHATSAPP_VID: {
      label: 'Mobile Number for WhatsApp call',
      requiredMessage: 'Please provide mobile number',
      patternMessage: 'Please provide valid mobile number',
      regexp: MobileRegexPattern,
    },
    HANG_VID: {
      label: 'Email Id for Hangouts call:',
      requiredMessage: 'Please provide  email Id',
      patternMessage: 'Please provide valid email Id',
      regexp: EmailRegexPattern,
    },
    VID: {
      label: 'Please provide skype Id',
      requiredMessage: 'Please provide skype Id',
      patternMessage: 'Please provide valid skype Id',
      regexp: skypeIDPattern,
    },
    OTHER: {
      label: 'Video Interview Address',
      requiredMessage: 'Please provide interview address',
      patternMessage: 'Please provide valid interview address',
      regexp: EmailRegexPattern,
    },

  };

  const videoTypes = [
    {
      type: 'whatsapp',
      id: 'WHATSAPP_VID',
      label: 'Whatsapp Video Call',
    },
    {
      type: 'skype',
      id: 'VID',
      label: 'Skype Call',
    },
    {
      type: 'hangouts',
      id: 'HANG_VID',
      label: 'Google Hangouts',
    },
    {
      type: 'video',
      id: 'OTHER',
      label: 'Other',
    },
  ];

  return (
    <Form
      layout="vertical"
      form={form}
      initialValues={{
        // mode: 'HANG_VID',
      }}
      onFinish={onVideoScreenFinishHandler}
    >
      <Form.Item
        name="mode"
        rules={[{ required: true, message: 'Please select mode of video call' }]}
        style={{ marginBottom: 32 }}
      >
        <Radio.Group className="full-width video-types">
          {
            videoTypes.map((videoType, index) => (
              <Row key={videoType.id}>
                <Col span={3} style={{ margin: 'auto' }}>
                  <CustomImage
                    src={`/svgs/${videoType.type}.svg`}
                    height={48}
                    width={48}
                    alt={videoType.type}
                  />
                </Col>
                <Col span={21} style={{ paddingRight: '32px' }} className={index !== (videoTypes.length - 1) ? 'page-0-btn-divider' : ''}>
                  <Radio
                    value={videoType.id}
                    className="radio-reverse radio-suggest"
                    style={{ fontSize: '16px', color: '#284e52' }}
                    onClick={():void => {
                      setinterviewTypeFormat(videoType.id);
                      setInput(true);
                    }}
                  >
                    {videoType.label}
                  </Radio>
                </Col>
              </Row>
            ))
          }
        </Radio.Group>
      </Form.Item>
      {input
        ? (
          <Row>
            <Col span={24}>
              <Form.Item
                label={typeMap[interviewTypeFormat].label}
                name="videoValue"
                rules={[
                  {
                    required: true,
                    message: typeMap[interviewTypeFormat].requiredMessage,
                  },
                  {
                    pattern: typeMap[interviewTypeFormat].regexp,
                    message: typeMap[interviewTypeFormat].patternMessage,
                  },
                ]}
              >
                <Input
                  prefix={interviewTypeFormat === 'WHATSAPP_VID' ? '91' : null}
                  className="app-actions-feedback-input"
                  size="large"
                  allowClear
                />
              </Form.Item>
            </Col>

          </Row>
        ) : ''}

      <Button
        type="primary"
        htmlType="submit"
        block
        className="interview-btn"
        loading={loading}
      >
        Send Invite
      </Button>
      ,
    </Form>

  );
};

export default InterviewVideo;
