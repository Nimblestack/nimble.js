/**
 * Nimble is an extensible object oriented JavaScript library for connecting and communicating with Datadipity.com APIs. This is designed to drasitically reduce development time when building connected products and software. Copyright 2014 Clickslide Limited. All rights reserved.
 * @namespace Nimble
 */

/*jshint unused: false */
/* global window, $, config, clearInterval */
//============================================================
// Register Namespace
//------------------------------------------------------------
var Nimble = Nimble || {};

(function () {
    "use strict";
    var _self;
    //============================================================
    // Constructor - MUST BE AT TOP OF FILE
    //------------------------------------------------------------
    /**
     * @description An Nimble object
     * @class Nimble
     * @memberOf Nimble
     * @global
     */
    Nimble = function () {
        _self = this;
        _self.created = true;
    };

    //============================================================
    // Member Functions & Variables
    //------------------------------------------------------------
    Nimble.prototype = {

        /**
         *   App Constants
         **/
        BAD_API_URL: "API Unavailable. Please verify the URL in app-config.js. Possibly your baseUrl is not set to https://datadipity.com?",

        /** Use this for login sequence **/
        _tmp_email: "",
        _tmp_password: "",

        /**
         * @description Was Nimble() created?
         * @protected
         * @memberOf Nimble
         * @property {boolean} created
         * @inner
         */
        created: false,

        /**
         * @description The URL for the API. This variable is used internally. It can be set using the method setBaseUrl() of the Nimble object.
         * @protected
         * @memberOf Nimble
         * @property {string} BaseUrl
         * @inner
         */
        BaseUrl: null,

        /**
         * @description This is a reference object to the Nimble object created in the app. This helps with scope and referencing.
         * @protected
         * @memberOf Nimble
         * @property {Nimble} appnml
         * @inner
         */
        appnml: null,

        /**
         * @description A reference to the app config array.
         * @protected
         * @memberOf Nimble
         * @property {array} appconfig
         * @inner
         */
        appconfig: [],

        /**
         * @description Set the config for the app and save it as a serialized string using JSON.stringify to the localstorage.
         * @function setAppConfig
         * @memberOf Nimble
         * @public
         * @param {object} _config - pass the appconfig object from the App
         * @return null
         * @inner
         */
        setAppConfig: function (_config) {
            _self.appconfig = _config;
            window.localStorage.appconfig = JSON.stringify(_config);
        },

        /**
         * @description This is a reference to a method in the A
         * @protected
         * @memberOf Nimble
         * @property {function} handleLogin
         * @inner
         */
        handleLogin: null,

        /**
         * @description After login, load the first API data from the appconfig.
         * @protected
         * @memberOf Nimble
         * @property {boolean} initWithData
         * @inner
         */
        initWithData: true,

        /**
         * @description Keeps track of which API we are logged into.
         * @protected
         * @memberOf Nimble
         * @property {integer} loginIndex
         * @inner
         */
        loginIndex: 0,

        /**
         * @description A custom callback after loadDialogs completes to be triggered in the App instead of the built in methods.
         * @protected
         * @memberOf Nimble
         * @property {function} loadDialogCallback
         * @inner
         */
        loadDialogCallback: null,

        /**
         * @description The ID of the home page as described in the Nimble document
         * @protected
         * @memberOf Nimble
         * @property {string|number} homePageId
         * @inner
         */
        homePageId: null,

        /**
         * @description Track if the app is running on phonegap or browser
         * @property {boolean} isGap
         * @memberOf Nimble
         * @public
         * @inner
         */
        isGap: false,

        /**
         * @description A function used to handle Nimble data when it is returned from the server.
         * @public
         * @memberOf Nimble
         * @callback onGetData
         * @inner
         */
        onGetData: null,

        /**
         * @description Whether or not search is enabled in the API
         * @private
         * @memberOf Nimble
         * @property search
         */
        search: "0",

        /**
         * @description Set the homePageId parameter.
         * @function setHomePageId
         * @memberOf Nimble
         * @public
         * @param {String} id - id of the homepage
         * @return null
         * @inner
         */
        setHomePageId: function (id) {
            _self.homePageId = id;
        },

        /**
         * @description Get the homePageId parameter.
         * @function setHomePageId
         * @public
         * @memberOf Nimble
         * @return null
         * @inner
         */
        getHomePageId: function () {
            return _self.homePageId;
        },

        /**
         * @description Set the BaseUrl parameter.
         * @function setBaseUrl
         * @memberOf Nimble
         * @public
         * @param {string} url - the url as developer/app based on your Datadipity API.
         * @param {string} protocol - http or https, always https for Datadipity.com
         * @param {string} host - datadipity.com
         * @return null
         * @inner
         */
        setBaseUrl: function (url, protocol, host) {
            _self.BaseUrl = protocol + "://" + host + "/" + url;
        },
        /**
         * @description Get the BaseUrl.
         * @function getBaseUrl
         * @public
         * @memberOf Nimble
         * @return {string} BaseUrl - The base url variable
         * @inner
         */
        getBaseUrl: function () {
            return _self.BaseUrl;
        },

        /**
         * @description Set the session ID in local storage.
         * @function setSession
         * @public
         * @memberOf Nimble
         * @return null
         * @inner
         */
        setSession: function (sess, index) {
            try {
                var a = JSON.parse(window.localStorage.appconfig);
                a[index].sessid = sess;
                window.localStorage.appconfig = JSON.stringify(a);
            } catch (err) {
                throw err; // throw it to make it obvious
            }
        },
        /**
         * @description get the session ID from local storage.
         * @function getSession
         * @public
         * @memberOf Nimble
         * @return {string} Session - The session ID
         * @inner
         */
        getSession: function (index) {
            var a = JSON.parse(window.localStorage.appconfig);
            //console.log(a);
            //console.log(index);
            return a[index].sessid;
        },
        /**
         * @description POST data to Datadipity.com to create a new resource or trigger the "add" event for API communication. TODO: Add the ability to upload files.
         * @function add
         * @memberOf Nimble
         * @public
         * @param {string} action - This is an Nimble String representing the resource to add. This resource will be parsed and will trigger the API events on the server side. <BasicPage>...</BasicPage>
         * @param {string} pageType - A Nimble page type in lowercase and plural: basicpages, listpages, etc. It depends on the type of page you are posting to the ListPage and which type of page it accepts.
         * @param {asyncCallback} callback - A custom callback function to override the default. This takes an Nimble object as an argument.
         * @return null
         * @inner
         * @todo This needs more testing, it may not be functioning properly at this version.
         */
        add: function (action, pagesType, callback, index) {
            var next = null;
            if (callback !== null) {
                next = callback;
            } else {
                next = _self.processPageData;
            }
            //console.log(next);
            // post request to Datadipity.com
            _self.setBaseUrl(
                _self.appconfig[index].url,
                config.protocol,
                config.host
            );

            $.ajax({
                type: "GET",
                url:  _self.BaseUrl + "/" + pagesType + ".json?_method=post&_action=" + action + "&PHPSESSID=" + _self.getSession(index),
                crossDomain: true,
                dataType: 'text',
                success: function (data) {
                    next(data);
                },
                error: _self.failedRequest
            });
        },

        /**
         * @description Update an Nimble resource on the Datadipity server
         * @function update
         * @memberOf Nimble
         * @public
         * @param {string} action - This is an Nimble String representing the resource to add. This resource will be parsed and will trigger the API events on the server side. <BasicPage>...</BasicPage>
         * @param {string} pageType - A Nimble page type in lowercase and plural: basicpages, listpages, etc. It depends on the type of page you are posting to the ListPage and which type of page it accepts.
         * @param {asyncCallback} callback - A custom callback function to override the default. This takes an Nimble object as an argument.
         * @param {integer} index - the item to use from AppConfig
         * @return null
         * @inner
         */
        update: function (action, pageType, pageId, callback, index) {
            var next = null;
            if (callback !== null) {
                next = callback;
            } else {
                next = _self.processPageData;
            }

            _self.setBaseUrl(
                _self.appconfig[index].url,
                config.protocol,
                config.host
            );

            $.ajax({
                type: "GET",
                url:  _self.BaseUrl + "/" + pageType +"/"+pageId+ ".json?_method=put&_action=" + action + "&PHPSESSID=" + _self.getSession(index),
                crossDomain: true,
                dataType: 'text',
                success: function (data) {
                    // Set Session Variable Here to maintain scope
                    //appnml.setSession(data.session.id);
                    next(data);
                },
                error: _self.failedRequest
            });
        },

        /**
         * @description Remove a resource from the Datadipity server using basic pages as an example it would look similar to https://datadipity.com/developerurl/apiurl/pageType/pageId.xml?_method=delete
         * @function remove
         * @memberOf Nimble
         * @public
         * @param {string} pageType - the type of page eg: basicpages, listpages, linkpages, etc.
         * @param {string} pageId - Required to execute a delete on a resource
         * @param {integer} index - the item to use from AppConfig
         * @return null
         * @inner
         */
        remove: function (pageType, pageId, callback, index) {
            var next = null;
            if (callback !== null) {
                next = callback;
            } else {
                next = _self.processPageData;
            }

            // GET delete request to Datadipity.com using XML
            _self.setBaseUrl(
                _self.appconfig[index].url,
                config.protocol,
                config.host
            );

            $.ajax({
                type: "GET",
                url:  _self.BaseUrl + "/" + pageType + "/" + pageId + ".json?_method=delete&PHPSESSID=" + _self.getSession(index),
                crossDomain: true,
                dataType: 'text',
                success: function (data) {
                    next(data);
                },
                error: _self.failedRequest
            });
        },

        /**
         * @description A simple method to get a single Nimble object or a collection of objects. Urls for requests are formed as Nimble.AppUrl/pageUrl.json or Nimble.AppUrl/pageTypespageId.json. This uses JSON by default. This has an XML endpoint but is not implemented in JavaScript.
         * @function get
         * @memberOf Nimble
         * @public
         * @param {asyncCallback} callback - A function to override the default event listener.
         * @param {boolean} withUpdate - Adds ?update to force the API data provider to refresh
         * @param {array} postparams - Adds ?postparam[key]=val from [{name:key, value:val}] for every Object in the array
         * @param {string} pageType - basicpages, listpages, linkpages, etc.
         * @param {string} pageId - The ID parameter from the @attributes.id element
         * @param {string} pageUrl - This will override using pageType/pageId
         * @param {integer} index - the item to use from AppConfig
         * @todo More testing needs to be done using individual page types.
         * @return null
         * @inner
         */
        get: function (index, callback, withUpdate, postparams, pageType, pageId, pageUrl) {
            var next = null;
            if (callback) {
                next = callback;
            } else {
                next = null;
            }

            _self.setBaseUrl(
                _self.appconfig[index].url,
                config.protocol,
                config.host
            );

            var reqUrl = _self.BaseUrl;


            try {
                if ((pageType !== null && pageType !== undefined) && (pageId === null || pageId === undefined)) {
                    // get the collection
                    reqUrl = _self.BaseUrl + "/" + pageType.toLowerCase();
                } else if ((pageId !== null && pageId !== undefined) && (pageType === null || pageType === undefined)) {
                    throw new Error({
                        name: "Configuration Error",
                        level: "Cancel Request",
                        message: "pageType cannot be null when pageId is not. this.get()"
                    });
                } else if ((pageId !== null && pageId !== undefined) && (pageType !== null && pageType !== undefined)) {
                    // pageType and pageId are both set
                    reqUrl = _self.BaseUrl + "/" + pageType.toLowerCase() + "/" + pageId.toLowerCase();
                }
            } catch (err) {
                throw(err);
            }

            if (pageUrl !== null && pageUrl !== undefined) {
                reqUrl = _self.BaseUrl + "/" + pageUrl.toLowerCase();
            }

            var sessid = _self.getSession(index);
            var withSession = false;
            if (sessid != "null" && sessid != "undefined" && sessid !== null && sessid !== undefined) {
                   withSession = true;
            }

            if(withSession) {
                if (withUpdate === true) {
                    reqUrl += ".json?update&PHPSESSID=" + sessid;
                } else {
                    reqUrl += ".json?PHPSESSID=" + sessid;
                }
            } else {
                if (withUpdate === true) {
                    reqUrl += ".json?update";
                } else {
                    reqUrl += ".json";
                }
            }

            // include postparams
            if ((postparams !== undefined && postparams !== null) && postparams.length > 0) {
                var c = postparams.length;
                for (var i = 0; i < c; i++) {
                    if(i === 0 && !withUpdate && !withSession){
                        reqUrl += "?postparam[" + postparams[i].name + "]=" + postparams[i].value;
                    }else{
                        reqUrl += "&postparam[" + postparams[i].name + "]=" + postparams[i].value;
                    }
                }
            }
            console.log("Getting: " + reqUrl);
            $.ajax({
                type: "GET",
                url: reqUrl,
                crossDomain: true,
                dataType: 'text',
                success: function (data) {
                    console.log(data);
                    next(data);
                },
                error: _self.failedRequest
            });
        },

        /**
         * @description POST Filedata to Datadipity.com to trigger the "get" event for API communication. This is used when the first API in your chain requires File input. An example of such an API would be an Image Recognition API.
         * @function getWithFile
         * @memberOf Nimble
         * @public
         * @param {FormData} Filedata - This is the object from the File Input tag in HTML
         * @param {asyncCallback} callback - A custom callback function to override the default. This takes an Nimble object as an argument.
         * @return null
         * @inner
         */
        getWithFile: function (Filedata, callback, index) {
            var next = null;
            if (callback !== null) {
                next = callback;
            } else {
                next = _self.processPageData;
            }

            _self.setBaseUrl(
                _self.appconfig[index].url,
                config.protocol,
                config.host
            );
            // TODO: Create action templates in Nimble based on available data models
            var postUrl = _self.BaseUrl + ".json?update&PHPSESSID=" + this.getSession(index);
            //console.log(postUrl);
            $.ajax({
                type: "POST",
                url: postUrl,
                crossDomain: true,
                processData: false,
                contentType: false,
                data: Filedata,
                dataType: 'text',
                success: function (data) {
                    next(data);
                },
                error: _self.failedRequest
            });
        },
        /**
         * @description Logs any Ajax failures to the console
         * @function failedRequest
         * @memberOf Nimble
         * @private
         * @param {object} xhr The full Ajax request object
         * @param {string} status The Error message
         * @param {object} err The full Error object
         * @return null
         * @inner
         */
        failedRequest: function (xhr, status, err) {
            console.log(err);
            console.log(status);
            console.log(JSON.stringify(xhr));
            throw err;
        },
        /**
         * @description This sets the search boolean and the homepage ID
         * @function processPageData
         * @memberOf Nimble
         * @protected
         * @param {object} data
         * @return null
         * @inner
         */
        processPageData: function (data) {
            // load homepage template
            _self.search = data.ListPage.search;
            _self.setHomePageId(data.ListPage["@attributes"].id);
        },
        /**
         * @function Register
         * @memberOf Nimble
         * @public
         * @description Registration and Login use similar functionality. New users and possibly returning users will have to authorize API services. Once logged in or registered, if authorization is required, Clickslide will return a "registerApis=true" in its JSON response. The manageAuthRedirect Method in the example handles this behavior. It is altered slightly in Cordova Phonegap.
         * @param {string} userName - Name of user to register
         * @param {string} userEmail - Email address of the user ro register
         * @param {string} userPassword1 - Email address of the user to register
         * @param {string} userPassword2 - Verify the user password
         * @param {function} callback - a custom function to override the onRegister method. This method will take a data object as an argument.
         * @return null
         * @inner
         */
        Register: function (userName, userEmail, userPassword1, userPassword2, callback) {
            var next = null;
            if (callback !== null) {
                next = callback;
            } else {
                next = _self.onRegister;
            }
            // simple validation
            if (userEmail.length === 0) {
                alert("Enter valid email address");
                return false;
            }
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (!re.test(userEmail)) {
                alert("Enter valid email address");
                return false;
            }
            if (userName.length === 0) {
                alert("Enter name");
                return false;
            }
            if (userPassword1.length === 0) {
                alert("Enter password");
                return false;
            }
            if (userPassword2.length === 0) {
                alert("Repeat password");
                return false;
            }
            if (userPassword1 !== userPassword2) {
                alert("Password is not the same");
                return false;
            }

//            var nml = this;
            _self.setBaseUrl(
                 _self.appconfig[_self.loginIndex].url,
                config.protocol,
                config.host
            );

            $.ajax({
                type: "POST",
                url:  _self.BaseUrl + "/register/doRegister.json",
                crossDomain: true,
                data: {
                    name: userName,
                    email: userEmail,
                    password: userPassword1
                },
                success: function (data) {
                    next(data);
                },
                error: function (err) {
                    console.log("Registration Failed!");
                    console.log(JSON.stringify(err));
                }
            });
        },

        /**
         * @description Default callback for the Register method.. This function does nothing at the moment except log the data returned. You should override this in your app by sending a <callback> function to the Register function.
         * @function onRegister
         * @private
         * @memberOf Datadipity
         * @param {object} data - This is the JSON object coming from the server.
         * @return null
         * @inner
         */
        onRegister: function (data) {
            if (data.success === true || data.success == "true") {
                console.log(_self.loginIndex);
                _self.setSession(data.session.id, _self.loginIndex);

                if (data.registerApis === true || data.registerApis == "true") {
                    window.open(_self.BaseUrl + "/register/apis?PHPSESSID=" + _self.getSession(_self.loginIndex ), "App Authorization", "directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=400,height=350");
                }
            }
        },
        /**
         * @description Logout an App user or developer to their Clickslide account.
         * @method Logout
         * @public
         * @memberOf Nimble
         * @param {string} sessid - Session ID
         * @param {asyncCallback} callback - a custom function to override the onLogin method. This method will take a data object as an argument.
         * @return null
         * @inner
         */
        Logout: function (sessid, callback) {
            var next = null;
            if (callback !== null) {
                next = callback;
            } else {
                next = _self.onLogin;
            }
            $.ajax({
                type: "GET",
                url: _self.BaseUrl + "/login/logout.json?PHPSESSID=" + sessid,
                crossDomain: true,
                success: function (data) {
                    next(data);
                },
                error: function (res, status, err) {
                    console.log("Logout Failed! - " + status);
                    throw err;
                }
            });
        },
        /**
         * @description Login an App user or developer to their Clickslide account.
         * @method Login
         * @public
         * @memberOf Nimble
         * @param {string} userEmail - Email address of the user to login
         * @param {string} userPassword - To be used once to connect for a session *DO NOT STORE THIS*
         * @param {asyncCallback} callback - a custom function to override the onLogin method. This method will take a data object as an argument.
         * @todo Make sure the server accepts POST requests and not GET requests for LOGIN. GET is too insecure.
         * @return null
         * @inner
         */
        Login: function (userEmail, userPassword, callback) {
            var next = null;
            if (callback !== null) {
                next = callback;
            } else {
                next = _self.onLogin;
            }

            _self.setBaseUrl(
                _self.appconfig[_self.loginIndex].url,
                config.protocol,
                config.host
            );


            $.ajax({
                type: "GET",
                url: _self.BaseUrl + "/login/doLogin.json",
                crossDomain: true,
                data: {
                    email: userEmail,
                    password: userPassword
                },
                success: function (data, status, xhr) {
                    next(data);
                },
                error: function (res, status, err) {
                    console.log("Login Failed! - " + status);
                    console.log(res);
                    console.log(err);
                    throw err;
                }
            });
        },

        /**
         * @description Default callback for the Login method.. This function sets the user session for this Nimble object. You can override this but we suggest calling Nimble.onLogin(data) in the first line of your custom callback to make sure the Nimble object maintains its session data properly.
         * @function onLogin
         * @private
         * @memberOf Nimble
         * @param {object} data - This is the JSON object coming from the server.
         * @summary This method will redirect to the API authentication page if the logged in user needs to authenticate with any APIs used in the application.
         * @return null
         * @inner
         * @TODO: somehow tie
         */
        onLogin: function (data) {
            if (data.success === true || data.success === "true") {
                _self.setSession(data.session.id, _self.loginIndex);
            }
        },
        /**
         * @description Verify APIs and redirect for Auth if necessary. This method ends by calling _Nimble.get(_Nimble.onGetData, true). Be sure to register a callback with onGetData before this gets called otherwise it will lose its scope.
         * @function manageAuthRedirect
         * @private
         * @memberOf Nimble
         * @param {asyncCallback} callback
         * @return null
         * @inner
         */
        manageAuthRedirect: function (callback) {
            $("#loader").modal("hide");
            $("#generic").modal("show");
            $("#authlink").attr("href", _self.BaseUrl + "/register/apis?PHPSESSID=" + _self.getSession(_self.loginIndex));
            $("#authlink").bind('click', function (evt) {
                $("#authlink").unbind('click');
                evt.preventDefault();
                var url = evt.currentTarget.href;
                var popup = window.open(url, "_blank", "location=yes");
                if (!_self.isGap) {
                    // do this in browser
                    var timer = setInterval(function (evt) {
                        if (popup.closed) {
                            clearInterval(timer);
                            $("#generic").modal("hide");
                            callback();
                        }
                    }, 500);
                } else {
                    // do this in phonegap
                    popup.addEventListener("exit", function () {
                        //clearInterval(timer);
                        $("#generic").modal("hide");
                        callback();
                    });
                }
            });
        }
    };
})();
/**
 *
 * This is a sample web app demonstrating how to implement a data driven application using nimble.js library. This app uses Twitter Bootstrap 3, Jquery 1.10, jsviews and nimblejs. Templates are loaded from the template diretory.
 * Copyright 2015 Nimblestack. All rights reserved.
 * @namespace nimble.js
 */

