import React, { useState } from 'react';
import {
  Carousel, Typography, Button, Row, Col,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';

const { Paragraph } = Typography;

const corousels = [
  {
    title: 'Scheduling Interview Made simpler',
    key: 'first',
    content: 'Provide Days & Timings when you are available for interview',
    url: '/svgs/schedule1.svg',
  },
  {
    title: 'No more hassle of matching calendars',
    key: 'second',
    content: 'Candidate can select from those dates and book as per convenience',
    url: '/svgs/schedule2.svg',
  },
  {
    title: 'No more waiting for candidates',
    key: 'third',
    content: 'We also send reminders to candidates so that they don’t miss the interview',
    url: '/svgs/schedule3.svg',
  },
];

interface PropsModel {
  handleScreenChange: (type) => void;
}

const CorouselHelper = (props: PropsModel): JSX.Element => {
  const { handleScreenChange } = props;

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleChange = (from, to):void => {
    if ((from === (corousels.length - 1)) && to === 0) {
      handleScreenChange('interviewType');
    } else {
      setCurrentIndex(to);
    }
  };

  return (
    <Row>
      <Col span={24}>
        <Carousel className="m-intro-carousel" beforeChange={handleChange}>
          {
            corousels.map((corousel) => (
              <Row key={corousel.key} justify="center" align="middle">
                <Col span={24}>
                  <Paragraph className="m-carousel-heading">{corousel.title}</Paragraph>
                </Col>
                <Col span={24} className="text-center">
                  <div className="m-carousel-img">
                    <CustomImage src={corousel.url} alt={corousel.key} width={200} height={200} className="m-carousel-img" />
                  </div>
                </Col>
                <Col span={24}>
                  <Paragraph className="m-carousel-content">{corousel.content}</Paragraph>
                </Col>
              </Row>
            ))
          }

        </Carousel>
      </Col>
      <Col span={24} className="intro-action-container">
        <Button
          type={currentIndex === (corousels.length - 1) ? 'primary' : 'link'}
          onClick={():void => {
            handleScreenChange('interviewType');
          }}
          style={{ width: '100%' }}
          className="interview-btn"
        >
          { currentIndex === (corousels.length - 1) ? (
            <p style={{ marginTop: '16px' }}>
              Start Scheduling
              {' '}
              <CustomImage src="/svgs/arrow.svg" height={24} width={24} alt="arrow" />
            </p>
          ) : 'Skip Intro' }
        </Button>
      </Col>
    </Row>

  );
};

export default CorouselHelper;
