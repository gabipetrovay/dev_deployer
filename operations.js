var send  = require(CONFIG.root + "/core/send.js").send;


exports.upload = function(link) {
    send.ok(link.res, { success: true });
};

