/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Carousel, Col, Row } from 'antd';
import Container from 'components/Layout/Container';
import CustomImage from 'components/Wrappers/CustomImage';
import ClientConstants from 'constants/client-constants';
import React from 'react';

require('components/StaticPages/Common/Testimonials/Clients.component.less');

const renderTestimonials = (): React.ReactNode => ClientConstants.client1.map((linksArr) => (
  <div className="client-img" key={Math.random()}>
    {linksArr.map((link) => (
      <div key={link.key}>
        <a href={link.href} target="_blank" rel="noopener noreferrer">
          <CustomImage
            src={`/images/clients/${link.key}.png`}
            alt={link.label}
            layout
          />
        </a>
      </div>
    ))}
  </div>
));

interface IArrow{
  type: string;
  onClick: any;
}

const Client = (): JSX.Element => {
  const Arrow = ({ type, onClick }: IArrow): JSX.Element => {
    if (type) {
      switch (type) {
        case 'left':
          return (
            <div onClick={onClick}>
              <LeftOutlined className="leftarrow" />
            </div>
          );
        case 'right':
          return (
            <>
              <div onClick={onClick}>
                <RightOutlined className="rightarrow" />
              </div>
            </>
          );
        default:
          return <></>;
      }
    } else {
      return <></>;
    }
  };
  return (
    <Row className="clients-slider">
      <Container>
        <Row align="middle" justify="center">
          <Col span={24} offset={0} key={Math.random()}>
            <Carousel
              effect="fade"
              autoplay
              arrows
              dots={false}
              prevArrow={<Arrow type="left" onClick={(): boolean => true} />}
              nextArrow={<Arrow type="right" onClick={(): boolean => true} />}
            >
              {renderTestimonials()}
            </Carousel>
          </Col>
        </Row>
      </Container>
    </Row>
  );
};

export default Client;
