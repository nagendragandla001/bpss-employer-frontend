import { ArrowLeftOutlined } from '@ant-design/icons';
import {
  Button,
  Col, Form, FormInstance, Row, Space, Typography,
} from 'antd';
import Modal from 'antd/lib/modal/Modal';
import { IJobPost } from 'common/jobpost.interface';
import JobCity from 'components/JobPosting/JobCity';
import JobOpenings from 'components/JobPosting/JobOpenings';
import Locality from 'components/JobPosting/Locality';
import React, { useState } from 'react';
import { isMobile } from 'mobile-device-detect';
import { pushClevertapEvent } from 'utils/clevertap';

const { Text } = Typography;

interface ILocationReviewModal {
  visible: boolean;
  form: FormInstance;
  job: IJobPost;
  onClose: (value) => void;
  onSubmit: (value) => void;
  isNewUser: boolean;
}

const LocationReviewModal = (props: ILocationReviewModal): JSX.Element => {
  const {
    visible, onClose, form, job, onSubmit, isNewUser,
  } = props;

  const [state, setState] = useState({
    cityName: job?.cityName,
    locality: { value: job?.locality?.value, label: job?.locality?.label },
    vacancies: job?.vacancies,
  });

  const [geometry, setGeometry] = useState({});

  const handleCancel = (): void => {
    onClose(false);
  };

  const handleFormFinish = async (data): Promise<void> => {
    // console.log(state);
    onSubmit(state);
  };

  const getGeometry = (data): void => {
    // console.log(data);
    setGeometry(data);
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

  const onValuesChange = (formData): void => {
    pushClevertapEvent(`${isNewUser ? 'First' : 'New'} Job Post`, {
      Type: `${isNewUser ? 'First' : 'New'} Job Post Review`,
      field_modified: Object.keys(formData)?.[0],
    });
  };

  return (
    <Modal
      title={isMobile
        ? [
          <Row justify="space-between" key="filter-title">
            <Col>
              <Button onClick={handleCancel} type="link">
                <ArrowLeftOutlined />
              </Button>
              <Text strong className="text-base">Edit Location and Openings</Text>
            </Col>
            <Col className="m-clear-all">
              <Button form="locationReviewModal" type="text" htmlType="submit"><Text strong className="modal-button">Save</Text></Button>
            </Col>
          </Row>,
        ]
        : 'Edit Location and Openings'}
      visible={visible}
      onCancel={handleCancel}
      className={isMobile ? 'full-screen-modal m-jd-modal-container' : ''}
      footer={false}
      closable={!isMobile}
    >
      <Form
        id="locationReviewModal"
        form={form}
        name="review-job-details"
        layout="vertical"
        requiredMark={false}
        onFinish={handleFormFinish}
        onValuesChange={onValuesChange}
        initialValues={{
          cityName: job?.cityName,
          locality: { value: job?.locality?.value, label: job?.locality?.label },
          vacancies: job?.vacancies,
        }}
      >
        <Row align="middle">
          <Col span={24}>
            <JobCity
              callback={getGeometry}
              disabled={job?.disableFields}
              selectHandler={cityChangeHandler}
              city={job?.cityName}
            />
          </Col>
          <Col span={24}>
            <Locality
              city={state.cityName}
              geometry={geometry}
              selectedLocality={localityHandler}
              disabled={job?.disableFields}
            />
          </Col>
          <Col span={10}>
            <JobOpenings updateJobOpenings={vacanciesHandler} />
          </Col>

          <Col md={{ span: 24 }} xs={{ span: 0 }} className="text-center">
            <Space align="center">
              <Button
                size="small"
                type="link"
                className="text-semibold"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button size="small" type="primary" htmlType="submit">Continue</Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default LocationReviewModal;
