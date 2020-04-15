'use strict';

angular.module('myApp.painter', ['ngRoute'])

        .config(['$routeProvider', function ($routeProvider) {
                $routeProvider.when('/painter', {
                    templateUrl: 'view/mon-painter.html',
                    controller: 'PainterCtrl'
                });
                $routeProvider.when('/painter/:gameid', {
                    templateUrl: 'view/mon-painter.html',
                    controller: 'PainterCtrl'
                });
            }])
        .controller('PainterCtrl', ['$rootScope', '$scope', '$http', '$routeParams', '$location', '$route', '$interval', '$timeout', '$websocket', 'UrlInjector', function ($rootScope, $scope, $http, $routeParams, $location, $route, $interval, $timeout, $websocket, UrlInjector) {
                $scope.gameid = $routeParams.gameid;
                $scope.newGame = {};
                $scope.gamedata = {};
                $scope.allGames = [];
                $scope.meMaster = false;
                $scope.nextRoundCountDownRunningIndicator = false;
                $scope.inGameCountDownRunning = false;
                $scope.rColor = 0;
                $scope.gColor = 0;
                $scope.bColor = 0;
                $scope.size = 4;
                $scope.lastPicture = "";
                $scope.picChangedAfterLastPush = false;
                var sketchPadName = "#sketchpad";
                // Variables for referencing the canvas and 2dcanvas context
                // Variables for referencing the canvas and 2dcanvas context
                var canvas, ctx;

                console.log("ww", window.innerWidth)
                if (window.innerWidth < 479) {
                    $scope.canvasWidth = 350;
                    $scope.canvasHeigth = 350;
                } else {
                    $scope.canvasWidth = 500;
                    $scope.canvasHeigth = 500;
                }
                ;


                $scope.createNewGame = function () {
                    $http({
                        method: 'PUT',
                        headers: {'Content-Type': 'application/json'},
                        data: $scope.newGame,
                        url: UrlInjector.getBaseURL() + '/api/painter/'
                    }).then(function successCallback(response) {
                        $scope.gamedata = response.data;
                        redirect('none', '/painter/' + $scope.gamedata.id);
                    }, function errorCallback(response) {
                        $scope.errorData = response.data;
                    });
                };

                $scope.getAllGames = function () {
                    $http({
                        method: 'GET',
                        url: UrlInjector.getBaseURL() + '/api/painter/all'
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
                            url: UrlInjector.getBaseURL() + '/api/painter/' + $scope.gameid
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
                            init();
                            resize(canvas);
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
                            url: UrlInjector.getBaseURL() + '/api/painter/' + $scope.gameid + '/master/' + player.id
                        }).then(function successCallback(response) {
                            $scope.gamedata = response.data;
                        }, function errorCallback(response) {
                            $scope.errorData = response.data;
                        });
                    }
                };

                $scope.playerWantsToPlay = function (player) {
                    if ($scope.gameid) {
                        $http({
                            method: 'PATCH',
                            headers: {'Content-Type': 'application/json'},
                            url: UrlInjector.getBaseURL() + '/api/painter/' + $scope.gameid + '/wants/' + player.id
                        });
                    }
                };
                $scope.playerWantsNotToPlay = function (player) {
                    if ($scope.gameid) {
                        $http({
                            method: 'PATCH',
                            headers: {'Content-Type': 'application/json'},
                            url: UrlInjector.getBaseURL() + '/api/painter/' + $scope.gameid + '/wantsnot/' + player.id
                        });
                    }
                };

                $scope.addCountDownTime = function () {
                    if ($scope.gameid) {
                        $http({
                            method: 'PATCH',
                            headers: {'Content-Type': 'application/json'},
                            url: UrlInjector.getBaseURL() + '/api/painter/' + $scope.gameid + '/countdown+'
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
                            url: UrlInjector.getBaseURL() + '/api/painter/' + $scope.gameid + '/points+/' + player.id
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
                            url: UrlInjector.getBaseURL() + '/api/painter/' + $scope.gameid + '/points-/' + player.id
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
                            url: UrlInjector.getBaseURL() + '/api/painter/' + $scope.gameid + '/countdown-'
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
                            url: UrlInjector.getBaseURL() + '/api/painter/' + $scope.gameid + '/stopround'
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
                            url: UrlInjector.getBaseURL() + '/api/painter/' + $scope.gameid + '/' + playerToRemove.id
                        }).then(function successCallback(response) {
                            $scope.gamedata = response.data;
                        }, function errorCallback(response) {
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
                            url: UrlInjector.getBaseURL() + '/api/painter/' + $scope.gameid + '/nextround'
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
                            url: UrlInjector.getBaseURL() + '/api/painter/' + $scope.gameid + '/nextcard'
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
                            url: UrlInjector.getBaseURL() + '/api/painter/' + $scope.gameid + '/intervene'
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
                            var remainingMillis = $scope.gamedata.nextRoundStart + ($scope.gamedata.roundLength * 1000) - actualMillis;
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
                    }
                };


                $scope.nextRoundCountDown = function () {
                    $scope.nextRoundCountDownSeconds = $scope.nextRoundCountDownSeconds - 1000;
                    if ($scope.nextRoundCountDownSeconds <= 0) {
                        $interval.cancel($scope.nextRoundCountDownPromise);
                        $scope.nextRoundCountDownRunningIndicator = false;
                        closeCountDownModal();
                        resize(canvas);
                        return;
                    }
                    $scope.countdownMessage = $scope.nextRoundCountDownSeconds / 1000;
                };

                $scope.countDown = function () {
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
                    }
                    if ($scope.nextRoundCountDownPromise) {
                        $interval.cancel($scope.nextRoundCountDownPromise);
                        $scope.nextRoundCountDownRunningIndicator = false;
                        closeCountDownModal();
                    }
                };

                $scope.nextRoundCountDownRunning = function () {
                    if ($scope.gamedata.roundRunning
                            && $scope.nextRoundCountDownRunningIndicator
                            && !$scope.inGameCountDownRunning) {
                        return true;
                    }
                    return false;
                };
                $scope.inGameRoundRunning = function () {
                    if ($scope.gamedata.roundRunning
                            && !$scope.nextRoundCountDownRunningIndicator
                            && $scope.inGameCountDownRunning) {
                        return true;
                    }
                    return false;
                };



                var openCountDownModal = function () {
                    $('#roundStartModal').modal('show');
                };
                var closeCountDownModal = function () {
                    $('#roundStartModal').modal('hide');
                };

                $scope.$on("$destroy", function () {
                    if ($scope.startCountDownPromise) {
                        $timeout.cancel($scope.startCountDownPromise);
                    }
                    if ($scope.countDownPromise) {
                        $scope.inGameCountDownRunning = false;
                        $interval.cancel($scope.countDownPromise);
                    }
                    if ($scope.nextRoundCountDownPromise) {
                        $interval.cancel($scope.nextRoundCountDownPromise);
                    }
                });

                $scope.setColor = function (r, g, b) {
                    $scope.rColor = r;
                    $scope.gColor = g;
                    $scope.bColor = b;
                };

                $scope.setSize = function (s) {
                    $scope.size = s;
                };


                $scope.upload = function () {
                    if ($scope.iamAcutalPlayer() === true && $scope.picChangedAfterLastPush === true) {
                        var dataUrl = canvas.toDataURL("image/png");
                        if ($scope.lastPicture !== dataUrl) {
                            $scope.lastPicture = dataUrl;
                            uploadImageToClients();
                            $scope.picChangedAfterLastPush = false;
                            console.log("Bild hochgeladen");
                        } else {
                            console.log("Bild hat sich nicht geändert");
                        }
                    }
                };

                $scope.clearAtClients = function () {
                    if ($scope.iamAcutalPlayer() === true) {
                        $http({
                            method: 'PUT',
                            headers: {'Content-Type': 'application/json'},
                            data: {imageData: ""},
                            url: UrlInjector.getBaseURL() + '/api/painter/' + $scope.gameid + "/clear"
                        });
                    }
                };

                $scope.clear = function () {
                    $scope.clearAtClients();
                    clearCanvas(canvas, ctx);
                };


                $scope.cancelCountDowns();
                $scope.getAllGames();
                $scope.getGame();


                var ws = $websocket("ws://" + UrlInjector.getWSBaseURL() + "/painter");
                ws.onMessage(function (event) {
                    if (event && event.data) {

                        if (event && event.data) {
                            var im = angular.fromJson(event.data)
                            if (im.action === "PULL") {
                                console.log("PULL");
                                $scope.getGame();
                            }

                            if (im.action === "STOP_COUNTDOWN") {
                                $scope.cancelCountDowns();
                            }

                            if (im.action === "NEXT_ROUND") {
                                clearCanvas(canvas, ctx);
                                $scope.getGame();
                            }
                            if (im.action === "NEXT_CARD") {
                                $scope.lastTerm = im.lastTerm;
                                showNextCardModal()
                                clearCanvas(canvas, ctx);
                                $scope.getGame();
                            }
                            if (im.action === "CLEAR") {
                                console.log("CLEAR");
                                clearCanvas(canvas, ctx);
                            }
                            if (im.action === "DRAW") {
                                console.log("DRAW");
                                setImageOnCanvas(im.imageData);
                            }
                        }

                        if (event.data === "INTERVENE") {
                            showNextCardModal();
                            if ($scope.meMaster || ($rootScope.playerdata.id === $scope.gamedata.actualPlayer.id)) {
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

                $scope.iamAcutalPlayer = function () {
                    var iamAp = false;
                    if ($scope.gamedata && $scope.gamedata.actualPlayer) {
                        iamAp = $rootScope.playerdata.id === $scope.gamedata.actualPlayer.id;
                    }
                    return iamAp;
                };

                $scope.showCreateGameModal = function () {
                    $('#createGameModal').modal('show');
                };

                var showNextCardModal = function () {
                    $('#nextCardModal').modal('show');
//                    var audio = new Audio('../images/smssqueeze_idiszvnp.mp3');
//                    audio.play();
                    $timeout(hideNextCardModal, 1500);
                };

                var hideNextCardModal = function () {
                    $('#nextCardModal').modal('hide');
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
                    if($scope.meMaster){
                        sketchPadName = "#sketchpadMaster";
                        init();
                    }else{
                        sketchPadName = "#sketchpad";                        
                        init();
                    }
                };

                var addPlayerToGame = function () {
                    if ($scope.gameid && $rootScope.playerdata.name) {
                        console.info("Play", $rootScope.playerdata)
                        $http({
                            method: 'PATCH',
                            headers: {'Content-Type': 'application/json'},
                            data: $rootScope.playerdata,
                            url: UrlInjector.getBaseURL() + '/api/painter/' + $scope.gameid
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
                };

                var setImageOnCanvas = function (imagedata) {
                    var destinationImage = new Image;
                    destinationImage.onload = function () {
                        ctx.drawImage(destinationImage, 0, 0, canvas.clientWidth, canvas.clientHeight);
                    };
                    destinationImage.src = imagedata;                    
                }


                var uploadImageToClients = function () {

                    $http({
                        method: 'PUT',
                        headers: {'Content-Type': 'application/json'},
                        data: {imageData: $scope.lastPicture},
                        url: UrlInjector.getBaseURL() + '/api/painter/' + $scope.gameid + '/draw'
                    })

                };



                // Variables to keep track of the mouse position and left-button status 
                var mouseX, mouseY, mouseDown = 0;

                // Variables to keep track of the touch position
                var touchX, touchY;

                // Keep track of the old/last position when drawing a line
                // We set it to -1 at the start to indicate that we don't have a good value for it yet
                var lastX, lastY = -1;

                // Draws a line between the specified position on the supplied canvas name
                // Parameters are: A canvas context, the x position, the y position, the size of the dot
                function drawLine(ctx, x, y, size) {

                    // If lastX is not set, set lastX and lastY to the current position 
                    if (lastX == -1) {
                        lastX = x;
                        lastY = y;
                    }

                    // Let's use black by setting RGB values to 0, and 255 alpha (completely opaque)
                    var r = $scope.rColor;
                    var g = $scope.gColor;
                    var b = $scope.bColor;
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

                    // Update the last position to reference the current position
                    lastX = x;
                    lastY = y;
                    $scope.picChangedAfterLastPush = true;
                }

                // Clear the canvas context using the canvas width and height
                function clearCanvas(canvas, ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }

                // Keep track of the mouse button being pressed and draw a dot at current location
                function sketchpad_mouseDown() {
                    mouseDown = 1;
                    drawLine(ctx, mouseX, mouseY, $scope.size);
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
                        drawLine(ctx, mouseX, mouseY, $scope.size);
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

                    drawLine(ctx, touchX, touchY, $scope.size);

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
                    drawLine(ctx, touchX, touchY, $scope.size);

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

                    var parentOffset = $(sketchPadName).offset();
                    if (e.touches) {
                        if (e.touches.length == 1) { // Only deal with one finger
                            var touch = e.touches[0]; // Get the information for finger #1
                            touchX = touch.pageX - parentOffset.left;
                            touchY = touch.pageY - parentOffset.top;
//                            touchX = touch.pageX - touch.target.offsetLeft;
//                            touchY = touch.pageY - touch.target.offsetTop;
                        }
                    }
                }


                function resize(can) {  
                    //Remember the old picture before resize
//                    var tmpPic = canvas.toDataURL("image/png");
                    // Lookup the size the browser is displaying the canvas.
                   
                    var displayWidth =  $scope.meMaster ? Math.round(document.getElementById("canvasContainerMaster").offsetWidth*0.9) : Math.round(document.getElementById("canvasContainer").offsetWidth*0.9);
                    if(displayWidth > 550){
                        displayWidth = 550;
                    }
                    var displayHeight =  Math.round(displayWidth*0.5);
                    if (can.width !== displayWidth ||
                            can.height !== displayHeight) {

                        // Make the canvas the same size
                        can.width = displayWidth;
                        can.height = displayHeight;
//                        setImageOnCanvas(tmpPic);
                    }

                }
                // Set-up the canvas and add our event handlers after the page has loaded
                function init() {
                    // Get the specific canvas element from the HTML document
                    if(!$scope.meMaster){
                        canvas = document.getElementById('sketchpad');
                    }else{
                        canvas = document.getElementById('sketchpadMaster');                        
                        
                    }

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
                    $(window).on("resize", function () {
                        resize(canvas);
                    });
                    resize(canvas);
                }

                init();

                $interval($scope.upload, 250);
                $interval(resize, 250, 0, true, canvas);

            }]);