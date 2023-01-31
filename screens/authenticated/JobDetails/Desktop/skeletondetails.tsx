import React from 'react';
import {
  Row, Col, Divider, Typography, Card,
} from 'antd';

import SkeletonInput from 'antd/lib/skeleton/Input';
import SkeletonButton from 'antd/lib/skeleton/Button';
import Container from 'components/Layout/Container';
import CustomImage from 'components/Wrappers/CustomImage';

const { Paragraph } = Typography;
const SkeletonCard = ():JSX.Element => (
  <>

    <Row key={Math.random()} className="jd-skeleton-header-row">
      <Container>
        <Row>
          <Col span={16}>
            <Card
              className="jd-header-card"
            >
              <Row className="jd-title" style={{ display: 'inline-grid' }}>
                <SkeletonInput className="ct-loading-btn" active />
                <SkeletonInput style={{ width: 150, height: 20 }} active />
              </Row>
              <Row style={{ marginTop: '2rem' }}>

                <SkeletonButton style={{ width: 180, height: 30 }} active />

                <SkeletonButton style={{ width: 180, height: 30, marginLeft: '2rem' }} active />

              </Row>
            </Card>

          </Col>

          <Col span={8}>
            <Row justify="center" align="middle">
              <Col key={Math.random()} span={24} className="m-bottom-16">
                <Card
                  className="m-bottom-16 jd-side-layout-card"
                >
                  <Row className="jd-bold-layout" key={Math.random()}>
                    <Col key={Math.random()} span={4}>
                      <CustomImage
                        src="/svgs/calendar-illustration.svg"
                        width={48}
                        height={48}
                        alt="calendar"
                      />
                    </Col>
                    <Col key={Math.random()} className="jd-bold-layout" span={15}>
                      Interview slots
                    </Col>
                  </Row>
                  <Divider />
                  <Row key={Math.random()}>
                    <Col span={24} key={Math.random()}>
                      <Row key={Math.random()}>
                        <Col span={12} key={Math.random()}>
                          <Row key={Math.random()} className="jd-font-12 ">

                            <Col span={24} key={Math.random()} className="jd-font-12 jd-row">
                              <SkeletonInput className="jd-empty-input" active />
                            </Col>
                            <Col span={24} key={Math.random()} className="jd-font-12 jd-row">
                              <SkeletonInput className="jd-empty-input" active />
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col key={Math.random()} span={24} className="m-bottom-16">
                <Card className="jd-call-hr">
                  <Row style={{ display: 'flex', marginLeft: '0.8rem' }} key={Math.random()}>
                    <Col key={Math.random()} style={{ marginTop: '10px' }}>
                      <Row className="jd-bold-layout jd-row" key={Math.random()}>
                        Call Hr
                      </Row>
                      <Row className="jd-bold-layout jd-row" key={Math.random()}>
                        <SkeletonInput className="jd-empty-input" active />
                      </Row>
                      <Row className="jd-subheading jd-row" key={Math.random()}>
                        <SkeletonInput className="jd-empty-input" active />
                      </Row>
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col key={Math.random()} span={24} className="m-bottom-16">
                <Card className="jd-side-layout-card jd-background">
                  <Row className="jd-display-flex" key={Math.random()}>
                    <Col key={Math.random()} className="jd-bold-layout" style={{ marginTop: '0px' }}>
                      Job Completion:
                    </Col>
                  </Row>
                  <Row className="jd-subheading jd-row" key={Math.random()}>
                    Created On :
                    {' '}
                    <span className="jd-subheading">
                      {' '}
                      <SkeletonInput className="jd-empty-input" active />
                    </span>
                  </Row>
                  <Row className="jd-subheading jd-row" key={Math.random()}>
                    Last modified on :
                    <span className="jd-subheading">
                      {' '}
                      <SkeletonInput className="jd-empty-input" active />
                    </span>
                  </Row>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>

      </Container>
    </Row>
    <Container>
      <Card
        key={Math.random()}
        className="jd-details-card"
      >
        <Row className="jd-title jd-row" key={Math.random()}>
          <Col span={22} key={Math.random()}>
            Job Details
          </Col>

        </Row>
        <Row key={Math.random()} className="jd-row">
          <Col key={Math.random()} span={8}>
            <Paragraph className="jd-subheading">
              Job Category
            </Paragraph>
          </Col>
          <Col key={Math.random()} span={8}>
            <Paragraph>
              <SkeletonInput className="jd-empty-input" active />
            </Paragraph>
          </Col>

        </Row>
        <Row className="jd-row" key={Math.random()}>
          <Col key={Math.random()} span={8}>
            <Paragraph className="jd-subheading">
              Employment Type
            </Paragraph>
          </Col>
          <Col key={Math.random()} span={8}>
            <Paragraph>
              <SkeletonInput className="jd-empty-input" active />
            </Paragraph>
          </Col>
        </Row>
        <Row className="jd-row" key={Math.random()}>
          <Col key={Math.random()} span={8}>
            <Paragraph className="jd-subheading">
              Job Description
            </Paragraph>
          </Col>
          <Col key={Math.random()} span={12}>
            <Paragraph
              className="jd-desc"

            >
              <SkeletonInput className="jd-empty-input" active />
            </Paragraph>
          </Col>
        </Row>
        <Divider className="divider-clr" />
      </Card>
      <Card
        key={Math.random()}
        className="jd-details-card"
      >
        <Row className="jd-title jd-row" key={Math.random()}>
          <Col key={Math.random()} span={22}>
            Job Locations & Openings
          </Col>

        </Row>
        <Row key={Math.random()} className="jd-row">
          <Col key={Math.random()} span={8}>
            <Paragraph className="jd-subheading">
              Job Locations
            </Paragraph>
          </Col>
          <Col key={Math.random()} span={12}>
            <Row style={{ display: 'block' }} key={Math.random()}>
              <SkeletonInput className="jd-empty-input" active />
            </Row>

          </Col>
        </Row>
        <Row className="jd-row" key={Math.random()}>
          <Col key={Math.random()} span={8}>
            <Paragraph className="jd-subheading">
              Total Openings
            </Paragraph>
          </Col>
          <Col key={Math.random()} span={8}>
            <SkeletonInput className="jd-empty-input" active />
          </Col>
        </Row>
        <Divider className="divider-clr" />
      </Card>

      <Card
        key={Math.random()}
        className="jd-details-card"
      >
        <Row className="jd-title jd-row" key={Math.random()}>
          <Col key={Math.random()} span={22}>
            Salary
          </Col>

        </Row>
        <Row className="jd-row" key={Math.random()}>
          <Col key={Math.random()} span={8}>
            <Paragraph className="jd-subheading">
              In hand Salary
            </Paragraph>
          </Col>
          <Col key={Math.random()} span={8}>
            <SkeletonInput className="jd-empty-input" active />
          </Col>
        </Row>
        <Divider className="divider-clr" />
      </Card>

      <Card
        key={Math.random()}
        className="jd-details-card"
      >
        <Row className="jd-title jd-row" key={Math.random()}>
          <Col key={Math.random()} span={22}>
            Work Hours
          </Col>

        </Row>

        <Row className="jd-row" key={Math.random()}>
          <Col key={Math.random()} span={8}>
            <Paragraph className="jd-subheading">
              Weekly Working Days
            </Paragraph>
          </Col>
          <Col key={Math.random()} span={8}>
            <Row key={Math.random()}>
              <SkeletonInput className="jd-empty-input" active />
            </Row>
          </Col>
        </Row>
        <Row className="jd-row" key={Math.random()}>
          <Col key={Math.random()} span={8}>
            <Paragraph className="jd-subheading">
              Off Days
            </Paragraph>
          </Col>
          <Col key={Math.random()} span={8}>
            <Row key={Math.random()}>
              <SkeletonInput className="jd-empty-input" active />
            </Row>
          </Col>
        </Row>

        <Row className="jd-row" key={Math.random()}>
          <Col key={Math.random()} span={8}>
            <Paragraph className="jd-subheading">
              Shift Timings
            </Paragraph>
          </Col>
          <Col key={Math.random()} span={14}>
            <SkeletonInput className="jd-empty-input" active />
          </Col>
        </Row>
        <Divider className="divider-clr" />
      </Card>
      <Card
        key={Math.random()}
        className="jd-details-card"
      >
        <Row
          className="jd-title jd-row"
          key={Math.random()}
          style={{ display: 'inline-grid' }}
        >
          Candidate Requirements
          <span className="jd-subheading" style={{ paddingLeft: '0px' }}>
            Compulsory fields are marked with
            <span className="clr-red">*&nbsp;</span>
          </span>
        </Row>
        {/* Resume */}
        <Row className="jd-row" key={Math.random()}>
          <Col key={Math.random()} span={8} className="jd-display-flex">
            <CustomImage
              src="/images/job-details/jd-resume-ic.svg"
              width={24}
              height={24}
              alt="resume"
            />
            <Paragraph className="jd-subheading jd-subheading-img">
              Resume
            </Paragraph>
          </Col>
          <Col key={Math.random()} span={14}>
            <SkeletonInput className="jd-empty-input" active />
          </Col>

          <Divider className="divider-clr" />
        </Row>
        <Row className="jd-row" key={Math.random()}>
          <Col key={Math.random()} span={8} className="jd-display-flex">
            <CustomImage
              src="/images/job-details/jd-edu-ic.svg"
              width={24}
              height={24}
              alt="resume"
            />
            <Paragraph className="jd-subheading jd-subheading-img">
              Education
            </Paragraph>
          </Col>
          <Col key={Math.random()} span={14}>
            <SkeletonInput className="jd-empty-input" active />
          </Col>

          <Divider className="divider-clr" />
        </Row>
        <Row className="jd-row" key={Math.random()}>
          <Col key={Math.random()} span={8} className="jd-display-flex">
            <CustomImage
              src="/images/job-details/jd-exp-ic.svg"
              width={24}
              height={24}
              alt="resume"
            />
            <Paragraph className="jd-subheading jd-subheading-img">
              Experience
            </Paragraph>
          </Col>
          <Col key={Math.random()} span={14}>
            <SkeletonInput className="jd-empty-input" active />
          </Col>

          <Divider className="divider-clr" />
        </Row>
        <Row className="jd-row" key={Math.random()}>
          <Col key={Math.random()} span={8} className="jd-display-flex">
            <CustomImage
              src="/images/job-details/jd-dem-ic.svg"
              width={24}
              height={24}
              alt="resume"
            />
            <Paragraph className="jd-subheading jd-subheading-img">
              Demography
            </Paragraph>
          </Col>
          <Col key={Math.random()} span={14}>
            <SkeletonInput className="jd-empty-input" active />
          </Col>

          <Divider className="divider-clr" />
        </Row>
        <Row className="jd-row" key={Math.random()}>
          <Col key={Math.random()} span={8} className="jd-display-flex">
            <CustomImage
              src="/images/job-details/jd-com-ic.svg"
              width={24}
              height={24}
              alt="resume"
            />
            <Paragraph className="jd-subheading jd-subheading-img">
              Communication
            </Paragraph>
          </Col>
          <Col key={Math.random()} span={14}>
            <SkeletonInput className="jd-empty-input" active />
          </Col>

          <Divider className="divider-clr" />
        </Row>
        <Row className="jd-row" key={Math.random()}>
          <Col key={Math.random()} span={8} className="jd-display-flex">
            <CustomImage
              src="/images/job-details/jd-owner-ic.svg"
              width={24}
              height={24}
              alt="resume"
            />
            <Paragraph className="jd-subheading jd-subheading-img">
              Ownership
            </Paragraph>
          </Col>
          <Col key={Math.random()} span={14}>
            <SkeletonInput className="jd-empty-input" active />
          </Col>

          <Divider className="divider-clr" />
        </Row>
        <Row className="jd-row" key={Math.random()}>
          <Col key={Math.random()} span={8} className="jd-display-flex">
            <CustomImage
              src="/images/job-details/jd-resume-ic.svg"
              width={24}
              height={24}
              alt="resume"
            />
            <Paragraph className="jd-subheading jd-subheading-img">
              Documents
            </Paragraph>
          </Col>
          <Col key={Math.random()} span={14}>
            <SkeletonInput className="jd-empty-input" active />
          </Col>

          <Divider className="divider-clr" />
        </Row>
        <Row className="jd-row" key={Math.random()}>
          <Col key={Math.random()} span={8} className="jd-display-flex">
            <CustomImage
              src="/images/job-details/jd-skill-ic.svg"
              width={24}
              height={24}
              alt="resume"
            />
            <Paragraph className="jd-subheading jd-subheading-img">
              Skills
            </Paragraph>
          </Col>
          <Col key={Math.random()} span={14}>
            <SkeletonInput className="jd-empty-input" active />
          </Col>

          <Divider className="divider-clr" />
        </Row>
        <Row className="jd-row" key={Math.random()}>
          <Col key={Math.random()} span={8} className="jd-display-flex">
            <CustomImage
              src="/images/job-details/jd-req-ic.svg"
              width={24}
              height={24}
              alt="resume"
            />
            <Paragraph className="jd-subheading jd-subheading-img">
              Additional Requirements
            </Paragraph>
          </Col>
          <Col key={Math.random()} span={14}>
            <SkeletonInput className="jd-empty-input" active />
          </Col>

          <Divider className="divider-clr" />
        </Row>
      </Card>
    </Container>
  </>
);
export default SkeletonCard;
