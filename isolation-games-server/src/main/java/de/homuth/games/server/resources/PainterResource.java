package de.homuth.games.server.resources;

import de.homuth.games.server.model.Player;
import de.homuth.games.server.model.painter.Line;
import de.homuth.games.server.model.painter.LineEncoder;
import de.homuth.games.server.model.whoami.Whoami;
import de.homuth.games.server.services.StorageService;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.inject.Inject;
import javax.websocket.EncodeException;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.PATCH;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.slf4j.LoggerFactory;

/**
 *
 * @author jhomuth
 */
@Path("painter")
@Produces(value = MediaType.APPLICATION_JSON)
@Consumes(value = MediaType.APPLICATION_JSON)
@ServerEndpoint(value = "/painter",  encoders = { LineEncoder.class })
public class PainterResource {

    private Session session;
    private static Set<PainterResource> painterEndpoints = new CopyOnWriteArraySet<>();
    private static HashMap<String, String> users = new HashMap<>();

    @Inject
    private StorageService storageService;

    private static final org.slf4j.Logger LOGGER = LoggerFactory.getLogger(PainterResource.class);

    @PUT
    public Response draw(Line line) {
        try {
            broadcast(line);
        } catch (IOException ex) {
           LOGGER.error("",ex);
        }
        return Response.ok().build();
    }

    @OnOpen
    public void onOpen(
            Session session,
            @javax.websocket.server.PathParam("gameid") String username) throws IOException {

        this.session = session;
        painterEndpoints.add(this);
        users.put(session.getId(), username);

//        broadcast("On open");
    }

    @OnMessage
    public void onMessage(Session session, String message)
            throws IOException {
//        broadcast(message);
    }

    @OnClose
    public void onClose(Session session) throws IOException {
        painterEndpoints.remove(this);
//        broadcast("Disconnectd");
    }

    @OnError
    public void error(Throwable t) {

    }

    private static void broadcast(Line message) throws IOException {

        painterEndpoints.forEach(endpoint -> {
            synchronized (endpoint) {
                try {
                    endpoint.session.getBasicRemote().
                            sendObject(message);
                } catch (IOException | EncodeException e) {
                    LOGGER.error("",e);
                }
            }
        });
    }
}
