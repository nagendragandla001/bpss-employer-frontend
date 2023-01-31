/* eslint-disable @typescript-eslint/ban-types */
import { RoutesConstants } from 'constants/routes-constants';

const isAdaptive: Function = (route: string) => {
  const isRouteInConstants = RoutesConstants.filter((i) => i.page === route);
  const checkAdaptive = isRouteInConstants && isRouteInConstants.length
  && isRouteInConstants[0] && isRouteInConstants[0].adaptive;
  return checkAdaptive;
};

export default isAdaptive;
