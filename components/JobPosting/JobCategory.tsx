/* eslint-disable react/prop-types */
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import { Form, Select } from 'antd';
import React, { useEffect } from 'react';
import { getjobCategoryListAPI } from 'service/login-service';
import usePersistedState from 'utils/usePersistedState';

const { Option } = Select;

export interface IJobCategory {
  name: string;
  label: string;
  selectHandler: (obj: any) => void;
  mode?: 'multiple' | 'tags' | undefined;
  disabled: boolean;
  showArrow: boolean;
  faId?: number | string | undefined;
}

const JobCategory = (props: IJobCategory): JSX.Element => {
  const {
    name, label, selectHandler, mode, disabled, showArrow, faId,
  } = props;
  const [jobCategories, setJobCategories] = usePersistedState('job_category_list', []);

  const handleMultipleSelectChange = (value): void => {
    const selectedCategories = value.map((v) => {
      const categoryObj = jobCategories.find((job) => job.id === v);
      if (categoryObj) {
        return { value: categoryObj.id, label: categoryObj.name };
      }
      return { value: v, label: '' };
    });

    selectHandler(selectedCategories);
  };

  const emptyCallback = (): boolean => true;

  const checkFunctionalArea = (_rule, value): Promise <void> => {
    if (value && value.length > 10) { return Promise.reject(new Error('Upto 10 functional areas can be selected')); }
    return Promise.resolve();
  };

  const handleSingleSelectChange = (value): void => {
    const currentValue = jobCategories.find((job) => job.id === value);
    if (currentValue) {
      selectHandler({ label: currentValue.name, value: currentValue.id });
    } else {
      selectHandler({ label: '', value });
    }
  };

  useEffect(() => {
    if (!jobCategories || jobCategories.length === 0) {
      const JobCategoryList = getjobCategoryListAPI();
      JobCategoryList.then((jobcategory) => {
        setJobCategories(jobcategory.objects);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobCategories]);

  useEffect(() => {
    if (faId) {
      handleSingleSelectChange(faId);
    }
  }, [faId]);

  return (
    <Form.Item
      name={name}
      label={label}
      rules={[
        {
          required: true,
          message: 'Search from dropdown',
        },
        { validator: checkFunctionalArea },
      ]}
    >
      <Select
        mode={mode}
        size="large"
        disabled={disabled || false}
        optionFilterProp="children"
        showArrow={showArrow || false}
        showSearch
        className="text-base selected-values"
        suffixIcon={<SearchOutlined className="text-extra-base" />}
        placeholder="Search from dropdown"
        onChange={mode === 'multiple' ? handleMultipleSelectChange : emptyCallback}
        onSelect={mode === 'multiple' ? emptyCallback : handleSingleSelectChange}
      >
        {jobCategories
          && jobCategories.map((d) => (
            <Option value={d.id} key={d.name} title={d.name} className="full-width text-base">
              {d.name}
            </Option>
          ))}
      </Select>
    </Form.Item>
  );
};

export default JobCategory;
