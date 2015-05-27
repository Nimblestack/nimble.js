/*jshint unused: false */
/* global window, $, appconfig, NML, document, device, app, FormData, _ */

// Configuration for NML.js
var config = {
    // API URLs for NML.js to connect to, hosted at Datadipity.com
    appconfig: [
        {
            url: "clickslide/yammersentimentanalysisbasic",
            sessid: null
        },
        {
            url: "clickslide/ocrdocumentconcepts",
            sessid: null
        }
    ],
    initWithData: false, // if true, App will start by making a request to API at startIndex
    startIndex: 0, // first URL to GET from appconfig
    autoLogin: false, // if true, use machine based ID to login
    local: true // if true, use localhost REMOVE FOR PRODUCTION
};

// A custom variable used to switch between app types for the purpose of a cool demo.
app.prototype.appType = "yammer";

/**
 * Callback for NML.get function
 * This is where we will process the data
 */
app.prototype.onGetData = function (nmldata) {
    if (nmldata === null || nmldata === "" || nmldata === " ") {
        // runLogin if data is null
        // TODO: Only allow 3 retries then fail with server error.
        // TODO: In Cordova, verify network and device API connectivity
        app.runLogin();
    } else {
        // start the UI if the app launches with a request for data
        if (app.nml.initWithData) {
            app.initGui();
        }
        try {
            app.json = JSON.parse(nmldata);
        } catch (err) {
            app.json = nmldata;
        }
        if (app.json.hasOwnProperty("error")) {
            $("#textList").append('<a href="#" style="background-color:red;color:white;text-transform:capitalize;" class="list-group-item">' +
                '<h4 class="list-group-item-heading">' + app.json.error.api + '</h4>' +
                '<p class="list-group-item-text"><strong>' + app.json.error.status + '</strong> ' + app.json.error.message + '</p>' +
                '</a>');
        } else {
            app.nml.setHomePageId(app.json.ListPage["@attributes"].id);
            var jsondata = null;
            $("#textList").html("");

            // TODO: Swap out for views instead of hard coded HTML
            if (app.appType === 'image') {
                jsondata = app.json.ListPage.pages.BasicPage;
                if (jsondata instanceof Array) {
                    _.each(jsondata, function (item) {
                        $("#textList").append('<a href="#" class="list-group-item">' +
                            '<h4 class="list-group-item-heading">' + item.title + '</h4>' +
                            '<p class="list-group-item-text">' + item.pageText + '</p>' +
                            '</a>');
                    });
                } else {
                    $("#textList").append('<a href="#" class="list-group-item">' +
                        '<h4 class="list-group-item-heading">' + jsondata.title + '</h4>' +
                        '<p class="list-group-item-text">' + jsondata.pageText + '</p>' +
                        '</a>');
                }
            } else {
                jsondata = app.json.ListPage.pages.LinkPage;
                console.log(jsondata);
                if (jsondata instanceof Array) {
                    _.each(jsondata, function (item) {
                        var color = (item.linkTitle === "negative") ? 'style="background-color:red;color:white;"' : '';
                        $("#textList").append('<a ' + color + ' href="' + item.linkUrl + '" class="list-group-item">' +
                            '<h4 ' + color + ' class="list-group-item-heading">' + item.title + '</h4>' +
                            '<p class="list-group-item-text">' + item.pageText + '</p>' +
                            '</a>');
                    });
                } else {
                    var color = (jsondata.Title === "negative") ? 'style="background-color:red;"' : '';
                    $("#textList").append('<a ' + jsondata + ' href="' + jsondata.linkUrl + '" class="list-group-item">' +
                        '<h4 class="list-group-item-heading">' + jsondata.title + '</h4>' +
                        '<p class="list-group-item-text">' + jsondata.pageText + '</p>' +
                        '</a>');
                }

            }
        }

        $('#loader').modal('toggle');
    }
};
/**
 * Give all the GUI elements their event listeners
 */
app.prototype.initGui = function () {
    if (app.appType === "image") {
        $("#imageUp").show();
        $("#yammer").hide();
        // TOOD: Test if it requires a different type of form for Phonegap?
        $("#upForm").submit(function (evt) {
            var formData = new FormData(this);
            $('#loader').modal('toggle');
            app.nml.getWithFile(formData, app.onGetData, 0);
            evt.preventDefault();
        });
    } else {
        $("#imageUp").hide();
        $("#yammer").show();
        $('#loader').modal('toggle');
        app.nml.get(0, app.onGetData, true);
    }
};
