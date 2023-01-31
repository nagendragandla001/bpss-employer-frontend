/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
const routes = require('next-routes');
const { RoutesConstants } = require('./constants/routes-constants');

const makeProtected = (pattern) => `/employer-zone${pattern}`;

// Public Routes (Does not require Authenctication)
const publicRoutes = RoutesConstants.filter((route) => route.type === 'public');

// Private Routes (Requires Authenctication)
const protectedRoutes = RoutesConstants.filter((route) => route.type === 'protected');

const myRoutes = routes();

// serviceWorkerRoutes.forEach(route => myRoutes.add(route));
publicRoutes.forEach((route) => myRoutes.add(route));
protectedRoutes.forEach((routeObj) => myRoutes.add({
  ...routeObj,
  pattern: makeProtected(routeObj.pattern),
}));
module.exports = myRoutes;
