import React from 'react';
import {
  Row, Col, Typography, Card, Skeleton,
} from 'antd';
import SkeletonInput from 'antd/lib/skeleton/Input';
import Container from 'components/Layout/Container';
import CustomImage from 'components/Wrappers/CustomImage';

const { Paragraph, Text } = Typography;
const EmptyLayout = ():JSX.Element => (
  <Row className="ct-skeleton">
    <Col span={24}>
      <Row className="ct-desktop-header skeleton-header">
        <Col span={24}>
          <Container>
            <Row justify="space-between">
              <Col>
                <Row>
                  <Col>
                    <Skeleton.Image />
                  </Col>
                  <Col style={{ paddingLeft: '24px' }}>
                    <Row>
                      <Col>
                        <SkeletonInput className="ct-loading-btn" active />
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <SkeletonInput className="ct-loading-btn" active />
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <SkeletonInput className="ct-loading-btn" active />
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Col>
              <Col>
                <Card
                  className="ct-profile-card"
                >
                  <Paragraph className="ct-profile-title">Your Profile</Paragraph>
                  <Row>
                    <Col>
                      <SkeletonInput className="ct-loading-btn" active />
                    </Col>
                  </Row>
                  <Row className="ct-empty-row">
                    <SkeletonInput className="ct-loading-btn" active />
                  </Row>
                  <Row className="ct-empty-row">
                    <SkeletonInput className="ct-loading-btn" active />
                  </Row>
                </Card>
              </Col>
            </Row>
          </Container>
        </Col>
      </Row>
      <Row>
        <Container>
          <Col span={24} className="additional-details-container">
            <Row align="middle">
              <Col>
                <CustomImage
                  src="/images/company-tab/startup.svg"
                  width={24}
                  height={25}
                  alt="startup"
                />
                <SkeletonInput className="ct-loading-input" active />
              </Col>
              <Col>
                <CustomImage
                  src="/images/company-tab/building.svg"
                  width={24}
                  height={25}
                  alt="building"
                />
                <SkeletonInput className="ct-loading-input" active />
              </Col>
            </Row>
            <Row align="middle">
              <Col>
                <CustomImage
                  src="/images/company-tab/employee-count.svg"
                  width={24}
                  height={25}
                  alt="edit"
                />
                <SkeletonInput className="ct-loading-input" active />
              </Col>
              <Col>
                <CustomImage
                  src="/images/company-tab/type.svg"
                  width={24}
                  height={24}
                  alt="edit"
                />
                <SkeletonInput className="ct-loading-input" active />
              </Col>
            </Row>
            <Row>
              <Col className="ct-company-description">
                <CustomImage
                  src="/icons/location.svg"
                  width={24}
                  height={24}
                  alt="edit"
                />
                <SkeletonInput className="ct-loading-input" active />
              </Col>
            </Row>
          </Col>
        </Container>
      </Row>
      <Row>
        <Container>
          <Col span={24}>
            <Row>
              <Col className="m-bottom-8">
                <Text className="text-extra-base font-bold">
                  About Company
                </Text>
              </Col>
            </Row>
            <Row>
              <Col>
                <SkeletonInput className="ct-loading-input" active />
              </Col>
            </Row>
          </Col>
        </Container>
      </Row>
      <Row>
        <Container>
          <Col span={24}>
            <Row>
              <Col className="m-bottom-8">
                <Text className="text-extra-base font-bold">
                  Why you should work with Company
                  ?
                </Text>
              </Col>
            </Row>
            <Row>
              <Col>
                <SkeletonInput className="ct-loading-input" active />
              </Col>
            </Row>
          </Col>
        </Container>
      </Row>
      <Row>
        <Container>
          <Col span={24}>
            <Row>
              <Col className="m-bottom-8">
                <Text className="text-extra-base font-bold">
                  Office photos
                </Text>
              </Col>
            </Row>
            <Row>
              <Col>
                <Skeleton.Image />
              </Col>
            </Row>
          </Col>
        </Container>
      </Row>
    </Col>
  </Row>

);

export default EmptyLayout;
