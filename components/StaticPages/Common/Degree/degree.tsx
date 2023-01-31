/* eslint-disable react/jsx-props-no-spreading */
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import {
  Button, Checkbox, Col, Form, Row, Select,
} from 'antd';
import { observer, Observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { degreeAPI, getSpecialDegreeListAPI } from 'service/login-service';
import usePersistedState from 'utils/usePersistedState';
import { degreeElasticFilter } from 'components/StaticPages/Common/Degree/degreeFilter';

const { Option } = Select;

interface IDegreeList{
  id:number;
  name:string;
}

const Degree = ({ store, education }): JSX.Element => {
  const [degreelist, setdegreelist] = useState<Array<IDegreeList>>([]);
  const [specialization, setspecialization] = usePersistedState('specialization_list', '');
  const [specializationObj, setSpecializationObj] = useState({} as any);

  const setDegreeCheck = useState(false)[1];
  const setspecialcheck = useState(false)[1];

  const degreeChange = (): void => {
    setDegreeCheck(true);
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
  if (!specialization) {
    const SpecialDegreeCategoryList = getSpecialDegreeListAPI();
    SpecialDegreeCategoryList.then((categoryInfo) => {
      setspecialization(categoryInfo.objects);
    });
  }

  const specializationID = (ids): number[] => ids.map((item) => specializationObj[item]);

  useEffect(() => {
    const elasticFilters = degreeElasticFilter(education);
    const degreeres = degreeAPI(elasticFilters);
    degreeres.then((degreeInfo) => {
      setdegreelist(degreeInfo.objects);
    });
  }, [education, setdegreelist]);

  useEffect(() => {
    const newObject = {};
    for (let i = 0; i < specialization.length; i += 1) {
      newObject[specialization[i].name] = specialization[i].id;
    }
    setSpecializationObj(newObject);
  }, [specialization]);

  return (
    <Form.List name="degrees">
      {(fields, { add, remove }): JSX.Element => {
        if (fields.length === 0 && store.degrees && store.degrees.length > 0) {
          // eslint-disable-next-line no-param-reassign
          fields = addFields(store.degrees.length, add);
        } else if (fields.length === 0) {
          fields.push({ name: 0, key: 0, fieldKey: 0 });
          store.addDegree();
          add();
        }
        return (
          <>
            <Row gutter={24} style={{ marginBottom: 8 }}>
              <Col xs={{ span: 20 }} lg={{ span: 11 }}>
                Degree
              </Col>
              <Col xs={{ span: 20 }} lg={{ span: 11 }}>
                Specialization
              </Col>
            </Row>
            {
              fields.map((field, index) => (
                <Form.Item
                  {...field}
                  style={{ marginBottom: 16 }}
                  key={field.fieldKey}
                >
                  <Row gutter={24}>
                    <Col xs={20} lg={11}>
                      <Form.Item
                        key={field.name}
                        name={field.name}
                        label={index === 0 ? 'Degree' : ''}
                        // style={{ marginBottom: 0 }}
                        noStyle
                      >
                        <Select
                          value={store.degrees.length > 0
                            ? store.degrees[field.name].degree
                            : undefined}
                          placeholder="Select Degree"
                          onChange={degreeChange}
                          onSelect={(val, option): void => {
                            store.updateDegree(option.title, field.name);
                            store.updateDegreeid(val, field.name);
                          }}
                          className="text-base"
                          style={{ overflow: 'auto' }}
                        >
                          {degreelist.length > 0
                            && degreelist.map((d) => (
                              <Option value={d.id} title={d.name} key={Math.random()}>
                                {d.name}
                              </Option>
                            ))}
                        </Select>
                        <Observer>
                          {(): JSX.Element => (
                            <>
                              {
                                store.degrees[field.name].enableDegree
                                  ? (
                                    <Form.Item
                                      valuePropName="checked"
                                      style={{ marginBottom: 0 }}
                                    >
                                      <Checkbox
                                        defaultChecked={store.degrees.length > 0
                                          ? store.degrees[field.name].degreeMandatory
                                          : false}
                                        onChange={(e): void => {
                                          store.updateDegreeMandatory(field.name, e.target.checked);
                                        }}
                                      >
                                        Mandatory
                                      </Checkbox>
                                    </Form.Item>
                                  ) : null
                              }
                            </>
                          )}
                        </Observer>
                      </Form.Item>
                    </Col>

                    {/* Specialization */}
                    <Col xs={20} lg={11}>
                      <Form.Item
                        label={index === 0 ? 'Specialization' : null}
                        name="specialization"
                        noStyle
                        style={{ marginBottom: 0 }}
                      >
                        <Select
                          mode="multiple"
                          onChange={(val): void => {
                            store.updateSpecialization(val, field.name);
                            store.updateSpecializationId(specializationID(val), field.name);
                          }}
                          defaultValue={store.degrees.length > 0 ? store.degrees[field.name].specialization : ''}
                          onSelect={(): void => {
                            setspecialcheck(true);
                          }}
                          className="text-base"
                          placeholder="Select Specialization"
                        >
                          {specialization && specialization.length > 0
                            && specialization.map((d) => (
                              <Option value={d.name} key={d.id} title={d.id} className="full-width">
                                {d.name}
                              </Option>
                            ))}
                        </Select>

                        <Observer>
                          {(): JSX.Element => (
                            <>
                              {
                                store.degrees[field.name].enableSpecialization
                                  ? (
                                    <Form.Item
                                      valuePropName="checked"
                                    >
                                      <Checkbox
                                        defaultChecked={store.degrees.length > 0
                                          ? store.degrees[field.name].specializationMandatory
                                          : false}
                                        onChange={(e): void => {
                                          store.updateSpecializationmandatory(
                                            field.name, e.target.checked,
                                          );
                                        }}
                                      >
                                        Mandatory
                                      </Checkbox>
                                    </Form.Item>
                                  ) : null
                              }
                            </>
                          )}
                        </Observer>
                      </Form.Item>
                    </Col>
                    <Col
                      xs={{ span: 2 }}
                      md={{ span: 2 }}
                      style={{ paddingLeft: 0 }}
                    >
                      {
                        fields.length > 1 && (
                          <CloseOutlined
                            className="d-jp-close-icon"
                            style={{ marginTop: 12 }}
                            onClick={(): void => {
                              remove(field.name);
                              store.removeDegree(field.name);
                            }}
                          />
                        )
                      }
                    </Col>
                  </Row>
                </Form.Item>
              ))
            }

            {/* Add Another Degree CTA */}
            <Form.Item noStyle>
              <Button
                type="link"
                style={{ padding: 0 }}
                size="small"
                onClick={(): void => {
                  store.addDegree();
                  add();
                }}
              >
                <span className="text-base text-semibold">
                  + Add another Degree
                </span>
              </Button>
            </Form.Item>
          </>
        );
      }}
    </Form.List>
  );
};
Degree.propTypes = {
  store: PropTypes.oneOfType([PropTypes.object]).isRequired,
  education: PropTypes.number.isRequired,
};
export default observer(Degree);
