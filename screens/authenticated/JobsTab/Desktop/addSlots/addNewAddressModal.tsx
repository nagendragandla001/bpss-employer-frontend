/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import {
  Form, Select, Button, Input, Row, Col, Drawer, Tooltip, AutoComplete,
  Typography,
} from 'antd';
import { ApiConstants } from 'constants/index';
import { post } from 'service/api-method';
import { OrgOfficesListType } from 'screens/authenticated/JobsTab/Common/JobsTabUtils';
import { isMobile } from 'mobile-device-detect';
import GoogleMapPreview from 'screens/authenticated/JobsTab/Desktop/addSlots/googleMapPreview';
import CustomImage from 'components/Wrappers/CustomImage';

require('screens/authenticated/JobsTab/Desktop/addSlots/addNewAddressModal.less');

const { TextArea } = Input;
const { Text } = Typography;

interface PropsInterface{
  closeModal: ()=> void;
  addNewAddressHandler: (updateObject: OrgOfficesListType)=>void;
  modalTitle: string;
  submitBtnText: string;
}

type updateObjectType={
  selectedAddress: Record<string, any>;
  mapPosition: {
    lat: number;
    lng: number;
  };
  displayValue: string;
}

type stateType={
  autoCompleteResult: Array<Record<string, any>>;
  autocompleteService: any;
} & updateObjectType;

