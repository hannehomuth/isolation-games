
package de.homuth.games.server.model.painter;

import de.homuth.games.server.model.tabu.*;
import de.homuth.games.server.model.Game;
import de.homuth.games.server.model.Player;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Random;
import org.slf4j.LoggerFactory;

/**
 *
 * @author jhomuth
 */
public class MondayPainter extends Game {

    private static final org.slf4j.Logger LOGGER = LoggerFactory.getLogger(MondayPainter.class);

    /**
     * The list of cards to play
     */
    private List<MondayCard> cards;

    private MondayCard acutalCard;

    private int remainingCards;

    /**
     * Creates the next round of the game
     */
    public void nextRound() {
        setStarted(true);
        switchToNextPlayer(Boolean.FALSE);
        switchMondayCard();

        Calendar nextRoundStartCal = Calendar.getInstance();
        nextRoundStartCal.add(Calendar.SECOND, 5);
        setNextRoundStart(nextRoundStartCal.getTime());
        setRoundRunning(Boolean.TRUE);
        setLastModified(new Date());
    }
    
    /**
     * Creates the next round of the game
     */
    public void nextCard() {
        setStarted(true);
        switchMondayCard();
        setLastModified(new Date());
    }

    /**
     * Creates the next round of the game
     */
    public void stopRound() {
        setStarted(true);
        setRoundRunning(Boolean.FALSE);
        setLastModified(new Date());
    }
    
    public void markPlayerForPlay(String playerId, boolean wantsToPlay){
        for (Player value : getPlayers().values()) {
            if(playerId.equalsIgnoreCase(value.getId())){
                value.setWantsToPlay(wantsToPlay);
            }
        }
    }

    
    /**
     * Gets the next tabu card
     *
     * @return
     */
    private void switchMondayCard() {
        acutalCard = cards.get(new Random().nextInt(cards.size()));
        boolean remove = cards.remove(acutalCard);
       
        LOGGER.info("Removed card from list " + remove+": new size "+cards.size());
        remainingCards=cards.size();
    }

    /**
     * Get the value of acutalCard
     *
     * @return the value of acutalCard
     */
    public MondayCard getAcutalCard() {
        return acutalCard;
    }

    /**
     * Set the value of acutalCard
     *
     * @param acutalCard new value of acutalCard
     */
    public void setAcutalCard(MondayCard acutalCard) {
        this.acutalCard = acutalCard;
    }

    /**
     * Get the value of cards
     *
     * @return the value of cards
     */
    public List<MondayCard> getCards() {
        return cards;
    }

    /**
     * Set the value of cards
     *
     * @param cards new value of cards
     */
    public void setCards(List<MondayCard> cards) {
        this.cards = cards;
    }

    /**
     * Get the value of remainingCards
     *
     * @return the value of remainingCards
     */
    public int getRemainingCards() {
        return remainingCards;
    }

    /**
     * Set the value of remainingCards
     *
     * @param remainingCards new value of remainingCards
     */
    public void setRemainingCards(int remainingCards) {
        this.remainingCards = remainingCards;
    }
}
