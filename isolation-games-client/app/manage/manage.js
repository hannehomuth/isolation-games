'use strict';

angular.module('myApp.manage', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/manage', {
    templateUrl: 'manage/manage.html',
    controller: 'ManageCtrl'
  });
}])

.controller('ManageCtrl', [function() {

}]);