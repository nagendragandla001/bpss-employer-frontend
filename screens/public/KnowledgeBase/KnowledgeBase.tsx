/* eslint-disable react/no-danger */
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import {
  Col, Input, List, Row, Typography,
} from 'antd';
import Container from 'components/Layout/Container';
import Link from 'next/link';
import React, { useState } from 'react';
import HeadComponent from 'screens/public/KnowledgeBase/KBHead';
import { getKnowledgeBases } from 'service/static-service';
import usePersistedState from 'utils/usePersistedState';

require('screens/public/KnowledgeBase/KnowledgeBase.less');

const { Title } = Typography;

const KnowledgeBase: React.FC = () => {
  const [allKB, setAllKB] = usePersistedState('knowledge_bases', '');
  const [filteredKB, setFilteredKB] = useState(allKB);

  const setKBData = async (): Promise<any> => {
    let tempDataContainer = {};
    const kbData = await getKnowledgeBases();
    if (kbData && kbData.objects) {
      tempDataContainer = kbData.objects.filter((kb) => kb.kb_type === 'recruiter');
      setAllKB(tempDataContainer);
      setFilteredKB(tempDataContainer);
    }
  };

  if (!allKB) { setKBData(); }

  const onChange = (searchString): void => {
    if (searchString) {
      const filteredData = allKB.filter((kb) => (
        kb?.title.toLowerCase().includes(searchString?.target?.value.toLowerCase())
      ));
      setFilteredKB(filteredData);
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
                Recruiter Knowledge Base
              </Title>
              <Title level={2} className="cp-subtitle">
                A collated resource of relevant information for recruiters
              </Title>
            </Col>
          </Row>
        </Container>
      </Row>

      {/* Search Section */}
      <Row className="static-kb">
        <Container>
          <Row>
            <Col
              xs={{ span: 22, offset: 1 }}
              md={{ span: 12 }}
              className="search-input"
            >
              <Input
                placeholder="Search within Knowledge Base"
                onChange={onChange}
                name="search"
                prefix={<SearchOutlined />}
                size="large"
              />
            </Col>
          </Row>
          <Row align="top" style={{ display: 'flex' }}>
            <Col
              xs={{ span: 22, offset: 1 }}
              md={{ span: 22, offset: 1 }}
              className="kb-section"
            >
              {filteredKB ? (
                <List
                  grid={{
                    gutter: 16,
                    xs: 1,
                    sm: 1,
                    md: 2,
                    lg: 2,
                    xl: 2,
                    xxl: 2,
                  }}
                  dataSource={filteredKB}
                  renderItem={(item: { id: number, title: string, slug: string }): JSX.Element => (
                    <List.Item
                      key={item.id}
                      className="kb-link"
                    >
                      <Link
                        href={{ pathname: '/knowledgeBaseDetails', query: { id: item.slug } }}
                        as={`/knowledge-base/recruiter/${item.slug}/`}
                      >
                        <a
                          href={`/knowledge-base/recruiter/${item.slug}/`}
                        >
                          {item.title}
                        </a>
                      </Link>
                    </List.Item>
                  )}
                />
              ) : ''}
            </Col>
          </Row>
        </Container>
      </Row>
    </>
  );
};

export default KnowledgeBase;
