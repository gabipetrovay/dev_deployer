var spawn = require("child_process").spawn;

exports.deployFromGithub = function(link) {

    if (!link.data || typeof link.data !== "string" || !link.data.trim()) {
        link.send(400, "Missing repository URL");
        return;
    }

    var repoUrl = link.data.trim();

    M.app.fetch(repoUrl, function(err, descriptor) {

        if (err) {
            link.send(500, err.message);
            return;
        }

        M.app.install(descriptor, function(err) {

            if (err) {
                link.send(500, err.message);
                return;
            }

            link.send(200);
        });
    });
};

exports.upload = function(link) {

    if (link.req.method === "GET") {
        link.send(200, { status: "OK" });
        return;
    }

    if (!link.files || !link.files["files[]"] || !link.files["files[]"].path) {
        link.send(400, "Missing file");
        return;
    }

    var file = link.files["files[]"];
    var zipPath = M.config.APPLICATION_ROOT + link.session.appid + "/" + file.path;

    var env = process.env;
    env.MONO_ROOT = M.config.root;
    var depl_app = spawn(M.config.root + "/admin/scripts/installation/deploy_app.sh", [zipPath], { env: env });

    var output = "";

    depl_app.stdout.on("data", function(data) {
        console.log(data.toString().trim());
        output += data.toString();
    });
    depl_app.stderr.on("data", function(data) {
        console.error(data.toString().trim());
        output += data.toString();
    });
    
    M.app.install();
    
    depl_app.on("exit", function(code){

        if (code == 0) {
            // TODO improve this appId reading (probably get it through other means)
            // (add all output to a -v option and only print ID at the end)
            var splits = output.trim().split("\n");
            var lastLine = splits[splits.length - 1];
            var tokens = lastLine.trim().split(" ");
            var appId = tokens[tokens.length - 1];

            M.app.getApplication(appId, function(err, app) {

                if (err) {
                    link.send(500, "The application was not found in the databse. Application deployment failed somehow. :(");
                    return;
                }

                M.app.getDomains(appId, function(err, domains) {

                    if (err) {
                        link.send(500, err);
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

                    link.send(200, [result]);
                });
            });
        }
        else {
            link.send(500, ":{ :( :[");
        }
    });
};

