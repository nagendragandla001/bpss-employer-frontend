import {
  Tag, Row, Checkbox, Col, Divider, Typography, Space, Button,
} from 'antd';
import CustomerSupportActionModal from 'components/Layout/CustomerSupportAction/customerSupportActionModal';
import React, { useState } from 'react';
import { pushClevertapEvent } from 'utils/clevertap';

const { CheckableTag } = Tag;
const { Title, Text, Paragraph } = Typography;

interface IAssessmentData{
  active: boolean;
  description: string;
  id: string;
  title: string;
  skills: Array<string>;
}

interface IProps{
  addAssessmentHandler: (assessmentId: string) => void;
  assessmentData: Array<IAssessmentData>;
  setAssessmentData: (val: Array<IAssessmentData>) => void;
  jobState: string;
  selectedIds: Array<string>;
}

const Assessments = (props: IProps): JSX.Element => {
  const {
    addAssessmentHandler, assessmentData, setAssessmentData,
    jobState, selectedIds,
  } = props;
  const [isModalVisible, setModalVisibility] = useState(false);

  const assessmentCheckHandler = (value, assessmentId): void => {
    const newState = assessmentData?.map((assessmentObj) => {
      if (assessmentObj?.id === assessmentId) {
        return {
          ...assessmentObj,
          active: value,
        };
      }
      return assessmentObj;
    });
    setAssessmentData(newState);
    addAssessmentHandler(assessmentId);
  };

  return (
    <Space direction="vertical" className="assessment-container">
      <Title level={5} className="assessment-heading">Enable Assessment</Title>
      {assessmentData?.map((assessmentObj) => (
        <CheckableTag
          checked={selectedIds?.includes(assessmentObj?.id)}
          onChange={(val):void => {
            assessmentCheckHandler(val, assessmentObj?.id);
          }}
        >
          <Row align="middle">
            <Col xs={{ span: 2 }} md={{ span: 1 }}>
              <Checkbox
                onChange={(evt):void => {
                  assessmentCheckHandler(evt?.target?.checked, assessmentObj?.id);
                }}
                checked={selectedIds?.includes(assessmentObj?.id)}
              />
            </Col>
            <Col xs={{ span: 2 }} md={{ span: 1 }}>
              <Divider
                type="vertical"
                orientationMargin={0}
              />
            </Col>
            <Col xs={{ span: 20 }} md={{ span: 22 }}>
              <Space direction="vertical" size="small" align="start">
                <Title level={5} className="assessment-title">{assessmentObj?.title}</Title>
                <Paragraph className="assessment-desc">
                  This assessment evaluates candidates on the following skills
                </Paragraph>
                <Paragraph className="assessment-skills">
                  {assessmentObj?.description}
                </Paragraph>
              </Space>
            </Col>
          </Row>
        </CheckableTag>
      ))}
      <Text className="assessment-footer">
        Want customised assessment as per your requirements?
        &nbsp;
        <Button
          type="link"
          onClick={(): void => {
            pushClevertapEvent('Custom Assessment');
            setModalVisibility(true);
          }}
        >
          {' '}
          Contact Us

        </Button>
      </Text>
      {
        isModalVisible ? (
          <CustomerSupportActionModal
            title="Need a Customized Plan?"
            description="Let us know your requirements and our sales executive will reach out to you shortly"
            source="pricing_plan"
            closeHandler={(): void => {
              pushClevertapEvent('Custom Assessment', {
                Type: 'Cancel',
              });
              setModalVisibility(false);
            }}
            isLoggedInPage
            text="Custom plan request received"
          />
        ) : null
      }

    </Space>
  );
};

export default Assessments;
