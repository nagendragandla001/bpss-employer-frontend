import {
  FacebookFilled, InstagramFilled, LinkedinFilled, TwitterSquareFilled, YoutubeFilled,
} from '@ant-design/icons/lib/icons';
import { Col, Row, Space } from 'antd';
import Container from 'components/Layout/Container';
import { Desktop } from 'components/Layout/Responsive';
import config from 'config';
import LinksConstants from 'constants/links-constants';
import React from 'react';

require('components/Layout/LoggedInFooter/LoggedInFooter.less');

const currentYear = new Date().getFullYear();

const LoggedInFooterList = [{
  title: 'Terms & Conditions',
  link: LinksConstants.TERMS,
}, {
  title: 'Privacy Policy',
  link: LinksConstants.PRIVACY,
}, {
  title: 'Contact us',
  link: LinksConstants.CONTACT,
}, {
  title: 'FAQ',
  link: LinksConstants.EMPLOYER_FAQ,
}];

const LoggedInFooter = (): JSX.Element => (
  <Desktop>
    <Row className="logged-in-footer">
      <Container>
        <Desktop>
          <Row align="middle">
            <Col span={10}>
              <ul className="footer-internal-links">
                {LoggedInFooterList.map((item) => (
                  <li key={item.title}>
                    <a href={item.link}>
                      &bull;&nbsp;
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </Col>
            <Col span={8}>
              <span>Follow Us On</span>
              <ul className="footer-social-links">
                <li>
                  <a
                    href={LinksConstants.FACEBOOK_LINK}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FacebookFilled />
                  </a>
                </li>
                <li>
                  <a
                    href={LinksConstants.TWITTER_LINK}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <TwitterSquareFilled />
                  </a>
                </li>
                <li>
                  <a
                    href={LinksConstants.LINKEDIN_LINK}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <LinkedinFilled />
                  </a>
                </li>
                <li>
                  <a
                    href={LinksConstants.INSTA_LINK}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <InstagramFilled />
                  </a>
                </li>
                <li>
                  <a
                    href={LinksConstants.YOUTUBE_LINK}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <YoutubeFilled />
                  </a>
                </li>
              </ul>
            </Col>
            <Col span={6} className="text-right">
              <Space size="small">
                <span>Copyright &copy;</span>
                <a
                  href={config.AJ_URL}
                  target="_blank"
                  rel="noreferrer"
                  title={LinksConstants.APP_NAME}
                  style={{ textDecoration: 'underline', fontWeight: 600 }}
                >
                  {LinksConstants.APP_NAME}
                </a>
                <span>{currentYear}</span>
              </Space>
            </Col>
          </Row>
        </Desktop>
      </Container>
    </Row>
  </Desktop>
);

export default LoggedInFooter;
