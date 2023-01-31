/* eslint-disable react/no-danger */
import {
  Col, Row, Typography,
} from 'antd';
import Container from 'components/Layout/Container';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { createMarkup } from 'screens/authenticated/JobDetails/Common/JobDetails.utils';
import HeadComponent from 'screens/public/KnowledgeBase/KBDetailsHead';
import { getKnowledgeBases } from 'service/static-service';

require('screens/public/FAQ/FAQ.less');

const { Title } = Typography;

const KnowledgeBaseDetails: React.FC = () => {
  const [selectedKB, setSelectedKB] = useState([] as any);
  const router = useRouter();

  const { asPath } = router;

  const pageSlug = (asPath as string).split('/')[3] || '';

  const setKBData = async (): Promise<any> => {
    let tempDataContainer = {};
    const kbData = await getKnowledgeBases();
    if (kbData && kbData.objects) {
      tempDataContainer = kbData.objects.filter((kb) => kb.slug === pageSlug);
      setSelectedKB(tempDataContainer[0]);
    }
  };

  useEffect(() => {
    setKBData();
  }, []);

  return (
    <>
      <HeadComponent seo={selectedKB} />

      {/* Hero Section */}
      <Row className="common-public-hero">
        <Container>
          <Row>
            <Col xs={{ span: 22, offset: 1 }} md={{ span: 24 }}>
              <Title level={1} className="cp-title">
                {selectedKB?.title ? `${selectedKB.title}` : ''}
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
              md={{ span: 24 }}
              className="faq-panel"
            >
              {selectedKB?.content ? (
                <div dangerouslySetInnerHTML={
                  createMarkup(selectedKB.content)
                }
                />
              ) : ''}
            </Col>
          </Row>
        </Container>
      </Row>
    </>
  );
};

export default KnowledgeBaseDetails;
