/* eslint-disable no-param-reassign */
import React, { useState } from 'react';
import {
  Form, Select,
} from 'antd';
import usePersistedState from 'utils/usePersistedState';
import { getLocationListAPI } from 'service/login-service';
import { pushClevertapEvent } from 'utils/clevertap';

const segregateCityOpt = (data: string): Array<string> => {
  const cityList = data && JSON.parse(data);
  const topCityList = ['mumbai', 'thane', 'navi-mumbai', 'bengaluru', 'new-delhi', 'gurgaon', 'pune', 'chennai', 'hyderabad'];
  cityList.forEach((city: { class: string; name: string }) => {
    city.class = (topCityList.indexOf(city.name.replace(' ', '-').toLocaleLowerCase()) > -1) ? 'top' : 'other';
  });
  cityList.top = cityList.filter((city: { class: string }) => city.class === 'top');
  cityList.other = cityList.filter((city: { class: string }) => city.class === 'other');
  return cityList;
};

const CompanyLocationInput: React.FunctionComponent = (): JSX.Element => {
  const [cityList, setcityList] = usePersistedState('city_region_list', '');
  const [isLocationStartEventSent, setLocationStartEventSent] = useState(false);

  if (!cityList) {
    const filter = { filter: JSON.stringify({ and: { state_id: { exists: 'True' } } }), limit: 1000 };
    const locationList = getLocationListAPI(filter);
    locationList.then((cityInfo) => {
      setcityList(JSON.stringify(cityInfo && cityInfo.objects));
    });
  }
  let cityRegionList;
  if (cityList && cityList.length) { cityRegionList = segregateCityOpt(cityList); }

  const sendEvent = (): void => {
    if (!isLocationStartEventSent) {
      pushClevertapEvent('Location Fill Attempt', { Type: 'registration_form' });
      setLocationStartEventSent(true);
    }
  };

  return (
    <Form.Item
      label="Company Head Office"
      name="company_locality"
      rules={[{ required: true, message: 'Please input your company location!' }]}
    >
      <Select
        showSearch
        optionFilterProp="children"
        className="text-base"
        onSearch={sendEvent}
        onDropdownVisibleChange={sendEvent}
        placeholder="Select City"
      >
        <Select.OptGroup label="Top Cities">
          {cityRegionList && cityRegionList.top
        && cityRegionList.top.map((city) => (
          <Select.Option
            value={city.id}
            key={city.id}
          >
            {city.name}
          </Select.Option>
        ))}
        </Select.OptGroup>
        <Select.OptGroup label="Other Cities">
          {cityRegionList && cityRegionList.other
        && cityRegionList.other.map((city) => (
          <Select.Option
            value={city.id}
            key={city.id}
          >
            {city.name}
          </Select.Option>
        ))}
        </Select.OptGroup>
      </Select>
    </Form.Item>
  );
};

export default CompanyLocationInput;
