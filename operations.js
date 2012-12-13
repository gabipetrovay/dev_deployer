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
        console.log(data.toString().trim());
        output += data.toString();
    });
    depl_app.stderr.on("data", function(data) {
        console.error(data.toString().trim());
        output += data.toString();
    });
    depl_app.on("exit", function(code){

        if (code == 0) {
            // TODO improve this appId reading (probably get it through other means)
            // (add all output to a -v option and only print ID at the end)
            var splits = output.trim().split("\n");
            var lastLine = splits[splits.length - 1];
            var tokens = lastLine.trim().split(" ");
            var appId = tokens[tokens.length - 1];

            apps.getApplication(appId, function(err, app) {

                if (err) {
                    send.internalservererror(link, "The application was not found in the databse. Application deployment failed somehow. :(");
                    return;
                }

                apps.getApplicationDomains(appId, function(err, domains) {

                    if (err) {
                        send.internalservererror(link, err);
                        return;
                    }

                    var domain = null;

                    for (var i in domains) {
                        if (domains[i].indexOf("mono.ch") !== -1) {
                            continue;
                        }
                        domain = domains[i];
                        break;
                    }

                    var result = {
                        name: app.name,
                        size: 0,
                        type: "text/html",
                        delete_type: "DELETE",
                        delete_url: "http://dev.mono.ch:8000/@/dev_deployer/remove/00000000000000000000000000000002",
                        url: domain ? "http://" + domain + "/" : "#"
                    };

                    send.ok(link.res, [result]);
                });
            });
        }
        else {
            send.internalservererror(link, ":{ :( :[");
        }
    });
};

