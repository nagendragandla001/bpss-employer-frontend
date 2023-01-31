/* eslint-disable import/no-cycle */
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import {
  Button, Col, Row, Typography,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import React, { useEffect, useState } from 'react';
import { PricingPlanType } from 'screens/authenticated/jobPostingStep4/commonTypes';
import { pushClevertapEvent } from 'utils/clevertap';

require('screens/authenticated/jobPostingStep4/addOns.less');

const { Text } = Typography;

const addOnsMap = {
  APP_UL: {
    title: 'Application unlocks',
    description: 'Make the most of your applications and unlock their contact details',
  },
  FJ: {
    title: 'Promoted Job Posts',
    description: 'Get 3x visibility for your job posts',
  },
  DB_UL: {
    title: 'Database Unlocks',
    description: 'Unlock the most suited candidates from our database',
  },
};
interface PropsType {
  plans: Array<PricingPlanType>;
  buyingPlanHandler: (plan: any) => void
}

type GroupPlansType = {
  APP_UL: Array<PricingPlanType>,
  FJ: Array<PricingPlanType>,
  DB_UL: Array<PricingPlanType>,
  JP?: Array<PricingPlanType>,
}

const eitherSort = (arr) => {
  const sorter = (a, b) => +a.unit_cost - +b.unit_cost;
  arr.sort(sorter);
  return arr;
};
const AddOns = (props: PropsType): JSX.Element => {
  const { plans, buyingPlanHandler } = props;

  const [groupPlans, setGroupPlans] = useState<GroupPlansType>({
    APP_UL: [],
    FJ: [],
    DB_UL: [],
  });

  const segregatePlans = (): void => {
    const data: GroupPlansType = {
      APP_UL: [],
      FJ: [],
      DB_UL: [],
    };
    plans.forEach((plan: PricingPlanType) => {
      if (plan.offerings[0].code === 'APP_UL') {
        data.APP_UL = [...data.APP_UL, plan];
      } else if (plan.offerings[0].code === 'FJ') {
        data.FJ = [...data.FJ, plan];
      } else if (plan.offerings[0].code === 'DB_UL') {
        data.DB_UL = [...data.DB_UL, plan];
      }
    });

    setGroupPlans({
      APP_UL: eitherSort(data.APP_UL),
      FJ: eitherSort(data.FJ),
      DB_UL: eitherSort(data.DB_UL),
    });
  };

  const addOnWrapper = (key): JSX.Element => (
    <Row gutter={[24, 24]} className="add-on-section">
      <Col span={24}>
        <Row align="middle">
          <CustomImage
            src={`/images/pricing-plan/${key}.svg`}
            alt={key}
            className="add-on-icon"
            // layout
          />
          <Col span={16}>

            <Text className="add-on-title">
              {' '}
              {addOnsMap[key].title}
            </Text>
          </Col>
          <Col span={23}>
            <Text className="description">{addOnsMap[key].description}</Text>
          </Col>
        </Row>
      </Col>
      <Col span={24}>
        <Row gutter={[24, 24]}>
          {
            groupPlans[key].map((plan) => (
              <Col xs={{ span: 24 }} lg={{ span: 7 }} key={plan.name}>
                <Row className="add-on-block">
                  {
                    plan.offerings.map((offer) => (
                      <Col key={offer.id}>
                        {/* <div> */}
                        <Row className="add-on">
                          <Col span={24}>
                            <Text className="limit">{offer.limit}</Text>
                          </Col>
                          <Col span={24}>
                            <Row>
                              <Col span={16}>
                                <Row>
                                  <Col span={24}>
                                    <Text className="text-medium">{offer.name}</Text>
                                  </Col>
                                  <Col span={24}>
                                    <Text className="description">
                                      valid for
                                      {' '}
                                      {offer.validity}
                                      {' '}
                                      days
                                    </Text>
                                  </Col>
                                </Row>
                              </Col>
                              <Col span={8} className="text-center add-on-action">
                                <Row>
                                  <Col span={24}>
                                    <Text className="text-medium text-bold">
                                      ₹
                                      {plan.unit_cost}
                                    </Text>
                                  </Col>
                                  <Col span={24}>
                                    <Button.Group size="small" className="full-width">
                                      <Button
                                        type="primary"
                                        block
                                        className="add-on-action-btn"
                                        size="small"
                                        onClick={(): void => {
                                          buyingPlanHandler(plan);
                                          pushClevertapEvent('General Click', {
                                            Type: 'Buy Plan',
                                            'Plan Type': `${offer.name} ${offer.limit}`,
                                          });
                                        }}
                                      >
                                        Buy
                                      </Button>
                                      <Button
                                        type="primary"
                                        className="add-on-action-suffix-btn"
                                        size="small"
                                        icon={<PlusOutlined />}
                                        onClick={(): void => {
                                          buyingPlanHandler(plan);
                                          pushClevertapEvent('General Click', {
                                            Type: 'Buy Plan',
                                            'Plan Type': `${offer.name} ${offer.validity}`,
                                          });
                                        }}
                                      />
                                    </Button.Group>
                                  </Col>
                                </Row>
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                        {/* </div> */}
                      </Col>
                    ))
                  }
                </Row>
              </Col>
            ))
          }
        </Row>
      </Col>
    </Row>
  );

  useEffect(() => {
    segregatePlans();
  }, [plans]);

  return (
    <Row className="add-ons-container" gutter={[50, 50]}>
      <Col span={24} className="addon-main-title add-on-title">
        <Text>Or Choose Add Ons for your current plan</Text>
      </Col>
      {
        groupPlans.FJ.length > 0 ? (
          <Col span={24}>{addOnWrapper('FJ')}</Col>
        ) : null
      }
      {
        groupPlans.APP_UL.length > 0 ? (
          <Col span={24}>{addOnWrapper('APP_UL')}</Col>
        ) : null
      }
      {
        groupPlans.DB_UL.length > 0 ? (
          <Col span={24}>{addOnWrapper('DB_UL')}</Col>
        ) : null
      }
    </Row>
  );
};

export default AddOns;
