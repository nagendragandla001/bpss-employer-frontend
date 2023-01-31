import PlusCircleFilled from '@ant-design/icons/PlusCircleFilled';
import {
  Col, Card, Row, Button, Progress, Typography,
} from 'antd';
import React from 'react';
import router from 'routes';
import { pushClevertapEvent } from 'utils/clevertap';

require('screens/authenticated/AccountSummary/accountSummary.less');

const { Text } = Typography;

interface PropsI {
  text: string;
  remaining: number;
  total: number;
}
const AccountSummary = (props: PropsI): JSX.Element => {
  const { text, remaining, total } = props;
  return (
    <Col className="d-account-summary-container at-summary">
      <Card title="Account Summary">
        <Row>
          <Col span={24} className="stat">
            <Row align="top" gutter={[12, 12]}>
              <Col span={19}>
                <Row>
                  <Col span={24}>
                    <Row justify="space-between">
                      <Col>
                        <Text className="text-bold">{text}</Text>
                      </Col>
                      <Col>
                        <Text className="stats-remaining">
                          {total - remaining}
                          /
                        </Text>
                        <Text className="stats-bought">{total}</Text>
                      </Col>
                    </Row>
                  </Col>
                  <Col span={24}>
                    <Progress
                      percent={((total - remaining) / total) * 100}
                      showInfo={false}
                      size="small"
                      strokeColor="#e87d15"
                    />
                  </Col>
                </Row>
              </Col>
              <Col span={5}>
                <Button
                  onClick={(): void => {
                    pushClevertapEvent('Add Credits', {
                      Type: text === 'Database Unlocks Used'
                        ? 'Add db unlock credits'
                        : 'Add app unlock credits',
                      Source: 'Account Summary',
                    });
                    router.Router.pushRoute('PricingPlans');
                  }}
                  type="link"
                  size="small"
                  className="p-all-0 text-bold"
                  icon={<PlusCircleFilled className="add-icon" />}
                >
                  ADD
                </Button>
              </Col>
            </Row>
          </Col>
          {text === 'Database Unlocks Used' ? (
            <Col span={24} className="m-top-10">
              <Text className="text-small text-disabled">
                * Our fair usage policy allows for a maximum of 999 unlocks
              </Text>
            </Col>
          ) : null}
        </Row>
      </Card>
    </Col>
  );
};
export default AccountSummary;
