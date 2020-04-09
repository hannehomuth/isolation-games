package de.homuth.games.server.model;

/**
 *
 * @author jhomuth
 */
public class Player {

    /**
     * An unique id
     */
    private String id;

    /**
     * Indicator whether this player is the master
     */
    private boolean master;

    private boolean wantsToPlay = Boolean.TRUE;

    /**
     * Get the value of wantsToPlay
     *
     * @return the value of wantsToPlay
     */
    public boolean isWantsToPlay() {
        return wantsToPlay;
    }

    /**
     * Set the value of wantsToPlay
     *
     * @param wantsToPlay new value of wantsToPlay
     */
    public void setWantsToPlay(boolean wantsToPlay) {
        this.wantsToPlay = wantsToPlay;
    }

    /**
     * The name of the player
     */
    private String name;

    /**
     * The amount of points the player has
     */
    private int points;

    /**
     * Get the value of points
     *
     * @return the value of points
     */
    public int getPoints() {
        return points;
    }

    /**
     * Set the value of points
     *
     * @param points new value of points
     */
    public void setPoints(int points) {
        this.points = points;
    }

    /**
     * Get the value of master
     *
     * @return the value of master
     */
    public boolean isMaster() {
        return master;
    }

    /**
     * Set the value of master
     *
     * @param master new value of master
     */
    public void setMaster(boolean master) {
        this.master = master;
    }

    /**
     * Get the value of id
     *
     * @return the value of id
     */
    public String getId() {
        return id;
    }

    /**
     * Set the value of id
     *
     * @param id new value of id
     */
    public void setId(String id) {
        this.id = id;
    }

    /**
     * Get the value of name
     *
     * @return the value of name
     */
    public String getName() {
        return name;
    }

    /**
     * Set the value of name
     *
     * @param name new value of name
     */
    public void setName(String name) {
        this.name = name;
    }

}
