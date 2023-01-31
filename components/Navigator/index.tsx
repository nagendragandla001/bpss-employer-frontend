/* eslint-disable no-underscore-dangle */
import { Col, Row } from 'antd';
import Container from 'components/Layout/Container';
import LoggedInNav from 'components/StaticPages/Common/LoggedInNav/LoggedInNav.component';
import PublicNav from 'components/StaticPages/Common/PublicNav/PublicNav.component';
import 'components/StaticPages/Common/PublicNav/PublicNav.component.less';
import CustomImage from 'components/Wrappers/CustomImage';
import AppConstants from 'constants/constants';
import Router from 'next/router';
import React, { useEffect, useState } from 'react';
import { isUserLoggedIn } from 'service/auth-service';
import { getUnifiedOrgDetails } from 'service/organization-service';

require('components/StaticPages/Common/PublicNav/PublicNav.component.less');

interface StateInterface{
  userDetails: {
    firstName: string;
    lastName: string;
    logo: string;
    id:string;
  };
  loggedInNavBar: boolean;
  PublicNavBar: boolean;
}
const Navigator: React.FunctionComponent = () => {
  const [state, setState] = useState<StateInterface>({
    userDetails: {
      firstName: '',
      lastName: '',
      logo: '',
      id: '',
    },
    loggedInNavBar: false,
    PublicNavBar: false,
  });

  const getNavBar = async (): Promise<void> => {
    const response = await isUserLoggedIn();
    if (response && Router.asPath.startsWith('/employer-zone/')) {
      // const OrgDataApiCall = await getOrgDetails();
      const OrgDataApiCall = await getUnifiedOrgDetails();

      if (OrgDataApiCall) {
        const OrgData = await OrgDataApiCall.data;
        response.logo = (OrgData && OrgData.objects
          && OrgData.objects.length > 0 && OrgData.objects[0]._source
          && OrgData.objects[0]._source.logo) || '';
        response.contact_unlocks_left = (OrgData && OrgData.objects
          && OrgData.objects.length > 0 && OrgData.objects[0]
          && OrgData.objects[0].contact_unlocks_left) || 0;
        response.id = (OrgData && OrgData.objects
            && OrgData.objects.length > 0 && OrgData.objects[0]._source
            && OrgData.objects[0]._source.id) || '';
      }
      // if (response.id) {
      //   const data = await getNewPricingStats(response.id);

      //   if (data.APP_UL) {
      //     callUnlockContext.setcontactUnlocksLeft(
      //       data.APP_UL.remaining,
      //     );
      //     callUnlockContext.setTotalContactUnlocks(
      //       data.APP_UL.bought,
      //     );
      //   }
      // }
      setState((prevState) => ({
        ...prevState,
        userDetails: {
          firstName: response.first_name || '',
          lastName: response.last_name || '',
          logo: response.logo || '',
          id: response.id || '',
        },
        loggedInNavBar: true,
      }));
    } else {
      setState((prevState) => ({
        ...prevState,
        PublicNavBar: true,
      }));
    }
  };

  useEffect(() => {
    getNavBar();
  }, []);

  return (
    <>
      {state.loggedInNavBar ? <LoggedInNav />
        : null}
      {state.PublicNavBar ? <PublicNav />
        : null}
      {(!state.loggedInNavBar && !state.PublicNavBar)
        ? (
          <Container>
            <Row
              align="middle"
              justify="space-between"
              className="common-nav"
            >
              <Col lg={{ span: 24 }}>
                <CustomImage
                  src="/images/assets/logo.svg"
                  width={112}
                  height={32}
                  alt={AppConstants.APP_NAME}
                />
              </Col>
            </Row>
          </Container>
        ) : null }
    </>
  );
};

export default Navigator;
