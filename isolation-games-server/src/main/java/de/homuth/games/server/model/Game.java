package de.homuth.games.server.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 *
 * @author jhomuth
 */
public class Game {

    private String name;

    private String id;

    private Map<Integer, Player> players;

    private Player actualPlayer;

    private Date lastModified;

    private boolean started;

    private Date nextRoundStart;

    private int roundLength;

    private boolean roundRunning;

    /**
     * Get the value of roundRunning
     *
     * @return the value of roundRunning
     */
    public boolean isRoundRunning() {
        return roundRunning;
    }

    /**
     * Set the value of roundRunning
     *
     * @param roundRunning new value of roundRunning
     */
    public void setRoundRunning(boolean roundRunning) {
        this.roundRunning = roundRunning;
    }

    public Game() {
        lastModified = new Date();
        started = Boolean.FALSE;
        roundLength = 30;
    }

    @JsonIgnore
    public void addOrReplacePlayer(Player p) {
        int pos = -1;
        if (players == null || players.isEmpty()) {
            players = new HashMap<>();
            p.setMaster(Boolean.TRUE);
            players.put(0, p);
            return;
        }
        for (Integer integer : players.keySet()) {
            if (integer != null) {
                if (players.get(integer) != null && players.get(integer).getId() != null) {
                    if (players.get(integer).getId().equals(p.getId())) {
                        pos = integer;
                        break;
                    }
                }
            }
        }
        if (pos == -1) {
            pos = players.size();
        }
        players.put(pos, p);
        Boolean foundMaster = Boolean.FALSE;
        for (Player value : players.values()) {
            if (value.isMaster()) {
                foundMaster = Boolean.TRUE;
            }
        }
        if (!foundMaster) {
            Boolean addMaster = Boolean.FALSE;
            for (Player value : players.values()) {
                value.setMaster(true);
                return;//Breche nach dem ersten ab
            }
        }

    }

    @JsonIgnore
    public void removePlayer(String playerID
    ) {
        int pos = -1;
        if (players == null) {
            players = new HashMap<>();
        }
        for (Integer integer : players.keySet()) {
            if (integer != null) {
                if (players.get(integer) != null && players.get(integer).getId() != null) {
                    if (players.get(integer).getId().equals(playerID)) {
                        pos = integer;
                        break;
                    }
                }
            }
        }
        if (pos != -1) {
            players.remove(pos);
        }
    }

    @JsonIgnore
    public void makePlayerToMaster(String playerID
    ) {
        int pos = -1;
        if (players == null) {
            players = new HashMap<>();
        }
        for (Player p : players.values()) {
            p.setMaster(Boolean.FALSE);
            if (p.getId().equalsIgnoreCase(playerID)) {
                p.setMaster(Boolean.TRUE);
            }
        }
    }

    @JsonIgnore
    public void addOrRemovePointForPlayer(String playerID,
            int pointsToAdd
    ) {
        if (players == null) {
            players = new HashMap<>();
        }
        for (Player p : players.values()) {
            if (p.getId().equalsIgnoreCase(playerID)) {
                p.setPoints(p.getPoints() + pointsToAdd);
            }
        }
    }

    @JsonIgnore
    public void addOrRemoveCountDown(int secondsToAdd
    ) {
        roundLength = roundLength + secondsToAdd;
        if (roundLength < 5) {
            roundLength = 5;
        }
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
     * Get the value of players
     *
     * @return the value of players
     */
    public Map<Integer, Player> getPlayers() {
        return players;
    }

    /**
     * Set the value of players
     *
     * @param players new value of players
     */
    public void setPlayers(Map<Integer, Player> players) {
        this.players = players;
    }

    /**
     * Get the value of actualPlayer
     *
     * @return the value of actualPlayer
     */
    public Player getActualPlayer() {
        return actualPlayer;
    }

    /**
     * Set the value of actualPlayer
     *
     * @param actualPlayer new value of actualPlayer
     */
    public void setActualPlayer(Player actualPlayer) {
        this.actualPlayer = actualPlayer;
    }

    /**
     * Get the value of lastModified
     *
     * @return the value of lastModified
     */
    public Date getLastModified() {
        return lastModified;
    }

    /**
     * Set the value of lastModified
     *
     * @param lastModified new value of lastModified
     */
    public void setLastModified(Date lastModified) {
        this.lastModified = lastModified;
    }

    /**
     * Get the value of started
     *
     * @return the value of started
     */
    public boolean isStarted() {
        return started;
    }

    /**
     * Set the value of started
     *
     * @param started new value of started
     */
    public void setStarted(boolean started) {
        this.started = started;
    }

    /**
     * Get the value of nextRoundStart
     *
     * @return the value of nextRoundStart
     */
    public Date getNextRoundStart() {
        return nextRoundStart;
    }

    /**
     * Set the value of nextRoundStart
     *
     * @param nextRoundStart new value of nextRoundStart
     */
    public void setNextRoundStart(Date nextRoundStart) {
        this.nextRoundStart = nextRoundStart;
    }

    /**
     * Get the value of roundLength
     *
     * @return the value of roundLength
     */
    public int getRoundLength() {
        return roundLength;
    }

    /**
     * Set the value of roundLength
     *
     * @param roundLength new value of roundLength
     */
    public void setRoundLength(int roundLength) {
        this.roundLength = roundLength;
    }

}
