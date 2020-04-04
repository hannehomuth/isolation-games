package de.homuth.games.server.resources;

import de.homuth.games.server.model.Player;
import de.homuth.games.server.services.StorageService;
import java.io.IOException;
import javax.inject.Inject;
import javax.ws.rs.GET;
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
@Path("player")
@Produces(value = MediaType.APPLICATION_JSON)
public class PlayerResource {

    @Inject
    private StorageService storageService;

    private static final org.slf4j.Logger LOGGER = LoggerFactory.getLogger(PlayerResource.class);

    @PUT
    public Response create(Player p) {
        try {
            Player storedPlayer = storageService.storePlayer(p);
            return Response.ok(storedPlayer).build();
        } catch (IOException ex) {
            LOGGER.error("...", ex);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GET
    @Path("{playerid}")
    public Response get(@PathParam("playerid") String playerID) {
        try {
            Player storedPlayer = storageService.getPlayer(playerID);
            if (storedPlayer == null) {
                return Response.status(Response.Status.NOT_FOUND).build();
            }
            return Response.ok(storedPlayer).build();
        } catch (IOException ex) {
            LOGGER.error("...", ex);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }
}
