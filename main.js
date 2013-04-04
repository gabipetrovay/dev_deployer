define([
        "/uploader/js/jquery.fileupload-ui.js",
        "/uploader/js/locale.js"
    ], function() {

    var self;

    function init(config) {
        self = this;

        // Deploy from Git
        $("#deploy-from-git .btn-start").on("click", function() {
            
            var repositoryPath = $("#repository-path").val().trim();
            
            var textBox = $("#repository-path");
            var btn = $(this);
            
            // Disable button and the textbox
            btn.addClass("disabled");
            textBox.attr("disabled", "");
            
            
            // Show alert message
            var message = "Started deployment from " + repositoryPath + " ...";
            
            showStartOperationMessage(message);
            
            // Call deploy from Git operation
            self.link("deployFromGit", { data: repositoryPath }, function(err) {
                btn.removeClass("disabled");
                textBox.removeAttr("disabled");
                
                $("#repository-path").val("");
                
                if (err) {
                    showError(err);
                } else {
                    showSuccessMessage("Successfully deployed app from Git.");
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

// Alerts functions
function showError(err) {
    var template = $("#errorAlert").clone().attr("id", "");
    template.find(".message").html(err);

    template.fadeIn();
        
    $("#alerts").append(template);
}
    
function showStartOperationMessage(message) {
    var template = $("#warningAlert").clone().attr("id", "");

    template.find(".message").html(message);
    template.fadeIn();
       
    $("#alerts").append(template);
}
    
function showSuccessMessage(message) {
    var template = $("#successAlert").clone().attr("id", "");

    template.find(".message").html(message);
    template.fadeIn();
    
    $("#alerts").append(template);
}
