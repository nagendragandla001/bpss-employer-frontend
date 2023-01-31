/* eslint-disable react/destructuring-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AutoComplete, Button, Col, Form, Input, Modal, Row,
} from 'antd';
import { FormInstance } from 'antd/lib/form';
import CustomImage from 'components/Wrappers/CustomImage';
import { ApiConstants } from 'constants/index';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import { post } from 'service/api-method';

require('screens/authenticated/ApplicationsTab/Mobile/CreateInterviewSlotsForm.less');

const GoogleMapComponent = dynamic(() => import('screens/authenticated/ApplicationsTab/Mobile/ScheduleInterview/GoogleMapPreview'), { ssr: false });

const { TextArea } = Input;

interface PropsInterface{

  CloseModal: ()=>void;
  changeState:any;
  interviewLocationsList: Array<{address: string; id: number; mapsLink: string}>;
  parentForm: FormInstance;
  FinishHandlerForm:any;
  interviewModal:boolean
}
interface AutoCompleteInterface{
  AutoCompleteResult: Array<Record<string, any>>;
  selectedAddress: Record<string, any>;
  AutocompleteService: any;
  GeocoderService: any;
  MapPosition: {
    lat: number;
    lng: number;
  };
  displayValue: string;
}

const AddNewAddressModal = (props: PropsInterface): JSX.Element => {
  const [Locationform] = Form.useForm();
  const [btnVisible, setbtnVisible] = useState(true);
  const [addressInProgress, setaddressInProgress] = useState(false);
  // const { Option } = Select;
  const [state, setState] = useState<AutoCompleteInterface>({
    AutoCompleteResult: [],
    selectedAddress: {},
    AutocompleteService: {},
    GeocoderService: {},
    MapPosition: {
      lat: 12.972442,
      lng: 77.580643,
    },
    displayValue: '',
  });
  useEffect(() => {
    const gecoderObject = new (window as any).google.maps.Geocoder();
    setState((prevState) => ({
      ...prevState,
      AutocompleteService: new (window as any).google.maps.places.AutocompleteService(),
      GecoderService: gecoderObject,
    }));
  }, []);

  const searchHandler = (value): void => {
    const searchOptions = {
      componentRestrictions: {
        country: 'in',
      },
    };
    if (value !== '') {
      state.AutocompleteService.getPlacePredictions(
        {
          ...searchOptions,
          input: value,
        }, (predictions, status) => {
          if (status === 'OK') {
            setState((prevState) => ({
              ...prevState,
              AutoCompleteResult: predictions,
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
          MapPosition: {
            lat: predictions[0].geometry.location.lat(),
            lng: predictions[0].geometry.location.lng(),
          },
        }));
      }
    });
  };
  const onChangeHandler = (value): void => {
    setState((prevState) => ({ ...prevState, displayValue: value }));
  };
  const getUserLocation = (): void => {
    // console.log('click');
    setbtnVisible(false);
    // console.log('click');
    // eslint-disable-next-line no-undef
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
              MapPosition: {
                lat: predictions[0].geometry.location.lat(),
                lng: predictions[0].geometry.location.lng(),
              },
              displayValue: predictions[0].formatted_address,
            }));
            Locationform.setFieldsValue({
              googleAddress: predictions[0].formatted_address,
            });
          }
        });
    });
  };

  const onFinishHandler = async (value): Promise<any> => {
    setaddressInProgress(true);
    const apiCall = await post(ApiConstants.CREATE_ORG_OFFICE, {
      address: value.location,
      place_id: state.selectedAddress.placeId,
    }, { withAuth: true, isForm: false, errorMessage: '' });

    if ([200, 201, 202].indexOf(apiCall.status) > -1) {
      setaddressInProgress(false);
      const response = await apiCall.data;
      const newAddress = {
        address: response.address,
        id: response.id,
        mapsLink: `https://maps.google.com/?q=${response.place.location}`,
      };
      const newInterviewLocationsList = props.interviewLocationsList;
      newInterviewLocationsList.unshift(newAddress);
      props.changeState((prevState) => ({
        ...prevState,
        InterviewLocations: newInterviewLocationsList,
        ShowInterviewModal: false,
      }));

      props.parentForm.setFieldsValue({
        InterviewAddress: response.id,
      });
      props.FinishHandlerForm(response.id);
    }
  };
  return (
    <Modal
      visible={!!props.interviewModal}
      onCancel={props.CloseModal}
      footer={null}
      width={400}
      className="full-screen-modal"
    >
      <Form
        layout="vertical"
        form={Locationform}
        onFinish={onFinishHandler}
        hideRequiredMark
        // className="full-width"
        // style={{ height: 200, overflowY: 'auto' }}
      >
        <Row className="new-address-container" style={{ padding: '16px' }}>
          <Col span={24}>
            <Row justify="space-between">
              <Col className=" m-carousel-content">Use New address</Col>

            </Row>
          </Col>
          <Col span={24}>
            <Form.Item
              name="googleAddress"
              label="Google location of venue:"
              className="form-item-title-grey"
              validateTrigger={['onBlur']}
              rules={[{
                required: true,
                message: 'Please Select the interview Location',
              }]}
              style={{ marginTop: 40 }}
            >
              <AutoComplete
                placeholder="Search Location"
                onSearch={searchHandler}
                notFoundContent={null}
                showSearch
                autoFocus
                onSelect={onSelectHandler}
                value={state.displayValue}
                className="search-location"
                onChange={onChangeHandler}
                style={{ width: '100%' }}
                options={
                  (state.AutoCompleteResult || [])
                    .map((item: any) => ({ value: item.description, key: item.place_id }))
                }
                showArrow={false}
              >
                <Input
                  onClick={getUserLocation}
                  suffix={<CustomImage src="/svgs/gps-fixed-24-px.svg" width={24} height={24} alt="second" />}
                />
              </AutoComplete>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item>
              <GoogleMapComponent
                lat={state.MapPosition.lat}
                lng={state.MapPosition.lng}
                setAddressState={setState}
                form={Locationform}
                btn={btnVisible}
                getUserLocation={getUserLocation}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="location"
              label="Complete Address:"
              className="form-item-title-grey"
              style={{ marginTop: '20px' }}
              validateTrigger={['onBlur']}
              rules={[{
                required: true,
                message: 'This Field is required',
              }, {
                whitespace: true,
                message: 'This Field cannot be empty',
              }, {
                max: 90,
                message: 'Address cannot be more than 90 characters',
              }]}
            >
              <TextArea className="app-actions-feedback-input" placeholder="e.g. 11/14A, 2nd Floor, Aasaanjobs pvt. ltd." rows={3} />
            </Form.Item>
          </Col>
        </Row>
        <Button
          type="primary"
          htmlType="submit"
          block
          className="interview-btn"
          loading={addressInProgress}
        >
          Add Address & Send Invite
        </Button>
      </Form>
    </Modal>
  );
};

export default AddNewAddressModal;
