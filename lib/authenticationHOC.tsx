import React from 'react';
import { getAuthToken } from 'service/auth-service';
import redirect from 'lib/redirectionHelper';
import config from 'config';
import { has } from 'utils/common-utils';
import axios from 'axios';
import { pushClevertapProfile } from 'utils/clevertap';

export interface UserDetailsType{
  firstName: string;
  lastName: string;
  userId: string;
  mobile: string;
  email: string;
  whatsappSubscribed: boolean;
}
export interface AuthenticationHocProps{
  userDetails: any ;
  wrappedComponentProps: any;
}

const authenticationHOC = (WrappedComponent): React.ReactNode => {
  const AuthenticationHOC = (props:AuthenticationHocProps) : JSX.Element => {
    const { userDetails, wrappedComponentProps } = props;
    return (
      <WrappedComponent userDetails={userDetails} wrappedComponentProps={wrappedComponentProps} />
    );
  };

  AuthenticationHOC.getInitialProps = async (ctx):
  Promise<AuthenticationHocProps> => {
    if (ctx && ctx.req) {
      const authToken = getAuthToken(ctx.req);
      const hasEmployerZone = ctx.asPath.startsWith('/employer-zone/');
      if (!hasEmployerZone) return { userDetails: null, wrappedComponentProps: null };
      if (authToken) {
        try {
          const userRequest = await axios.request({
            url: `${config.API_ENDPOINT}api/v4/user/`,
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              authorization: `Bearer ${authToken}`,
            },
          });
          if ([200, 201, 202].indexOf(userRequest.status) !== -1) {
            const response = await userRequest.data;
            if (response && response.objects && response.objects.length) {
              let wrappedComponentProps = {};
              if (WrappedComponent.getInitialProps !== undefined) {
                wrappedComponentProps = await WrappedComponent.getInitialProps(ctx);
              }

              const userInfo = response?.objects[0];

              pushClevertapProfile({
                'Email Verified': userInfo?.email_verified === true ? 'T' : 'F',
                'Mobile Verified': userInfo?.mobile_verified === true ? 'T' : 'F',
                'User ID': userInfo?.id,
              });

              return {
                userDetails: {
                  firstName: (has(response.objects[0], 'first_name') && response.objects[0].first_name)
                              || '',
                  lastName: (has(response.objects[0], 'last_name') && response.objects[0].last_name)
                              || '',
                  userId: (has(response.objects[0], 'id') && response.objects[0].id)
                              || '',
                  mobile: (has(response.objects[0], 'mobile') && response.objects[0].mobile)
                              || '',
                  email: (has(response.objects[0], 'email') && response.objects[0].email)
                              || '',
                  whatsappSubscribed: (true)
                              || '',
                },

                wrappedComponentProps: { ...wrappedComponentProps },
              };
            }
          }
        } catch (err: any) {
          if (err?.response?.status === 401) {
            redirect(ctx.res, '/logout');
          }
        }
      } else {
        redirect(ctx.res, '/logout');
      }
    }
    return { userDetails: null, wrappedComponentProps: null };
  };
  return AuthenticationHOC;
};

export default authenticationHOC;
