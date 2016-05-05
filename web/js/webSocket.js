var wsUri = "ws://" + document.location.host + document.location.pathname + "whiteboard";
var webSocket = new WebSocket(wsUri);

var whiteboard;
var ctx;
var flag = false;

whiteboard = document.getElementById("whiteboard");
ctx = whiteboard.getContext("2d");

var jsonString = JSON.stringify({
    "action": "action",
    "lineWidth": 1,
    "color": "black",
    "moveTox": 0,
    "moveToy": 0,
    "lineTox": 0,
    "lineToy": 0
});
var json = JSON.parse(jsonString);

jsonString = JSON.stringify({
    "action": "action",
    "username": "user",
    "message": "message"
});

var jsonChat = JSON.parse(jsonString);

webSocket.onopen = function (evt) {
    onOpen(evt);
};
webSocket.onmessage = function (evt) {
    onMessage(evt);
};
webSocket.onerror = function (evt) {
    onError(evt);
};

whiteboard.addEventListener("mousedown", function (e) {
    var coordinates = findCoordinates(whiteboard, e);
    json.action = "draw";
    json.moveTox = coordinates.x;
    json.moveToy = coordinates.y;
    json.lineWidth = $("#pencil-thickness").val();
    json.color = $("#color").val();
    flag = true;
});

whiteboard.addEventListener("mousemove", function (e) {
    if (flag == true) {
        var coordinates = findCoordinates(whiteboard, e);
        json.lineTox = coordinates.x;
        json.lineToy = coordinates.y;
        webSocket.send(JSON.stringify(json));
        
        json.moveTox = coordinates.x;
        json.moveToy = coordinates.y;
    }
});

whiteboard.addEventListener("mouseup", function (e) {
    flag = false;
});

$("#output-text").keypress(function (evt) {
    if (evt.which == 13) {
        console.log("pressed enter")
        evt.preventDefault();
        sendChatMessage();
    }
});

function sendChatMessage() {
    var userName = $("#user-name").val();
    var message = $("#output-text").val();
    jsonChat.action = "writeToChat";
    jsonChat.username = userName;
    jsonChat.message = message;
    webSocket.send(JSON.stringify(jsonChat));
}

function sendClearCanvas() {
    var jsonClear = JSON.stringify({"action": "clearCanvas"});
    webSocket.send(jsonClear);
}

function drawLine(json) {
    ctx.beginPath();
    ctx.lineWidth = json.lineWidth;
    ctx.strokeStyle = json.color;
    ctx.moveTo(json.moveTox, json.moveToy);
    ctx.lineTo(json.lineTox, json.lineToy);
    ctx.stroke();
}

function clearCanvas() {
    ctx.clearRect(0, 0, whiteboard.width, whiteboard.height)
}

function writeInChat(json) {
    var chatLog = document.getElementById("chatlog");
    chatLog.scrollTop = chatLog.scrollHeight;
    console.log(json);
    chatLog.innerHTML += json.username + ": " + json.message + "\n";
}

function findCoordinates(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function onMessage(evt) {
    console.log("onMessage executed");
    var jsonAction = JSON.parse(evt.data);

    if (jsonAction.action == "draw") {
        drawLine(jsonAction);
    } else if (jsonAction.action == "writeToChat") {
        writeInChat(jsonAction);
    } else if (jsonAction.action == "clearCanvas") {
        clearCanvas();
    }
}

function onOpen(evt) {
    console.log("onOpen executed");
}

function onError(evt) {
    console.log("onError executed");
    writeToScreen('<span style="color : red">ERROR</span>' + evt.data);
}
