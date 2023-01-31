/* eslint-disable no-shadow */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-var-requires */
const next = require('next');
const express = require('express');
const path = require('path');
const LRUCache = require('lru-cache');
// const querystring = require('querystring');
const compression = require('compression');
const cors = require('cors');
const bodyParser = require('body-parser');

const routes = require('./routes');

const autoLoginHandler = require('./handlers/autoLogin');
const autoCompleteHandler = require('./handlers/autoComplete');
const paymentResponseHandler = require('./handlers/paymentResponseHandler');
const emailVerificationHandler = require('./handlers/emailVerificationHandler');
const sendEmailHandler = require('./handlers/sendEmail');

const port = parseInt(process.env.PORT, 10) || 3000;

const app = next({ dev: process.env.NODE_ENV !== 'production' });

const ssrCache = new LRUCache({
  max: 100 * 1024 * 1024, /* cache size will be 100 MB using
  `return n.length` as length() function */
  length(n, key) {
    return n.length;
  },
  maxAge: 1000 * 60 * 60 * 24 * 30,
});
function getCacheKey(req) {
  return `${req.path}`;
}

async function renderAndCache(req, res, page, query) {
  const key = getCacheKey(req);
  // If we have a page in the cache, let's serve it
  if (ssrCache.has(key)) {
    // console.log(`serving from cache ${key}`);
    res.setHeader('x-cache', 'HIT');
    res.send(ssrCache.get(key));
    return;
  }

  // console.log(`key ${key} not found, rendering`);
  // If not let's render the page into HTML
  try {
    const html = await app.renderToHTML(req, res, page, query);

    // Something is wrong with the request, let's skip the cache
    if (res.statusCode !== 200) {
      res.send(html);
      return;
    }
    if (!html) {
      return;
    }
    // Let's cache this page
    ssrCache.set(key, html);

    res.setHeader('x-cache', 'MISS');
    res.send(html);
  } catch (err) {
    app.renderError(err, req, res, page, query);
  }
}

const pingdom = (req, res, next) => {
  if (req.url.includes('pingdom')) {
    res.writeHead(200);
    res.end();
  } else {
    next();
  }
};

const handler = routes.getRequestHandler(app, (
  {
    req, res, route, query,
  },
) => {
  // redirectFromAJ param is added incorrectly by the cdn, this if block
  // rectifies this & redirects to correct url
  // console.log('url', req.url);
  if (req && req.url && req.url.includes('?redirectFromAJ=true')) {
    const params = { ...req.query };
    const paramsKeys = Object.keys(params);
    if (paramsKeys.length >= 1 && paramsKeys.indexOf('redirectFromAJ') === -1) {
      const newUrl = req.url.replace('?redirectFromAJ', '&redirectFromAJ');
      res.redirect(301, newUrl);
    }
  }
  // if (req.url === '/sw.js' || /^\/(workbox|worker|fallback)-\w+\.js$/.test(req.url)) {
  //   const filePath = path.join(__dirname, 'build', req.url);
  //   // console.log('path', filePath);
  //   app.serveStatic(req, res, filePath);
  // }

  if (query.username && query.hash_code && route.name !== 'PasswordReset') {
    autoLoginHandler(req, res);
  } else if (route.name === 'autoComplete') {
    autoCompleteHandler(req, res);
  } else if (route.name === 'paymentResponse') {
    paymentResponseHandler(req, res);
  } else if (route.name === 'EmployerHomepage') {
    renderAndCache(req, res, route.page, query);
  } else {
    app.render(req, res, route.page, query);
  }
});
// const trailingSlashMiddleware = (req, res, next, ...resProps) => {
//   const parsedURL = req._parsedUrl;
//   const query = parsedURL.query || null;

//   if (req.url && req.url.includes('/s/') && query) {
//     const queryObj = querystring.parse(query);

//     if (queryObj.page) {
//       const { page, ...restQueryObj } = queryObj;
//       let finalUrl = `${parsedURL.pathname}`;

//       const restQueryString = querystring.stringify(restQueryObj);
//       if (restQueryString) {
//         finalUrl = `${parsedURL.pathname}?${restQueryString}`;
//       }
//       res.writeHead(301, {
//         Location: finalUrl,
//       });
//       res.end();
//     }
//   }

//   if (
//     req.url.includes('service-worker.js')
//     || req.url.includes('sw.js')
//     || req.url.startsWith('/_next')
//     || req.url.startsWith('/static')
//     || req.url.endsWith('/')
//     || parsedURL.pathname.endsWith('/')
//   ) {
//     next();
//   } else {
//     const querySuffix = parsedURL.search ? parsedURL.search : '';
// parsedURL.search can be null!
//     const pathWithTrailingSlash = `${parsedURL.pathname}/${querySuffix}`;
//     res.writeHead(301, {
//       Location: pathWithTrailingSlash,
//     });
//     res.end();
//   }
// };

const lowercaseUrlMiddleware = (req, res, next) => {
  if (req.url.includes('/s/') && /[A-Z]/.test(req.url)) {
    res.redirect(301, req.url.toLowerCase());
  } else {
    next();
  }
};

const imgHandler = (req, res, next) => {
  const match = req.url.match('.svg|.jpg|.png|.gif|.jpeg|.webp');
  if (match !== null) {
    res.setHeader('Cache-Control', 'public, max-age=365, must-revalidate');
  }
  next();
};

app.prepare().then(() => {
  const server = express();
  server.use(pingdom);
  server.use(imgHandler);
  server.use(cors({ credentials: true, origin: true }));
  server.use(compression());
  server.use(express.static(path.join(__dirname, 'public')));
  // server.use(trailingSlashMiddleware);
  server.use(lowercaseUrlMiddleware);
  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({ extended: true }));
  server.use('/send/email', sendEmailHandler);
  server.use('/verify/email', emailVerificationHandler);
  // sserver.get('/employerHomePage', (req, res) => renderAndCache(req, res));
  server.use(handler);
  server.listen(port, (err) => {
    if (err) throw err;
    // console.log(`> Ready on http://localhost:${port}`);
  });
  // createServer(handler).listen(3000);
});
