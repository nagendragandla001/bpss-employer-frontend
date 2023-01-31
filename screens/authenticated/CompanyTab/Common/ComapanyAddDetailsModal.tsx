import {
  Button, Col, Form, Modal, Row, Select, Typography,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import snackBar from 'components/Notifications';
import { isMobile } from 'mobile-device-detect';
import React, { useState } from 'react';
import { OrganizationDetailsType } from 'screens/authenticated/CompanyTab/Common/CompanyTabUtils';
import { cityApi, industryApi, patchOrgDetails } from 'service/organization-service';
import { pushClevertapEvent } from 'utils/clevertap';
import usePersistedState from 'utils/usePersistedState';
// interface DataInterface{
//   id:number,
//   name:string,
// }
const { Text } = Typography;
interface PropsI{
  visibleModal:boolean,
  onCancel:()=>void;
  data: OrganizationDetailsType;
  patchrequest :(any)=>void
}
const { Option } = Select;
const CompanyAddDetails = (props:PropsI):JSX.Element => {
  const {
    visibleModal, onCancel, data, patchrequest,
  } = props;
  const [submitInProgress, setSubmitInProgress] = useState(false);
  const [industry, setIndustry] = usePersistedState('company_industry_list', '');
  const [city, setCity] = usePersistedState('company_city_list', '');
  const finishHandler = async (formData):Promise<void> => {
    setSubmitInProgress(true);
    // console.log(formData);
    const patchobj = {
      city_id: formData.headQ,
      employee_count: formData.employeeCount,
      // type: formData.type,
      industry_id: formData.industry,
      year_of_establishment: formData.year,
      operating_cities_list: formData.cities,
      id: data.id,
    };

    const res = await patchOrgDetails(patchobj, data.id);
    if ([200, 201, 202].indexOf(res.status) > -1) {
      setSubmitInProgress(false);
      onCancel();
      pushClevertapEvent('Profile Additional Details', { Type: 'Save', Status: 'Success' });
      patchrequest('success');
    } else {
      setSubmitInProgress(false);
      pushClevertapEvent('Profile Additional Details', { Type: 'Save', Status: 'Failure' });
      snackBar({
        title: 'Your details cannot be saved right now Plesae try again after some time',
        description: '',
        iconName: '',
        notificationType: 'error',
        placement: 'topRight',
        duration: 5,
      });
    }
  };
  const years = [] as any;

  const currentYear = new Date().getFullYear();
  let startYear;
  startYear = startYear || 1980;
  while (startYear <= currentYear) {
    startYear += 1;
    years.push(<Option key={startYear} value={startYear}>{startYear }</Option>);
  }

  if (!industry) {
    const industryList = industryApi();

    industryList.then((industryInfo) => {
      setIndustry(industryInfo && industryInfo.objects);
    });
  }

  if (!city) {
    const filter = { filter: JSON.stringify({ and: { state_id: { exists: 'True' } } }), limit: 1000 };
    const cityList = cityApi(filter);
    cityList.then((cityInfo) => {
      setCity(cityInfo && cityInfo.objects);
    });
  }

  const populateCities = ():number[] => {
    const cities = [] as number[];
    if (data.operatingCities && data.operatingCities.length > 0) {
      for (let i = 0; i < data.operatingCities.length; i += 1) {
        if (cities.indexOf(data.operatingCities[i].id) === -1) {
          cities.push(data.operatingCities[i].id);
        }
      }
    }
    return cities;
  };
  // useEffect(() => {
  //   industryCategory();
  //   cityCategory();
  // }, []);
  return (
    <Modal
      visible={!!visibleModal}
      onCancel={onCancel}
      title={isMobile ? (
        <Row key="job-details" className="ct-title" gutter={16}>
          <Col onClick={onCancel}><CustomImage src="/svgs/m-close.svg" width={24} height={24} alt="Close" /></Col>
          <Col className="ct-v-auto"><Text className="title">Additional Details</Text></Col>
        </Row>
      ) : 'Additional Details'}
      okText="Save & Close"
      width={416}
      className={isMobile ? 'm-ct-app-actions-modal-mobile' : 'ct-modal-title'}
      footer={null}
      closable={false}
    >
      <Form
        layout="vertical"
        initialValues={{
          year: data.yearOfEstablishment,
          employeeCount: data.employeeCount,
          // type: data.type,
          industry: data.industry ? data.industry.id : '',
          headQ: data.headQ ? data.headQ.id : '',
          cities: populateCities(),
          website: data.website,
          facebook: data.facebook,
          linkedin: data.linkedin,
          twitter: data.twitter,
          glassdoor: data.glassdoor,
        }}
        onFinish={finishHandler}
      >

        <Form.Item
          label="Founded Year"
          name="year"

        >
          <Select
            getPopupContainer={(TriggerNode:HTMLElement):HTMLElement => TriggerNode}
            placeholder="Select year"
          >
            {years}
          </Select>
        </Form.Item>
        <Form.Item
          label="No of Employees"
          name="employeeCount"

        >
          <Select
            getPopupContainer={(TriggerNode:HTMLElement):HTMLElement => TriggerNode}
            placeholder="Select No of Employees"
          >
            <Option value={0}>below 50</Option>
            <Option value={1}>50-200</Option>
            <Option value={2}>200-500</Option>
            <Option value={3}>500-1000</Option>
            <Option value={4}>Above 1000</Option>
          </Select>
        </Form.Item>
        {/* <Form.Item
          label="Type"
          name="type"

        >
          <Select
            getPopupContainer={(TriggerNode:HTMLElement):HTMLElement => TriggerNode}
            placeholder="Select Type"
          >
            <Option value="STA">Startup</Option>
            <Option value="SME">Small Medium Enterprises (SMEs)</Option>
            <Option value="IND">Individual Employer</Option>
            <Option value="CORP">Corporate</Option>
            <Option value="HR">Agency/HR firm</Option>
          </Select>
        </Form.Item> */}
        <Form.Item
          label="Industry"
          name="industry"
        >
          <Select
            getPopupContainer={(TriggerNode:HTMLElement):HTMLElement => TriggerNode}
            placeholder="Select Type"
          >
            {industry.length > 0 && industry.map((ind) => (
              <Option key={ind.id} value={ind.id}>{ind.name}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Company Location"
          name="headQ"

        >
          <Select
            showArrow
            getPopupContainer={(TriggerNode:HTMLElement):HTMLElement => TriggerNode}
            placeholder="e.g. Mumbai"
          >
            {city.length > 0 && city.map((place) => (
              <Option key={place.id} value={place.id}>{place.name}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Cities where you have offices"
          name="cities"

        >

          <Select
            mode="multiple"
            showSearch
            showArrow
            optionFilterProp="label"
            getPopupContainer={(TriggerNode:HTMLElement):HTMLElement => TriggerNode}
            placeholder="Type to add"
          >
            {city.length > 0 && city.map((place) => (
              <Option key={place.id} value={place.id} label={place.name}>{place.name}</Option>
            ))}
          </Select>
        </Form.Item>

        {isMobile
          ? (
            <div className="m-ct-feedback-modal-footer-mobile">
              <Button
                htmlType="submit"
                type="primary"
                className="green-primary-btn"
                loading={submitInProgress}
                // className="ct-cancel-btn"
                // onClick={finishHandler}
                // onClick={():void => {
                //   pushClevertapEvent('Profile Additional Details', { Type: 'Save' });
                // }}
              >
                Save & Close

              </Button>

            </div>
          )
          : (
            <>
              <Button
                htmlType="submit"
                className="ct-cancel-btn-add"
                onClick={():void => {
                  onCancel();
                  pushClevertapEvent('Profile Additional Details', { Type: 'Cancel' });
                }}
              >
                Cancel

              </Button>
              <Button
                htmlType="submit"
                className="ct-save-btn"
                loading={submitInProgress}
                // onClick={():void => {
                //   pushClevertapEvent('Profile Additional Details', { Type: 'Save' });
                // }}
              >
                Save & Close

              </Button>
            </>
          )}

      </Form>

    </Modal>

  );
};
export default CompanyAddDetails;
