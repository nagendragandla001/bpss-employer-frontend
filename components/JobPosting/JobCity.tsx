/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/require-default-props */
/* eslint-disable @typescript-eslint/no-explicit-any */
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import { Loader } from '@googlemaps/js-api-loader';
import { AutoComplete, Form, Select } from 'antd';
import config from 'config';
import { JobPostingConfig } from 'constants/index';
import React, { useEffect, useState } from 'react';

const { Option } = AutoComplete;

interface AutoCompleteInterface {
  cities: Array<Record<string, string>>;
  selectedCity: Record<string, string>;
  AutocompleteService: any;
  GeocoderService: any;
}

interface PropsModel {
  callback: (data) => void;
  selectHandler: (data) => void;
  city?:any;
  disabled: boolean
}

const JobCity = (props: PropsModel): JSX.Element => {
  const {
    callback, selectHandler, city, disabled,
  } = props;

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

    loader.load().then((google) => {
      const gecoderObject = google ? new (window as any).google.maps.Geocoder() : {};
      setState((prevState) => ({
        ...prevState,
        AutocompleteService: new (window as any).google.maps.places.AutocompleteService(),
        GecoderService: gecoderObject,
      }));

      if (process.browser) {
        gecoderObject.geocode(
          { address: city },
          (predictions, statusOfRequest) => {
            if (statusOfRequest === 'OK' && predictions.length > 0) {
              callback(predictions[0].geometry);
            }
          },
        );
      }
    });
  };

  const onSelectHandler = (value, option): void => {
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

  useEffect(() => {
    // setTimeout(() => {
    initializeMaps();
    // }, 1000);
  }, [city]);

  return (
    <Form.Item
      label={JobPostingConfig.cityName.label}
      name={JobPostingConfig.cityName.name}
      rules={[...JobPostingConfig.cityName.rules]}
    >
      <Select
        size="large"
        showArrow
        showSearch
        suffixIcon={<SearchOutlined className="text-extra-base" />}
        notFoundContent={null}
        onSearch={searchHandler}
        onSelect={onSelectHandler}
        placeholder="Type to search city"
        className="text-base search-dropdown selected-values"
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

export default JobCity;
