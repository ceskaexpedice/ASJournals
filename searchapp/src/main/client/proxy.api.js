const PROXY_CONFIG = {

    "/k5api/**": {
        "target": "https://kramerius.lib.cas.cz/search/api/v5.0",
        "ignorePath": false,
        "logLevel": "debug",
        "pathRewrite": {
            "^/api": ""
        },
        "changeOrigin": false,
        "secure": false
    },
    "/api/**": {
        "target": "http://localhost:8080/api",
        "changeOrigin": true,
        "secure": false,
        "logLevel": "debug",
        "pathRewrite": {
            "^/api": ""
        },
        "onProxyRes": function (pr, req, res) {
            if (pr.headers['set-cookie']) {
                // console.log("Replacing cookie "+pr.headers['set-cookie']);
                // const cookies = pr.headers['set-cookie'].map(cookie => 
                //     cookie.replace(/\/insodatawebui/gi, '/')
                // );
                // pr.headers['set-cookie'] = cookies;
                // console.log("Replaced cookie "+pr.headers['set-cookie']);
            }
        }
    }
};

module.exports = PROXY_CONFIG;