const liveServer = require("live-server");

liveServer.start({
    port: 8081,
    open: false,
    root: "./demo-site",
    file: "index.html"
});
