import 'zone.js/node';

import { APP_BASE_HREF } from '@angular/common';
import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import { existsSync, mkdirSync  } from 'node:fs';
import { join } from 'node:path';
import bootstrap from './src/main.server';

let configDir = '';
let config: any = {};

const request = require('request');
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req: any, file: any, cb: any) {
    let path = configDir + req.query['ctx'];
    if (req.query['cover']) {
      //console.log('bude ' + configDir + req.query['ctx']);
    } else {
      //console.log('bude ' + configDir + req.query['ctx'] + "/texts/files");
      path = path + "/texts/files";
    }
    mkdirSync(path, { recursive: true })
    cb(null, path )
    
  },
  filename: function (req: any, file: any, cb: any) {
    console.log(req.query['cover']);
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    if (req.query['cover']) {
      cb(null, 'cover.jpeg');
    } else {
      cb(null, file.originalname);
    }
    
  }
});
const upload = multer({ storage:   storage });

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const distFolder = existsSync(join(process.cwd(), 'dist/')) ? join(process.cwd(), 'dist/') : join(process.cwd(), '.');
  const indexHtml = existsSync(join(distFolder, 'index.ssr.html')) ? 'index.ssr.html' : 'index';
  const args = process.argv;
  let apiServer = 'http://localhost:8080/';
  if (args.length > 2) {
    apiServer = args[2];
  } else {
    console.log('Api server paramater missing. Start nodejs process as "node server/main.js "http://apiserverurl"');
    console.log('Using default: ' + apiServer);
    // process.exit();
  }
  server.use(express.urlencoded({ extended: true }));
  server.use(express.json());

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/main/modules/express-engine)
  server.engine('html', ngExpressEngine({
    bootstrap
  }));

  server.set('view engine', 'html');
  server.set('views', distFolder);

  // Rest API endpoints
  server.get('/api/img', (req, res) => {
    //res.redirect(apiServer + req.url);

    request({ url: apiServer + req.url, encoding: null }, function (error: any, response: any, body: any) {
      if (error) {
        console.log('error:', error); // Print the error if one occurred and handle it
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      }
      if (response.body) {
        if (response['headers']['content-type']) {
          res.type(response['headers']['content-type']);
        } else {
          res.setHeader('content-type', 'image/jpeg');
        }
        res.send(response.body);
      } else {
        res.send('')
      }
    });
  });

  server.get('/api/lf', (req, res) => {
    //res.redirect(apiServer + req.url);

    request({ url: apiServer + req.url, encoding: null }, function (error: any, response: any, body: any) {
      if (error) {
        console.log('error:', error); // Print the error if one occurred and handle it
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      }
      if (response.body) {
        if (response['headers']['content-type']) {
          res.type(response['headers']['content-type']);
        } else {
          res.setHeader('content-type', 'image/jpeg');
        }
        res.send(response.body);
      } else {
        res.send('')
      }
    });
  });


  server.get('/api/**', (req, res) => {
    request({url: apiServer + req.url, headers: req.headers} , function (error: any, response: any, body: any) {
      if (error) {
        console.log('error:', error); // Print the error if one occurred and handle it
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      }
      if (body) {

        if (req.url.indexOf('assets/config.json') > 0) {
          config = JSON.parse(response.body);
          configDir = config.configDir;
          // console.log(config);
        }
        if (response['headers']['set-cookie']) {
          res.setHeader('cookie', response['headers']['set-cookie']);
          res.setHeader('set-cookie', response['headers']['set-cookie']);
        }

        if (response['headers']['content-type']) {
          res.setHeader('content-type', response['headers']['content-type']);
        }

        res.status(200).send(body);
      } else {
        res.send('')
      }

    });
  });

  server.post('/lf', upload.single('file'), function(req: any, res: any) {
    // console.log(req.body); // form fields
    /* example output:
    { title: 'abc' }
     */
    // console.log(req.file); 
    const resp: any = {};
    if (req.query['cover']) {
      resp.msg = 'ok'
    } else {
      const action = req.query['isImage'] ? 'GET_IMAGE' : 'GET_FILE';
      resp.location = '/api/lf?action='+action+'&id=' + req.file.originalname + '&ctx=' + req.query.ctx; 
    }
    res.send(resp);
    res.status(204).end();
  });


  server.post('/api/**', (req, res) => {
    //  console.log(req['headers']['cookie']);
    request.post({
      url: apiServer + req.url,
      headers: {
        'content-type': 'application/json',
        //'set-cookie': req.headers['cookie'],
        'cookie': req.headers['cookie']
      },
      body: JSON.stringify(req.body),


    }, function (error: any, response: any, body: any) {
      if (error) {
        console.log('error:', error); // Print the error if one occurred and handle it
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      }

      // console.log('set-cookie', response['headers']['set-cookie']);
      if (response['headers']['set-cookie']) {
        res.setHeader('cookie', response['headers']['set-cookie']);
        res.setHeader('set-cookie', response['headers']['set-cookie']);
      }
      if (body) {
        res.setHeader('content-type', response['headers']['content-type']);
        res.send(body);
      } else {
        res.send('')
      }

    });
  });

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
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

function run(): void {
  const host = process.env['HOST'] || 'localhost';
  // const host = 'localhost';
  const port = parseInt(process.env['PORT']) || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, host, () => {
    console.log(`Node Express server listening on http://${host}:${port}`);
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

export default bootstrap;