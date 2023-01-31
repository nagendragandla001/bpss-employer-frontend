/* eslint-disable react/jsx-props-no-spreading */
import {
  Button, Col, Form, FormInstance, Modal, Row, Typography,
} from 'antd';

import React, { useState } from 'react';
import { pushClevertapEvent } from 'utils/clevertap';
import { patchJobChanges } from 'screens/authenticated/JobDetails/Common/JobDetails.service';
import JobCity from 'components/JobPosting/JobCity';
import JobOpenings from 'components/JobPosting/JobOpenings';
import Locality from 'components/JobPosting/Locality';
import { preapreLocationPatchChanges } from 'utils';
import { ArrowLeftOutlined } from '@ant-design/icons';

require('screens/authenticated/JobDetails/Mobile/editJobDetails/editJobDetails.less');

const { Text } = Typography;

type PropsModel = {
  onCancel: () => void,
  jobData: any,
  patchrequest: (msg) => void
  form:FormInstance
}
interface locationI{
  // eslint-disable-next-line camelcase
  place_id:string;
  vacancies:number;
}

const EditJobLocation = (props: PropsModel): JSX.Element => {
  const {
    onCancel, jobData, patchrequest, form,
  } = props;
  // const [form] = Form.useForm();
  const [submitInProgress, setSubmitInProgress] = useState(false);

  const [geometry, setGeometry] = useState({});
  const [state, setState] = useState({
    cityName: jobData?.cityName,
    locality: { value: jobData?.locality?.value, label: jobData?.locality?.label },
    vacancies: jobData?.vacancies,
  });

  const getGeometry = (geometryData): void => {
    setGeometry(geometryData);
  };

  const finishHandler = async (formData):Promise<void> => {
    // console.log(state);
    setSubmitInProgress(true);
    const patchObj = preapreLocationPatchChanges(formData);
    const apiCall = await patchJobChanges(jobData.id, patchObj);
    if ([200, 201, 202].indexOf(apiCall.status) > -1) {
    //  pushClevertapEvent('Special Click', { Type: 'Update Job Location' });
      setSubmitInProgress(false);
      patchrequest('success');
      onCancel();
    } else {
      setSubmitInProgress(false);
    }
  };

  const cityChangeHandler = (value): void => {
    setState((prev) => ({
      ...prev,
      cityName: value,
    }));
  };

  const localityHandler = (locality): void => {
    // console.log(locality);
    setState((prev) => ({
      ...prev,
      locality: { value: locality.place_id, label: locality.description },
    }));
  };

  const vacanciesHandler = (value: number | null): void => {
    setState((prev) => ({
      ...prev,
      vacancies: value || 0,
    }));
  };
  return (
    <Modal
      visible
      className="full-screen-modal m-jd-modal-container"
      closable={false}
      footer={null}
      destroyOnClose
      title={[
        <Row justify="space-between" key="filter-title">
          <Col>
            <Button onClick={onCancel} type="link">
              <ArrowLeftOutlined />
            </Button>
            <Text strong className="text-base">Edit Location and Openings</Text>
          </Col>

        </Row>,

      ]}
    >
      <Form
        layout="vertical"
        hideRequiredMark
        form={form}
        initialValues={{
          cityName: jobData?.cityName,
          locality: { value: jobData?.locality?.value, label: jobData?.locality?.label },
          vacancies: jobData?.vacancies,
        }}
        onFinish={finishHandler}
      >
        <Row gutter={24}>
          <Col span={24}>
            <JobCity
              callback={getGeometry}
              disabled={jobData?.disableFields}
              selectHandler={cityChangeHandler}
              city={jobData?.cityName}
            />
          </Col>
          <Col span={24}>
            <Locality
              city={state.cityName}
              geometry={geometry}
              disabled={jobData?.disableFields}
              selectedLocality={localityHandler}
            />
          </Col>
          <Col span={10}>
            <JobOpenings updateJobOpenings={vacanciesHandler} />
          </Col>

        </Row>
        <Form.Item className="modal-action">
          <Button
            type="primary"
            block
            htmlType="submit"
            onClick={(): void => {
              pushClevertapEvent('Special Click', { Type: 'Update Job Location' });
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

export default EditJobLocation;
