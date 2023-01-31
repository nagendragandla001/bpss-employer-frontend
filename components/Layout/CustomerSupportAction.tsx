/* eslint-disable react-hooks/exhaustive-deps */
import {
  Button, Typography,
} from 'antd';
import { RoutesConstants } from 'constants/routes-constants';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { isMobile } from 'mobile-device-detect';
import CustomerSupportActionModal from
  'components/Layout/CustomerSupportAction/customerSupportActionModal';
import CustomImage from 'components/Wrappers/CustomImage';
import { pushClevertapEvent } from 'utils/clevertap';
// import dynamic from 'next/dynamic';

// const CustomerSupportActionModal = dynamic(() =>
// import('components/Layout/CustomerSupportAction/customerSupportActionModal'), { ssr: false });

require('components/Layout/CustomerSupportAction.less');

const { Paragraph } = Typography;

const CustomerSupportAction: React.FunctionComponent = () => {
  const router = useRouter();

  // State
  const [isActionVisible, setActionVisible] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);

  const ProtectedRoutes = RoutesConstants.filter((route) => route.type === 'protected');
  const ValidRoutes = ProtectedRoutes.filter((route) => !route.pattern.startsWith('/job-posting'));

  const CurrentRoute = router && router.route && router.route.replace('/', '');

  useEffect(() => {
    // eslint-disable-next-line max-len
    const isValidRoute = ValidRoutes.some((route) => route.page.toLowerCase() === CurrentRoute.toLowerCase());
    setActionVisible(isValidRoute);
  }, []);

  const setModalRoutine = (): void => {
    pushClevertapEvent('Customer Support', {
      Type: 'start',
    });
    setModalVisible(true);
  };

  return (
    <>
      {isActionVisible ? (
        <Paragraph className="customer-support-block">
          <Button
            type="link"
            onClick={setModalRoutine}
            className={isMobile ? '' : 'can-we-help-btn'}
          >
            <CustomImage
              src="/images/common/help-icon.svg"
              width={50}
              height={56}
              alt="Can We Help?"
            />
            {isMobile ? '' : 'Can we help you?'}
          </Button>
        </Paragraph>
      ) : ''}

      {
        isModalVisible ? (
          <CustomerSupportActionModal
            title="Contact Customer Support"
            description="Your feedback is valuable to us. If you are facing a problem in using the product or want to request a new feature on the product, please provide the feedback."
            source={CurrentRoute}
            closeHandler={(): void => setModalVisible(false)}
            text="Customer Query Received"
            isLoggedInPage
          />
        ) : null
      }
    </>
  );
};

export default CustomerSupportAction;
