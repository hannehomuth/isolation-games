package de.homuth.games.server.resources;

import de.homuth.games.server.model.Player;
import de.homuth.games.server.model.whoami.Whoami;
import de.homuth.games.server.services.StorageService;
import java.io.IOException;
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
@Path("whoami")
@Produces(value = MediaType.APPLICATION_JSON)
@Consumes(value = MediaType.APPLICATION_JSON)
@ServerEndpoint(value = "/whoami")
public class WhoamiResource {

    private Session session;
    private static Set<WhoamiResource> whoamiEndpoints = new CopyOnWriteArraySet<>();
    private static HashMap<String, String> users = new HashMap<>();

    @Inject
    private StorageService storageService;

    private static final org.slf4j.Logger LOGGER = LoggerFactory.getLogger(WhoamiResource.class);

    @PUT
    public Response create(Whoami game) {
        try {
            LOGGER.info("Game created");
            Whoami storedGame = storageService.storeWhoami(game);
            return Response.ok(storedGame).build();
        } catch (IOException ex) {
            LOGGER.error("...", ex);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GET
    @Path("{gameid}")
    public Response get(@PathParam("gameid") String gameId) {
        try {
            Whoami storedGame = storageService.getWhoami(gameId);
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
            Whoami storedGame = storageService.getWhoami(gameId);
            if (storedGame.isRoundRunning()) {
                return Response.status(Response.Status.CONFLICT).build();
            }
            storedGame.addOrReplacePlayer(player);
            storageService.storeWhoami(storedGame);
            LOGGER.info("Player added");
            broadcast("PULL");
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
            Whoami storedGame = storageService.getWhoami(gameId);
            if (storedGame.isRoundRunning()) {
                return Response.status(Response.Status.CONFLICT).build();
            }
            storedGame.removePlayer(playerId);
            storageService.storeWhoami(storedGame);
            broadcast("PULL");
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
            Whoami storedGame = storageService.getWhoami(gameId);
            if (storedGame.isRoundRunning()) {
                return Response.status(Response.Status.CONFLICT).build();
            }
            storedGame.makePlayerToMaster(playerId);
            storageService.storeWhoami(storedGame);
            broadcast("PULL");
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
            Whoami storedGame = storageService.getWhoami(gameId);
            if (storedGame.isRoundRunning()) {
                return Response.status(Response.Status.CONFLICT).build();
            }
            storedGame.addOrRemovePointForPlayer(playerId, 1);
            storageService.storeWhoami(storedGame);
            broadcast("PULL");
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
            Whoami storedGame = storageService.getWhoami(gameId);
            if (storedGame.isRoundRunning()) {
                return Response.status(Response.Status.CONFLICT).build();
            }
            storedGame.addOrRemovePointForPlayer(playerId, -1);
            storageService.storeWhoami(storedGame);
            broadcast("PULL");
            LOGGER.info("removed point for player " + playerId);
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
            Whoami storedGame = storageService.getWhoami(gameId);
            storedGame.stopRound();
            storageService.storeWhoami(storedGame);
            broadcast("PULL");
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
            Whoami storedGame = storageService.getWhoami(gameId);
            if (storedGame.isRoundRunning()) {
                return Response.status(Response.Status.CONFLICT).build();
            }
            storedGame.nextRound();
            storageService.storeWhoami(storedGame);
            broadcast("PULL");
            LOGGER.info("Next round");
            return Response.ok(storedGame).build();
        } catch (IOException ex) {
            LOGGER.error("...", ex);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }
    
  
    @PATCH
    @Path("{gameid}/{playerid}/{figure}")
    public Response addFigureForPlayer(@PathParam("gameid") String gameId, @PathParam("playerid") String playerId, @PathParam("figure") String figure) {
        try {
            Whoami storedGame = storageService.getWhoami(gameId);
            storedGame.addPersonalFigureForPlayer(playerId, figure);
            storageService.storeWhoami(storedGame);
            broadcast("PULL");
            LOGGER.info("added point for player " + playerId);
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
            List<Whoami> storedGames = storageService.getAllWhoamiGames();
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
        whoamiEndpoints.add(this);
        users.put(session.getId(), username);

        broadcast("On open");
    }

    @OnMessage
    public void onMessage(Session session, String message)
            throws IOException {
        broadcast(message);
    }

    @OnClose
    public void onClose(Session session) throws IOException {
        whoamiEndpoints.remove(this);
        broadcast("Disconnectd");
    }

    @OnError
    public void error(Throwable t) {

    }

    private static void broadcast(String message) throws IOException {

        whoamiEndpoints.forEach(endpoint -> {
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
