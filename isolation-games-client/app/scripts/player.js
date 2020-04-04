'use strict';

angular.module('myApp.player', ['ngRoute'])
        .controller('PlayerCtrl', ['$rootScope','$scope', '$http','$location', '$route', 'UrlInjector', function ($rootScope,$scope, $http, $location, $route, UrlInjector) {
                $rootScope.playerdata = {}
                $scope.savePlayerData = function () {
                    window.localStorage.setItem('games.player', angular.toJson($scope.playerdata));
                };

                $scope.getPlayerData = function () {
                    var playerJsonData = window.localStorage.getItem('games.player');
                    if (!playerJsonData) {
                        $scope.openUserEdit();
                    } else {
                        $rootScope.playerdata = angular.fromJson(playerJsonData);
                        
                        if (!$scope.playerdata.id) {
                            $scope.openUserEdit();
                        }else{
                            $scope.getPlayerFromServer($scope.playerdata.id);
                        }
                    }
                };
                $scope.openUserEdit = function () {
                    $('#createPlayerModal').modal('show');
                };

                $scope.createOrUpdatePlayer = function () {
                    $http({
                        method: 'PUT',
                        data: $scope.playerdata,
                        headers: {'Content-Type': 'application/json'},
                        url: UrlInjector.getBaseURL() + '/api/player/'
                    }).then(function successCallback(response) {
                        $rootScope.playerdata = response.data;
                        $scope.savePlayerData();
                        redirect('#createPlayerModal')
                    }, function errorCallback(response) {
                        $scope.errorData = response.data;
                    });
                };

                $scope.getPlayerFromServer = function (id) {
                    $http({
                        method: 'GET',
                        url: UrlInjector.getBaseURL() + '/api/player/'+id
                    }).then(function successCallback(response) {
                        $rootScope.playerdata = response.data;
                        $scope.savePlayerData();                        
                    }, function errorCallback(response) {
                        if(response.status === 404){
                            $scope.openUserEdit();
                        }
                        $scope.errorData = response.data;
                    });
                };
                
                 /**
                 * Method will redirect to home location
                 * @returns {undefined}
                 */
                var redirect = function (modalToClose, pathToGo, callback) {
                    /* Hide the modal panel */
                    if (modalToClose !== 'none') {
                        $(modalToClose).modal('hide');
                    }
                    /* Redirect to base */
                    if (pathToGo) {
                        $location.path(pathToGo);
                    }
                    $route.reload();
                    if (callback) {
                        callback();
                    }
                };


                $scope.getPlayerData();
            }]);