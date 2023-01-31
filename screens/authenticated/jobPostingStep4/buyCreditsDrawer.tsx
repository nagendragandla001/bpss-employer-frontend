/* eslint-disable import/no-cycle */
import { CloseOutlined, RightOutlined } from '@ant-design/icons';
import {
  Button, Carousel, Checkbox, Col, Drawer, Form, Input, Row, Typography,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import { isMobile } from 'mobile-device-detect';
import React, { useState } from 'react';
import { OrgOfficesListType } from 'screens/authenticated/JobsTab/Common/JobsTabUtils';
// import AddNewAddressModal from
// 'screens/authenticated/JobsTab/Desktop/addSlots/addNewAddressModal';
import { createInvoice, CreateInvoicePostDataType } from 'service/organization-service';
import { logEvent } from 'utils/analytics';
import { GSTNumberRegexPattern } from 'utils/constants';
import { pushClevertapEvent } from 'utils/clevertap';
import router from 'routes';
import dynamic from 'next/dynamic';
import { PricingPlanType } from 'screens/authenticated/jobPostingStep4/commonTypes';

const AddNewAddressModal = dynamic(() => import('screens/authenticated/JobsTab/Desktop/addSlots/addNewAddressModal'), { ssr: false });
require('screens/authenticated/jobPostingStep4/buyCreditsDrawer.less');

const { Text, Paragraph, Title } = Typography;

type PropsType={
  onCloseHandler:()=>void;
  orgOffices:Array<OrgOfficesListType>;
  productId: number;
  plan: PricingPlanType | any;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Arrow = ({ onClick }: any): JSX.Element => (
  <Button onClick={onClick} className="carousel-arrows">
    <RightOutlined className="rightarrow" />
  </Button>
);

const BuyPremiumCreditsDrawer = (props: PropsType):JSX.Element => {
  const {
    onCloseHandler, orgOffices, productId, plan,
  } = props;
  const [buyCreditsForm] = Form.useForm();
  const [officesCarouselLoaded, setOfficesCarouselLoaded] = useState(false);
  const [showAddNewAddressModal, setShowAddNewAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(orgOffices
      && orgOffices.length > 0 ? [orgOffices[0].id] : []);
  const [officeLocations, setOfficeLocations] = useState(orgOffices);
  const [gstInput, setGstInput] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const addressOnChangeHandler = (value): void => {
    pushClevertapEvent('Buy Plan', {
      Type: 'Select Address',
    });
    const diff = value.filter((item) => !selectedAddress.includes(item));
    setSelectedAddress(diff);
    buyCreditsForm.setFieldsValue({
      officeAddress: diff,
    });
  };

  const addNewAddressHandler = (updateObject:OrgOfficesListType) :void => {
    pushClevertapEvent('Buy Plan', {
      Type: 'Save Address',
    });
    const newOfficesList = [...officeLocations];
    newOfficesList.unshift(updateObject);
    setOfficeLocations(newOfficesList);
    setSelectedAddress([updateObject.id]);
    setShowAddNewAddressModal(false);
    buyCreditsForm.setFieldsValue({
      officeAddress: [updateObject.id],
    });
  };

  const createPostObject = (formData): CreateInvoicePostDataType => ({
    address_id: formData.officeAddress[0] ? formData.officeAddress[0] : null,
    // job_id: jobId,
    quantity: 1,
    product_id: productId,
    client_gst_reg_num: formData.gstNo,
  });

  const logPricingSubmitEvent = (): void => {
    const trackObj = {
      category: 'job_post',
      action: 'pricing_plan_submit',
      label: 'pricing_plan',
      nonInteraction: false,
    };
    logEvent(trackObj);
  };

  const OnSubmitHandler = async (formData): Promise<void> => {
    logPricingSubmitEvent();
    // Creating Invoice and Redirecting to Invoice Page
    const postObject = createPostObject(formData);
    const apiCall = await createInvoice(postObject);
    const response = await apiCall.data;
    if ([200, 201, 202].indexOf(apiCall.status) > -1 && response && response.external_invoice_id) {
      setErrorMessage('');
      pushClevertapEvent('Buy Plan', {
        Type: formData.gstNo ? 'GST' : 'Submit Address',
        GST: formData.gstNo ? 'True' : 'False',
        Status: 'S',
      });
      router.Router.pushRoute(
        'InvoiceDetails',
        { id: response.external_invoice_id.toUpperCase() },
      );
    } else {
      if (apiCall?.response?.status === 400) {
        setErrorMessage(apiCall?.response?.data?.message);
      }
      pushClevertapEvent('Buy Plan', {
        Type: formData.gstNo ? 'GST' : 'Submit Address',
        GST: formData.gstNo ? 'True' : 'False',
        Status: 'F',
        Error: (apiCall?.response?.data?.type as string) === 'ValueError',
      });
    }
  };

  const onValuesChange = (formData) => {
    if (formData?.gstNo) {
      if (!gstInput) {
        pushClevertapEvent('Buy Plan', {
          Type: 'Add GST',
        });
        setGstInput(true);
      }
    }
  };

  const getBuyCreditsForm = ():JSX.Element => (
    <Form
      name="pricingSelectForm"
      form={buyCreditsForm}
      onFinish={OnSubmitHandler}
      onValuesChange={onValuesChange}
      layout="vertical"
      hideRequiredMark
      size="large"
      initialValues={{
        officeAddress: selectedAddress,
      }}
    >
      <Row>
        <Col xs={{ span: 14 }} md={{ span: 12 }}>
          <Form.Item
            name="gstNo"
            label="Enter your GST no."
            extra="Address state and GST state should match"
            rules={[
              {
                pattern: GSTNumberRegexPattern,
                message: 'Please Enter a valid GST number',
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Form.Item
            name="officeAddress"
            label="Office Address:"
            rules={[{
              required: true,
              message: 'Office address is required',
            }]}
          >
            {officeLocations.length > 0 ? (
              <Checkbox.Group
                className="p-top-8"
                onChange={addressOnChangeHandler}
                value={selectedAddress}
                style={{ display: 'flex' }}
              >
                <Carousel
                  autoplay={false}
                  slidesToShow={officeLocations.length > 2 ? 2
                    : officeLocations.length}
                  slidesToScroll={2}
                  style={{ width: 'auto', maxWidth: `${isMobile ? '95vw' : '592px'}` }}
                  nextArrow={<Arrow type="right" />}
                  className="buy-credits-offices-carousel"
                  arrows
                  useCSS
                  useTransform
                  variableWidth={officesCarouselLoaded}
                  infinite
                  onInit={():void => setOfficesCarouselLoaded(true)}
                >
                  {officeLocations.map((item, index) => (
                    <div key={item.id}>
                      <Checkbox
                        value={item.id}
                        className="carousel-checkbox"
                      >
                        <div className="checkbox-content text-small">
                          <Paragraph className="interview-address">
                            {item.address}
                          </Paragraph>
                          <div className="flex-align-center flex-justify-end">
                            <a
                              href={item.mapsLink}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <CustomImage
                                src={`/images/application-tab/address${index % 8}.jpg`}
                                alt="map-img"
                                className="map-img"
                                height={48}
                                width={48}
                              />
                            </a>
                          </div>
                        </div>
                      </Checkbox>
                    </div>
                  ))}
                </Carousel>
              </Checkbox.Group>
            ) : <div />}
          </Form.Item>
          {/* Add Another Address */}
          <Button
            onClick={(): void => {
              pushClevertapEvent('Buy Plan', {
                Type: 'Add address',
              });
              setShowAddNewAddressModal(true);
            }}
            type="link"
            size="small"
            className="add-another-btn"
          >
            <span className="font-bold">
              {`+ Add ${officeLocations.length ? 'Another' : ''} Address`}
            </span>
          </Button>
        </Col>
      </Row>
      {isMobile ? null : (
        <Row>
          {
            errorMessage && (
              <Text type="danger">{errorMessage}</Text>
            )
          }
          <Col span={24} className="submit-btn">
            <Button type="primary" htmlType="submit">
              Continue
            </Button>
          </Col>
        </Row>
      ) }

      {/* Add New Interview Address Drawer */}
      {showAddNewAddressModal
        ? (
          <AddNewAddressModal
            closeModal={(): void => setShowAddNewAddressModal(false)}
            addNewAddressHandler={addNewAddressHandler}
            modalTitle=""
            submitBtnText="Save Address"
          />
        )
        : null}
    </Form>
  );

  return (
    <Drawer
      visible
      placement={isMobile ? 'bottom' : 'right'}
      width={650}
      className={`buy-credits-drawer ${isMobile ? 'buy-credits-drawer-mobile' : ''}`}
      title="Buy Plan"
      onClose={onCloseHandler}
      height="100%"
      closeIcon={<CloseOutlined style={{ color: '#284e52', maxWidth: 24 }} />}
      maskStyle={{ background: 'rgb(0, 47, 52,0.8)' }}
      footer={isMobile ? (
        <Button
          type="primary"
          className="btn-grey"
          onClick={():void => buyCreditsForm.submit()}
        >
          Continue
        </Button>
      ) : null}
      destroyOnClose
    >
      <Row>
        <Col span={24}>
          <div className="plan-info">
            <Row className="title">
              <Col span={24}>
                <Text className="text-white text-small">Plan Type</Text>
              </Col>
              <Col span={24}>
                <Row justify="space-between">
                  <Col>
                    <Title level={3} className="text-bold text-white">
                      {plan.display_name}
                    </Title>
                  </Col>
                  <Col>
                    <Text className="text-white">
                      ₹
                      {plan.unit_cost}
                    </Text>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row className="plan-details">
              {
                plan.offerings.map((offer: any) => (
                  <Col span={24} className="offer" key={offer.id}>
                    <Text className="text-small offer-name">
                      {
                        offer.is_unlimited ? (
                          <Text className="text-small">Unlimited</Text>
                        ) : (
                          <Text className="text-small">{offer.limit > 0 ? offer.limit : ''}</Text>
                        )
                      }
                    </Text>
                    <Text className="text-small offer-name text-bold">
                      {' '}
                      {offer.name}
                    </Text>
                  </Col>
                ))
              }
              <Text className="plan-validity">
                {plan.validity_days}
                {' '}
                days validity
              </Text>
            </Row>
          </div>
        </Col>
      </Row>
      {getBuyCreditsForm()}
    </Drawer>
  );
};

export default BuyPremiumCreditsDrawer;
