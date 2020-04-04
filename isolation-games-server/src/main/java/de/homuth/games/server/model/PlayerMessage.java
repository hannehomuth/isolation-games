package de.homuth.games.server.model;

/**
 *
 * @author jhomuth
 */
public class PlayerMessage {

    /**
     * The player which should get the message
     */
    private Player player;

    /**
     * The message which should be displayed
     */
    private Message message;

    /**
     * Get the value of message
     *
     * @return the value of message
     */
    public Message getMessage() {
        return message;
    }

    /**
     * Set the value of message
     *
     * @param message new value of message
     */
    public void setMessage(Message message) {
        this.message = message;
    }

    /**
     * Get the value of player
     *
     * @return the value of player
     */
    public Player getPlayer() {
        return player;
    }

    /**
     * Set the value of player
     *
     * @param player new value of player
     */
    public void setPlayer(Player player) {
        this.player = player;
    }

}
