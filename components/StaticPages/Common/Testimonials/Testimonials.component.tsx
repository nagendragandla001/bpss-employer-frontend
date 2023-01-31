import {
  Carousel, Col, Row, Typography,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import AppConstants from 'constants/constants';
import React from 'react';

require('components/StaticPages/Common/Testimonials/Testimonials.component.less');

const { Paragraph, Text, Title } = Typography;
// not able to update image as images is of different size and width
export interface Testimonial {
  name: string;
  key: string;
  description: string;
  author: string;
  designation: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Urban Ladder',
    key: 'urbanladder',
    description: `“We have worked with ${AppConstants.APP_NAME} on a very niche requirement of
    part time retail staff. They have taken up this challenge
    wonderfully well.”`,
    author: 'Nivedita Singh,',
    designation: 'Senior Manager, HR, Urban Ladder',
  },
  {
    name: 'Hathway',
    key: 'hathway',
    description: `“Their focussed approach have helped in bringing right kind of
    talents to the organization in a very short span of time.”`,
    author: 'Sandeep Marandi,',
    designation: 'Zonal Head HR, Hathway',
  },
  {
    name: 'Zoomcar',
    key: 'zoomcar',
    description: `“Working with ${AppConstants.APP_NAME} makes it seamless for us to give the
    job description once and consider it's done.”`,
    author: 'Chetan Salunkhe,',
    designation: 'Regional Manager - Human Resource, Zoomcar',
  },
  {
    name: 'Optum Soft',
    key: 'optum',
    description: `“Job requirement is created very carefully and candidates are
    provided quickly as per the considerations.”`,
    author: 'Srilakshmi Pappu,',
    designation: 'HR and Admin Manager, Optum Soft',
  },
];

const renderTestimonials = (): React.ReactNode => testimonials.map((testimonial) => (
  <Row key={testimonial.key}>
    <Col xs={{ span: 22, offset: 1 }} md={{ span: 10, offset: 7 }}>
      <Title level={3} className="testimonials-description">
        {testimonial.description}
      </Title>
      <Paragraph>
        <Text className="testimonials-author">
          {testimonial.author}
        </Text>
      </Paragraph>
      <Paragraph>
        <Text className="testimonials-designation">{testimonial.designation}</Text>
      </Paragraph>
      <CustomImage
        src={`/images/clients/icon-${testimonial.key}.jpg`}
        alt={`Testimonials ${testimonial.name}`}
        className="center-block testimonials-img"
        // loading="lazy"
      />
    </Col>
  </Row>
));

const Testimonials: React.FunctionComponent = () => (
  <Row className="clients-testimonials">
    <Col span={24} offset={0}>
      <Paragraph className="text-center">
        <Text className="text-semibold testimonials-title">
          What our clients say about us
        </Text>
      </Paragraph>
      <Carousel effect="fade" autoplay>
        {renderTestimonials()}
      </Carousel>
    </Col>
  </Row>
);

export default Testimonials;
