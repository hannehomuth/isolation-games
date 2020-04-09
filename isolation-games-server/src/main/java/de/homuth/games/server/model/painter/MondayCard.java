package de.homuth.games.server.model.painter;

/**
 *
 * @author jhomuth
 */
public class MondayCard  {

    private String id;

    /**
     * The term to describe
     */
    private String term;

    /**
     * An indicator whether the card was already played
     */
    private boolean played;

    /**
     * Get the value of played
     *
     * @return the value of played
     */
    public boolean isPlayed() {
        return played;
    }

    /**
     * Set the value of played
     *
     * @param played new value of played
     */
    public void setPlayed(boolean played) {
        this.played = played;
    }

    /**
     * Get the value of term
     *
     * @return the value of term
     */
    public String getTerm() {
        return term;
    }

    /**
     * Set the value of term
     *
     * @param term new value of term
     */
    public void setTerm(String term) {
        this.term = term;
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
    
}