const AddNewAddressModal = (props: PropsInterface): JSX.Element => {
  const [addNewAddressForm] = Form.useForm();
  const [showCurrentLocationBtn, setShowCurrentLocationBtn] = useState(true);
  const { Option } = Select;
  const { addNewAddressHandler, modalTitle, submitBtnText } = props;
  const [state, setState] = useState<stateType>({
    autoCompleteResult: [],
    selectedAddress: {},
    autocompleteService: {},
    // Default Location is set to Bangalore
    mapPosition: {
      lat: 12.972442,
      lng: 77.580643,
    },
    displayValue: '',
  });
  // RIP - Request in Progress XD
  const [addNewAddressRIP, setAddNewAddressRIP] = useState(false);

  // Getting the instance AutoCompleteService,
  // Because it is used several times that's why it is stored in state
  // It are loaded when page is loaded
  // Link to this library is specified in the script tag of _document file
  useEffect(() => {
    setState((prevState) => ({
      ...prevState,
      autocompleteService: new (window as any).google.maps.places.AutocompleteService(),
    }));
  }, []);

  const searchHandler = (value): void => {
    const searchOptions = {
      componentRestrictions: {
        country: 'in',
      },
    };
    if (value !== '') {
      state.autocompleteService.getPlacePredictions(
        {
          ...searchOptions,
          input: value,
        }, (predictions, status) => {
          if (status === 'OK') {
            setState((prevState) => ({
              ...prevState,
              autoCompleteResult: predictions,
            }));
          }
        },
      );
    }
  };

  const onSelectHandler = (value, option): void => {
    setState((prevState) => ({
      ...prevState,
      selectedAddress: {},
    }));
    const searchOptions = {
      address: value,
    };
    setShowCurrentLocationBtn(false);
    const gecoderObject = new (window as any).google.maps.Geocoder();
    gecoderObject.geocode({ ...searchOptions }, (predictions, statusOfRequest) => {
      if (statusOfRequest === 'OK' && predictions.length > 0) {
        setState((prevState) => ({
          ...prevState,
          selectedAddress: {
            placeId: option.key,
            geometry: predictions[0].geometry,
            address: predictions[0].formatted_address,
          },
          displayValue: value,
          mapPosition: {
            lat: predictions[0].geometry.location.lat(),
            lng: predictions[0].geometry.location.lng(),
          },
        }));
      }
    });
  };

  const updateNewAddress = (updateObject):void => {
    setState((prevState) => ({
      ...prevState,
      ...updateObject,
    }));
    addNewAddressForm.setFieldsValue({
      googleAddress: updateObject.displayValue,
    });
  };

  // Getting the user current location from the browser
  const getUserLocation = (): void => {
    // eslint-disable-next-line no-undef
    if (navigator) {
      setShowCurrentLocationBtn(false);
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude } = position.coords;
        const { longitude } = position.coords;
        const gecoderObject = new (window as any).google.maps.Geocoder();
        gecoderObject.geocode({ location: { lat: latitude, lng: longitude } },
          (predictions, statusOfRequest) => {
            if (statusOfRequest === 'OK' && predictions.length > 0) {
              setState((prevState) => ({
                ...prevState,
                selectedAddress: {
                  placeId: predictions[0].place_id,
                  geometry: predictions[0].geometry,
                  address: predictions[0].formatted_address,
                },
                mapPosition: {
                  lat: predictions[0].geometry.location.lat(),
                  lng: predictions[0].geometry.location.lng(),
                },
                displayValue: predictions[0].formatted_address,
              }));
              addNewAddressForm.setFieldsValue({
                googleAddress: predictions[0].formatted_address,
              });
            }
          });
      });
    }
  };

  const onFinishHandler = async (value): Promise<any> => {
    setAddNewAddressRIP(true);
    const apiCall = await post(ApiConstants.CREATE_ORG_OFFICE, {
      address: value.location,
      place_id: state.selectedAddress.placeId,
    }, { withAuth: true, isForm: false, errorMessage: '' });

    if ([200, 201, 202].indexOf(apiCall.status) > -1) {
      setAddNewAddressRIP(false);
      const response = await apiCall.data;
      addNewAddressHandler({
        address: response.address,
        id: response.id,
        mapsLink: `https://maps.google.com/?q=${response.place.location}`,
        placeId: state.selectedAddress.placeId,
        formattedAddress: '',
      });
    }
  };
  return (
    <Drawer
      visible
      width={680}
      placement={isMobile ? 'bottom' : 'right'}
      className={`add-new-address-drawer ${isMobile ? 'add-new-address-drawer-mobile' : ''}`}
      title={isMobile ? null : modalTitle}
      height="100%"
      destroyOnClose
      onClose={(): void => props.closeModal()}
      footer={isMobile ? (
        <Button
          type="primary"
          className="btn-grey"
          onClick={():void => addNewAddressForm.submit()}
        >
          Add Address
        </Button>
      ) : null}
    >
      <Row align="middle" className="add-new-address-title">
        <Col>
          <Button
            type="link"
            className="back-arrow-button"
            onClick={(): void => props.closeModal()}
          >
            <CustomImage
              src="/svgs/back-arrow-icon24x24.svg"
              width={24}
              height={24}
              alt="back arrow"
            />
          </Button>

        </Col>
        <Col>
          <Text className="font-size-20 font-bold">Add New Address</Text>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Form
            name="addNewAddressForm"
            layout="vertical"
            size="large"
            form={addNewAddressForm}
            onFinish={onFinishHandler}
            hideRequiredMark
            scrollToFirstError
          >
            <Row>
              <Col span={24}>
                <Form.Item
                  name="googleAddress"
                  label="Google location of venue:"
                  rules={[{
                    required: true,
                    message: 'Please Select the interview Location',
                  }, {
                    whitespace: true,
                    message: 'Please Select the interview Location',
                  }]}
                >
                  <AutoComplete
                    placeholder="Search Location"
                    onSearch={searchHandler}
                    notFoundContent={null}
                    showSearch
                    autoFocus
                    onSelect={onSelectHandler}
                    value={state.displayValue}
                    showArrow={false}
                    className="location-autocomplete"
                  >
                    {state.autoCompleteResult
                && state.autoCompleteResult
                && state.autoCompleteResult.map((item: any) => (
                  <Option value={item.description} key={item.place_id}>
                    {item.description}
                  </Option>
                ))}
                  </AutoComplete>
                </Form.Item>
                <Form.Item noStyle>
                  <Tooltip placement="bottomLeft" title="set current location">
                    <Button
                      onClick={getUserLocation}
                      icon={(
                        <CustomImage
                          src="/svgs/gps-fixed-24-px.svg"
                          height={24}
                          width={24}
                          alt="second"
                        />
                      )}
                      className="gps-icon"
                    />
                  </Tooltip>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24} className="google-map-preview">
                <GoogleMapPreview
                  lat={state.mapPosition.lat}
                  lng={state.mapPosition.lng}
                  showCurrentLocationBtn={showCurrentLocationBtn}
                  getUserLocation={getUserLocation}
                  updateNewAddress={updateNewAddress}
                />
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  name="location"
                  label="Complete Address:"
                  rules={[{
                    required: true,
                    message: 'Complete Address is required',
                  }, {
                    whitespace: true,
                    message: 'Complete Address cannot be empty',
                  }, {
                    max: 90,
                    message: 'Address cannot be more than 90 characters',
                  }]}
                >
                  <TextArea className="text-area" placeholder="Office no., Building, Area, etc." rows={3} />
                </Form.Item>
              </Col>
            </Row>
            {isMobile ? null : (
              <Row justify="center">
                <Col span={24} className="add-address-submit-btn">
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="text-base font-bold"
                    loading={addNewAddressRIP}
                  >
                    {submitBtnText}
                  </Button>
                </Col>
              </Row>
            )}
          </Form>
        </Col>
      </Row>
    </Drawer>
  );
};

export default AddNewAddressModal;
