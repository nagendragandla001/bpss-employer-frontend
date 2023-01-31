import {
  Button, Card, Col, Form, Modal, Radio, Row,
} from 'antd';
import { ApiConstants } from 'constants/index';
import { isMobile } from 'mobile-device-detect';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { patchJobChanges } from 'screens/authenticated/JobDetails/Common/JobDetails.service';
import {
  JobDetailsType,
} from 'screens/authenticated/JobDetails/Common/JobDetails.utils';
import { pushClevertapEvent } from 'utils/clevertap';
import CustomImage from 'components/Wrappers/CustomImage';

require('screens/authenticated/JobDetails/Desktop/jobDetails.less');

const JobTitleSugg = dynamic(() => import('screens/authenticated/JobDetails/Common/JobTitle'));
const CompanySearchInput = dynamic(() => (import('components/StaticPages/Common/CompanySearchInput/CompanySearchInput.component')));
const config = {
  company: {
    label: 'Are you posting this job for your company?',
    name: 'owncompany',
  },
  otherCompany: {
    label: 'If No then please specify the name of Company',
    name: 'hiring_org_name',
    rules: [
      {
        required: true,
        message: 'please specify the name of Company!',
      },
      {
        whitespace: true,
        message: 'The name of Company cannot be empty!',
      },
    ],
  },
};
interface titleI{
  visible:boolean,
  onCancel:()=>void;
  data:JobDetailsType
  patchrequest:(string)=>void,
}
const JobTitle = (props:titleI):JSX.Element => {
  const {
    visible, onCancel, data, patchrequest,
  } = props;
  const [visibleOrg, setvisibleOrg] = useState(!!data.hiringOrgName);
  const [submitInProgress, setSubmitInProgress] = useState(false);
  const finishHandler = async (formData):Promise<void> => {
    setSubmitInProgress(true);
    // console.log(formData);
    const obj = {
      title: formData.title,
      hiring_org_name: formData.companyName || '',
    };

    const apiCall = await patchJobChanges(data.id, obj);
    if ([200, 201, 202].indexOf(apiCall.status) > -1) {
      setSubmitInProgress(false);
      patchrequest('success');
      onCancel();
    } else {
      setSubmitInProgress(false);
    }
  };
  return (
    <Modal
      visible={!!visible}
      footer={null}
      onCancel={onCancel}
      width={400}
      className={isMobile ? 'm-ct-app-actions-modal-mobile' : 'ct-modal-title'}
      title="Edit Job Title"
    >
      <Form
        layout="vertical"
        initialValues={{
          title: data.title,
          owncompany: data.hiringOrgName !== '' ? '2' : '1',
          companyName: data.hiringOrgName.length > 0 ? data.hiringOrgName : '',
        }}
        onFinish={finishHandler}
      >
        <JobTitleSugg />
        <Form.Item
          label={config.company.label}
          name={config.company.name}
          style={{ marginBottom: 16 }}
        >
          <Radio.Group
            onChange={(e): void => {
              if (e.target.value === '1') {
                setvisibleOrg(false);
              } else {
                setvisibleOrg(true);
              }
            }}
            className="radio-buttons text-base"
          >
            <Radio.Button value="1">Yes</Radio.Button>
            <Radio.Button value="2">No</Radio.Button>
          </Radio.Group>
        </Form.Item>

        {/* Hiring Org Name */}
        {
          visibleOrg ? (
            <CompanySearchInput
              selectHandler={(): boolean => true}
              // company={data.hiringOrgName}
            />

          ) : (
            <Card>
              <Row className="jd-display-flex">
                <Col>
                  <CustomImage src={data.organizationLogo} width={80} height={32} alt="logo" />
                </Col>
                <Col span={7} style={{ marginLeft: '1rem' }}>
                  <Row style={{ color: '#5b787c', fontSize: '12px' }}>
                    Company
                  </Row>
                  <Row style={{ color: '#002f34', fontSize: '14px' }}>
                    {data.organizationName}
                  </Row>
                </Col>
                <Col offset={isMobile ? 0 : 2}>
                  <Button
                    type="link"
                    icon={<CustomImage src="/svgs/edit.svg" width={24} height={24} alt="edit" />}
                    className="ct-edit-btn"
                    href={`${ApiConstants.COMPANY_API}`}
                  >
                    Edit
                  </Button>
                </Col>
              </Row>
            </Card>
          )
        }

        {isMobile
          ? (
            <div className="m-ct-feedback-modal-footer-mobile">
              <Button
                htmlType="submit"
                type="primary"
                className="green-primary-btn"
                loading={submitInProgress}
              >
                Save Changes

              </Button>

            </div>
          )
          : (
            <Form.Item>
              <Button
                htmlType="submit"
                type="primary"
                className="m-jobdetails-submit-btn"
                loading={submitInProgress}
                onClick={(): void => {
                  pushClevertapEvent('Special Click', { Type: 'Update Job Title' });
                }}
              >
                Save Changes

              </Button>
            </Form.Item>
          ) }

      </Form>
    </Modal>
  );
};
export default JobTitle;
