'use strict';

angular.module('myApp.tabu', ['ngRoute'])

        .config(['$routeProvider', function ($routeProvider) {
                $routeProvider.when('/tabu', {
                    templateUrl: 'view/tabu.html',
                    controller: 'TabuCtrl'
                });
                $routeProvider.when('/tabu/:gameid', {
                    templateUrl: 'view/tabu.html',
                    controller: 'TabuCtrl'
                });
            }])
        .controller('TabuCtrl', ['$rootScope', '$scope', '$http', '$routeParams', '$location', '$route', '$interval', '$timeout', '$websocket', 'UrlInjector', function ($rootScope, $scope, $http, $routeParams, $location, $route, $interval, $timeout, $websocket, UrlInjector) {
                $scope.gameid = $routeParams.gameid;
                $scope.newGame = {};
                $scope.gamedata = {};
                $scope.allGames = [];
                $scope.meMaster = false;
                $scope.nextRoundCountDownRunningIndicator = false;
                $scope.inGameCountDownRunning = false;
                
                $scope.createNewGame = function () {
                    console.info("New game", $scope.newGame);
                    $http({
                        method: 'PUT',
                        headers: {'Content-Type': 'application/json'},
                        data: $scope.newGame,
                        url: UrlInjector.getBaseURL() + '/api/tabu/'
                    }).then(function successCallback(response) {
                        $scope.gamedata = response.data;
                        redirect('none', '/tabu/' + $scope.gamedata.id);
                    }, function errorCallback(response) {
                        $scope.errorData = response.data;
                    });
                };

                $scope.getAllGames = function () {
                    $http({
                        method: 'GET',
                        url: UrlInjector.getBaseURL() + '/api/tabu/all'
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
                            url: UrlInjector.getBaseURL() + '/api/tabu/' + $scope.gameid
                        }).then(function successCallback(response) {
                            $scope.gamedata = response.data;
                            $scope.countdownSeconds = $scope.gamedata.roundLength;
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
                            $scope.countdownSeconds = $scope.gamedata.roundLength;
                            $scope.cancelCountDowns();
                            calculateCountDown();
//                            if ($scope.gamedata.roundRunning === false) {
//                            }
                        }, function errorCallback(response) {
                            $scope.errorData = response.data;
                        });
                    }
                };



                $scope.makePlayerToMaster = function (player) {
                    if ($scope.gameid) {
                        $http({
                            method: 'PATCH',
                            headers: {'Content-Type': 'application/json'},
                            url: UrlInjector.getBaseURL() + '/api/tabu/' + $scope.gameid + '/master/' + player.id
                        }).then(function successCallback(response) {
                            $scope.gamedata = response.data;
                        }, function errorCallback(response) {
                            $scope.errorData = response.data;
                        });
                    }
                };

                $scope.addCountDownTime = function () {
                    if ($scope.gameid) {
                        $http({
                            method: 'PATCH',
                            headers: {'Content-Type': 'application/json'},
                            url: UrlInjector.getBaseURL() + '/api/tabu/' + $scope.gameid + '/countdown+'
                        }).then(function successCallback(response) {
                            $scope.gamedata = response.data;
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
                            url: UrlInjector.getBaseURL() + '/api/tabu/' + $scope.gameid + '/points+/' + player.id
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
                            url: UrlInjector.getBaseURL() + '/api/tabu/' + $scope.gameid + '/points-/' + player.id
                        }).then(function successCallback(response) {
                            $scope.gamedata = response.data;
                        }, function errorCallback(response) {
                            $scope.errorData = response.data;
                        });
                    }
                };

                $scope.removeCountDownTime = function () {
                    if ($scope.gameid) {
                        $http({
                            method: 'PATCH',
                            headers: {'Content-Type': 'application/json'},
                            url: UrlInjector.getBaseURL() + '/api/tabu/' + $scope.gameid + '/countdown-'
                        }).then(function successCallback(response) {
                            $scope.gamedata = response.data;
                        }, function errorCallback(response) {
                            $scope.errorData = response.data;
                        });
                    }
                };

                $scope.stopRound = function () {
                    $scope.cancelCountDowns();
                    if ($scope.gameid) {
                        $http({
                            method: 'PATCH',
                            headers: {'Content-Type': 'application/json'},
                            url: UrlInjector.getBaseURL() + '/api/tabu/' + $scope.gameid + '/stopround'
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
                            url: UrlInjector.getBaseURL() + '/api/tabu/' + $scope.gameid + '/' + playerToRemove.id
                        }).then(function successCallback(response) {
                            $scope.gamedata = response.data;
                        }, function errorCallback(response) {
                            console.info("Error", response)
                            $scope.errorData = response.data;
                        });
                    }
                };

                $scope.nextround = function () {
                    $scope.countdownSeconds = $scope.gamedata.roundLength;
                    $scope.cancelCountDowns();
                    if ($scope.gameid) {
                        $http({
                            method: 'POST',
                            url: UrlInjector.getBaseURL() + '/api/tabu/' + $scope.gameid + '/nextround'
                        }).then(function successCallback(response) {
                            $scope.gamedata = response.data;
                        }, function errorCallback(response) {
                            $scope.errorData = response.data;
                        });
                    }
                };
                
                $scope.nextcard = function () {
                    if ($scope.gameid) {
                        $http({
                            method: 'POST',
                            url: UrlInjector.getBaseURL() + '/api/tabu/' + $scope.gameid + '/nextcard'
                        }).then(function successCallback(response) {
                            $scope.gamedata = response.data;
                        }, function errorCallback(response) {
                            $scope.errorData = response.data;
                        });
                    }
                };
                
                $scope.intervene = function () {
                    if ($scope.gameid) {
                        $http({
                            method: 'POST',
                            url: UrlInjector.getBaseURL() + '/api/tabu/' + $scope.gameid + '/intervene'
                        })
                    }
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
                        $route.reload();
                    }
                    if (callback) {
                        callback();
                    }
                };



                var calculateCountDown = function () {
                    /* Prüfen ob wir noch in der runterzählphase sind,
                     * oder bereits den richtigen countdown haben */
                    var actualMillis = new Date().getTime();
                    if ($scope.gamedata && $scope.gamedata.nextRoundStart) {
                        if (actualMillis < $scope.gamedata.nextRoundStart && $scope.gamedata.roundRunning) {
                            /* Wir sind vor dem nächsten Rundenstart. Erzeuge einen Timer
                             * welcher genau zum Zeitpunkt des Starts anfängt von X runterzuzählen
                             * (In Game Countdown) */
                            var diff = ($scope.gamedata.nextRoundStart - actualMillis);
                            if ($scope.startCountDownPromise) {
                                /* Falls es schon einen Timer gibt, stoppe diesen zuerst*/
                                $timeout.cancel($scope.startCountDownPromise);
                            }
                            $scope.startCountDownPromise = $timeout(startCountDown, diff);
                            $scope.nextRoundCountDownSeconds = diff;
                            $scope.startNextRoundCountDown();
                        } else if (actualMillis > $scope.gamedata.nextRoundStart && $scope.gamedata.roundRunning) {
                            /* Der Ingame count down sollte schon gestartet worden sein, wenn wir aber in diese Methode
                             * kommen und der Status ist so, muss die Seite neu geladen worden sein, daher starte den einfach nochmal */
                            var remainingMillis = $scope.gamedata.nextRoundStart + ($scope.gamedata.roundLength*1000) - actualMillis;
                            $scope.countdownSeconds = remainingMillis / 1000;
                            startCountDown();
                        }
                    }
                };

                $scope.startNextRoundCountDown = function () {
                    if ($scope.nextRoundCountDownSeconds <= 0) {
                        if ($scope.nextRoundCountDownPromise) {
                            $interval.cancel($scope.nextRoundCountDownPromise);
                        }
                    } else {
                        $scope.nextRoundCountDownPromise = $interval($scope.nextRoundCountDown, 1000);
                        $scope.nextRoundCountDownRunningIndicator = true;
                        openCountDownModal();
                        console.log("Startet nextgame countdown");
                    }
                }


                $scope.nextRoundCountDown = function () {
                    $scope.nextRoundCountDownSeconds = $scope.nextRoundCountDownSeconds - 1000;
                    if ($scope.nextRoundCountDownSeconds <= 0) {
                        $interval.cancel($scope.nextRoundCountDownPromise);
                        $scope.nextRoundCountDownRunningIndicator = false;
                        closeCountDownModal();
                        return;
                    }
                    $scope.countdownMessage = $scope.nextRoundCountDownSeconds / 1000;
                };

                $scope.countDown = function () {
                    console.info("In game count down");
                    $scope.countdownSeconds = $scope.countdownSeconds - 1;
                    if ($scope.countdownSeconds <= 0) {
                        $scope.inGameCountDownRunning = false;
                        $scope.stopRound();
                        $interval.cancel($scope.countDownPromise);

                    }
                }

                $scope.cancelCountDowns = function () {
                    if ($scope.startCountDownPromise) {
                        $timeout.cancel($scope.startCountDownPromise);
                    }
                    if ($scope.countDownPromise) {
                        $scope.inGameCountDownRunning = false;
                        $interval.cancel($scope.countDownPromise);                        
                        console.log("Canceled ingame countdown");
                    }
                    if ($scope.nextRoundCountDownPromise) {
                        $interval.cancel($scope.nextRoundCountDownPromise);
                        $scope.nextRoundCountDownRunningIndicator = false;
                        closeCountDownModal();
                        console.log("Canceled nextround countdown");
                    }
                };
                
                $scope.nextRoundCountDownRunning = function(){
                    if($scope.gamedata.roundRunning
                            && $scope.nextRoundCountDownRunningIndicator
                            && !$scope.inGameCountDownRunning){
                        return true;
                    }
                    return false;
                };
                $scope.inGameRoundRunning = function(){
                    if($scope.gamedata.roundRunning
                            && !$scope.nextRoundCountDownRunningIndicator
                            && $scope.inGameCountDownRunning){
                        return true;
                    }
                    console.log("Game running",$scope.gamedata.roundRunning, "Next round c",$scope.nextRoundCountDownRunningIndicator,"Ingame:",$scope.inGameCountDownRunning);
                    return false;
                };
                
                

                var openCountDownModal = function (){
                    $('#roundStartModal').modal('show');
                };
                var closeCountDownModal = function (){
                    $('#roundStartModal').modal('hide');
                };

                $scope.$on("$destroy", function () {
                    if ($scope.startCountDownPromise) {
                        $timeout.cancel($scope.startCountDownPromise);
                    }
                    if ($scope.countDownPromise) {
                        $scope.inGameCountDownRunning = false;
                        $interval.cancel($scope.countDownPromise);
                        console.log("Canceled ingame countdown");
                    }
                    if ($scope.nextRoundCountDownPromise) {
                        $interval.cancel($scope.nextRoundCountDownPromise);
                        console.log("Canceled nextround countdown");
                    }
                });


                $scope.cancelCountDowns();
                $scope.getAllGames();
                $scope.getGame();


                var ws = $websocket(UrlInjector.getWSBaseURL() + "/tabu");
                ws.onMessage(function (event) {
                    if (event && event.data) {
                        if (event.data === "PULL") {
                            /* If we get the advice to pull, simply do it */
                            $scope.getGame();
                        }
                        if (event.data === "STOP_COUNTDOWN") {
                            $scope.cancelCountDowns();
                        }
                        if (event.data === "PULL_IF_MASTER" && $scope.meMaster) {
                            $scope.getGame();
                        }
                        if (event.data === "INTERVENE") {
                            showInterveneModal();
                            if($scope.meMaster || ($rootScope.playerdata.id === $scope.gamedata.actualPlayer.id)){
                                $scope.getGame();                                
                            }
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
                
                var showInterveneModal = function () {
                    $('#interveneModal').modal('show');
                    var audio = new Audio('../images/smssqueeze_idiszvnp.mp3');
                    audio.play();
                    $timeout(hideInterveneModal,1500);
                };
                
                var hideInterveneModal = function () {
                    $('#interveneModal').modal('hide');
                };


//              Helper functions
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

                var addPlayerToGame = function () {
                    if ($scope.gameid) {
                        console.info("Play", $rootScope.playerdata)
                        $http({
                            method: 'PATCH',
                            headers: {'Content-Type': 'application/json'},
                            data: $rootScope.playerdata,
                            url: UrlInjector.getBaseURL() + '/api/tabu/' + $scope.gameid
                        }).then(function successCallback(response) {
                            $scope.gamedata = response.data;
                        }, function errorCallback(response) {
                            $scope.errorData = response.data;
                        });
                    }
                };

                var startCountDown = function () {
                    if ($scope.gamedata.roundRunning) {
                        console.log("Startet ingame countdown");
                        $scope.inGameCountDownRunning = true;
                        delete $scope.countdownMessage;
                        $scope.countDownPromise = $interval($scope.countDown, 1000);
                    }
                }



            }]);