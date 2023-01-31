import React from 'react';
import {
  Row, Col, Divider, Button, Typography, Skeleton, Progress,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';

const { Text } = Typography;

const jobs = [1, 2, 3, 4, 5, 6];

interface PropsInterface {
  currentTab: string;
}

const JobCardsSkeleton = (props: PropsInterface): JSX.Element => (
  <>
    {jobs && jobs.map((job) => (
      <Row className={`job-card-container${props.currentTab === 'drafts' ? ' draft-card-container' : ''}`} key={job}>
        <Col span={24}>
          <Row className="job-details-container">
            <Col span={12} className="job-title display-flex flex-direction-column">
              {props.currentTab === 'drafts' ? <Text className="font-bold color-blue-grey-5 text-small">DRAFT</Text> : null}
              <Skeleton.Input style={{ width: 200, height: 24 }} active size="small" />
              <Skeleton.Input style={{ width: 300, height: 20, marginTop: 8 }} active size="small" />
            </Col>
            <Col span={12} className="app-stats-container">
              {props.currentTab === 'drafts' || props.currentTab === 'open' ? null : (
                <>
                  <Row>
                    <Col>
                      <Text className="text-base">Total Applications:&nbsp;</Text>
                      <Skeleton.Button style={{ width: 30, height: 20 }} active />
                    </Col>
                  </Row>
                  <Row className="p-top-8" style={{ justifyContent: 'space-evenly' }}>
                    <Col className="app-stat-box">
                      <Text className="text-small">
                        Applied
                      </Text>
                      <Skeleton.Button className="p-top-8" style={{ width: 30, height: 24 }} active />
                    </Col>
                    <Col className="app-stat-box">
                      <Text className="text-small" style={{ color: '#4727ad' }}>
                        Interviews
                      </Text>
                      <Skeleton.Button className="p-top-8" style={{ width: 30, height: 24 }} active />
                    </Col>
                    <Col className="app-stat-box">
                      <Text className="text-small" style={{ color: '#4727ad' }}>
                        Selection
                      </Text>
                      <Skeleton.Button className="p-top-8" style={{ width: 30, height: 24 }} active />
                    </Col>
                  </Row>
                </>
              )}
              {props.currentTab === 'open' ? (
                <>
                  <Row>
                    <Col>
                      <Text className="text-base">Total Applications:&nbsp;</Text>
                      <Skeleton.Button style={{ width: 30, height: 20 }} active />
                    </Col>
                  </Row>
                  <Row className="p-top-8" style={{ justifyContent: 'space-evenly' }}>
                    <Col className="app-stat-box">
                      <Text className="text-small">
                        Applied
                      </Text>
                      <Skeleton.Button className="p-top-8" style={{ width: 30, height: 24 }} active />
                    </Col>
                    <Col className="app-stat-box">
                      <Text className="text-small" style={{ color: '#4727ad' }}>
                        Database
                      </Text>
                      <Skeleton.Button className="p-top-8" style={{ width: 30, height: 24 }} active />
                    </Col>
                  </Row>
                </>
              ) : null}
            </Col>
          </Row>
          {props.currentTab === 'drafts' ? (
            <Progress
              percent={0}
              status="active"
              showInfo={false}
              className="draft-progress-bar"
              trailColor="#e0e0e0"
            />
          ) : <Divider className="divider" />}
          <Row className={`job-card-footer${props.currentTab === 'drafts' ? ' draft-footer' : ''}`}>
            <Col span={12} className={`display-flex ${props.currentTab === 'drafts' ? '' : 'margin-right-2rem'}`}>
              {props.currentTab === 'drafts' ? (
                <Row>
                  <Col>
                    <Text className="color-charcoal-6 text-small">You were editing</Text>
                    <br />
                    <Skeleton.Input style={{ width: 100, height: 20 }} active />
                  </Col>
                </Row>
              ) : (
                <>
                  {props.currentTab !== 'closed'
                    ? (
                      <Button
                        className="link-btn font-bold"
                      >

                        <CustomImage
                          src="/images/jobs-tab/pencil-icon-24x24.svg"
                          height={24}
                          width={24}
                          alt="pencil Icon"
                          className="p-right-2"
                          // style={{ paddingRight: 2 }}
                        />
                        Edit

                      </Button>

                    ) : null}
                  {props.currentTab === 'open' ? (
                    <Button className="link-btn font-bold">
                      <CustomImage
                        src="/images/jobs-tab/share-icon-24x24.svg"
                        height={24}
                        width={24}
                        alt="share Icon"
                        className="p-right-2"
                        // style={{ paddingRight: 2 }}
                      />
                      Share
                    </Button>
                  ) : null}

                </>
              )}
            </Col>
            <Col span={12} className={`${props.currentTab === 'drafts' ? 'draft-footer-btn' : 'flex-align-center app-stats-container'}`}>
              {props.currentTab === 'drafts' ? (
                <Button type="primary" className="primary-btn">
                  Complete Posting
                </Button>
              ) : (
                <Skeleton.Input style={{ width: 300, height: 16 }} active size="small" />
              )}
            </Col>
          </Row>
        </Col>
      </Row>
    ))}
  </>
);

export default JobCardsSkeleton;
