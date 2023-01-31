import PlusCircleFilled from '@ant-design/icons/PlusCircleFilled';
import {
  Button, Col, Divider, Progress, Row, Typography,
} from 'antd';
import { pricingConstants, pricingConstantsClevertapValue } from 'constants/enum-constants';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { TatalPricingStats } from 'screens/authenticated/jobPostingStep4/commonTypes';
import { pushClevertapEvent } from 'utils/clevertap';

require('screens/authenticated/AccountSummary/accountSummary.less');

const { Text } = Typography;
interface PropsType {
  pricingStats: TatalPricingStats
}

const DesktopAccountSummary = ({ pricingStats }: PropsType): JSX.Element => {
  const [sortedStats, setSortedStats] = useState({});

  const sortedStatsHandler = (): void => {
    const data: TatalPricingStats = {};
    if (pricingStats.JP) {
      data.JP = pricingStats.JP;
    }
    if (pricingStats.FJ) {
      data.FJ = pricingStats.FJ;
    }
    if (pricingStats.APP_UL) {
      data.APP_UL = pricingStats.APP_UL;
    }
    if (pricingStats.DB_UL) {
      data.DB_UL = pricingStats.DB_UL;
    }
    setSortedStats({ ...data });
  };

  const getPercent = (stat): number => ((stat.bought - stat.remaining) / stat.bought) * 100;

  useEffect(() => {
    if (pricingStats) {
      sortedStatsHandler();
    }
  }, [pricingStats]);

  return (
    <Row className="d-account-summary-container">
      {
        Object.keys(sortedStats).map((stat) => (
          <React.Fragment key={stat}>
            <Col span={24} key={stat} className="stat">
              <Row align="top" gutter={[12, 12]}>
                <Col span={19}>
                  <Row>
                    <Col span={24}>
                      <Row justify="space-between">
                        <Col><Text className="text-bold">{pricingConstants[stat]}</Text></Col>
                        <Col>
                          <Text className="stats-remaining">
                            {pricingStats[stat].bought - pricingStats[stat].remaining}
                            /
                          </Text>
                          <Text className="stats-bought">
                            {pricingStats[stat].bought}
                          </Text>
                        </Col>
                      </Row>
                    </Col>
                    <Col span={24}>
                      <Progress percent={getPercent(pricingStats[stat])} showInfo={false} size="small" strokeColor="#e87d15" />
                    </Col>
                  </Row>
                </Col>
                <Col span={5}>
                  <Link href="/pricingPlans" as="/employer-zone/pricing-plans/">
                    <Button
                      type="link"
                      size="small"
                      className="p-all-0 text-bold"
                      icon={<PlusCircleFilled className="add-icon" />}
                      onClick={(): void => {
                        pushClevertapEvent('Add Credits', {
                          Type: `Add ${pricingConstantsClevertapValue[stat]}`,
                          Source: 'Account Summary',
                        });
                      }}
                    >
                      ADD
                    </Button>
                  </Link>
                </Col>
              </Row>
            </Col>
            <Divider />
          </React.Fragment>
        ))
      }
      <Col span={24} className="text-center">
        <Link href="/pricingPlans" as="/employer-zone/pricing-plans/">
          <Button
            type="primary"
            className="br-8"
            onClick={(): void => {
              pushClevertapEvent('Upgrade Plan', {
                Source: 'Account Summary',
              });
            }}
          >
            Upgrade Plan
          </Button>
        </Link>
      </Col>
    </Row>
  );
};

export default DesktopAccountSummary;
