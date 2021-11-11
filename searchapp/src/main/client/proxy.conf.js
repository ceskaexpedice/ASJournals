const PROXY_CONFIG = {
  "/search/**": {
    "target": "http://localhost:8983/solr/",
    "ignorePath": false,
    "logLevel": "debug",
    "pathRewrite": {
      "^/search": ""
    },
    "changeOrigin": false,
    "secure": false
  },
  "/api/**": {
    "target": "https://kramerius.lib.cas.cz/search/api/v5.0",
    "ignorePath": false,
    "logLevel": "debug",
    "pathRewrite": {
      "^/api": ""
    },
    "changeOrigin": false,
    "secure": false
  },
  "/img": {
    "target0": "http://localhost:8080/k5journals/img",
    "target": "https://kramerius.lib.cas.cz/search/img",
    "target1": "http://cdk.lib.cas.cz/search/api/v5.0",
    "target2": "http://kramerius.lib.cas.cz/search/api/v5.0",
    "pathRewrite": {
      "^/img": ""
    },
    "logLevel": "debug",
    "changeOrigin": true,
    "secure": false
  },
  "/texts/**": {
    "target": "http://localhost:8080/k5journals/texts",
    "target2": "http://localhost:4200/assets/test",
    "logLevel": "debug",
    "bypass": function (req, res, proxyOptions) {
      //console.log(req.query['ctx']);
      req.headers["X-Custom-Header"] = "yes";

      if (req.path.indexOf('theme') > -1) {
        const base = "/assets/test/cached_css/";
        return base + req.query['color'] + ".css";
      } else {

        const action = req.query['action'];
        if (action === 'GET_CONFIG') {
          return "/assets/test/" + req.query['ctx'] + "/config.json";
        } else if (action === 'LOAD') {
          return "/assets/test/" + req.query['ctx'] + "/texts/" + req.query['id'] + "_cs.html";
        } else {
          return "/assets/test/" + action + ".json";
        }
      }
    },
    "logLevel": "debug",
    "changeOrigin": false,
    "secure": false
  },
  "/lf": {
    "target": "http://localhost:8080/k5journals/lf",
    "logLevel": "debug",
    "pathRewrite": {
      "^/lf": ""
    },
    "changeOrigin": false,
    "secure": false
  },
  "/login": {
    "target2": "http://localhost:8080/login",
    "target": "http://localhost:4200/assets/test/user.json",
    "logLevel": "debug",
    "pathRewrite": {
      "^/login": ""
    },
    "changeOrigin": false,
    "secure": false 
  },
  "/index": {
    "target": "http://localhost:8080/k5journals/index",
    "logLevel": "debug",
    "pathRewrite": {
      "^/index": ""
    },
    "changeOrigin": false,
    "secure": false
  },
  "/search_": {
    "target": "https://kramerius.lib.cas.cz/search/api/v5.0/search",
    "ignorePath": false,
    "logLevel": "debug",
    "pathRewrite": {
      "^/search": ""
    },
    "changeOrigin": false,
    "secure": false
  }
};
module.exports = PROXY_CONFIG;