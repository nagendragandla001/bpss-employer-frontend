// - Employer Settings Page Skeletopn
// - Created by Koushik on 19/08/2020

import React from 'react';
import {
  Row, Col, Typography, Button, Divider, Skeleton,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';

const { Text } = Typography;

const Settings = ():JSX.Element => (
  <>
    <Row>
      <Col span={24} className="userDetails-container">
        <Row>
          <Col span={24} className="user-name-banner">
            <CustomImage
              src="/images/settings/banner.svg"
              width={360}
              height={136}
              alt="settings page banner"
            />
            <Text className="user-name">
              <span>
                <Skeleton.Input
                  style={{
                    height: 32,
                    width: 150,
                  }}
                  active
                />
              </span>
              <Button type="link" className="user-name-edit-btn">
                <CustomImage
                  src="/images/settings/pencilIcon.svg"
                  width={24}
                  height={24}
                  alt="settings page banner"
                />
              </Button>
            </Text>
          </Col>
        </Row>
        <Row className="userDetail-container">
          <Col className="display-flex">
            <CustomImage
              src="/images/settings/blackEmailIcon.svg"
              width={24}
              height={24}
              alt="email icon"
            />
          </Col>
          <Col span={22}>
            <Row justify="space-between">
              <Col className="m-left-16">
                <Row>
                  <Col span={24}>
                    <Text className="label-header">Email</Text>
                  </Col>
                </Row>
                <Row>
                  <Col className="display-flex">
                    <Text className="user-detail">
                      <Skeleton.Input style={{ height: 20, width: 150 }} active />
                    </Text>
                  </Col>
                </Row>
              </Col>
              <Col>
                <Button type="link" className="user-details-change-btn">
                  Change
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
        <Divider className="settings-divider" />
        <Row className="userDetail-container">
          <Col className="display-flex">
            <CustomImage
              src="/images/settings/blackPhoneIcon.svg"
              width={24}
              height={24}
              alt="phone icon"
            />
          </Col>
          <Col span={22}>
            <Row justify="space-between">
              <Col className="m-left-16">
                <Row>
                  <Col>
                    <Text className="label-header">Mobile no.</Text>
                  </Col>
                </Row>
                <Row>
                  <Col className="display-flex">
                    <Skeleton.Input style={{ height: 20, width: 100 }} active />
                  </Col>
                </Row>
              </Col>
              <Col>
                <Button type="link" className="user-details-change-btn">
                  Change
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>
    </Row>
    <Row>
      <Col span={24} className="passbook-details-container">
        <CustomImage
          src="/images/settings/passbookBanner.svg"
          width={344}
          height={130}
          alt="passbook banner"
        />
        <Row className="passbook-details-money-icon">
          <Col span={24}>
            <CustomImage
              src="/images/settings/moneyBag.svg"
              alt="money bag icon"
            />
          </Col>
        </Row>
        <Row className="passbook-details">
          <Col span={24}>
            <Text className="wallet-text">Wallet Balance</Text>
            <Text className="wallet-balance">₹0</Text>
          </Col>
        </Row>
        <Row>
          <Col className="passbook-link-btn">
            <Button type="link">
              View Passbook
              <CustomImage
                src="/images/settings/rightArrow.svg"
                width={24}
                height={24}
                alt="passbook banner"
              />
            </Button>
          </Col>
        </Row>
      </Col>
    </Row>
    <Row>
      <Col span={24}>
        <Row>
          <Col>
            <Text className="header">Settings</Text>
          </Col>
        </Row>
        <Row className="setting-container">
          <Col>
            <CustomImage
              src="/images/settings/changePasswordIcon.svg"
              width={26}
              height={24}
              alt="email notification icon"
            />
          </Col>
          <Col span={20} className="m-left-16">
            <Button type="link" className="label pwd-btn">
              Change Password
            </Button>
          </Col>
        </Row>
        <Divider className="settings-divider" />
        <Row className="setting-container">
          <Col>
            <CustomImage
              src="/images/settings/logoutIcon.svg"
              width={24}
              height={24}
              alt="email notification icon"
            />
          </Col>
          <Col span={20} className="m-left-16">
            <Button type="link" className="label pwd-btn">
              Logout
            </Button>
          </Col>
        </Row>
      </Col>
    </Row>
  </>
);

export default Settings;
