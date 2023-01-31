/* eslint-disable react/no-danger */
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import {
  Col, Collapse, Input, Row, Typography,
} from 'antd';
import Container from 'components/Layout/Container';
import React, { useState } from 'react';
import { createMarkup } from 'screens/authenticated/JobDetails/Common/JobDetails.utils';
import HeadComponent from 'screens/public/FAQ/Head';
import { getFAQ } from 'service/static-service';
import usePersistedState from 'utils/usePersistedState';

require('screens/public/FAQ/FAQ.less');

const { Title } = Typography;
const { Panel } = Collapse;

const FAQ: React.FC = () => {
  const [allFAQ, setAllFAQ] = usePersistedState('faq', '');
  const [filteredFAQ, setFilteredFAQ] = useState(allFAQ);

  const setFAQDate = async (): Promise<any> => {
    let tempDataContainer = {};
    const faqData = await getFAQ();
    if (faqData && faqData.objects) {
      tempDataContainer = faqData.objects.filter((faq) => faq.user_type === 'employer');
      setAllFAQ(tempDataContainer);
      setFilteredFAQ(tempDataContainer);
    }
  };

  if (!allFAQ) { setFAQDate(); }

  const onChange = (searchString): void => {
    if (searchString) {
      const filteredData = allFAQ.filter((faq) => (
        faq?.question.toLowerCase().includes(searchString?.target?.value)
        || faq?.answer.toLowerCase().includes(searchString?.target?.value)
      ));
      setFilteredFAQ(filteredData);
    }
  };

  return (
    <>
      <HeadComponent />

      {/* Hero Section */}
      <Row className="common-public-hero">
        <Container>
          <Row>
            <Col xs={{ span: 22, offset: 1 }} md={{ span: 24 }}>
              <Title level={1} className="cp-title">
                Frequently Asked Questions
              </Title>
              <Title level={2} className="cp-subtitle">
                Frequently asked questions by employers who are looking to hire
              </Title>
            </Col>
          </Row>
        </Container>
      </Row>

      {/* Search Section */}
      <Row className="static-faq">
        <Container>
          <Row>
            <Col
              xs={{ span: 22, offset: 1 }}
              md={{ span: 12 }}
              className="search-input"
            >
              <Input
                placeholder="Search within FAQ's"
                onChange={onChange}
                name="search"
                prefix={<SearchOutlined />}
                size="large"
                // className="text-small"
              />
            </Col>
            <Col
              xs={{ span: 22, offset: 1 }}
              md={{ span: 24 }}
              className="faq-panel"
            >
              {filteredFAQ && filteredFAQ.map((faqObj) => (
                <Collapse
                  ghost
                  expandIconPosition="end"
                  accordion
                  key={faqObj.id}
                >
                  <Panel
                    header={faqObj.question}
                    key={faqObj.id}
                  >
                    <div dangerouslySetInnerHTML={
                      createMarkup(faqObj.answer)
                    }
                    />
                  </Panel>
                </Collapse>
              ))}
            </Col>
          </Row>
        </Container>
      </Row>
    </>
  );
};

export default FAQ;
