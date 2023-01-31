/* eslint-disable react/require-default-props */
import React from 'react';
import {
  Row, Col, Typography, Button, Divider, Skeleton, Space,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';

const { Text } = Typography;

interface EmptySkeletonProps {
  title: string;
  image?: string;
}

const EmptySkeleton = ({ title, image }: EmptySkeletonProps): JSX.Element => (
  <Row justify="space-between" align="middle">
    <Col>
      <Space align="center" className="display-flex" size={16}>
        {
          image && (
            <div className="display-flex">
              <CustomImage
                src={`/images/settings/${image}.svg`}
                width={24}
                height={24}
                alt="phone icon"
              />
            </div>
          )
        }
        <Space direction="vertical" size={0}>
          <Text className="field-label">{title}</Text>
          <Skeleton.Input size="small" active />
        </Space>
      </Space>
    </Col>
    <Col>
      <Skeleton.Button size="small" active />
    </Col>
  </Row>
);

const Settings = ():JSX.Element => (
  <Row className="settings-page-container">
    <Col span={24}>
      <Row className="settings-wrapper" gutter={[0, 32]}>
        <Col span={24} className="setting-container">
          <Row>
            <Col span={24}>
              <CustomImage
                src="/images/settings/banner.svg"
                width={554}
                height={116}
                className="user-name-banner"
                alt="settings page banner"
              />
              <Space className="user-name-wrapper">
                <Skeleton.Input active size="small" />
              </Space>
            </Col>
            <Col span={24}>
              <Row gutter={[0, 12]}>
                <Col span={24} className="p-all-16">
                  <EmptySkeleton title="Mobile no." image="blackPhoneIcon" />
                </Col>
                <Divider style={{ margin: 0 }} />
                <Col span={24} className="p-all-16">
                  <EmptySkeleton title="Email" image="blackEmailIcon" />
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <Row gutter={[0, 8]}>
            <Col span={24}>
              <Text className="label-header main-header-label">Verification details</Text>
            </Col>
            <Col span={24}>
              <Row className="setting-container">
                <Col span={24} className="p-all-16">
                  <EmptySkeleton title="Category" />
                </Col>
                <Col span={24} className="p-all-16">
                  <EmptySkeleton title="Registered Company Name" />
                </Col>
                <Col span={24} className="p-all-16">
                  <EmptySkeleton title="GST" />
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <Row gutter={[0, 8]}>
            <Col span={24}>
              <Text className="label-header main-header-label">Settings</Text>
            </Col>
            <Col span={24}>
              <Space>
                <CustomImage
                  src="/images/settings/changePasswordIcon.svg"
                  width={26}
                  height={24}
                  alt="password"
                />
                <Text>Change Password</Text>
              </Space>
            </Col>
          </Row>
        </Col>

        <Col span={24}>
          <Row gutter={[0, 16]}>
            <Col span={24}>
              <Text className="label-header main-header-label">Secondary Manager Details</Text>
            </Col>
            <Col span={24}>
              <Row>
                <Col span={24} className="setting-container p-all-16">
                  <Row gutter={[0, 20]}>
                    <Col span={24}>
                      <Row justify="space-between" align="middle">
                        <Col>
                          <Skeleton.Input active size="small" />
                        </Col>
                        <Col>
                          <Button
                            type="link"
                            disabled
                            className="remove-btn text-small p-all-0"
                          >
                            Remove
                            <CustomImage
                              src="/images/settings/binIcon.svg"
                              width={24}
                              height={24}
                              alt="bin icon"
                            />
                          </Button>
                        </Col>
                      </Row>
                    </Col>
                    <Col span={24}>
                      <Space direction="vertical">
                        <Space direction="horizontal" align="center" size={10}>
                          <div className="display-flex">
                            <CustomImage
                              src="/images/settings/greyEmailIcon.svg"
                              width={20}
                              height={20}
                              alt="settings page banner"
                            />
                          </div>
                          <Skeleton.Input size="small" active />
                        </Space>
                        <Space direction="horizontal" align="center">
                          <div className="display-flex">
                            <CustomImage
                              src="/images/settings/greyPhoneIcon.svg"
                              width={20}
                              height={20}
                              alt="settings page banner"
                            />
                          </div>
                          <Skeleton.Input size="small" active />
                        </Space>
                      </Space>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    </Col>
  </Row>
);

export default Settings;
