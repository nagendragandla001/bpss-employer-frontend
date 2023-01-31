import { Col, Row, notification } from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import { isMobile } from 'mobile-device-detect';
import React, { useEffect } from 'react';

require('components/WjToRocketNotificationModal/wjToRocketNotificationModal.less');

const localStorageKey = 'wj-to-rocket-notification-shown';

const WjToRocketNotificationModal = ():JSX.Element => {
  const closeNotification = ():void => {
    window.localStorage.setItem(localStorageKey, 'true');
  };

  const openNotification = (placement): void => {
    const args = {
      message: '',
      description:
      (
        <Row>
          <Col span={24} className="flex-all-center">
            <CustomImage
              className="banner"
              src="/images/static-pages/common/wj-to-rocket-banner.svg"
              width={652}
              height={100}
              alt="wj to rocket banner"
            />
          </Col>
        </Row>
      ),
      duration: 0,
      placement,
      bottom: 32,
      className: 'aj-to-wj-notification',
      onClose: (): void => closeNotification(),
    };
    notification.open(args); // eslint-disable-line
  };

  useEffect(() => {
    const localStorageItem = window.localStorage.getItem(localStorageKey);
    if (!localStorageItem && localStorageItem !== 'true') {
      if (!isMobile) {
        openNotification('bottomLeft');
      }
    }
  }, []);

  return (<></>);
};

export default WjToRocketNotificationModal;
