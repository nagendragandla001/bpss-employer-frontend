import React from 'react';
import {
  Row, Col, Typography, Skeleton,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';

require('screens/authenticated/Passbook/passbook.less');

const { Text } = Typography;

const passbookDetails = [1, 2];

const Passbook = ():JSX.Element => (
  <>
    <Row>
      <Col span={24} className="header">
        <Text>Your Passbook</Text>
      </Col>
    </Row>
    <Row className="passbook">
      <Col span={24}>
        <Row justify="space-between" align="middle" className="passbook-details-container">
          <Col>
            <CustomImage
              src="/images/settings/moneyBag.svg"
              alt="money bag icon"
            />
          </Col>
          <Col className="passbook-details">
            <Text className="wallet-text">Premium Job Credits</Text>
            <Text className="wallet-balance">
              <Skeleton.Input style={{ height: 38, width: 20 }} active />
              <div className="padding-left-4">
                <CustomImage
                  src="/svgs/premium-jp-coin-24x24.svg"
                  alt="free jp icon"
                  width={24}
                  height={24}
                />
              </div>
            </Text>
          </Col>
        </Row>
        <Row
          align="middle"
          justify="space-between"
          className="header"
        >
          <Col>
            <Text>Recent Transactions</Text>
          </Col>
          <Col>
            <Text>Amount</Text>
          </Col>
        </Row>
        {passbookDetails.map((item) => (
          <Row
            key={item}
            className="txn-details"
          >
            <Col span={24}>
              <Row
                align="top"
                justify="space-between"
                className="p-bottom-1rem"
              >
                <Col>
                  <Row>
                    <Col>
                      <Text className="txn-title">
                        <Skeleton.Input style={{ height: 20, width: 150 }} active />
                      </Text>
                    </Col>
                  </Row>
                </Col>
                <Col className="txn-amount">
                  <Text>
                    <Skeleton.Input style={{ height: 30, width: 70 }} active />
                  </Text>
                </Col>
              </Row>
              <Row
                align="middle"
                justify="space-between"
              >
                <Col>
                  <Text className="txn-date">
                    <Skeleton.Input style={{ height: 10, width: 150 }} active />
                  </Text>
                </Col>
              </Row>
            </Col>
          </Row>
        ))}
      </Col>
    </Row>
  </>

);

export default Passbook;
