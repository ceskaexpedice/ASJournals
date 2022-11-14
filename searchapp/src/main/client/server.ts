import 'zone.js/node';

import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import { join } from 'path';

import { AppServerModule } from './src/main.server';
import { APP_BASE_HREF } from '@angular/common';
import { existsSync } from 'fs';

const request = require('request');

// The Express app is exported so that it can be used by serverless Functions.
export function app() {
  const server = express();
  const distFolder = join(process.cwd(), 'browser');
  //const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';

  const indexHtml = existsSync(join(distFolder, 'index.ssr.html')) ? 'index.ssr.html' : 'index';

  const args = process.argv;
  let apiServer = 'http://localhost:8080/';
  if (args.length > 2) {
    apiServer = args[2];
  } else {
    console.log('Api server paramater missing. Start nodejs process as "node server/main.js "http://apiserverurl"');
    // process.exit();
  }

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
  server.engine('html', ngExpressEngine({
    bootstrap: AppServerModule,
  }));

  server.set('view engine', 'html');
  server.set('views', distFolder);
  // Example Express Rest API endpoints
  server.get('/api/img', (req, res) => {
    res.redirect(apiServer + req.url);
  });

  server.get('/api/**', (req, res) => {
    request(apiServer + req.url, function (error: any, response: any, body: any) {
      if (error) {
        console.log('error:', error); // Print the error if one occurred and handle it
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      }
      if (body) {
        res.setHeader('content-type', response['headers']['content-type']);
        res.send(body);
      } else {
        res.send('')
      }
      
    });
  });

  // Serve static files from /browser
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Universal engine
  server.get('*', (req, res) => {
    
    res.render(indexHtml, { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }] });
  });

  return server;
}

function run() {
  const port = process.env.PORT || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export * from './src/main.server';
