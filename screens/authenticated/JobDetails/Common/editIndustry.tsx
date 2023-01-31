import {
  Form, Select, Checkbox, Row, Col,
} from 'antd';
import React, { useState, useEffect } from 'react';
import { getIndustryListAPI } from 'service/login-service';
import usePersistedState from 'utils/usePersistedState';
import { isMobile } from 'mobile-device-detect';

require('screens/authenticated/JobDetails/Desktop/jobDetails.less');

const { Option } = Select;

const IndustryTypeInput = (): JSX.Element => {
  const [indSugg, setindSugg] = usePersistedState('industry_category_list', '');
  const [indSuggObj, setIndSuggObj] = useState({} as any);
  const [industryMandatory, setIndustryMandatory] = useState(false);
  if (!indSugg) {
    const IndCategoryList = getIndustryListAPI();
    IndCategoryList.then((IndInfo) => {
      setindSugg(IndInfo.objects);
    });
  } else if (indSugg && indSugg.length > 0) {
    // if (store.industryId && !isEmpty(indSuggObj)) {
    //   const data = store.industryId.map((id) => indSuggObj[id]);
    //   store.updateindustrytype(data);
    // }
  }

  const handleindustrytype = (value): void => {
    const arr = value.map((id) => indSuggObj[id]);

    // store.updateindustrytype(arr);
    // store.updateindustryid(value);
  };
  const checkindustry = (_rule, value): Promise <void> => {
    if (value.length === 0 && industryMandatory) { return Promise.reject(new Error('Select the industry')); }
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
    <Row className={isMobile ? 'jobdetails-m-row-width' : 'jobdetails-row-width'}>
      <Col className={isMobile ? 'jobdetails-m-row-width' : 'jobdetails-row-width'}>
        <Form.Item
          label=""
          name="industryTypeMandatory"
          valuePropName="checked"
          style={{
            position: 'absolute',
            top: -14,
            zIndex: 1,
          }}
          className="jobdetails-m-mandatory-edit-modal"
        >
          <Checkbox
            value
            className="mandatory-checkbox"
            onChange={(e): void => {
              setIndustryMandatory(e.target.checked);
            //   if (e.target.checked) {
            //     store.candidateRequirement
            //       .candidateInfo.updateIndustryMandatory(e.target.checked);
            //   } else {
            //     store.candidateRequirement.candidateInfo.updateIndustryMandatory(false);
            //   }
            }}
          >
            <span className="mandatory-text">Mandatory</span>
          </Checkbox>
        </Form.Item>
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
            size="large"
            onChange={handleindustrytype}
            className="text-base"
          >
            {indSugg
          && indSugg.map((d) => (
            <Option value={d.id} key={Math.random()} title={d.name} className="full-width">
              {d.name}
            </Option>
          ))}
          </Select>
        </Form.Item>
      </Col>
    </Row>
  );
};

export default IndustryTypeInput;
