'use strict';

angular.module('myApp.painter', ['ngRoute'])

        .config(['$routeProvider', function ($routeProvider) {
                $routeProvider.when('/painter', {
                    templateUrl: 'view/painter.html',
                    controller: 'PainterCtrl'
                });
                $routeProvider.when('/painter/:gameid', {
                    templateUrl: 'view/painter.html',
                    controller: 'PainterCtrl'
                });
            }])
        .controller('PainterCtrl', ['$rootScope', '$scope', '$http', '$routeParams', '$location', '$route', '$interval', '$timeout', '$websocket', 'UrlInjector', function ($rootScope, $scope, $http, $routeParams, $location, $route, $interval, $timeout, $websocket, UrlInjector) {
                $scope.gameid = $routeParams.gameid;
                $scope.newGame = {};
                $scope.gamedata = {};
                $scope.allGames = [];
                $scope.meMaster = false;
                $scope.personalFigure = {};
                $scope.notes = {};
                $scope.tX = 0;
                $scope.tY = 0;

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


                var ws = $websocket("ws://" + UrlInjector.getWSBaseURL() + "/painter");
                ws.onMessage(function (event) {
                    if (event && event.data) {
                        var l = event.data;
                        console.info("Draw")
                        drawLine(ctx, l.x, l.y, 12, true,l.r,l.g)
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
                    if ($scope.gameid && $rootScope.playerdata.name) {
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


                // Variables for referencing the canvas and 2dcanvas context
                var canvas, ctx;

                // Variables to keep track of the mouse position and left-button status 
                var mouseX, mouseY, mouseDown = 0;

                // Variables to keep track of the touch position
                var touchX, touchY;

                // Keep track of the old/last position when drawing a line
                // We set it to -1 at the start to indicate that we don't have a good value for it yet
                var lastX, lastY = -1;

                // Draws a line between the specified position on the supplied canvas name
                // Parameters are: A canvas context, the x position, the y position, the size of the dot
                function drawLine(ctx, x, y, size, local, lx,ly) {

                    // If lastX is not set, set lastX and lastY to the current position 
                    if (lastX == -1) {
                        lastX = x;
                        lastY = y;
                    }
                    if(lx){
                        lastX = lx;
                    }
                    if(ly){
                        lastX = ly;
                    }

                    // Let's use black by setting RGB values to 0, and 255 alpha (completely opaque)
                    var r = 0;
                    var g = 0;
                    var b = 0;
                    var a = 255;

                    // Select a fill style
                    ctx.strokeStyle = "rgba(" + r + "," + g + "," + b + "," + (a / 255) + ")";

                    // Set the line "cap" style to round, so lines at different angles can join into each other
                    ctx.lineCap = "round";
                    //ctx.lineJoin = "round";


                    // Draw a filled line
                    ctx.beginPath();

                    // First, move to the old (previous) position
                    ctx.moveTo(lastX, lastY);

                    // Now draw a line to the current touch/pointer position
                    ctx.lineTo(x, y);

                    // Set the line thickness and draw the line
                    ctx.lineWidth = size;
                    ctx.stroke();

                    ctx.closePath();

                    if (!local) {
                        $http({
                            method: 'PUT',
                            headers: {'Content-Type': 'application/json'},
                            data: {r: lastX,
                                g: lastY,
                                b: b,
                                x: x,
                                y: y},
                            url: UrlInjector.getBaseURL() + '/api/painter/'
                        }).then(function successCallback(response) {
                            $scope.gamedata = response.data;
                        }, function errorCallback(response) {
                            $scope.errorData = response.data;
                        });
                    }

                    // Update the last position to reference the current position
                    lastX = x;
                    lastY = y;


                }

                // Clear the canvas context using the canvas width and height
                function clearCanvas(canvas, ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }

                // Keep track of the mouse button being pressed and draw a dot at current location
                function sketchpad_mouseDown() {
                    mouseDown = 1;
                    drawLine(ctx, mouseX, mouseY, 12);
                }

                // Keep track of the mouse button being released
                function sketchpad_mouseUp() {
                    mouseDown = 0;

                    // Reset lastX and lastY to -1 to indicate that they are now invalid, since we have lifted the "pen"
                    lastX = -1;
                    lastY = -1;
                }

                // Keep track of the mouse position and draw a dot if mouse button is currently pressed
                function sketchpad_mouseMove(e) {
                    // Update the mouse co-ordinates when moved
                    getMousePos(e);

                    // Draw a dot if the mouse button is currently being pressed
                    if (mouseDown == 1) {
                        drawLine(ctx, mouseX, mouseY, 12);
                    } else {
                        console.log("Move only")
                    }
                }

                // Get the current mouse position relative to the top-left of the canvas
                function getMousePos(e) {
                    if (!e)
                        var e = event;

                    if (e.offsetX) {
                        mouseX = e.offsetX;
                        mouseY = e.offsetY;
                    } else if (e.layerX) {
                        mouseX = e.layerX;
                        mouseY = e.layerY;
                    }
                }

                // Draw something when a touch start is detected
                function sketchpad_touchStart() {
                    // Update the touch co-ordinates
                    getTouchPos();

                    drawLine(ctx, touchX, touchY, 12);

                    // Prevents an additional mousedown event being triggered
                    event.preventDefault();
                }

                function sketchpad_touchEnd() {
                    // Reset lastX and lastY to -1 to indicate that they are now invalid, since we have lifted the "pen"
                    lastX = -1;
                    lastY = -1;
                }

                // Draw something and prevent the default scrolling when touch movement is detected
                function sketchpad_touchMove(e) {
                    // Update the touch co-ordinates
                    getTouchPos(e);

                    // During a touchmove event, unlike a mousemove event, we don't need to check if the touch is engaged, since there will always be contact with the screen by definition.
                    drawLine(ctx, touchX, touchY, 12);

                    // Prevent a scrolling action as a result of this touchmove triggering.
                    event.preventDefault();
                }

                // Get the touch position relative to the top-left of the canvas
                // When we get the raw values of pageX and pageY below, they take into account the scrolling on the page
                // but not the position relative to our target div. We'll adjust them using "target.offsetLeft" and
                // "target.offsetTop" to get the correct values in relation to the top left of the canvas.
                function getTouchPos(e) {
                    if (!e)
                        var e = event;

                    if (e.touches) {
                        if (e.touches.length == 1) { // Only deal with one finger
                            var touch = e.touches[0]; // Get the information for finger #1
                            touchX = touch.pageX - touch.target.offsetLeft;
                            touchY = touch.pageY - touch.target.offsetTop;

                        }
                    }
                }


                // Set-up the canvas and add our event handlers after the page has loaded
                function init() {
                    // Get the specific canvas element from the HTML document
                    canvas = document.getElementById('sketchpad');

                    // If the browser supports the canvas tag, get the 2d drawing context for this canvas
                    if (canvas.getContext)
                        ctx = canvas.getContext('2d');

                    // Check that we have a valid context to draw on/with before adding event handlers
                    if (ctx) {
                        // React to mouse events on the canvas, and mouseup on the entire document
                        canvas.addEventListener('mousedown', sketchpad_mouseDown, false);
                        canvas.addEventListener('mousemove', sketchpad_mouseMove, false);
                        window.addEventListener('mouseup', sketchpad_mouseUp, false);

                        // React to touch events on the canvas
                        canvas.addEventListener('touchstart', sketchpad_touchStart, false);
                        canvas.addEventListener('touchend', sketchpad_touchEnd, false);
                        canvas.addEventListener('touchmove', sketchpad_touchMove, false);
                    }
                }

                init();
            }]);