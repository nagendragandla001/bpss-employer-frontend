import { ArrowLeftOutlined } from '@ant-design/icons';
import {
  Button, Card, Col, Divider, Pagination, Row, Space, Tag, Typography,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { getMinMaxAge, getMinMaxExp, selectedFiltersDict } from 'screens/authenticated/ApplicationsTab/Common/ApplicationTabUtils';
import { getDownloadList } from 'service/application-card-service';

require('components/Candidates/DownloadsPage.less');

interface PropTypes {
  orgId: string;
  setDownloadsVisible: (boolean) => void;
}

const { Text, Title } = Typography;

const DownloadsPage = (props: PropTypes) : JSX.Element => {
  const { orgId, setDownloadsVisible } = props;
  const [downloadState, setDownloadState] = useState({
    downloadData: [],
    totalDownloads: 0,
    offset: 0,
    limit: 0,
  });

  const downloadCard = (data): JSX.Element|null => {
    const date = new Date(data.created);
    const getDownloadButtonText = () => {
      switch (data.status) {
        case 'EXP':
          return 'Link Expired';
        case 'PREP':
          return 'Generating Link';
        case 'READY':
          return 'Download Link';
        default:
          return 'Download Link';
      }
    };

    const getAgeFilters = (): JSX.Element | null => {
      if (!['', 'job'].includes(data.filters)) {
        const filterList = data?.filters?.split(',');
        if (filterList.includes('age_filter')) {
          const ageFilters = filterList.filter((filter) => filter.includes('age_m'));
          const ages = getMinMaxAge(ageFilters);
          return (
            <Col>
              <Tag
                key={Math.random()}
                className="filter-tag"
              >
                {`Age ${ages[0]}-${ages[1]} years`}
              </Tag>
            </Col>
          );
        }
        return null;
      }
      return null;
    };

    const getExperienceFilters = () => {
      if (!['', 'job'].includes(data.filters)) {
        const filterList = data?.filters?.split(',');
        if (filterList.includes('experience_filter')) {
          const expFilters = filterList.filter((filter) => filter.includes('experience_m'));
          const experiences = getMinMaxExp(expFilters);
          if (JSON.stringify(experiences) === JSON.stringify([0, 0])) {
            return (
              <Col>
                <Tag
                  key={Math.random()}
                  className="filter-tag"
                >
                  Experience- Fresher
                </Tag>
              </Col>
            );
          }
          return (
            <Col>
              <Tag
                key={Math.random()}
                className="filter-tag"
              >
                {`Experience ${experiences[0]}-${experiences[1]} years`}
              </Tag>
            </Col>
          );
        }
        return null;
      }
      return null;
    };

    return (
      <Row className="application-container">
        <Col span={4} className="m-top-12">
          <Space direction="vertical" size={4}>
            <Text strong>
              {date.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </Text>
            <Text>{date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}</Text>
          </Space>
        </Col>
        <Col span={20}>
          <Card>
            <Space direction="vertical" className="full-width">
              <Title level={4}>{data.type === 'AP' ? 'Applications Data' : 'Database Data'}</Title>
              <Row className="application-meta-container">
                <Col span={20}>
                  <Row gutter={[8, 8]}>
                    {data.job_role && (<Col span={24}>{`Job : ${data.job_role}`}</Col>)}
                    {!['', 'job'].includes(data.filters) && (
                      <Col span={24}>
                        <Row gutter={[2, 8]} align="middle">
                          Filters added :
                          &nbsp;&nbsp;
                          {data.filters.split(',').map((filter, index) => (
                            ((!filter.includes('age') && !filter.includes('all') && !filter.includes('experience') && !(filter === 'job'))
                              ? (
                                <Col key={filter}>
                                  <Tag
                                    className="filter-tag"
                                  >
                                    {
                                      (selectedFiltersDict[filter] !== undefined
                                        ? selectedFiltersDict[filter] : filter)
                                    }
                                  </Tag>
                                </Col>
                              ) : null)
                          ))}
                          {getAgeFilters()}
                          {getExperienceFilters()}
                        </Row>
                      </Col>
                    )}
                  </Row>
                </Col>
                <Col span={4}>
                  <Button
                    type="default"
                    className={['PREP', 'EXP'].includes(data.status) ? 'expired-link' : 'active-link'}
                    disabled={['PREP', 'EXP'].includes(data.status)}
                    href={data.file_url}
                  >
                    {getDownloadButtonText()}
                  </Button>
                </Col>
              </Row>
            </Space>
          </Card>
        </Col>
        <Col>
          <Divider />
        </Col>
      </Row>
    );
  };

  const onPageChange = (page: number): void => {
    setDownloadState((prevState) => ({
      ...prevState,
      offset: (page - 1) * prevState.limit,
    }));
  };

  const getDownloadData = async (): Promise<void> => {
    const response = await getDownloadList(orgId, downloadState.offset);
    setDownloadState((prevState) => ({
      ...prevState,
      downloadData: response?.data?.objects,
      totalDownloads: response?.data?.meta?.count,
      offset: response?.data?.meta?.offset,
      limit: response?.data?.meta?.limit,
    }));
  };

  useEffect(() => {
    getDownloadData();
  }, [downloadState.offset]);

  return (
    <Row className="m-top-24 download-page-container">
      <Col span={4}>
        <Button type="link" onClick={():void => setDownloadsVisible(false)}>
          <ArrowLeftOutlined
            className="back-arrow"
          />
        </Button>
      </Col>
      <Col span={20}>
        <Row>
          <Text strong className="text-extra-base">Downloads</Text>
        </Row>
        <Row className="m-top-24">
          {downloadState.downloadData.map((data) => (
            <>
              <Col span={24}>
                {downloadCard(data)}
              </Col>
              <Col span={24}>
                <Divider />
              </Col>
            </>
          ))}
        </Row>
        <Row align="middle" justify="center" className="ac-pagination">
          <Col span={24}>
            <Pagination
              size="small"
              //   current={pageNum}
              total={downloadState.totalDownloads || 0}
              showSizeChanger={false}
              hideOnSinglePage
              onChange={onPageChange}
            />
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default DownloadsPage;
