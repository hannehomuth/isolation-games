/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package de.homuth.games.server.model.painter;

/**
 *
 * @author jhomuth
 */
public class MondayPainterInfo {

    private String imageData = "";

    private String action = "";
    
    private String lastTerm = "";

    /**
     * Get the value of lastTerm
     *
     * @return the value of lastTerm
     */
    public String getLastTerm() {
        return lastTerm;
    }

    /**
     * Set the value of lastTerm
     *
     * @param lastTerm new value of lastTerm
     */
    public void setLastTerm(String lastTerm) {
        this.lastTerm = lastTerm;
    }

    /**
     * Get the value of action
     *
     * @return the value of action
     */
    public String getAction() {
        return action;
    }

    /**
     * Set the value of action
     *
     * @param action new value of action
     */
    public void setAction(String action) {
        this.action = action;
    }

    /**
     * Get the value of imageData
     *
     * @return the value of imageData
     */
    public String getImageData() {
        return imageData;
    }

    /**
     * Set the value of imageData
     *
     * @param imageData new value of imageData
     */
    public void setImageData(String imageData) {
        this.imageData = imageData;
    }

}
