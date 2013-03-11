define([
        "/uploader/js/jquery.fileupload-ui.js",
        "/uploader/js/locale.js"
    ], function() {

    var self;

    function init(config) {
        self = this;

        // Deploy from Github
        $("#deploy-from-github .btn-start").on("click", function() {
            var repositoryPath = $("#repository-path").val().trim();
            
            var btn = $("#deploy-from-github");
            btn.addClass("disabled");
            
            self.link("deployFromGithub", { data: repositoryPath }, function(err) {
                btn.removeClass("disabled");
                
                if (err) {
                    alert("Error: " + err);
                } else {
                    alert("Finished...");
                }
            });
        });

        // Initialize the jQuery File Upload widget:
        $('#fileupload').fileupload();

        // Enable iframe cross-domain access via redirect option:
        $('#fileupload').fileupload(
            'option',
            'redirect',
            window.location.href.replace(
                /\/[^\/]*$/,
                '/cors/result.html?%s'
            )
        );

        // Load existing files:
        $('#fileupload').each(function () {
            var that = this;
            $.getJSON(this.action, function (result) {
                if (result && result.length) {
                    $(that).fileupload('option', 'done')
                        .call(that, null, {result: result});
                }
            });
        });
    }

    return init;
});

