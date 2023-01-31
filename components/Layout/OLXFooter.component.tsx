/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/exhaustive-deps */
import PublicFooter from 'components/Layout/PublicFooter/PublicFooter.component';
import { RoutesConstants } from 'constants/routes-constants';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import LoggedInFooter from 'components/Layout/LoggedInFooter/LoggedInFooter.component';

const OLXFooter: React.FunctionComponent = () => {
  const router = useRouter();

  // State
  const [isLoggedInFooter, setLoggedInFooter] = useState(false);
  const [isPublicFooter, setPublicFooter] = useState(false);

  const ProtectedRoutes = RoutesConstants.filter(
    (route) => route.type === 'protected' && route.footer,
  );
  const PublicRoutes = RoutesConstants.filter(
    (route) => route.type === 'public' && route.footer,
  );

  const CurrentRoute = router && router.route && router.route.replace('/', '');

  useEffect(() => {
    ProtectedRoutes.forEach((route) => {
      if (route.page.toLowerCase() === CurrentRoute.toLowerCase()) {
        setLoggedInFooter(true);
      }
    });
    PublicRoutes.forEach((route) => {
      if (route.page.toLowerCase() === CurrentRoute.toLowerCase()) {
        setPublicFooter(true);
      }
    });
  }, []);

  return (
    <>
      {isLoggedInFooter ? (<LoggedInFooter />) : ''}
      {isPublicFooter ? (<PublicFooter showFooter />) : ''}
    </>
  );
};

export default OLXFooter;
