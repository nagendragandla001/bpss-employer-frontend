/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/require-default-props */
/* eslint-disable @typescript-eslint/no-explicit-any */
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import { Loader } from '@googlemaps/js-api-loader';
import { AutoComplete, Form, Select } from 'antd';
import config from 'config';
import React, { useEffect, useState } from 'react';

interface AutoCompleteInterface {
  cities: Array<Record<string, string>>;
  selectedCity: Record<string, string>;
  AutocompleteService: any;
  GeocoderService: any;
}

interface PropsModel {
  store?: any;
  callback: (data) => void;
  selectHandler: (data) => void;
  city?:any;
  disabled: boolean
}

const AutoCompleteComponent = ({
  store, callback, selectHandler, city, disabled,
}: PropsModel): JSX.Element => {
  const [locval, setlocval] = useState(store ? store.cityName : city);

  const [prev, setprev] = useState();
  const [state, setState] = useState<AutoCompleteInterface>({
    cities: [],
    selectedCity: {},
    AutocompleteService: {},
    GeocoderService: {},
  });

  const initializeMaps = async (): Promise<void> => {
    const loader = new Loader({
      apiKey: `${config.MAPS_API_KEY_FRONTEND}`,
      version: 'weekly',
      libraries: ['places'],
    });
    const mapOptions = {
      center: {
        lat: 0,
        lng: 0,
      },
      zoom: 4,
    };
    loader.load().then((google) => {
    //   // eslint-disable-next-line no-new
    //   new google.maps.Map(document.getElementById('map'), mapOptions);
      const gecoderObject = google ? new (window as any).google.maps.Geocoder() : {};
      setState((prevState) => ({
        ...prevState,
        AutocompleteService: new (window as any).google.maps.places.AutocompleteService(),
        GecoderService: gecoderObject,
      }));

      if (process.browser && prev !== locval) {
        setprev(locval);
        gecoderObject.geocode(
          { address: locval },
          (predictions, statusOfRequest) => {
            if (statusOfRequest === 'OK' && predictions.length > 0) {
              callback(predictions[0].geometry);
            }
          },
        );
      }
    });
  };

  useEffect(() => {
    setTimeout(() => {
      initializeMaps();
    }, 1000);
  }, []);

  const { Option } = AutoComplete;

  const onSelectHandler = (value, option): void => {
    setlocval(value);
    setState((prevState) => ({
      ...prevState,
      selectedCity: {},
    }));
    const searchOptions = {
      address: value,
    };

    const gecoderObject = new (window as any).google.maps.Geocoder();
    gecoderObject.geocode(
      { ...searchOptions },
      (predictions, statusOfRequest) => {
        if (statusOfRequest === 'OK' && predictions.length > 0) {
          setState((prevState) => ({
            ...prevState,
            selectedCity: {
              placeId: option.key,
              geometry: predictions[0].geometry,
            },
          }));
          callback(predictions[0].geometry);
          selectHandler(value);
        }
      },
    );
  };

  const searchHandler = (searchvalue): void => {
    const searchOptions = {
      componentRestrictions: {
        country: 'in',
      },
      types: ['(cities)'],
    };
    if (searchvalue !== '') {
      state.AutocompleteService.getPlacePredictions(
        {
          ...searchOptions,
          input: searchvalue,
        },
        (predictions, status) => {
          if (status === 'OK') {
            setState((prevState) => ({
              ...prevState,
              cities: predictions,
            }));
          }
        },
      );
    }
  };

  return (
    <Form.Item
      label="Add City"
      name="cityName"
      rules={[
        {
          required: true,
          message: 'Please input location',
        },
      ]}
      style={{ marginBottom: 32 }}
    >
      <Select
        size="large"
        showArrow
        showSearch
        suffixIcon={<SearchOutlined style={{ fontSize: '24px' }} />}
        notFoundContent={null}
        onSearch={searchHandler}
        onSelect={onSelectHandler}
        placeholder="Type to search city"
        className="text-base search-dropdown"
        disabled={disabled || false}
      >
        {state.cities
          && state.cities
          && state.cities.map((item: Record<string, string>) => (
            <Option value={item.description} key={item.place_id}>
              {item.description}
            </Option>
          ))}
      </Select>
    </Form.Item>
  );
};

export default AutoCompleteComponent;
