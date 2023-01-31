/* eslint-disable no-underscore-dangle */
import { Router } from 'next/router';
import RouterObject from 'routes';

export const getRouteInformation = (link) => {
  const match = RouterObject.match(link);
  return {
    url: match.parsedUrl.path,
    route: match.route ? match.route.name : 'Unknown',
    params: match.query,
  };
};

class NavHistory {
  history;

  constructor() {
    this._init();
    this.history = [];
  }

  reset = (): void => {
    this._init();
  };

  _init = (): void => {
    this.history = [];

    if (process.browser) {
      this.history.push(getRouteInformation(window.location.href));
      // Because the router isn't completely ready yet, manually parse
    }
  };

  _replace = (url): void => {
    if (url !== this.history[this.history.length - 1].url) {
      this.pop(); // replace the old url with the new one
      this._push(url);
    }
  };

  _push = (url): void => {
    if (process.browser) {
      this.history.push(getRouteInformation(url));
      // Because the router isn't completely ready yet, manually parse
    }
  };

  get() {
    return this.history;
  }

  pop() {
    if (process.browser) {
      return this.history.pop();
    }
    return this.history();
  }
}

const historyInstance = new NavHistory();

Router.events.on('routeChangeStart', (url) => historyInstance._push(url));

Router.events.on('routeChangeComplete', (url) => historyInstance._replace(url));

Router.events.on('routeChangeError', () => historyInstance.pop());

export default historyInstance; // make sure it's a singleton
