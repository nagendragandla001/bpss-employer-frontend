/* eslint-disable no-underscore-dangle */
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import {
  Checkbox,
  Col,
  Form, Input, Modal, Row, Space, Typography,
} from 'antd';
import
Button from 'antd/lib/button';
import snackBar from 'components/Notifications';
import CustomImage from 'components/Wrappers/CustomImage';
import React, { useState } from 'react';
import { dismissCandidate, getRejectionReasons, shortlistCandidate } from 'service/application-card-service';
import { pushClevertapEvent } from 'utils/clevertap';
import { isApiSuccessful } from 'utils/common-utils';
import { CMSInterface } from '../Common/ApplicationTabUtils';

require('screens/authenticated/ApplicationsTab/Desktop/applicationActions.less');

const { Text, Paragraph } = Typography;

interface PropsI{
  contactUnlocked:boolean;
  candidateId:string;
  jobId:string;
  jobTitle:string;
  updateDismissedCandidate: (id) => void;
  cms: CMSInterface;
  applicationStage: string;
  appliedJobTitle:string;
  appliedJobLocation: string;
  candidateName: string;
  gender: string;
  profileAvatarIndex: number;
  preSkilled: boolean;
}

type rejectionReason={
  id: number;
  reason: string;
}

const DatabaseApplicationActions = (props:PropsI) : JSX.Element => {
  const {
    contactUnlocked, candidateId, jobId, jobTitle, updateDismissedCandidate, cms,
    applicationStage, appliedJobLocation, appliedJobTitle, candidateName,
    gender, profileAvatarIndex,
    preSkilled,
  } = props;

  const [dismissModal, setDismissModal] = useState(false);
  const [rejectionReasons, setRejectionReasons] = useState<Array<rejectionReason>>([]);
  const [reasonIdSelected, setReasonIdSelected] = useState(0);
  const [othersId, setOthersId] = useState(0);
  const [requestInProgress, setRequestInProgress] = useState<''|'skip'|'submit'>('');
  const [state, setState] = useState({
    reason: false,
  });

  const [form] = Form.useForm();

  const showSnackbar = (title:string, description:string,
    iconName:string, notificationType: string) :void => {
    snackBar({
      title,
      description,
      iconName,
      notificationType,
      placement: 'bottomRight',
      duration: 5,
    });
  };

  const dismissHandler = async (): Promise<void> => {
    const apiCall = await getRejectionReasons('CA_DB_RECO', 'CA_D');
    if (isApiSuccessful(apiCall?.status)) {
      const response = await apiCall.data;
      const tempReasons = response.objects.map((item) => ({
        id: item.id,
        reason: item.name,
      }));
      setRejectionReasons(tempReasons);
      const otherReason = tempReasons.filter(((reason) => reason.reason === 'Other'));
      setOthersId(otherReason?.[0]?.id);
      setDismissModal(true);
    }
  };
  const shortlistHandler = async ():Promise<void> => {
    const apiCall = await shortlistCandidate(candidateId, jobId);
    if (isApiSuccessful(apiCall?.status)) {
      showSnackbar(`Candidate shortlisted for ${jobTitle} job. Waiting for candidate confirmation.`, '', 'congratsIcon.svg',
        'info');
      pushClevertapEvent('Shortlist', {
        Page: 'Database (Candidates Tab)',
        Status: 'S',
        cms_match: cms?.score,
        'pre-skilled': preSkilled,
      });
      updateDismissedCandidate(candidateId);
    } else {
      pushClevertapEvent('Shortlist', {
        Page: 'Database (Candidates Tab)',
        Status: 'F',
        cms_match: cms?.score,
        'pre-skilled': preSkilled,
      });
    }
  };

  const onFinishHandler = async (formData): Promise<void> => {
    let patchObject = [] as any;
    patchObject = {
      job_id: jobId,
      reason_ids: formData.rejectionReasons,
    };
    if (formData.rejectionReasons && formData.rejectionReasons.indexOf(othersId) > -1) {
      patchObject.comment = formData.comment;
    }
    if (!formData.rejectionReasons || formData.rejectionReasons.length === 0) {
      delete patchObject.reason_ids;
    }
    const apiCall = await dismissCandidate(candidateId, patchObject);
    setRequestInProgress('');
    setDismissModal(false);
    if (isApiSuccessful(apiCall?.status)) {
      showSnackbar('Application Rejected',
        `${candidateName} is dismissed for the job - ${appliedJobTitle}
      ${appliedJobLocation ? `- ${appliedJobLocation.split(',')[0]}` : ''}`, 'rejectedIcon.png',
        'error');
      updateDismissedCandidate(candidateId);
    }
  };

  const getModalFooterButton = (): JSX.Element => (
    <Space className="feedback-modal-footer">
      <Button
        key="back"
        type="link"
        loading={requestInProgress === 'skip'}
        disabled={requestInProgress === 'submit'}
        className="link-btn"
        onClick={(): void => {
          setRequestInProgress('skip');
          form.submit();
        }}
      >
        Skip
      </Button>
      <Button
        key="submit"
        type="primary"
        loading={requestInProgress === 'submit'}
        disabled={requestInProgress === 'skip'}
        className="primary-btn"
        onClick={(): void => {
          form.submit();
          if (form.getFieldsError().length < 2) { setRequestInProgress('submit'); }
        }}
      >
        Submit
      </Button>
    </Space>
  );

  return (
    <>
      <Button
        shape="round"
        onClick={dismissHandler}
        icon={<CloseOutlined style={{ color: '#a51616', fontSize: '0.9rem' }} />}
        className="app-actions-two-btn"
      >
        Dismiss
      </Button>
      {contactUnlocked
        ? (
          <Button
            shape="round"
            onClick={shortlistHandler}
            icon={<CheckOutlined style={{ color: ' #36992e', fontSize: '0.9rem' }} />}
            className="app-actions-two-btn"
          >
            Shortlist
          </Button>
        ) : null}
      {dismissModal && (
        <Modal
          title={<Text>Mark As Rejected</Text>}
          visible={dismissModal}
          onCancel={(): void => { setDismissModal(false); }}
          destroyOnClose
          closeIcon={<CloseOutlined style={{ color: '#284e52', fontSize: '1.5rem' }} />}
          className="app-actions-modal"
          maskStyle={{ background: 'rgb(0, 20, 67,0.8)' }}
          footer={getModalFooterButton()}
        >
          <Form
            name="FeedbackForm"
            layout="vertical"
            size="large"
            form={form}
            onFinish={onFinishHandler}
            className="feedback-modal-content"
            hideRequiredMark
          >
            <Space className="app-actions-rejection-reasons" direction="vertical" style={{ width: '100%' }}>
              <Row>
                <Col span={4}>
                  <CustomImage
                    src={`/images/application-tab/${gender || 'F'}avatar${gender ? profileAvatarIndex : '0'}.svg`}
                    alt="icon"
                    width={48}
                    height={48}
                    className="width-height-48"
                  />
                </Col>
                <Col span={18}>
                  <Row>
                    <Col span={24}>
                      <Paragraph
                        className="feedback-modal-candidate-name"
                        ellipsis
                      >
                        {candidateName}
                      </Paragraph>
                    </Col>
                    <Col span={24}>
                      <Paragraph className="display-flex">
                        <Text className="ac-light-gray-text ac-display-inline word-break text-small">
                          {`for ${appliedJobTitle} ${appliedJobLocation ? `- ${appliedJobLocation.split(',')[0]}` : ''}`}
                        </Text>
                      </Paragraph>
                    </Col>
                  </Row>
                </Col>
                <Col span={2}>
                  <CustomImage
                    src="/icons/notification-icons/rejectedIcon.png"
                    alt="icon"
                    width={36}
                    height={36}
                    className="width-height-48"
                  />
                </Col>
              </Row>

              <Text className="title">What was the reason for rejecting?</Text>
              <Form.Item
                name="rejectionReasons"
                className="p-top-sm"
              >
                <Checkbox.Group onChange={(value):void => {
                  if (value.indexOf(othersId) > -1) {
                    setState((prevState) => ({
                      ...prevState,
                      reason: true,
                    }));
                  } else {
                    setState((prevState) => ({
                      ...prevState,
                      reason: false,
                    }));
                  }
                }}
                >
                  {rejectionReasons.map((item) => (
                    <Row key={item.id}>
                      <Col span={24} className="checkbox">
                        <Checkbox
                          value={item.id}
                          onClick={():void => {
                            pushClevertapEvent('Special Click', {
                              Type: 'Rejection Reasons',
                              Value: `${item.reason}`,
                              cms_match: cms?.score,
                            });
                          }}
                        >
                          {item.reason}

                        </Checkbox>
                      </Col>
                    </Row>
                  ))}
                </Checkbox.Group>
              </Form.Item>
              {state.reason
                ? (
                  <Form.Item
                    name="comment"
                    rules={[{
                      required: true,
                      message: 'Please enter the reason',
                    }]}
                  >
                    <Input size="small" placeholder="Enter The reason" />
                  </Form.Item>
                )
                : null}
            </Space>
          </Form>
        </Modal>
      )}
    </>
  );
};

export default DatabaseApplicationActions;
