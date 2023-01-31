import {
  Button, Col, Collapse, Divider, Row, Typography,
} from 'antd';
import Container from 'components/Layout/Container';
import { Desktop, Mobile } from 'components/Layout/Responsive';
import CustomImage from 'components/Wrappers/CustomImage';
import config from 'config';
import { FooterConstants, AppConstants, LinksConstants } from 'constants/index';
import Link from 'next/link';
import React from 'react';

require('components/Layout/PublicFooter/PublicFooter.component.less');

const { Text, Paragraph } = Typography;
const { Panel } = Collapse;

const currentYear = new Date().getFullYear();

const renderLinks = (): React.ReactNode => FooterConstants.categories.map((category) => (
  <Col span={6} key={category.name}>
    <Text className="category-name">{category.name}</Text>
    <ul>
      {
        category.links.map((link) => (
          <li key={link.label}>
            {link.internal && link.as ? (
              <Link href={link.href} as={link.as}>
                <a href={link.as}>{link.label}</a>
              </Link>
            ) : ''}
            {link.internal && !link.as ? (
              <Link href={link.href}>
                <a href={link.href}>{link.label}</a>
              </Link>
            ) : ''}
            {!link.internal && !link.as ? (
              <a href={link.href} className="footer-link">{link.label}</a>
            ) : ''}
          </li>
        ))
      }
    </ul>
  </Col>
));

const renderLinksOnMobile = (): React.ReactNode => {
  const mobileLinks = [...FooterConstants.categories];
  mobileLinks.shift();
  const customPanelStyle = {
    background: '#f4f5f7',
    border: 0,
  };

  return mobileLinks.map((category) => (
    <Panel header={category.name} key={category.name} className="panel-card" style={customPanelStyle}>
      <ul>
        {category.links.map((link) => (
          <li key={link.label}>
            {link.internal && link.as ? (
              <Link href={link.href} as={link.as}>
                <a href={link.as}>{link.label}</a>
              </Link>
            ) : ''}
            {link.internal && !link.as ? (
              <Link href={link.href}>
                <a href={link.href}>{link.label}</a>
              </Link>
            ) : ''}
            {!link.internal && !link.as ? (
              <a href={link.href} className="footer-link">{link.label}</a>
            ) : ''}
          </li>
        ))}
      </ul>
    </Panel>
  ));
};

const renderMedia = (): JSX.Element => (
  <ul className="p-top-8">
    {
      FooterConstants.media.map((m) => (
        <li key={m.key}>
          <a href={m.href} target="_blank" rel="noopener noreferrer">
            <div className="footer-logo">
              <CustomImage
                src={`/icons/icon-footer-${m.key}.svg`}
                alt={m.label}
                // loading="lazy"
                className="footer-logo"
              />
            </div>
          </a>
        </li>
      ))
    }
  </ul>
);

const PublicFooter = (props: {showFooter: boolean}): JSX.Element => {
  const { showFooter } = props;

  return (
    <>
      <Desktop>
        <Row align="middle" justify="center" className="common-container desktop-container">
          <Container>
            {
              showFooter && (
                <Row>
                  <Col span={18} offset={1}>
                    <Row>
                      {renderLinks()}
                    </Row>
                  </Col>

                  <Col span={4} className="footer-social-block">
                    <Link href="employerHomePage" as="/" prefetch={false}>
                      <a href="/">
                        <div className="footer-logo">
                          <CustomImage
                            src="/images/assets/logo-white.svg"
                            alt={AppConstants.APP_NAME}
                            className="footer-logo"
                            // loading="lazy"
                            width={112}
                            height={32}
                          />
                        </div>
                      </a>
                    </Link>
                    <Paragraph>
                      <Text className="text-semibold">Follow us on</Text>
                      <Row className="footer-social-list">
                        {renderMedia()}
                      </Row>
                    </Paragraph>
                  </Col>
                </Row>
              )
            }

            {
              !showFooter && (
                <Row className="footer-section-regpage" align="middle" justify="center">
                  <Button type="default" className="text-semibold">
                    <a className="nav-links text-semibold" href={config.AJ_URL}>
                      Find a job
                    </a>
                  </Button>

                  <Button type="default" className="text-semibold">
                    <a className="nav-links text-semibold" href={LinksConstants.CONTACT}>
                      Contact us
                    </a>
                  </Button>
                </Row>
              )
            }

            <Row>
              <Divider style={{ backgroundColor: '#5B5E68', margin: '16px 0' }} />
            </Row>
            <Row>
              <Col span={22} offset={1}>
                <Row align="middle" justify="space-between" className="copy-rights">
                  <Paragraph>
                    <a href={LinksConstants.TERMS} className="text-small text-default">
                      Terms and conditions
                    </a>
                    <a href={LinksConstants.PRIVACY} className="text-small text-default m-left-md">
                      Privacy Policy
                    </a>
                  </Paragraph>
                  <Paragraph>
                    <Text className="text-small">
                      <span>Copyright &copy;&nbsp;</span>
                      <a href={config.AJ_URL} color="white" style={{ textDecoration: 'none', color: 'inherit' }}>
                        {AppConstants.APP_NAME}
                        &nbsp;
                      </a>
                      <span>{currentYear}</span>
                    </Text>
                  </Paragraph>
                </Row>
              </Col>
            </Row>
          </Container>
        </Row>
      </Desktop>
      <Mobile>
        <Row className="common-container mobile-container" align="middle" justify="center">
          <Container>
            {
              showFooter && (
                <>
                  <Row>
                    <Col span={24}>
                      <Collapse expandIconPosition="end" bordered={false}>
                        {renderLinksOnMobile()}
                      </Collapse>
                    </Col>
                  </Row>
                  <Row align="middle" justify="center">
                    <Col span={24} className="footer-social-block">
                      <Text className="text-semibold">Follow us on</Text>
                      <Row className="footer-social-list">
                        {renderMedia()}
                      </Row>
                    </Col>
                  </Row>
                </>
              )
            }
            {
              !showFooter && (
                <Row className="footer-section-regpage p-30" align="middle" justify="center">
                  <Button type="default" className="text-semibold">
                    <a className="nav-links text-semibold" href={config.AJ_URL}>
                      Find a job
                    </a>
                  </Button>

                  <Button type="default" className="text-semibold">
                    <a className="nav-links text-semibold" href={LinksConstants.CONTACT}>
                      Contact us
                    </a>
                  </Button>
                </Row>
              )
            }

            <Row>
              <Col span={22} offset={1}>
                <Row align="middle" justify="space-between">
                  <a href={LinksConstants.TERMS} className="text-small text-default">
                    Terms and conditions
                  </a>
                  <a href={LinksConstants.PRIVACY} className="text-small text-default">
                    Privacy Policy
                  </a>
                </Row>
                <Row align="middle">
                  <Divider style={{ backgroundColor: '#5B5E68', margin: '16px 0' }} />
                </Row>
                <Row className="copy-rights" align="middle" justify="center">
                  <Text className="text-small text-center">
                    <span>Copyright &copy;&nbsp;</span>
                    <a href={config.AJ_URL} color="white" style={{ textDecoration: 'none', color: 'inherit' }}>
                      {AppConstants.APP_NAME}
                      &nbsp;
                    </a>
                    <span>{currentYear}</span>
                  </Text>
                </Row>
              </Col>
            </Row>
          </Container>
        </Row>
      </Mobile>
    </>
  );
};

export default PublicFooter;
