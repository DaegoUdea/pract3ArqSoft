package com.edu.udea.ws;

import java.io.IOException;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import javax.websocket.EncodeException;
import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

@ServerEndpoint("/whiteboard")
public class EchoServer {

    private static final Set<Session> peers = Collections.synchronizedSet(new HashSet<Session>());

    @OnMessage
    public void onMessage(String message, Session peer) throws IOException, EncodeException {
        //Se envia un mensaje a todos los clientes conectados a la sesion.
        for (Session p : peers) {
            p.getBasicRemote().sendObject(message);
        }
    }

    @OnClose
    public void onClose(Session peer) {
        //Elimina un cliente de la sesion.
        peers.remove(peer);
    }

    @OnOpen
    public void onOpen(Session peer) {
        //Añade un cliente a la sesion.
        peers.add(peer);
    }

}
