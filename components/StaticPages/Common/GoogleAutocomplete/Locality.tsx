/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/require-default-props */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Form, Select, Spin,
} from 'antd';
import { FormInstance } from 'antd/lib/form';
import config from 'config';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { getLocationAPI } from 'service/login-service';
import { FormListFieldData } from 'antd/lib/form/FormList';
import snackBar from 'components/Notifications';

const deg2rad = (deg): number => (deg * Math.PI) / 180.0;
const rad2deg = (rad): number => (rad * 180.0) / Math.PI;

const getRaduis = (viewport): number => {
  const thetha = viewport.getNorthEast().lng() - viewport.getSouthWest().lng();
  let distance = Math.sin(deg2rad(viewport.getNorthEast().lat()))
    * Math.sin(deg2rad(viewport.getSouthWest().lat()))
    + Math.cos(deg2rad(viewport.getNorthEast().lat()))
    * Math.cos(deg2rad(viewport.getSouthWest().lat()))
    * Math.cos(deg2rad(thetha));
  distance = Math.acos(distance);
  distance = rad2deg(distance);
  distance = distance * 60 * 1.1515;
  return (distance / 2) * 1000;
};
interface LocalityProps {
  geometry: Record<string, any>;
  city: string | undefined;
  form: FormInstance;
  field: FormListFieldData;
  handlestoreaddlocality: (any) => void;
}
const { Option } = Select;
const Locality: React.FunctionComponent<LocalityProps> = (props: LocalityProps) => {
  const {
    geometry, city, handlestoreaddlocality, form, field,
  } = props;

  const [locality, setLocality] = useState<Array<Record<string, string>>>([]);

  const [error, setError] = useState(false);
  const [fetching, setfetching] = useState(false);

  useEffect(() => {
    setLocality([]);
  }, [city]);

  const searchHandlerlocality = async (searchValue): Promise<void> => {
    setfetching(true);
    if (searchValue !== '') {
      let locationObjects = [];
      const baseURL = config.BASE_URL;
      const key = config.MAPS_API_KEY_BACKEND;
      const url = `${baseURL}/autocomplete/?key=${key}&types=(regions)&components=country:in&input=${searchValue}&radius=${getRaduis(
        geometry.viewport,
      )}&location=${`${geometry.location.lat()},${geometry.location.lng()}`}&strictbounds`;
      const apiCall = await getLocationAPI(url);
      const locationsJson = await apiCall.data;
      if (locationsJson.status === 'ZERO_RESULTS') {
        setError(true);
      } else {
        setError(false);
      }
      locationObjects = locationsJson.predictions.filter(
        (item: Record<string, string>) => item.description !== city,
      );
      setLocality(locationObjects);
    }
    setfetching(false);
  };

  const handlestorelocality = (selectValue): void => {
    // console.log(selectValue);
    const list = form.getFieldValue('locations');

    const duplicates = list.filter((location) => (location && location.locality)
    && (location.locality.value === selectValue.value));

    if (duplicates.length > 1) {
      snackBar({
        title: 'Location already exists!',
        description: 'Please enter another location!',
        iconName: '',
        notificationType: 'error',
        placement: 'topRight',
        duration: 5,
      });
    } else {
      const locname = (locality).find((loc) => loc.place_id === selectValue.value);
      // console.log(locname);
      if (locname) {
        handlestoreaddlocality(locname);
      }
    }
  };

  const checkExisitingLocation = async (_rule, checkValue): Promise<void> => {
    if (checkValue) {
      if (checkValue.value === '') {
        throw new Error('Please input location');
      }

      const list = form.getFieldValue('locations');
      const isDuplicate = list.filter((location) => checkValue.value !== '' && ((location && location.locality && location.locality.value) === checkValue.value));
      if (isDuplicate.length > 1) {
        return Promise.reject(new Error('Location already exists!'));
      }
    }
    return Promise.resolve();
  };
  return (
    <Form.Item
      {...field}
      label="Add Locality"
      name="locality"
      validateTrigger={['onSelect']}
      rules={[
        {
          required: true,
          message: 'Please input location',
        },
        { validator: checkExisitingLocation },
      ]}
      extra={error ? <p className="clr-red">The locality doesn&apos; t exist in selected city</p> : null}
    >
      <Select
        className="search text-base"
        size="large"
        showSearch
        notFoundContent={fetching ? <Spin /> : null}
        style={{ width: '100%' }}
        onSearch={searchHandlerlocality}
        onSelect={handlestorelocality}
        placeholder="eg. Koramangla, Bengaluru"
        labelInValue
        optionFilterProp="label"
      >
        {locality.length > 0 ? locality.map((item, index) => (
          <Option value={item.place_id} key={`${item.place_id + index}`} label={item.description}>
            {item.description}
          </Option>
        )) : null}
      </Select>

    </Form.Item>
  );
};
export default observer(Locality);
