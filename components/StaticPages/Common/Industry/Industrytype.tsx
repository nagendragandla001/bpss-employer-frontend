import { Form, Select } from 'antd';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { getIndustryListAPI } from 'service/login-service';
import usePersistedState from 'utils/usePersistedState';
import isEmpty from 'lodash/isEmpty';

const { Option } = Select;

interface IIndSuggObj{
  [key:string]:number
}

const IndustryTypeInput = (props:{ store:any }): JSX.Element => {
  const { store } = props;
  const [indSugg, setindSugg] = usePersistedState('industry_category_list', '');
  const [indSuggObj, setIndSuggObj] = useState({} as IIndSuggObj);

  if (!indSugg) {
    const IndCategoryList = getIndustryListAPI();
    IndCategoryList.then((IndInfo) => {
      setindSugg(IndInfo.objects);
    });
  } else if (indSugg && indSugg.length > 0) {
    if (store.industryId && !isEmpty(indSuggObj)) {
      const data = store.industryId.map((id) => indSuggObj[id]);
      store.updateindustrytype(data);
    }
  }

  const handleindustrytype = (value): void => {
    const arr = value.map((id) => indSuggObj[id]);

    store.updateindustrytype(arr);
    store.updateindustryid(value);
  };
  const checkindustry = (_rule, value): Promise <void> => {
    if (value.length === 0 && store.industryMandatory) { return Promise.reject(new Error('Select the industry')); }
    if (value.length > 10) { return Promise.reject(new Error('Upto 10 industries can be selected')); }
    return Promise.resolve();
  };

  useEffect(() => {
    if (indSugg) {
      const obj = {};
      for (let i = 0; i < indSugg.length; i += 1) {
        obj[indSugg[i].id] = indSugg[i].name;
      }
      setIndSuggObj(obj);
    }
  }, [indSugg]);

  return (
    <Form.Item
      label="Previous Industry"
      name="industryType"
      rules={[{ validator: checkindustry }]}
    >
      <Select
        mode="multiple"
        showSearch
        optionFilterProp="children"
        showArrow
        onChange={handleindustrytype}
        className="text-base"
      >
        {indSugg && indSugg.length > 0
          && indSugg.map((d) => (
            <Option value={d.id} key={Math.random()} title={d.name} className="full-width">
              {d.name}
            </Option>
          ))}
      </Select>
    </Form.Item>
  );
};
IndustryTypeInput.propTypes = {
  store: PropTypes.oneOfType([PropTypes.object]).isRequired,

};
export default IndustryTypeInput;
