import {
  Button,
  Card, Col, Form, Row, Select, Space, Tag, Typography,
} from 'antd';
import { INameID } from 'common/jobpost.interface';
import React, { useState, useEffect } from 'react';
import { getAllDocumentsAndAssets } from 'service/job-posting-service';
import CustomImage from 'components/Wrappers/CustomImage';

require('components/JobPosting/TagsContainer/tagsContainer.less');

const { Option } = Select;
const { Text, Paragraph } = Typography;

interface ITagsContainer {
  tags: Array<INameID>;
  selected: Array<INameID>;
  addDocument: (doc) => void;
  removeDocument: (doc, action) => void;

}

const DocumentsContainer = (props: ITagsContainer): JSX.Element => {
  const {
    tags, selected, addDocument, removeDocument,
  } = props;

  const [state, setState] = useState({
    tags: [] as Array<INameID>,
    tagsToShow: 10,
    expanded: false,
  });

  const handleSelect = (document): void => {
    const documentMap = document.value.split('-');
    const selectedVal = parseInt(documentMap[0], 10);
    if (!selected.find((s) => s.id === selectedVal && s.type === documentMap[1])
    && selected.length < 4) {
      addDocument({ label: document.label, value: selectedVal, type: documentMap[1] });
    }
  };

  const handleTagSelect = (tag): void => {
    if (selected.find((s) => (s.id === tag.id) && (s.type === tag.type))) {
      removeDocument(tag, false);
    } else if (selected.length < 4) {
      addDocument({ label: tag.name, value: tag.id, type: tag.type });
    }
  };

  const showMore = (): void => {
    if (state.tagsToShow === 10) {
      setState((prev) => ({
        ...prev,
        expanded: true,
        tagsToShow: tags.length,
      }));
    } else {
      setState((prev) => ({
        ...prev,
        expanded: false,
        tagsToShow: 10,
      }));
    }
  };

  const fetchDocumentsAndAssets = async (): Promise<void> => {
    const response = await getAllDocumentsAndAssets();
    if ([200, 201, 202].includes(response?.status)) {
      if (response?.data?.length > 0) {
        setState((prev) => ({
          ...prev,
          tags: [...response.data],
        }));
      }
    }
  };

  useEffect(() => {
    fetchDocumentsAndAssets();
  }, []);

  return (
    <Form.Item
      name="documents"
      label="Documents and Assets"
    >
      <Card
        title={(
          <Space>
            <CustomImage
              src="/icons/tooltip.svg"
              height={10}
              width={9}
              alt="icon"
            />
            <Text className="tags-card-title">
              Add only mandatory documents
            </Text>
          </Space>
        )}
        bordered
        className="tags-card-container"
      >
        <Row gutter={[0, 10]} className="job-tags-container">
          <Col span={24}>
            <Select
              optionFilterProp="children"
              showArrow
              showSearch
              className="text-base tag-selections"
              placeholder="Select requirements by clicking on recommendations below or search here for more requirements"
              onSelect={handleSelect}
              labelInValue
              notFoundContent={null}
              allowClear
              value={null as any}
            >
              {state?.tags?.map((d) => (
                <Option value={`${d.id}-${d.type}`} key={`${d.id}-${d.name}`} className="full-width text-base">
                  {d.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={24} className="suggested-tags">
            {
              tags?.slice(0, state.tagsToShow)?.map((tag) => (
                <Tag
                  key={`${tag.name}${tag.id}`}
                  color={selected.find((t) => (t.id === tag.id) && t.type === tag.type) ? 'success' : 'default'}
                  closable={false}
                  style={{ cursor: 'pointer' }}
                  onClick={((): void => handleTagSelect(tag))}
                >
                  {tag.name}
                </Tag>
              ))
            }
          </Col>
          {
            tags?.length > 10 && (
              <Col span={24} className="text-right suggested-tags">
                <Button className="p-all-0" type="link" onClick={showMore}>
                  {
                    state.expanded ? 'show less' : 'show more'
                  }
                </Button>
              </Col>
            )
          }
        </Row>
      </Card>
      <Paragraph className="text-note p-top-8">** you can select maximum 4 requirements</Paragraph>
    </Form.Item>
  );
};

export default DocumentsContainer;
