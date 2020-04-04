package de.homuth.games.server.model.tabu;

import de.homuth.games.server.model.Message;
import java.util.List;

/**
 *
 * @author jhomuth
 */
public class TabuCard implements Message {

    private String id;

    /**
     * The term to describe
     */
    private String term;

    /**
     * The list of word the player is not allowed to play
     */
    private List<String> prohibitedWords;

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
     * Get the value of prohibitedWords
     *
     * @return the value of prohibitedWords
     */
    public List<String> getProhibitedWords() {
        return prohibitedWords;
    }

    /**
     * Set the value of prohibitedWords
     *
     * @param prohibitedWords new value of prohibitedWords
     */
    public void setProhibitedWords(List<String> prohibitedWords) {
        this.prohibitedWords = prohibitedWords;
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

    @Override
    public String asSimpleMessage() {
        StringBuilder builder = new StringBuilder();
        builder.append("Begriff: ").append(this.getTerm()).append("\n\n\n");
        for (String prohibitedWord : prohibitedWords) {
            builder.append(prohibitedWord).append("\n\n");
        }
        return builder.toString();

    }
}
