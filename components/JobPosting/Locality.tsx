/* eslint-disable @typescript-eslint/no-explicit-any */
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import {
  Form, Select, Spin,
} from 'antd';
import config from 'config';
import { JobPostingConfig } from 'constants/index';
import React, { useEffect, useState } from 'react';
import { getLocationAPI } from 'service/login-service';

const deg2rad = (deg): number => (deg * Math.PI) / 180.0;
const rad2deg = (rad): number => (rad * 180.0) / Math.PI;

const getRaduis = (viewport): number => {
  if (viewport) {
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
  }

  return 0;
};
interface ILocality {
  geometry: Record<string, any>;
  city: string;
  selectedLocality: (any) => void;
  disabled: boolean;
}
const { Option } = Select;
const Locality = (props: ILocality): JSX.Element => {
  const {
    geometry, city, selectedLocality, disabled,
  } = props;

  const [locality, setLocality] = useState<Array<Record<string, string>>>([]);

  const [error, setError] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    setLocality([]);
  }, [city]);

  const handleSearchLocality = async (searchValue): Promise<void> => {
    setFetching(true);
    if (searchValue && searchValue.trim() !== '') {
      const baseURL = config.BASE_URL;
      const url = `${baseURL}/autocomplete/?key=${config.MAPS_API_KEY_BACKEND}&types=(regions)&components=country:in&input=${searchValue}&radius=${getRaduis(geometry?.viewport)}&location=${`${geometry?.location?.lat()},${geometry?.location?.lng()}`}&strictbounds`;
      const apiCall = await getLocationAPI(url);
      const localityResponse = await apiCall.data;
      setError(localityResponse.status === 'ZERO_RESULTS');
      const localities = localityResponse.predictions.filter(
        (item: Record<string, string>) => item.description !== city,
      );
      setLocality(localities);
    }
    setFetching(false);
  };

  const handleSelectedLocality = (selectValue): void => {
    const locname = (locality).find((loc) => loc.place_id === selectValue.value);
    if (locname) {
      selectedLocality(locname);
    }
  };

  return (
    <Form.Item
      label={JobPostingConfig.locality.label}
      name={JobPostingConfig.locality.name}
      validateTrigger={['onSelect']}
      rules={[
        ...JobPostingConfig.locality.rules,
      ]}
      extra={error ? <p className="text-red">The locality doesn&apos; t exist in selected city</p> : null}
    >
      <Select
        className="search text-base full-width selected-values search-dropdown"
        size="large"
        showSearch
        notFoundContent={fetching ? <Spin /> : null}
        onSearch={handleSearchLocality}
        onSelect={handleSelectedLocality}
        placeholder="eg. Koramangla, Bengaluru"
        labelInValue
        suffixIcon={<SearchOutlined className="text-extra-base" />}
        showArrow
        optionFilterProp="label"
        disabled={disabled}
      >
        {locality.map((item, index) => (
          <Option value={item.place_id} key={`${item.place_id + index}`} label={item.description}>
            {item.description}
          </Option>
        ))}
      </Select>
    </Form.Item>
  );
};
export default Locality;
