'use strict';

// Declare app level module which depends on views, and core components
angular.module('myApp', [
  'ngRoute',
  'ngWebSocket',
  'myApp.tabu',
  'myApp.whoami',
  'myApp.painter',
  'myApp.gamechoose',
  'myApp.player'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({redirectTo: '/'});
}]);
