import { Col, Row } from 'antd';
import Container from 'components/Layout/Container';
import CustomImage from 'components/Wrappers/CustomImage';
import React from 'react';

require('components/StaticPages/Common/Clients/Clients.component.less');

// not able to update image as images is of different size and width
const config = {
  title: 'Happy family of clients',
  clients: [
    'bajaj',
    'bigbasket',
    'uber',
    'amazon',
    'swiggy',
    'croma',
    'zoomcar',
    'idbi',
    'edelweiss',
    'urbanladder',
  ],
};

const renderClients = (): Array<JSX.Element> => config.clients.map((client) => (
  <Col xs={{ span: 12 }} sm={{ span: 6 }} className="clients-logos" key={client}>
    <CustomImage
      src={`/images/static-pages/clients/icon-${client}.png`}
      alt={client}
      className="center-block"
      layout
      // loading="lazy"
      // width="auto"
    />
  </Col>
));

const Clients: React.FunctionComponent = () => (
  <Row className="logos-container">
    <Container>
      <Col span={24}>
        <Row gutter={90} align="middle" justify="center">
          {renderClients()}
        </Row>
      </Col>
    </Container>
  </Row>
);

export default Clients;
