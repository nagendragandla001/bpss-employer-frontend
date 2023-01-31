import { SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Card, Col, Form, Row, Select, Space, Tag, Typography,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import React, { useState } from 'react';
import { skillSuggAPI } from 'service/job-posting-service';

require('components/JobPosting/TagsContainer/tagsContainer.less');

const { Option } = Select;
const { Text, Paragraph } = Typography;

interface ITag {
  id: number,
  name: string
}

interface ITagsContainer {
  tags: Array<ITag>;
  selected: Array<ITag>;
  addSkill: (skill) => void;
  removeSkill: (skill, action) => void;
}

const SkillsContainer = (props: ITagsContainer): JSX.Element => {
  const {
    tags, selected, addSkill, removeSkill,
  } = props;

  const [state, setState] = useState({
    tags: [] as Array<ITag>,
    expanded: false,
    tagsToShow: 10,
  });

  const handleSkillSearch = async (value): Promise<void> => {
    const response = await skillSuggAPI(value);
    if ([200, 201, 202].includes(response?.status)) {
      setState((prev) => ({
        ...prev,
        tags: [...response?.data?.objects],
      }));
    }
  };

  const handleSelect = (document): void => {
    const skillVal = parseInt(document.value, 10);
    if (!selected.find((s) => (s.id === skillVal && document.label === s.name))
    && selected.length < 4) {
      addSkill({ label: document.label, value: skillVal });
    }
  };

  const handleTagSelect = (tag): void => {
    if (selected.find((s) => (s.id === tag.id && s.name === tag.name))) {
      removeSkill(tag, false);
    } else if (selected.length < 4) {
      addSkill({ label: tag.name, value: tag.id });
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

  return (
    <Form.Item
      name="skills"
      label={(
        <Row>
          <Col>
            Selected Skills
          </Col>
        </Row>
      )}
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
              Adding more requirements may reduce the number of applications
            </Text>
          </Space>
        )}
        bordered
        className="tags-card-container"
      >
        <Row align="middle" gutter={[0, 10]} className="job-tags-container">
          <Col span={24}>
            <Select
              optionFilterProp="children"
              showArrow
              showSearch
              className="text-base tag-selections"
              placeholder="Select requirements by clicking on recommendations below or search here for more requirements"
              onSelect={handleSelect}
              labelInValue
              onSearch={handleSkillSearch}
              notFoundContent={null}
              bordered
              allowClear
              suffixIcon={<SearchOutlined />}
              value={null as any}
            >
              {state?.tags?.map((d) => (
                <Option value={d.id} key={d.id} className="full-width text-base">
                  {d.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={24} className="suggested-tags">
            {
              tags?.slice(0, state.tagsToShow)?.map((tag) => (
                <Tag
                  key={tag.id}
                  color={selected.find((t) => t.id === tag.id) ? 'success' : 'default'}
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

export default SkillsContainer;
