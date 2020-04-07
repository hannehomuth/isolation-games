'use strict';

angular.module('myApp.gamechoose', ['ngRoute'])

        .config(['$routeProvider', function ($routeProvider) {
                $routeProvider.when('/', {
                    templateUrl: 'view/gamechoose.html',
                });

            }]);