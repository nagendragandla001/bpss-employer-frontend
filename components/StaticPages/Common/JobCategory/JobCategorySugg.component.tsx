/* eslint-disable react/prop-types */
import { Form, Select } from 'antd';
import { observer } from 'mobx-react';
import React, { useEffect } from 'react';
import { getjobCategoryListAPI } from 'service/login-service';
import usePersistedState from 'utils/usePersistedState';

const { Option } = Select;

// interface IJobSuggObj{
//   [key:string]:number;
// }

const JobCategorySuggInput = ({
  name, label, selectHandler, mode, disabled, showArrow,
}): JSX.Element => {
  // const [jobSuggObj, setJobSuggObj] = useState({} as IJobSuggObj);
  const [jobSugg, setjobSugg] = usePersistedState('job_category_list', []);

  const handletype = (value): void => {
    const selectedCategories = value.map((v) => {
      const categoryObj = jobSugg.find((job) => job.id === v);
      if (categoryObj) {
        return { value: jobSugg.id, label: jobSugg.name };
      }
      return { value: jobSugg.id, label: '' };
    });

    selectHandler(selectedCategories);
  };

  const emptyfun = (): boolean => true;

  const checkFunctionalArea = (_rule, value): Promise <void> => {
    if (value && value.length > 10) { return Promise.reject(new Error('Upto 10 functional areas can be selected')); }
    return Promise.resolve();
  };

  const handleSingleSelect = (value): void => {
    const currentValue = jobSugg.find((job) => job.id === value);
    if (currentValue) {
      selectHandler({ label: currentValue.name, value: currentValue.id });
    } else {
      selectHandler({ label: '', value });
    }
  };

  async function getjobCategoryListAPIFunc():Promise<void> {
    if (!jobSugg || jobSugg.length === 0) {
      const JobCategoryList = await getjobCategoryListAPI();
      setjobSugg(JobCategoryList?.objects);
    }
  }
  useEffect(() => {
    getjobCategoryListAPIFunc();
    // if (!jobSugg || jobSugg.length === 0) {
    //   const JobCategoryList = getjobCategoryListAPI();
    //   JobCategoryList.then((jobcategory) => {
    //     setjobSugg(jobcategory.objects);
    //   });
    // }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobSugg, disabled]);

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
        disabled={disabled || false}
        optionFilterProp="children"
        showArrow={showArrow || false}
        showSearch
        className="text-base"
        placeholder="Search from dropdown"
        onChange={mode === 'multiple' ? handletype : emptyfun}
        onSelect={mode === 'multiple' ? emptyfun : handleSingleSelect}
      >
        {jobSugg
          && jobSugg.map((d) => (
            <Option value={d.id} key={d.name} title={d.name} className="full-width text-base">
              {d.name}
            </Option>
          ))}
      </Select>
    </Form.Item>
  );
};

export default observer(JobCategorySuggInput);
