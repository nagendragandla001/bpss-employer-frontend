import React, { useState } from 'react';
import {
  Col, Row, Form, Checkbox, Select,
} from 'antd';
import usePersistedState from 'utils/usePersistedState';
import { getIndustryListAPI } from 'service/login-service';

const { Option } = Select;

const JobIndustry = (): JSX.Element => {
  const [indSugg, setindSugg] = usePersistedState('industry_category_list', '');
  const [industryMandatory, setIndustryMandatory] = useState(false);
  if (!indSugg) {
    const IndCategoryList = getIndustryListAPI();
    IndCategoryList.then((IndInfo) => {
      setindSugg(IndInfo.objects);
    });
  }

  const checkindustry = (_rule, value): Promise <void> => {
    if (value.length === 0 && industryMandatory) { return Promise.reject(new Error('Select the industry')); }
    if (value.length > 10) { return Promise.reject(new Error('Upto 10 industries can be selected')); }
    return Promise.resolve();
  };

  return (
    <Row>
      <Col span={24}>
        <Form.Item
          label=""
          name="industryTypeMandatory"
          valuePropName="checked"
          style={{
            position: 'absolute',
            top: -8,
            right: -7,
            zIndex: 1,
          }}
        >
          <Checkbox
            value
            className="mandatory-checkbox"
            onChange={(e): void => {
              setIndustryMandatory(e.target.checked);
            }}
          >
            <span className="mandatory-text">Mandatory</span>
          </Checkbox>
        </Form.Item>
      </Col>
      <Col span={24}>
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
            className="text-base"
            placeholder="Any Degree or Schooling"
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

export default JobIndustry;
