import React, { useState, useEffect } from 'react';
import {
  Modal, Form, Row, Col, Button, notification, InputNumber,
} from 'antd';
import {
  JobDetailsType,
} from 'screens/authenticated/JobDetails/Common/JobDetails.utils';
import GoogleAutoComplete from 'components/StaticPages/Common/GoogleAutocomplete/index';
import { isMobile } from 'mobile-device-detect';
import Locality from 'components/StaticPages/Common/GoogleAutocomplete/Locality';
import { pushClevertapEvent } from 'utils/clevertap';
import CustomImage from 'components/Wrappers/CustomImage';
import { patchJobChanges } from 'screens/authenticated/JobDetails/Common/JobDetails.service';

require('screens/authenticated/JobDetails/Desktop/jobDetails.less');

interface titleI{
  visible:boolean,
  onCancel:()=>void,
  data:JobDetailsType
  patchrequest:(string)=>void,
}
const JobLocations = (props:titleI):JSX.Element => {
  const {
    visible, onCancel, data, patchrequest,
  } = props;
  const [submitInProgress, setSubmitInProgress] = useState(false);
  const [geometry, setGeometry] = useState({});
  const [city, setcity] = useState(data.locations[0].city);
  const [locationData, setLocationData] = useState(data.locations);
  const [totalOpen, setTotalOpen] = useState(data.totalOpening);
  interface locationI{
    // eslint-disable-next-line camelcase
    place_id:string;
    vacancies:number;
  }
  const formDataLocation = (locData):Array<locationI> => {
    const locarr = [] as Array<locationI>;
    for (let i = 0; i < locData.length; i += 1) {
      if (locData[i].place_id) {
        locarr.push(
          {
            place_id: locData[i].place_id,
            vacancies: locData[i].vacancies,
          },
        );
      }
    }
    return locarr;
  };
  const calculateVacancy = (loc):number => {
    let vacancy = 0;
    for (let i = 0; i < loc.length; i += 1) {
      if (loc[i].place_id) {
        vacancy += loc[i].vacancies;
      }
    }
    return vacancy;
  };
  const finishHandler = async (formData):Promise<void> => {
    setSubmitInProgress(true);
    // console.log(formData);
    const locObj = formDataLocation(locationData);
    const obj = {
      city_name: formData.cityName || null,
      locations: locObj || [],
      vacancies: calculateVacancy(locationData),
    };
    // console.log(obj);
    const apiCall = await patchJobChanges(data.id, obj);
    if ([200, 201, 202].indexOf(apiCall.status) > -1) {
      setSubmitInProgress(false);
      patchrequest('success');
      onCancel();
    } else {
      setSubmitInProgress(false);
    }
  };
  const getGeometry = (geometryData): void => {
    setGeometry(geometryData);
  };
  // const handlelocality = (dataloc):void => {
  //   setLocationData(dataloc);
  // };
  const [form] = Form.useForm();
  const checkVaildOpenings = (_rule, value): Promise<void> => {
    if (value) {
      if (value <= 0) {
        return Promise.reject(new Error('Number of openings must be greater than 0.'));
      } if (value > 1000) {
        return Promise.reject(new Error("Vacancies can't be more than 1000."));
      }
    }
    return Promise.resolve();
  };
  const calculateOpening = ():void => {
    const locations = [...locationData];

    // if (locations[fieldName]) {
    //   locations[fieldName].vacancies = Number.isInteger(val) ? val : 0;
    //   applySnapshot(self, { ...self, locations: [...locations] });
    // }

    const vacancies = locations.reduce((prev, curr) => {
      const openings = curr.vacancies ? curr.vacancies : 0;
      return prev + openings;
    }, 0);
    setTotalOpen(vacancies);
  };
  const removeLocationList = (fieldName):void => {
    const remLocation = [...locationData];
    remLocation.splice(fieldName, 1);
    setLocationData(remLocation);
    const vacancies = remLocation.reduce((prev, curr) => {
      const openings = curr.vacancies ? curr.vacancies : 0;
      return prev + openings;
    }, 0);
    setTotalOpen(vacancies);
  };
  const addLocationList = ():void => {
    const locationAdd = [...locationData];

    const obj = {
      place_id: undefined, description: undefined, vacancies: 1, state: '', city: '',
    };
    locationAdd[locationData.length] = obj;

    setLocationData(locationAdd);
    const vacancies = locationAdd.reduce((prev, curr) => {
      const openings = curr.vacancies ? curr.vacancies : 0;
      return prev + openings;
    }, 0);
    setTotalOpen(vacancies);
    form.setFieldsValue({ locations: locationAdd });
  };

  const addFields = (count, add): Array<{name: number; key: number; fieldKey: number}> => {
    const fields: Array<{name: number; key: number; fieldKey: number}> = [];
    for (let i = 0; i < count; i += 1) {
      const field = {
        name: i,
        key: i,
        fieldKey: i,
      };
      fields.push(field);
      add();
    }
    return fields;
  };
  useEffect(() => {
    form.setFieldsValue({
      locations: locationData.map((loc) => {
        return {
          ...loc,
          locality: loc.place_id
            ? { label: loc.description, key: loc.place_id, value: loc.place_id }
            : undefined,
          vacancies: loc.vacancies,
        };
        return loc;
      }),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationData.slice()]);
  // console.log(locationData);
  const removeAll = ():void => {
    const locfirst = [] as any;
    const firstdata = { place_id: undefined, description: undefined, vacancies: 1 };
    locfirst[0] = firstdata;
    setLocationData(locfirst);
    const vacancies = locfirst.reduce((prev, curr) => {
      const openings = curr.vacancies ? curr.vacancies : 0;
      return prev + openings;
    }, 0);
    setTotalOpen(vacancies);
    // setLocationData([]);
  };
  return (
    <Modal
      visible={!!visible}
      footer={null}
      onCancel={onCancel}
      width={400}
      className={isMobile ? 'm-ct-app-actions-modal-mobile' : 'ct-modal-title'}
      title="Edit Job Location"
    >
      <Form
        layout="vertical"
        form={form}
        initialValues={{
          cityName: data.locations[0].city,
        }}
        onFinish={finishHandler}
      >
        <Row gutter={24}>
          <Col span={22}>
            <GoogleAutoComplete
              city={data.locations[0].city}
              callback={getGeometry}
              disabled={false}
              selectHandler={(value): void => {
                if (value) {
                  setcity(value);
                  removeAll();
                  // setremLoc(true);
                }
                // const obj = [{
                //   place_id: undefined, description: undefined, vacancies: 1, state: '', city: '',
                // }];
              }}
            />
          </Col>
        </Row>
        {
          city && (
            <Row key={Math.random()}>
              <Col span={24} style={{ marginBottom: 16 }}>
                {locationData.length > 0
                  ? (
                    <span>
                      Openings Locality-wise
                      <span className="text-semibold">{totalOpen ? ` (total ${totalOpen})` : ''}</span>
                    </span>
                  ) : null}
              </Col>

              <Col span={24}>
                <Form.List name="locations">
                  {(fields, { add, remove }): JSX.Element => {
                    if (fields.length === 0
                      && locationData
                      && locationData.length > 0) {
                    // eslint-disable-next-line no-param-reassign
                      fields = addFields(locationData, add);
                    } else if (fields.length === 0) {
                      fields.push({ name: 0, key: 0, fieldKey: 0 });
                      // console.log(fields);

                      // store.aboutJob.salaryAndWorkTiming.addShiftTiming();
                      add();
                    }

                    return (
                      <>
                        {
                          fields.map((field, index) => (
                            <Row gutter={24} key={field.key}>
                              <Col xs={{ span: 3 }} lg={{ span: 2 }}>
                                <Form.Item>

                                  {`${index + 1}`}

                                </Form.Item>
                              </Col>
                              <Col xs={{ span: 21 }} lg={{ span: 14 }}>
                                <Locality
                                  city={city}
                                  geometry={geometry}
                                  form={form}
                                  field={field}
                                  handlestoreaddlocality={(value): void => {
                                    // console.log(value);
                                    const locCopy = [...locationData];
                                    const obj = {
                                      place_id: value.place_id, description: value.description, vacancies: 1, state: '', city: '',
                                    };
                                    locCopy[field.name] = obj;
                                    setLocationData(locCopy);

                                    form.setFieldsValue({ locations: locCopy });
                                    // store.updateLocality(field.name, value);
                                  }}
                                />
                              </Col>
                              <Col xs={3} lg={0} />
                              <Col xs={{ span: 11 }} lg={{ span: 6 }}>
                                <Form.Item
                                  name={[field.name, 'vacancies']}
                                  fieldKey={[field.key, 'vacancies']}
                                  rules={[
                                    {
                                      required: true,
                                      message: 'Please input number of openings',
                                    },
                                    {
                                      validator: checkVaildOpenings,
                                    },
                                  ]}
                                  // initialValue={1}
                                >
                                  <InputNumber
                                    min={1}
                                    max={1000}
                                    className="text-base"
                                    onChange={(value: number | null): void => {
                                      if (value) {
                                        const locCopy = [...locationData];
                                        locCopy[field.name].vacancies = parseInt(
                                          value.toString(), 10,
                                        );
                                        setLocationData(locCopy);
                                        calculateOpening();
                                      // store.updateLocality(field.name, value);
                                      }
                                    }}
                                    placeholder="Openings"
                                    style={{ width: '100%' }}
                                  />
                                </Form.Item>
                              </Col>
                              <Col
                                xs={{ span: 10 }}
                                lg={{ span: 1 }}
                                style={{ paddingLeft: 0, textAlign: 'right' }}
                              >
                                {
                                  fields.length > 1 && (
                                    <Button
                                      type="link"
                                      className="p-all-0"
                                      icon={<CustomImage src="/svgs/row-delete.svg" height={48} width={48} alt="Row Delete" />}
                                      onClick={(): void => {
                                        remove(field.name);
                                        removeLocationList(field.name);

                                        // store.removeLocation(field.name);
                                      }}
                                    />
                                  )
                                }
                              </Col>
                            </Row>
                          ))
                        }
                        {
                          fields.length < 5 && (
                            <Form.Item>
                              <Button
                                size="small"
                                onClick={(): void => {
                                  addLocationList();
                                  add();
                                }}
                                className="text-semibold jobDetails-lang-btn"
                              >
                                <span className="text-base text-semibold">
                                  + Add another locality
                                </span>
                              </Button>
                            </Form.Item>
                          )
                        }
                      </>
                    );
                  }}
                </Form.List>
              </Col>
            </Row>
          )
        }
        {isMobile
          ? (
            <div className="m-ct-feedback-modal-footer-mobile">
              <Button
                htmlType="submit"
                type="primary"
                className="green-primary-btn"
                loading={submitInProgress}
              >
                Save Changes

              </Button>

            </div>
          )
          : (
            <Form.Item>
              <Button
                htmlType="submit"
                type="primary"
                className="m-jobdetails-submit-btn"
                onClick={(): void => {
                  pushClevertapEvent('Special Click', { Type: 'Update Location' });
                }}
                loading={submitInProgress}
              >
                Save Changes

              </Button>
            </Form.Item>
          ) }
      </Form>
    </Modal>
  );
};
export default JobLocations;
