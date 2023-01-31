import Routes from 'routes';

const RedirectionHelper = (response, redirectionRoute: string): void => {
  if (!process.browser) {
    response.writeHead(303, {
      Location: redirectionRoute,
    });
    response.end();
  } else {
    Routes.Router.pushRoute(redirectionRoute);
  }
};
export default RedirectionHelper;
