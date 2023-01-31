import {
  Button, Col, Divider, Form, Input, Modal, Row,
} from 'antd';
import snackBar from 'components/Notifications';
import CustomImage from 'components/Wrappers/CustomImage';
import { isMobile } from 'mobile-device-detect';
import React, { useState } from 'react';
import { OrganizationDetailsType } from 'screens/authenticated/CompanyTab/Common/CompanyTabUtils';
import Logo from 'screens/authenticated/CompanyTab/Common/Logo';
import { patchOrgDetails } from 'service/organization-service';
import { pushClevertapEvent } from 'utils/clevertap';
import {
  CompanyPattern,
  facebookPattern, glassdoorPattern, linkedinPattern,
  twitterPattern, WebsiteRegexPattern,
} from 'utils/constants';

interface propsI{
  visibleModal:boolean,
  onCancel:()=>void,
  data:OrganizationDetailsType;
  patchrequest :(any)=>void
}

const CompanyDetails = (props:propsI):JSX.Element => {
  const {
    visibleModal, onCancel, data, patchrequest,
  } = props;
  const [submitInProgress, setSubmitInProgress] = useState(false);

  const checkHttp = (link):boolean => {
    if (link.indexOf('http') > -1 || link.indexOf('https') > -1) {
      return true;
    }
    return false;
  };
  const finishHandler = async (formData):Promise<void> => {
    setSubmitInProgress(true);
    let websiteLink = formData.website;
    if (formData.website && formData.website.length > 0) {
      if (!checkHttp(formData.website)) {
        websiteLink = `https://${formData.website}`;
      }
    }

    const patchobj = {
      name: formData.name,
      popular_name: formData.popularName,
      tag_line: formData.tagline,
      website: formData.website && formData.website.length > 0 ? websiteLink : null,
      social_links: {
        facebook: formData.facebook && formData.facebook.length > 0 ? formData.facebook : null,
        twitter: formData.twitter && formData.twitter.length > 0 ? formData.twitter : null,
        glassdoor: formData.glassdoor && formData.glassdoor.length > 0 ? formData.glassdoor : null,
        linkedin: formData.linkedin && formData.linkedin.length > 0 ? formData.linkedin : null,
      },
      id: data.id,
    };
    const res = await patchOrgDetails(patchobj, data.id);
    if ([200, 201, 202].indexOf(res.status) > -1) {
      setSubmitInProgress(false);
      pushClevertapEvent('Profile General Details', { Type: 'Save', Status: 'Success' });
      onCancel();
      patchrequest('success');
    } else {
      setSubmitInProgress(false);
      pushClevertapEvent('Profile General Details', { Type: 'Save', Status: 'Failure' });
      snackBar({
        title: 'Your details cannot be saved right now Please try again after some time',
        description: '',
        iconName: '',
        notificationType: 'error',
        placement: 'topRight',
        duration: 5,
      });
    }
  };

  return (
    <Modal
      visible={!!visibleModal}
      onCancel={onCancel}
      title="General Details"
      width={550}
      okText="Save & Close"
      className={isMobile ? 'm-ct-app-actions-modal-mobile' : 'ct-modal-title'}
      footer={null}
      closable={false}
    >
      <Form
        layout="vertical"
        initialValues={{
          name: data.name,
          popularName: data.popularName,
          tagline: data.tagline,
          website: data.website,
          facebook: data.facebook,
          linkedin: data.linkedin,
          twitter: data.twitter,
          glassdoor: data.glassdoor,
        }}
        onFinish={finishHandler}
      >
        <Row>
          <Col span={8}>
            <Logo
              photos={data?.logo}
              id={data?.id}
              size="100px"
              handlelogo={(): boolean => true}
              source="modal"
            />
          </Col>
          <Col span={15}>
            <Form.Item
              label="Registered Names"
              name="name"
              rules={[
                {
                  required: true,
                  message: 'Please input Registered name!',
                },
                {
                  max: 50,
                  message: 'Registered name cannot be more than 50 characters',
                }, {
                  pattern: CompanyPattern,
                  message: 'Invalid Company Name',
                },
              ]}
            >
              <Input
                className="ct-app-actions-feedback-input"
                size="large"
                allowClear
                placeholder="Enter Registered Name"
              />
            </Form.Item>
            <Form.Item
              label="Popular Name"
              name="popularName"
              rules={[
                {
                  max: 50,
                  message: 'Popular name cannot be more than 50 characters',
                }, {
                  pattern: CompanyPattern,
                  message: 'Invalid Popular Name',
                },
              ]}
            >
              <Input
                className="ct-app-actions-feedback-input"
                size="large"
                allowClear
                placeholder="Enter Popular Name"
              />
            </Form.Item>
            <Form.Item
              label="Tagline"
              name="tagline"
            >
              <Input
                className="ct-app-actions-feedback-input"
                size="large"
                allowClear
                placeholder="Enter Tagline"
              />
            </Form.Item>
            <Form.Item
              label="Website"
              name="website"
              rules={[
                {
                  pattern: WebsiteRegexPattern,
                  message: 'This is not valid url',
                },
              ]}
            >
              <Input
                className="ct-app-actions-feedback-input"
                size="large"
                allowClear
                placeholder="Enter Website"
              />
            </Form.Item>
          </Col>
        </Row>
        <Divider dashed />
        <Row className="ct-des-profile">
          Public Profile Link
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item
              label="Facebook"
              name="facebook"
              className="ct-detail-link-btn"
              rules={[
                {
                  pattern: facebookPattern,
                  message: 'This is not valid url',
                },
              ]}
            >
              <Input
                allowClear
                placeholder="Enter URL"
                prefix={(
                  <CustomImage
                    src="/images/company-tab/ct-fb-modal.svg"
                    width={17}
                    height={16}
                    alt="facebook-icon"
                  />
                )}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Linkedin"
              name="linkedin"
              className="ct-detail-link-btn"
              rules={[
                {
                  pattern: linkedinPattern,
                  message: 'This is not valid url',
                },
              ]}
            >
              <Input
                allowClear
                placeholder="Enter URL"
                prefix={(
                  <CustomImage
                    src="/images/company-tab/ct-li-modal.svg"
                    width={17}
                    height={16}
                    alt="linkedin-icon"
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item
              label="Twitter"
              name="twitter"
              className="ct-detail-link-btn"
              rules={[
                {
                  pattern: twitterPattern,
                  message: 'This is not valid url',
                },
              ]}
            >
              <Input
                allowClear
                placeholder="Enter URL"
                prefix={(
                  <CustomImage
                    src="/images/company-tab/ct-tw-modal.svg"
                    width={17}
                    height={15}
                    alt="twitter-icon"
                  />
                )}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Glassdoor"
              name="glassdoor"
              className="ct-detail-link-btn"
              rules={[
                {
                  pattern: glassdoorPattern,
                  message: 'This is not valid url',
                },
              ]}
            >
              <Input
                allowClear
                placeholder="Enter URL"
                prefix={(
                  <CustomImage
                    src="/images/company-tab/glassdoor-link.svg"
                    width={12}
                    height={16}
                    alt="glassdoor-icon"
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>
        <Button
          htmlType="submit"
          className="ct-cancel-btn"
          onClick={():void => {
            onCancel();
            pushClevertapEvent('Profile General Details', { Type: 'Cancel' });
          }}
        >
          Cancel
        </Button>
        <Button
          htmlType="submit"
          className="ct-save-btn"
          loading={submitInProgress}
        >
          Save & Close
        </Button>
      </Form>

    </Modal>
  );
};

export default CompanyDetails;
