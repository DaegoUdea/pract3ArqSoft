var wsUri = "ws://" + document.location.host + document.location.pathname + "blackBoard";
var webSocket = new WebSocket(wsUri);

var blackBoard;
var ctx;
var color;
var thickness;
var x, y;
var coordinates;
var flag;

webSocket.onopen = function (evt) {
    onOpen(evt);
};
webSocket.onmessage = function (evt) {
    onMessage(evt);
};
webSocket.onerror = function (evt) {
    onError(evt);
};

main();

function main() {
    blackBoard = document.getElementById("blackBoard");
    ctx = blackBoard.getContext("2d");
    blackBoard.addEventListener("mousedown", function (e) {
        var json = JSON.stringify({
            "moveTox": 0,
            "moveToy": 0,
            "lineTox": 300,
            "lineToy": 150,
            "coords": {
                "x": 1,
                "y": 1
            }
        });
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(300, 150);
        ctx.stroke();
        webSocket.send(json);
    });
}

function onOpen(evt) {
    console.log("onOpen executed");
}

function onMessage(evt) {
    console.log("onMessage executed");
    console.log(evt.data + " received");
    var json = JSON.parse(evt.data);
    ctx.beginPath();
    ctx.moveTo(json.moveTox, json.moveToy);
    ctx.lineTo(json.lineTox, json.lineToy);
    ctx.stroke();
}

function onError(evt) {
    console.log("onError executed");
    writeToScreen('<span style="color : red">ERROR</span>' + evt.data);
}