// Setup JSHint Config
/*jshint unused: false */
/* global window, $, document, nimble, config, device */

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
     * @description This object
     * @property {object} _self
     * @memberOf app
     * @global
     */
    var _self;

    /**
     * @description An nimble App object
     * @class app
     * @memberOf app
     * @global
     */
    app = function () {
        _self = this;
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
         * @description A place hodler for the nimble.js Object used by the App
         * @protected
         * @memberOf app
         * @property {object} nimble
         * @inner
         */
        nimble: null,
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
         * @description A boolean to hold state after init is executed.
         * @protected
         * @memberOf app
         * @property {boolean} started
         * @inner
         */
        started: false,
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
            _self.bindEvents();
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
           // console.log("App Bind Events");
            if (document.location.protocol === "file:") {
                //console.log("Phonegap App");
                _self.isGap = true;
                document.addEventListener(
                    "deviceready",
                    _self.onDeviceReady,
                    false
                );
            } else {
                //console.log("Browser App");
                // no phonegap, start initialisation immediately
                $(document).ready(_self.onDeviceReady);
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
            //console.log(JSON.stringify(this));
            _self.nimble = new Nimble();
            _self.nimble.initWithData = config.initWithData;
            _self.nimble.isGap = _self.isGap;
            _self.nimble.onGetData = _self.onGetData;
            // set host name using local var
            _self.nimble.setBaseUrl(
                config.appconfig[0].url,
                config.protocol, config.host
            );
            _self.nimble.loginHandler = app.onLoginOrRegister;
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
                _self.nimble.setAppConfig(sessData);
                if (_self.nimble.initWithData) {
                    _self.nimble.get(0, _self.onGetData, true);
                } else {
                    _self.initGui();
                }
            } else {
                _self.nimble.setAppConfig(config.appconfig);
                _self.runLogin();
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
                if (_self.isGap) {
                    _self.nimble.Login(
                        device.uuid + "@clickslide.co",
                        "password",
                        _self.onLoginOrRegister
                    );
                } else {
                    if (window.localStorage.hash) {
                        // the hash is stored, so we can login the user. This is after the first run.
                        _self.nimble.Login(
                            window.localStorage.hash + "@clickslide.co",
                            "password",
                            _self.onLoginOrRegister
                        );
                    } else {
                        // attempt to login with this hash. This should only happen on the app's first run
                        // this will also run if all the app's data is cleared.
                        _self.nimble.Login(
                            hash + "@clickslide.co",
                            "password",
                            _self.onLoginOrRegister
                        );
                    }
                }
            } else {
                if (_self.nimble.loginIndex === 0 && !window.localStorage._tmp_email && !window.localStorage._tmp_password) {
                    $('#loginRegister').modal('show');
                    $("#modalTitle").text("Login");
                    $("#loginForm").on("submit", _self.handleLogin);
                    $("#registerForm").on("submit", _self.handleRegister);
                } else {
                    _self.nimble.Login(
                        window.localStorage._tmp_email,
                        window.localStorage._tmp_password,
                        _self.onLoginOrRegister
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
            if (_self.nimble.loginIndex === 0) {
                window.localStorage._tmp_email = email;
                window.localStorage._tmp_password = password;
                window.localStorage._tmp_name = email.split('@')[0];
                window.localStorage._tmp_password2 = password;
            }
            _self.nimble.Login(email, password, _self.onLoginOrRegister);
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
            if (_self.nimble.loginIndex === 0) {
                // save temporarily
                window.localStorage._tmp_email = email;
                window.localStorage._tmp_password = password;
                window.localStorage._tmp_name = name;
                window.localStorage._tmp_password2 = password2;
            }
            $("#lr_load").show();
            _self.nimble.Register(name, email, password, password2, _self.onLoginOrRegister);
        },
        /**
         * @description Override function. To be overriden in custom javascript.
         * @function initGui
         * @memberOf app
         * @public
         * @return null
         * @inner
         */
        initGui: function(){
           // console.log("initGui called");
        },
        /**
         * @description Override function. To be overriden in custom javascript. Handle response from server.
         * @function onGetData
         * @memberOf app
         * @public
         * @param data {object} JSON Response from the server
         * @return null
         * @inner
         */
        onGetData: function(data) {
            //console.log("Got data from server.");
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
           // console.log(data);
            if (data instanceof Object) {
                if (data.session !== null && data.session !== undefined) {
                    _self.nimble.onLogin(data);
                    if (data.registerApis === true || data.registerApis === "true") {
                       // console.log("open auth dialogs");
                        if (!config.autoLogin) {
                            $("#lr_load").hide();
                            $('#loader').modal('show');
                            $('#loginRegister').modal('hide');
                        }
                        _self.nimble.manageAuthRedirect(function () {
                            // auth redirect should have been successful for current _self.loginIndex
                            //console.log("Managed auth redirect");
                            if (_self.nimble.loginIndex < (_self.nimble.appconfig.length - 1)) {
                                // increment loginIndex
                                _self.nimble.loginIndex++;
                                _self.runLogin();
                            } else {
                                // start GUI
                                if (_self.nimble.initWithData === true) {
                                    _self.nimble.get(config.startIndex, _self.nimble.onGetData, true);
                                } else {
                                    _self.initGui();
                                }
                            }
                        });
                    } else {
                        if (_self.nimble.loginIndex < (_self.nimble.appconfig.length - 1)) {
                            // increment loginIndex
                            _self.nimble.loginIndex++;
                            // run login sequence again
                            _self.runLogin();
                        } else {
                            if (!config.autoLogin) {
                                $("#lr_load").hide();
                                $('#loginRegister').modal('hide');
                            }
                            // start GUI
                            if (_self.nimble.initWithData) {
                                $('#loader').modal('show');
                                _self.nimble.get(config.startIndex, _self.nimble.onGetData, true);
                            } else {
                                if(!_self.started){
                                    _self.initGui();
                                }
                            }
                        }
                    }
                } else {
                    if (config.autoLogin) {
                        // add message to login modal
                        if (_self.isGap) {
                            _self.nimble.Register(
                                device.uuid,
                                device.uuid + "@clickslide.co",
                                "password",
                                "password",
                                _self.onLoginOrRegister
                            );
                        } else {
                            window.localStorage.hash = hash;
                            _self.nimble.Register(
                                hash,
                                hash + "@clickslide.co",
                                "password",
                                "password",
                                _self.onLoginOrRegister
                            );
                        }
                    } else {
                        if (_self.nimble.loginIndex === 0) {
                            $("#lr_load").hide();
                            $("#modalTitle").text("Register");
                            $("#registerToggle").tab('show');
                            $("#failedLogin").html(data.message);
                        } else {
                            $('#loader').modal('show');
                            _self.nimble.Register(
                                window.localStorage._tmp_name,
                                window.localStorage._tmp_email,
                                window.localStorage._tmp_password,
                                window.localStorage._tmp_password2,
                                _self.onLoginOrRegister
                            );
                        }
                    }
                }
            } else {
                throw new Error(_self.nimble.BAD_API_URL);
            }
        },
    };
})();
