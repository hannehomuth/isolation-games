package de.homuth.games.server.resources;

import de.homuth.games.server.model.Player;
import de.homuth.games.server.model.painter.MondayPainterInfo;
import de.homuth.games.server.model.painter.CanvasEncoder;
import de.homuth.games.server.model.painter.MondayPainter;
import de.homuth.games.server.services.StorageService;
import java.io.IOException;
import java.util.Calendar;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;
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
@ServerEndpoint(value = "/painter", encoders = {CanvasEncoder.class})
public class PainterResource {

    private Session session;
    private static Set<PainterResource> painterEndpoints = new CopyOnWriteArraySet<>();
    private static HashMap<String, String> users = new HashMap<>();

    @Inject
    private StorageService storageService;

    private static final org.slf4j.Logger LOGGER = LoggerFactory.getLogger(PainterResource.class);

    @PUT
    @Path("{gameid}/draw")
    public Response draw(MondayPainterInfo canvasImage) {
        
        try {
            canvasImage.setAction("DRAW");
            broadcast(canvasImage);
        } catch (IOException ex) {
            LOGGER.error("", ex);
        }
        return Response.ok().build();
    }
    
    @PUT
    @Path("{gameid}/clear")
    public Response clear() {
        MondayPainterInfo canvasImage = new MondayPainterInfo();
        canvasImage.setAction("CLEAR");
        try {
            broadcast(canvasImage);
        } catch (IOException ex) {
            LOGGER.error("", ex);
        }
        return Response.ok().build();
    }

