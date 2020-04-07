'use strict';

angular.module('myApp.whoami', ['ngRoute'])

        .config(['$routeProvider', function ($routeProvider) {
                $routeProvider.when('/whoami', {
                    templateUrl: 'view/whoami.html',
                    controller: 'WhoamiCtrl'
                });
                $routeProvider.when('/whoami/:gameid', {
                    templateUrl: 'view/whoami.html',
                    controller: 'WhoamiCtrl'
                });
            }])
        .controller('WhoamiCtrl', ['$rootScope', '$scope', '$http', '$routeParams', '$location', '$route', '$interval', '$timeout', '$websocket', 'UrlInjector', function ($rootScope, $scope, $http, $routeParams, $location, $route, $interval, $timeout, $websocket, UrlInjector) {
                $scope.gameid = $routeParams.gameid;
                $scope.newGame = {};
                $scope.gamedata = {};
                $scope.allGames = [];
                $scope.meMaster = false;
                $scope.personalFigure = {};
                $scope.notes = {};

                $scope.createNewGame = function () {
                    console.info("New game", $scope.newGame);
                    $http({
                        method: 'PUT',
                        headers: {'Content-Type': 'application/json'},
                        data: $scope.newGame,
                        url: UrlInjector.getBaseURL() + '/api/whoami/'
                    }).then(function successCallback(response) {
                        $scope.gamedata = response.data;
                        redirect('none', '/whoami/' + $scope.gamedata.id);
                    }, function errorCallback(response) {
                        $scope.errorData = response.data;
                    });
                };

                $scope.addFigureForPlayer = function (playerid) {
                    $http({
                        method: 'PATCH',
                        headers: {'Content-Type': 'application/json'},
                        url: UrlInjector.getBaseURL() + '/api/whoami/' + $scope.gameid + "/" + playerid + "/" + $scope.personalFigure.name
                    }).then(function successCallback(response) {
                        $scope.gamedata = response.data;
                    }, function errorCallback(response) {
                        $scope.errorData = response.data;
                    });
                };

                $scope.getAllGames = function () {
                    $http({
                        method: 'GET',
                        url: UrlInjector.getBaseURL() + '/api/whoami/all'
                    }).then(function successCallback(response) {
                        $scope.allGames = response.data;
                    }, function errorCallback(response) {
                        $scope.errorData = response.data;
                    });
                };

                $scope.getGame = function () {
                    if ($scope.gameid) {
                        $http({
                            method: 'GET',
                            url: UrlInjector.getBaseURL() + '/api/whoami/' + $scope.gameid
                        }).then(function successCallback(response) {
                            $scope.gamedata = response.data;
                            var foundPlayer = false;
                            angular.forEach($scope.gamedata.players, function (player) {
                                if (player.id === $rootScope.playerdata.id) {
                                    foundPlayer = true;
                                    return;
                                }
                            });
                            if (!foundPlayer) {
                                addPlayerToGame();
                            }

                            checkForMaster();
                        }, function errorCallback(response) {
                            $scope.errorData = response.data;
                        });
                    }
                };

                $scope.addPointToPlayer = function (player) {
                    if ($scope.gameid) {
                        $http({
                            method: 'PATCH',
                            headers: {'Content-Type': 'application/json'},
                            url: UrlInjector.getBaseURL() + '/api/whoami/' + $scope.gameid + '/points+/' + player.id
                        }).then(function successCallback(response) {
                            $scope.gamedata = response.data;
                        }, function errorCallback(response) {
                            $scope.errorData = response.data;
                        });
                    }
                };

                $scope.removePointFromPlayer = function (player) {
                    if ($scope.gameid) {
                        $http({
                            method: 'PATCH',
                            headers: {'Content-Type': 'application/json'},
                            url: UrlInjector.getBaseURL() + '/api/whoami/' + $scope.gameid + '/points-/' + player.id
                        }).then(function successCallback(response) {
                            $scope.gamedata = response.data;
                        }, function errorCallback(response) {
                            $scope.errorData = response.data;
                        });
                    }
                };

                $scope.stopRound = function () {
                    if ($scope.gameid) {
                        $http({
                            method: 'PATCH',
                            headers: {'Content-Type': 'application/json'},
                            url: UrlInjector.getBaseURL() + '/api/whoami/' + $scope.gameid + '/stopround'
                        }).then(function successCallback(response) {
                            $scope.gamedata = response.data;
                        }, function errorCallback(response) {
                            $scope.errorData = response.data;
                        });
                    }
                };

                $scope.switchPlayer = function () {
                    if ($scope.gameid) {
                        $http({
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            url: UrlInjector.getBaseURL() + '/api/whoami/' + $scope.gameid + '/switchPlayer'
                        }).then(function successCallback(response) {
                            $scope.gamedata = response.data;
                        }, function errorCallback(response) {
                            $scope.errorData = response.data;
                        });
                    }
                };

                $scope.removePlayerFromGame = function (playerToRemove) {
                    if ($scope.gameid) {
                        $http({
                            method: 'DELETE',
                            url: UrlInjector.getBaseURL() + '/api/whoami/' + $scope.gameid + '/' + playerToRemove.id
                        }).then(function successCallback(response) {
                            $scope.gamedata = response.data;
                        }, function errorCallback(response) {
                            console.info("Error", response)
                            $scope.errorData = response.data;
                        });
                    }
                };

                $scope.nextround = function () {
                    if ($scope.gameid) {
                        $http({
                            method: 'POST',
                            url: UrlInjector.getBaseURL() + '/api/whoami/' + $scope.gameid + '/nextround'
                        }).then(function successCallback(response) {
                            $scope.gamedata = response.data;
                        }, function errorCallback(response) {
                            $scope.errorData = response.data;
                        });
                    }
                };

                $scope.meResponsibleForPlayer = function (player) {
                    if ($scope.gamedata && $scope.gamedata.playerToResponsiblePlayerMapping) {
                        return $scope.gamedata.playerToResponsiblePlayerMapping[$rootScope.playerdata.id] === player.id;
                    } else {
                        return false;
                    }
                }

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
                        $route.reload();
                    }
                    if (callback) {
                        callback();
                    }
                };


                $scope.getAllGames();
                $scope.getGame();


                var ws = $websocket("ws://" + UrlInjector.getWSBaseURL() + "/whoami");
                ws.onMessage(function (event) {
                    if (event && event.data) {
                        if (event.data === "PULL") {
                            /* If we get the advice to pull, simply do it */
                            $scope.getGame();
                        }
                    }
                });
                ws.onError(function (event) {
                    console.log('connection Error', event);
                });
                ws.onClose(function (event) {
                    console.log('connection closed', event);
                });
                ws.onOpen(function () {
                    console.log('connection open');
                    ws.send('HELLO SERVER');
                });


                $scope.showCreateGameModal = function () {
                    $('#createGameModal').modal('show');
                };

                var getNotes = function () {
                    $scope.notes.value = window.localStorage.getItem('games.notes');
                    $scope.$watch('notes.value', function () {
                        console.log("Sva")
                        window.localStorage.setItem('games.notes', $scope.notes.value);
                    });
                };

                var addPlayerToGame = function () {
                    if ($scope.gameid) {
                        console.info("Play", $rootScope.playerdata)
                        $http({
                            method: 'PATCH',
                            headers: {'Content-Type': 'application/json'},
                            data: $rootScope.playerdata,
                            url: UrlInjector.getBaseURL() + '/api/whoami/' + $scope.gameid
                        }).then(function successCallback(response) {
                            $scope.gamedata = response.data;
                        }, function errorCallback(response) {
                            $scope.errorData = response.data;
                        });
                    }
                };

                var checkForMaster = function () {
                    $scope.meMaster = false;
                    if ($rootScope.playerdata) {
                        angular.forEach($scope.gamedata.players, function (p) {
                            if (p.id === $rootScope.playerdata.id && p.master === true) {
                                $scope.meMaster = true;
                            }
                        })
                    }
                };

                getNotes();
            }]);