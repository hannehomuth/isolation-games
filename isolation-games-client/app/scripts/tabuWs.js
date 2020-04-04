angular.module('TABU_GAME', ['ngWebSocket'])
        .factory('TABU', function ($websocket) {
            // Open a WebSocket connection
            var ws = $websocket("ws://localhost:8080/hello");
            var atp = [];
            ws.onMessage(function (event) {
                console.log('message: ', event.data);
                var response;
                try {
                    response = angular.fromJson(event.data);
                } catch (e) {
                    document.getElementById("helloId").innerHTML =
                            "Sorry, connection failed ...";
                    document.getElementById("btnAtpId").disabled = false;
                    console.log('error: ', e);
                    response = {'error': e};
                }
                if (response.hello) {
                    document.getElementById("helloId").innerHTML = response.hello;
                    document.getElementById("btnAtpId").disabled = false;
                } else {
                    for (var i = 0; i < response.length; i++) {
                        atp.push({
                            rank: response[i].rank,
                            name: response[i].name,
                            email: response[i].email
                        });
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
            return {
                atp: atp,
                status: function () {
                    return ws.readyState;
                },
                send: function (message) {
                    if (angular.isString(message)) {
                        ws.send(message);
                    } else if (angular.isObject(message)) {
                        ws.send(JSON.stringify(message));
                    }
                }
            };
        })
        .controller('atpController', function ($scope, ATP) {
            $scope.ATP = ATP;
            $scope.submit = function () {
                ATP.send("ATP SERVER");
            };
        });