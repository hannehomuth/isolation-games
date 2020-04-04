angular.module('myApp')
        .factory('UrlInjector', function ($window) {

            return {
                getBaseURL: function () {
                    return _getBaseURL();
                },
                getWSBaseURL: function () {
                    return _getBaseWSURL();
                }
            };

            function _getBaseURL() {
                var hostname = $window.location.hostname;
                if (hostname.indexOf('localhost') === 0) {
                    return "http://localhost:8080";
                } else if (hostname.indexOf('192.168.188.55') === 0) {
                    return "http://192.168.188.55:8080";
                } else {
                    /* Take the url you're actually in */
                    return "";
                }
            };
            function _getBaseWSURL() {
                var hostname = $window.location.hostname;
                if (hostname.indexOf('localhost') === 0) {
                    return "ws://localhost:8080";
                } else if (hostname.indexOf('192.168.188.55') === 0) {
                    return "ws://192.168.188.55:8080";
                } else {
                    /* Take the url you're actually in */
                    return "";
                }
            }

        });
