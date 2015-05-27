/**
 *
 * This is a sample web app demonstrating how to implement a data driven application using NML.js library. This app uses Twitter Bootstrap 3, Jquery 1.10, jsviews and NMLjs. Templates are loaded from the template diretory.
 * Copyright 2015 Nimblestack. All rights reserved.
 * @namespace NML.js
 */

// Setup JSHint Config
/*jshint unused: false */
/* global window, $, document, NML, config, device */

//============================================================
// User Hash Utility Method
//------------------------------------------------------------
function generateUUID() {
    var d = new Date().getTime();
    // TODO: Stash the date registerd in LocalStorage
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}
var hash = generateUUID();


//============================================================
// Register Namespace
//------------------------------------------------------------
var app = app || {};

(function () {
    "use strict";

    //============================================================
    // Constructor - MUST BE AT TOP OF FILE
    //------------------------------------------------------------
    /**
     * @description An NML App object
     * @class app
     * @memberOf app
     * @global
     */
    app = function () {
        this.created = true;
    };

    //============================================================
    // Member Functions & Variables
    //------------------------------------------------------------
    app.prototype = {
        /**
         * @description A Boolean to check if the app is running in Cordova or on the web.
         * @protected
         * @memberOf app
         * @property {boolean} isGap
         * @inner
         */
        isGap: false,
        /**
         * @description A place hodler for the NML.js Object used by the App
         * @protected
         * @memberOf app
         * @property {object} nml
         * @inner
         */
        nml: null,
        /**
         * @description A place holder for a WebSocket connection used by the App
         * @protected
         * @memberOf app
         * @property {object} socket
         * @inner
         */
        socket: null,
        /**
         * @description A place holder for the JSON response from Datadipity.com
         * @protected
         * @memberOf app
         * @property {object} json
         * @inner
         */
        json: {},

        /**
         * @description App constructor
         * @function initialize
         * @memberOf app
         * @public
         * @param null
         * @return null
         * @inner
         */
        initialize: function () {
            app.bindEvents();
        },
        /**
         * @description Bind Cordova or Browser "onReady" event to the App
         * @function bindEvents
         * @memberOf app
         * @public
         * @param null
         * @return null
         * @inner
         */
        bindEvents: function () {
            console.log("App Bind Events");
            if (document.location.protocol === "file:") {
                console.log("Phonegap App");
                app.isGap = true;
                document.addEventListener(
                    "deviceready",
                    app.onDeviceReady,
                    false
                );
            } else {
                console.log("Browser App");
                // no phonegap, start initialisation immediately
                $(document).ready(function () {
                    app.onDeviceReady();
                });
            }
        },

        /**
         * @description When the Device is ready, either the browser or Phonegap, this method will execute.
         * @function onDeviceReady
         * @memberOf app
         * @public
         * @return null
         * @inner
         */
        onDeviceReady: function () {
            $("#lr_load").hide();
            app.nml = new NML();
            app.nml.initWithData = config.initWithData;
            app.nml.isGap = app.isGap;
            app.nml.onGetData = app.onGetData;
            // set host name using local var
            app.nml.setBaseUrl(
                config.appconfig[0].url,
                'https', ((config.local) ? 'localhost' : 'datadipity.com')
            );
            app.nml.loginHandler = app.onLoginOrRegister;
            var sessionReady = false;
            var sessData = null;
            if (window.localStorage.appconfig !== undefined && window.localStorage.appconfig !== null) {
                sessData = JSON.parse(window.localStorage.appconfig);
                if (sessData[0].url === config.appconfig[0].url) {
                    if (sessData[0].sessid !== null && sessData[0].sessid !== undefined && sessData[0].sessid !== "") {
                        // got session already
                        sessionReady = true;
                    }
                }
            }
            if (sessionReady) {
                app.nml.setAppConfig(sessData);
                if (app.nml.initWithData) {
                    app.nml.get(0, app.onGetData, true);
                } else {
                    app.initGui();
                }
            } else {
                app.nml.setAppConfig(config.appconfig);
                app.runLogin();
            }
        },

        /**
         * @description Run an automated login sequence or display dialogs for user to manually login. The automated sequence leverages device ID or random string to store user data. Sessions are stored in Local Storage. If sessions are removed, then in the case of a web app, the user email and password will automatically be reset. Such an algorithm provides for a reasonable balance between usability and security while maintaining ease of development.
         * @function runLogin
         * @memberOf app
         * @public
         * @return null
         * @inner
         */
        runLogin: function () {
            if (config.autoLogin) {
                // login the device
                if (app.isGap) {
                    app.nml.Login(
                        device.uuid + "@clickslide.co",
                        "password",
                        app.onLoginOrRegister,
                        app.nml
                    );
                } else {
                    if (window.localStorage.hash) {
                        // the hash is stored, so we can login the user. This is after the first run.
                        app.nml.Login(
                            window.localStorage.hash + "@clickslide.co",
                            "password",
                            app.onLoginOrRegister,
                            app.nml
                        );
                    } else {
                        // attempt to login with this hash. This should only happen on the app's first run
                        // this will also run if all the app's data is cleared.
                        app.nml.Login(
                            hash + "@clickslide.co",
                            "password",
                            app.onLoginOrRegister,
                            app.nml
                        );
                    }
                }
            } else {
                if (app.nml.loginIndex === 0) {
                    $('#loginRegister').modal('toggle');
                    $("#loginForm").on("submit", app.handleLogin);
                    $("#registerForm").on("submit", app.handleRegister);
                } else {
                    app.nml.Login(
                        window.localStorage._tmp_email,
                        window.localStorage._tmp_password,
                        app.onLoginOrRegister,
                        app.nml
                    );
                }
            }
        },
        /**
         * @description Handle the "Login" button click to submit the login form.
         * @function handleLogin
         * @memberOf app
         * @public
         * @param {object} evt The event object from the form submission.
         * @return null
         * @inner
         */
        handleLogin: function (evt) {
            evt.preventDefault();
            $("#lr_load").show();
            var email = $("#loginEmail").val();
            var password = $("#loginPassword").val();
            if (app.nml.loginIndex === 0) {
                window.localStorage._tmp_email = email;
                window.localStorage._tmp_password = password;
                window.localStorage._tmp_name = email.split('@')[0];
                window.localStorage._tmp_password2 = password;
            }
            app.nml.Login(email, password, app.onLoginOrRegister, app.nml);
        },
        /**
         * @description Handle the "Login" button click to submit the registration form.
         * @function handleRegister
         * @memberOf app
         * @public
         * @param {object} evt The event object from the form submission.
         * @return null
         * @inner
         */
        handleRegister: function (evt) {
            evt.preventDefault();
            var email = $("#registerEmail").val();
            var name = email.split('@')[0];
            var password = $("#registerPassword").val();
            var password2 = $("#registerPassword2").val();
            if (app.nml.loginIndex === 0) {
                // save temporarily
                window.localStorage._tmp_email = email;
                window.localStorage._tmp_password = password;
                window.localStorage._tmp_name = name;
                window.localStorage._tmp_password2 = password2;
            }
            $("#lr_load").show();
            app.nml.Register(name, email, password, password2, app.onLoginOrRegister);
        },
        /**
         * @description Callback after login or register HTTP request. This method saves teh User session data as well as manages next steps and automatic login for multiple APIs if required. It also redirects via Pop-Up window to an authentication screen for API authentication and Token storage.
         * @function onLoginOrRegister
         * @memberOf app
         * @public
         * @param {object} JSON Response from the server
         * @return null
         * @inner
         */
        onLoginOrRegister: function (data) {
            if (data instanceof Object) {
                if (data.session !== null && data.session !== undefined) {
                    app.nml.onLogin(data);
                    if (data.registerApis === true || data.registerApis === "true") {
                        console.log("open auth dialogs");
                        if (!config.autoLogin) {
                            $("#lr_load").hide();
                            // todo: test this modal open/close sequence for errors or misfires.
                            $('#loader').modal('toggle');
                            $('#loginRegister').modal('toggle');
                        }
                        app.nml.manageAuthRedirect(app.nml, function () {
                            // auth redirect should have been successful for current app.loginIndex
                            if (app.nml.loginIndex < (app.nml.appconfig.length - 1)) {
                                // increment loginIndex
                                app.nml.loginIndex++;
                                // reset base URL to next index
                                app.nml.setBaseUrl(
                                    config.appconfig[app.nml.loginIndex].url,
                                    'https', ((config.local) ? 'localhost' : 'datadipity.com')
                                );
                                // run login sequence again
                                app.runLogin();
                            } else {
                                // start GUI
                                if (app.nml.initWithData === true) {
                                    app.nml.get(0, app.nml.onGetData, true);
                                } else {
                                    app.initGui();
                                }
                            }
                        });
                    } else {
                        if (app.nml.loginIndex < (app.nml.appconfig.length - 1)) {
                            // increment loginIndex
                            app.nml.loginIndex++;
                            // reset base URL to next index
                            app.nml.setBaseUrl(
                                config.appconfig[app.nml.loginIndex].url,
                                'https', ((config.local) ? 'localhost' : 'datadipity.com')
                            );
                            // run login sequence again
                            app.runLogin();
                        } else {
                            if (!config.autoLogin) {
                                $("#lr_load").hide();
                                // todo: test this modal open/close sequence for errors or misfires.
                                //$('#loader').modal('toggle');
                                $('#loginRegister').modal('toggle');
                            }
                            // start GUI
                            if (app.nml.initWithData) {
                                app.nml.get(0, app.nml.onGetData, true);
                            } else {
                                app.nml.setBaseUrl(
                                    config.appconfig[config.startIndex].url,
                                    'https', ((config.local) ? 'localhost' : 'datadipity.com')
                                );
                                app.initGui();
                            }
                        }
                    }
                } else {
                    if (config.autoLogin) {
                        // add message to login modal
                        if (app.isGap) {
                            app.nml.Register(
                                device.uuid,
                                device.uuid + "@clickslide.co",
                                "password",
                                "password",
                                app.onLoginOrRegister
                            );
                        } else {
                            console.log(hash);
                            window.localStorage.hash = hash;
                            app.nml.Register(
                                hash,
                                hash + "@clickslide.co",
                                "password",
                                "password",
                                app.onLoginOrRegister
                            );
                        }
                    } else {
                        if (app.nml.loginIndex === 0) {
                            $("#lr_load").hide();
                            $("#registerToggle").tab('show');
                            $("#failedLogin").html(data.message);
                        } else {
                            app.nml.Register(
                                window.localStorage._tmp_name,
                                window.localStorage._tmp_email,
                                window.localStorage._tmp_password,
                                window.localStorage._tmp_password2,
                                app.onLoginOrRegister
                            );
                        }
                    }
                }
            } else {
                throw new Error(app.nml.BAD_API_URL);
            }
        },
    };
})();