    @PUT
    public Response create(MondayPainter game) {
        try {
            LOGGER.info("Game created");
            MondayPainter storedGame = storageService.storePainter(game);
            return Response.ok(storedGame).build();
        } catch (IOException ex) {
            LOGGER.error("...", ex);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GET
    @Path("{gameid}")
    public Response get(@PathParam("gameid") String gameId) {
        Calendar requestStart = Calendar.getInstance();
        try {
            MondayPainter storedGame = storageService.getMondayPainter(gameId);
            storedGame.setCards(Collections.EMPTY_LIST);
            Calendar requestEnd = Calendar.getInstance();
            LOGGER.info("Read game within " + (requestEnd.getTimeInMillis() - requestStart.getTimeInMillis()) + " milliseconds");
            return Response.ok(storedGame).build();
        } catch (IOException ex) {
            LOGGER.error("...", ex);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PATCH
    @Path("{gameid}")
    public Response addPlayer(@PathParam("gameid") String gameId, Player player) {
        try {
            MondayPainter storedGame = storageService.getMondayPainter(gameId);
            if (storedGame.isRoundRunning()) {
                return Response.status(Response.Status.CONFLICT).build();
            }
            storedGame.addOrReplacePlayer(player);
            LOGGER.info("Player added");
            storageService.storePainter(storedGame);
            MondayPainterInfo c = new MondayPainterInfo();
            c.setAction("PULL");
            broadcast(c);
            return Response.ok(storedGame).build();
        } catch (IOException ex) {
            LOGGER.error("...", ex);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DELETE
    @Path("{gameid}/{playerid}")
    public Response removePlayer(@PathParam("gameid") String gameId, @PathParam("playerid") String playerId) {
        try {
            MondayPainter storedGame = storageService.getMondayPainter(gameId);
            if (storedGame.isRoundRunning()) {
                return Response.status(Response.Status.CONFLICT).build();
            }
            storedGame.removePlayer(playerId);
            storageService.storePainter(storedGame);
            MondayPainterInfo c = new MondayPainterInfo();
            c.setAction("PULL");
            broadcast(c);
            LOGGER.info("Player removed");
            return Response.ok(storedGame).build();
        } catch (IOException ex) {
            LOGGER.error("...", ex);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PATCH
    @Path("{gameid}/master/{playerid}")
    public Response makePlayerToMaster(@PathParam("gameid") String gameId, @PathParam("playerid") String playerId) {
        try {
            MondayPainter storedGame = storageService.getMondayPainter(gameId);
            if (storedGame.isRoundRunning()) {
                return Response.status(Response.Status.CONFLICT).build();
            }
            storedGame.makePlayerToMaster(playerId);
            storageService.storePainter(storedGame);
            MondayPainterInfo c = new MondayPainterInfo();
            c.setAction("PULL");
            broadcast(c);
            LOGGER.info("Player made to master");
            return Response.ok(storedGame).build();
        } catch (IOException ex) {
            LOGGER.error("...", ex);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PATCH
    @Path("{gameid}/wants/{playerid}")
    public Response markPlayerForPlay(@PathParam("gameid") String gameId, @PathParam("playerid") String playerId) {
        try {
            MondayPainter storedGame = storageService.getMondayPainter(gameId);
            if (storedGame.isRoundRunning()) {
                return Response.status(Response.Status.CONFLICT).build();
            }
            storedGame.markPlayerForPlay(playerId,Boolean.TRUE);
            storageService.storePainter(storedGame);
            MondayPainterInfo c = new MondayPainterInfo();
            c.setAction("PULL");
            broadcast(c);
            LOGGER.info("Player made to master");
            return Response.ok(storedGame).build();
        } catch (IOException ex) {
            LOGGER.error("...", ex);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }
    @PATCH
    @Path("{gameid}/wantsnot/{playerid}")
    public Response markPlayerForDontPlay(@PathParam("gameid") String gameId, @PathParam("playerid") String playerId) {
        try {
            MondayPainter storedGame = storageService.getMondayPainter(gameId);
            if (storedGame.isRoundRunning()) {
                return Response.status(Response.Status.CONFLICT).build();
            }
            storedGame.markPlayerForPlay(playerId,Boolean.FALSE);
            storageService.storePainter(storedGame);
            MondayPainterInfo c = new MondayPainterInfo();
            c.setAction("PULL");
            broadcast(c);
            LOGGER.info("Player made to master");
            return Response.ok(storedGame).build();
        } catch (IOException ex) {
            LOGGER.error("...", ex);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PATCH
    @Path("{gameid}/points+/{playerid}")
    public Response addPoint(@PathParam("gameid") String gameId, @PathParam("playerid") String playerId) {
        try {
            MondayPainter storedGame = storageService.getMondayPainter(gameId);
            if (storedGame.isRoundRunning()) {
                return Response.status(Response.Status.CONFLICT).build();
            }
            storedGame.addOrRemovePointForPlayer(playerId, 1);
            storageService.storePainter(storedGame);
            MondayPainterInfo c = new MondayPainterInfo();
            c.setAction("PULL");
            broadcast(c);
            LOGGER.info("added point for player " + playerId);
            return Response.ok(storedGame).build();
        } catch (IOException ex) {
            LOGGER.error("...", ex);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PATCH
    @Path("{gameid}/points-/{playerid}")
    public Response removePoint(@PathParam("gameid") String gameId, @PathParam("playerid") String playerId) {
        try {
            MondayPainter storedGame = storageService.getMondayPainter(gameId);
            if (storedGame.isRoundRunning()) {
                return Response.status(Response.Status.CONFLICT).build();
            }
            storedGame.addOrRemovePointForPlayer(playerId, -1);
           storageService.storePainter(storedGame);
            MondayPainterInfo c = new MondayPainterInfo();
            c.setAction("PULL");
            broadcast(c);
            LOGGER.info("removed point for player " + playerId);
            return Response.ok(storedGame).build();
        } catch (IOException ex) {
            LOGGER.error("...", ex);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PATCH
    @Path("{gameid}/countdown+")
    public Response addCountDown(@PathParam("gameid") String gameId) {
        try {
            MondayPainter storedGame = storageService.getMondayPainter(gameId);
            if (storedGame.isRoundRunning()) {
                return Response.status(Response.Status.CONFLICT).build();
            }
            storedGame.addOrRemoveCountDown(5);
            storageService.storePainter(storedGame);
            MondayPainterInfo c = new MondayPainterInfo();
            c.setAction("PULL");
            broadcast(c);
            return Response.ok(storedGame).build();
        } catch (IOException ex) {
            LOGGER.error("...", ex);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PATCH
    @Path("{gameid}/countdown-")
    public Response removeCountDown(@PathParam("gameid") String gameId) {
        try {
            MondayPainter storedGame = storageService.getMondayPainter(gameId);
            if (storedGame.isRoundRunning()) {
                return Response.status(Response.Status.CONFLICT).build();
            }
            storedGame.addOrRemoveCountDown(-5);
            storageService.storePainter(storedGame);
            MondayPainterInfo c = new MondayPainterInfo();
            c.setAction("PULL");
            broadcast(c);
            return Response.ok(storedGame).build();
        } catch (IOException ex) {
            LOGGER.error("...", ex);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PATCH
    @Path("{gameid}/stopround")
    public Response stopRound(@PathParam("gameid") String gameId) {
        try {
            MondayPainter storedGame = storageService.getMondayPainter(gameId);
            storedGame.stopRound();
            storageService.storePainter(storedGame);
            MondayPainterInfo c = new MondayPainterInfo();
            c.setAction("PULL");
            broadcast(c);
            LOGGER.info("Stopped round");
            return Response.ok(storedGame).build();
        } catch (IOException ex) {
            LOGGER.error("...", ex);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }

    @POST
    @Path("{gameid}/nextround")
    public Response nextround(@PathParam("gameid") String gameId) {
        try {
            MondayPainter storedGame = storageService.getMondayPainter(gameId);
            if (storedGame.isRoundRunning()) {
                return Response.status(Response.Status.CONFLICT).build();
            }
            storedGame.nextRound();
            storageService.storePainter(storedGame);
            MondayPainterInfo c = new MondayPainterInfo();            
            c.setAction("NEXT_ROUND");
            broadcast(c);
            LOGGER.info("Next round");
            return Response.ok(storedGame).build();
        } catch (IOException ex) {
            LOGGER.error("...", ex);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }

    @POST
    @Path("{gameid}/nextcard")
    public Response nextCard(@PathParam("gameid") String gameId) {
        try {
            MondayPainterInfo c = new MondayPainterInfo();
            MondayPainter storedGame = storageService.getMondayPainter(gameId);
            c.setLastTerm(storedGame.getAcutalCard().getTerm());
            storedGame.nextCard();
            storageService.storePainter(storedGame);
            c.setAction("NEXT_CARD");
            broadcast(c);
            LOGGER.info("Next card");
            return Response.ok(storedGame).build();
        } catch (IOException ex) {
            LOGGER.error("...", ex);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }

    @POST
    @Path("{gameid}/intervene")
    public Response intervene(@PathParam("gameid") String gameId) {
        try {
            MondayPainter storedGame = storageService.getMondayPainter(gameId);
            storedGame.nextCard();
            storageService.storePainter(storedGame);
            MondayPainterInfo c = new MondayPainterInfo();
            c.setAction("INTERVENE");
            broadcast(c);
            LOGGER.info("Intervene");
            return Response.ok(storedGame).build();
        } catch (IOException ex) {
            LOGGER.error("...", ex);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GET
    @Path("all")
    public Response getAll() {
        try {
            List<MondayPainter> storedGames = storageService.getAllPainterGames();
            return Response.ok(storedGames).build();
        } catch (IOException ex) {
            LOGGER.error("...", ex);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
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

    private static void broadcast(MondayPainterInfo message) throws IOException {

        painterEndpoints.forEach(endpoint -> {
            synchronized (endpoint) {
                try {
                    endpoint.session.getBasicRemote().
                            sendObject(message);
                } catch (IOException | EncodeException e) {
                    LOGGER.error("", e);
                }
            }
        });
    }
}
