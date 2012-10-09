var spawn = require("child_process").spawn;

var send  = require(CONFIG.root + "/core/send.js").send;
var apps = require(CONFIG.root + "/api/apps");


exports.upload = function(link) {

    if (link.req.method === "GET") {
        send.ok(link.res, { status: "OK" });
        return;
    }

    if (!link.files || !link.files["files[]"] || !link.files["files[]"].path) {
        send.badrequest(link, "Missing file");
        return;
    }

    var file = link.files["files[]"];
    var zipPath = CONFIG.APPLICATION_ROOT + link.session.appid + "/" + file.path;

    var env = process.env;
    env.MONO_ROOT = CONFIG.root;
    var depl_app = spawn(CONFIG.root + "/admin/scripts/installation/deploy_app.sh", [zipPath], { env: env });

    var output = "";

    depl_app.stdout.on("data", function(data) {
        console.log(data.toString());
        output += data.toString();
    });
    depl_app.stderr.on("data", function(data) {
        console.error(data.toString());
        output += data.toString();
    });
    depl_app.on("exit", function(code){

        if (code == 0) {
            // TODO determine this ID from the deployment script
            // (add all output to a -v option and only print ID at the end)
            var appId = "faeb1870000000000000000000000000";

            apps.getApplication(appId, function(err, app) {

                if (err) {
                    send.internalservererror(link, "Application deployment failed somehow. :(");
                    return;
                }

                // TODO enhance the app api to return the domains or at least the first one
                var domain = app.domain || "crm.mono.ch:8000";

                var result = {
                    name: app.name,
                    size: 0,
                    type: "text/html",
                    delete_type: "DELETE",
                    delete_url: "http://dev.mono.ch:8000/@/dev_deployer/remove/00000000000000000000000000000002",
                    url: "http://" + domain + "/"
                };

                send.ok(link.res, [result]);
            });
        }
        else {
            send.internalservererror(link, ":{ :( :[");
        }
    });
};

