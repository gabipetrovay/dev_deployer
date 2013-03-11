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
            
            var textBox = $("#repository-path");
            var btn = $(this);
            
            // Disable button and the textbox
            btn.addClass("disabled");
            textBox.attr("disabled", "");
            
            // Call deploy from Github operation
            self.link("deployFromGithub", { data: repositoryPath }, function(err) {
                btn.removeClass("disabled");
                textBox.removeAttr("disabled");
                
                $("#repository-path").val("");
                
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

