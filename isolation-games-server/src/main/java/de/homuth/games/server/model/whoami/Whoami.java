/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package de.homuth.games.server.model.whoami;

import de.homuth.games.server.model.Game;
import de.homuth.games.server.model.Player;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

/**
 *
 * @author jhomuth
 */
public class Whoami extends Game {

    /**
     * A map of player with its figures to guess
     */
    private Map<String, String> playerToPersonMapping = new HashMap<>();
    
    private Map<String, String> playerToResponsiblePlayerMapping = new HashMap<>();
    
    public void addPersonalFigureForPlayer(String playerId, String personalFigure){
        String pForReplace = null;
        for (String pid : playerToPersonMapping.keySet()) {
            if(pid.equals(playerId)){
                pForReplace = pid;
                break;
            }
        }
        if(pForReplace != null){
            playerToPersonMapping.put(pForReplace, personalFigure);
        }else{
            for (Player p : getPlayers().values()) {
                if(p.getId().equalsIgnoreCase(playerId)){
                    playerToPersonMapping.put(p.getId(), personalFigure);
                    break;
                }
            }
        }
    }
    
    
    public void createPlayerToResponsiblePlayerMapping(){
        ArrayList<Player> values = new ArrayList<>(getPlayers().values());
        if(values.size()<2){
            return;
        }
        playerToResponsiblePlayerMapping = new HashMap<>();
        Player firstPlayer = values.get(0);
        for (int i = 0; i < (values.size()-1); i++) {
            playerToResponsiblePlayerMapping.put(values.get(i).getId(), values.get(i+1).getId());
        }
        playerToResponsiblePlayerMapping.put(values.get(values.size()-1).getId(), firstPlayer.getId());
    }

    @Override
    public void addOrReplacePlayer(Player p) {
        super.addOrReplacePlayer(p); //To change body of generated methods, choose Tools | Templates.
        createPlayerToResponsiblePlayerMapping();
    }
    
    
    
    public void stopRound(){
        setRoundRunning(false);        
    }
    public void nextRound(){
        setRoundRunning(true);
        ArrayList<Player> values = new ArrayList<>(getPlayers().values());
        setActualPlayer(values.get(new Random().nextInt(values.size())));
    }
    
    public void switchPlayer(){
        switchToNextPlayer(Boolean.TRUE);
    }
    
    /**
     * Get the value of playerToPersonMapping
     *
     * @return the value of playerToPersonMapping
     */
    public Map<String, String> getPlayerToPersonMapping() {
        return playerToPersonMapping;
    }

    /**
     * Set the value of playerToPersonMapping
     *
     * @param playerToPersonMapping new value of playerToPersonMapping
     */
    public void setPlayerToPersonMapping(Map<String, String> playerToPersonMapping) {
        this.playerToPersonMapping = playerToPersonMapping;
    }

    public Map<String, String> getPlayerToResponsiblePlayerMapping() {
        return playerToResponsiblePlayerMapping;
    }

    public void setPlayerToResponsiblePlayerMapping(Map<String, String> playerToResponsiblePlayerMapping) {
        this.playerToResponsiblePlayerMapping = playerToResponsiblePlayerMapping;
    }

    
}
