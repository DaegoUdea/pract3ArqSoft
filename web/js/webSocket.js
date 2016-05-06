var wsUri = "ws://" + document.location.host + document.location.pathname + "whiteboard";
var webSocket = new WebSocket(wsUri);

//Se definen los callbacks del Websocket y se les asocia una función respectiva.
webSocket.onopen = function (evt) {
    onOpen(evt);
};
webSocket.onmessage = function (evt) {
    onMessage(evt);
};
webSocket.onerror = function (evt) {
    onError(evt);
};

//Función que define como se ejecutará el flujo de la aplicación cuando un usuario 
//envia un mensaje a los otros clientes mediante la conexión del websocket.
//El flujo se define mediante la clave "action" contenida en un objeto json.
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

//Función que notifica por consola cuando se a establecido la conexion con el servidor.
function onOpen(evt) {
    console.log("onOpen executed");
}

//Funcion que notifica por consola un error en el flujo de mensajes por medioa de la
//Conexión con el servidor.
function onError(evt) {
    console.log("onError executed");
}

//Logica del negocio.

//Variables de control para el dibujado en el tablero compartido
var whiteboard;
var ctx;
var flag = false;

//Se obtienen los elementos necesarios para el dibujado.
whiteboard = document.getElementById("whiteboard");
ctx = whiteboard.getContext("2d");

//Formato json que debe tener un mensaje enviado por el socket para dibujar en el tablero.
var jsonString = JSON.stringify({
    "action": "draw",
    "lineWidth": 1,
    "color": "black",
    "moveTox": 0,
    "moveToy": 0,
    "lineTox": 0,
    "lineToy": 0
});
var jsonDraw = JSON.parse(jsonString);

//Formato json que debe tener un mensaje enviado por el socket para escribir mensajes en el chat.
jsonString = JSON.stringify({
    "action": "writeToChat",
    "username": "user",
    "message": "message"
});
var jsonChat = JSON.parse(jsonString);


//Función para descargar en formato .png la imagen dibujada en el tablero.
function downloadCanvas(link, canvasId, filename) {
    link.href = document.getElementById(canvasId).toDataURL();
    link.download = filename;
}

//Se asocia a un boton la funcion que descarga la imagen dibujada en el tablero.
document.getElementById('download-btn').addEventListener('click', function() {
    downloadCanvas(this, 'whiteboard', 'image.png');
}, false);

//Se añade a el tablero los eventListeners correspondientes para el dibujado.
whiteboard.addEventListener("mousedown", function (e) {
    //Se establece el punto inicial donde se empieza el trazo de una linea.
    var coordinates = findCoordinates(whiteboard, e);
    jsonDraw.action = "draw";
    jsonDraw.moveTox = coordinates.x;
    jsonDraw.moveToy = coordinates.y;
    jsonDraw.lineWidth = $("#pencil-thickness").val();
    jsonDraw.color = $("#color").val();
    
    //Mientras el usuario mantenga presionado el boton del mouse la variable flag
    //notifica que se puede dibujar a lo largo del movimiento del puntero.
    flag = true;
});

whiteboard.addEventListener("mousemove", function (e) {
    //Se trazan las lineas correspondientes al movimiento del puntero del usuario y
    //se notifica a los clientes que deben dibujar las lineas enviadas en formato json.
    if (flag == true) {
        var coordinates = findCoordinates(whiteboard, e);
        jsonDraw.lineTox = coordinates.x;
        jsonDraw.lineToy = coordinates.y;
        webSocket.send(JSON.stringify(jsonDraw));
        
        jsonDraw.moveTox = coordinates.x;
        jsonDraw.moveToy = coordinates.y;
    }
});

whiteboard.addEventListener("mouseup", function (e) {
    //Cuando el usuario suelta el boton del mouse se desactiva el dibujado a lo largo
    //del movimiento del puntero
    flag = false;
});

//Escribe un mensaje en el chat cuando se presiona la tecla enter
$("#output-text").keypress(function (evt) {
    if (evt.which == 13) {
        console.log("pressed enter")
        evt.preventDefault();
        sendChatMessage();
    }
});

//Envia un mensaje en formato json a los demas clientes informando que se debe escribir
//en el chat la información enviada.
function sendChatMessage() {
    var userName = $("#user-name").val();
    var message = $("#output-text").val();
    jsonChat.action = "writeToChat";
    jsonChat.username = userName;
    jsonChat.message = message;
    webSocket.send(JSON.stringify(jsonChat));
}

//Envia un mensaje en formato json a los demas clientes con el fin de limpiar
//el dibujo del tablero.
function sendClearCanvas() {
    var jsonClear = JSON.stringify({"action": "clearCanvas"});
    webSocket.send(jsonClear);
}

//Función que dibuja lineas mediante la información almacenada en un objeto json.
function drawLine(json) {
    ctx.beginPath();
    ctx.lineWidth = json.lineWidth;
    ctx.strokeStyle = json.color;
    ctx.moveTo(json.moveTox, json.moveToy);
    ctx.lineTo(json.lineTox, json.lineToy);
    ctx.stroke();
}

//Funcion que borra el dibujo del tablero.
function clearCanvas() {
    ctx.clearRect(0, 0, whiteboard.width, whiteboard.height)
}

//Funcion que escribe los mensajes del chat mediante la información almacenada
//en un objeto json.
function writeInChat(json) {
    var chatLog = document.getElementById("chatlog");
    chatLog.scrollTop = chatLog.scrollHeight;
    console.log(json);
    chatLog.innerHTML += json.username + ": " + json.message + "\n";
}

//Funcion que retorna las coordenadas del puntero en el tablero.
function findCoordinates(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

