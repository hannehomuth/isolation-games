package de.homuth.games.server.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import de.homuth.games.server.JsonFileFilter;
import de.homuth.games.server.model.Player;
import de.homuth.games.server.model.tabu.Tabu;
import de.homuth.games.server.model.tabu.TabuCard;
import de.homuth.games.server.model.whoami.Whoami;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.wildfly.swarm.spi.runtime.annotations.ConfigurationValue;

/**
 *
 * @author jhomuth
 */
@ApplicationScoped
public class StorageService {

    private static final String GAME_STORAGE_FOLDER = "games";
    private static final String TABU_STORAGE_FOLDER = "tabu";
    private static final String WHOAMI_STORAGE_FOLDER = "whoami";
    private static final String TMP_STORAGE_FOLDER = "temporary";

    private static final String PLAYER_STORAGE_FOLDER = "player";

    /**
     * The path were to store the migrations
     */
    @Inject
    @ConfigurationValue("games.storage.path")
    private String storagePath;

    private static final Logger LOGGER = LoggerFactory.getLogger(StorageService.class);

    /**
     * This method will collect the folder where all data is stored in. If the
     * folder doesn't exist, it will be created
     */
    private File getStorageFolder() {
        File storageFolder = new File(storagePath);
        createFolderIfNotExist(storageFolder);
        return storageFolder;
    }

    /**
     * Method will return the folder where all games are stored in. If the
     * folder isn't existing, it will be created
     *
     * @return
     */
    private File getTabuGamesStorageFolder() {
        File foodsourceStorageFolder = new File(getStorageFolder(), GAME_STORAGE_FOLDER+"/"+TABU_STORAGE_FOLDER);
        createFolderIfNotExist(foodsourceStorageFolder);
        return foodsourceStorageFolder;
    }
    private File getWhoamiGamesStorageFolder() {
        File foodsourceStorageFolder = new File(getStorageFolder(), GAME_STORAGE_FOLDER+"/"+WHOAMI_STORAGE_FOLDER);
        createFolderIfNotExist(foodsourceStorageFolder);
        return foodsourceStorageFolder;
    }
    
    private File getTmpStorageFolder() {
        File tmpstorageFolder = new File(getStorageFolder(), TMP_STORAGE_FOLDER);
        createFolderIfNotExist(tmpstorageFolder);
        return tmpstorageFolder;
    }

    /**
     * Method will return the folder where all games are stored in. If the
     * folder isn't existing, it will be created
     *
     * @return
     */
    private File getPlayerStorageFolder() {
        File foodsourceStorageFolder = new File(getStorageFolder(), PLAYER_STORAGE_FOLDER);
        createFolderIfNotExist(foodsourceStorageFolder);
        return foodsourceStorageFolder;
    }

    /**
     * Method will store the provided food source to filesystem. If the
     * foodsource already had an ID, the foodsource with the id will be located,
     * and overwritten. Otherwise a new ID will be created and setted.
     *
     * @param tabu
     * @return
     */
    public Tabu storeTabu(Tabu tabu) throws IOException {
        LOGGER.info("Stored tabu game");
        if (tabu == null) {
            throw new IllegalArgumentException("The game to store must not be null");
        }
        if (tabu.getId() == null || tabu.getId().isEmpty()) {
            /* Seems to be a new food source. Generate an ID and set it. */
            tabu.setId(UUID.randomUUID().toString());
            InputStream inputStream = StorageService.class.getClassLoader().getResourceAsStream("tabu-cards.csv");
            BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
            List<TabuCard> cards = new ArrayList<>();
            while (reader.ready()) {
                String line = reader.readLine();
                if (line != null) {
                    line = line.replace("\"", "");
                    String[] fields = line.split(";");
                    if (fields.length < 2) {
                        LOGGER.warn("Zeile hat zu wenig Einträge: " + line);
                        continue;
                    }
                    TabuCard c = new TabuCard();
                    c.setId(UUID.randomUUID().toString());
                    c.setTerm(fields[0].toUpperCase());
                    List<String> pWords = new ArrayList<>();
                    for (int i = 1; i < fields.length; i++) {
                        pWords.add(fields[i].toUpperCase());
                    }
                    c.setProhibitedWords(pWords);
                    cards.add(c);
                }
            }
            tabu.setCards(cards);
        }

        File tabuFile = new File(getTabuGamesStorageFolder(), tabu.getId() + ".json");
        File tmpTabu = File.createTempFile("tabu", ".tmp", getTmpStorageFolder());
        tabu.setLastModified(new Date());
        tabu.setRemainingCards(tabu.getCards().size());
        ObjectMapper mapper = new ObjectMapper();
        mapper.writeValue(tmpTabu, tabu);
        Files.move(tmpTabu.toPath(), tabuFile.toPath(), StandardCopyOption.ATOMIC_MOVE);
        tmpTabu.deleteOnExit();
        return tabu;
    }
    /**
     * Method will store the provided food source to filesystem. If the
     * foodsource already had an ID, the foodsource with the id will be located,
     * and overwritten. Otherwise a new ID will be created and setted.
     *
     * @param whoami
     * @return
     */
    public Whoami storeWhoami(Whoami whoami) throws IOException {
        LOGGER.info("Stored whoami game");
        if (whoami == null) {
            throw new IllegalArgumentException("The game to store must not be null");
        }
        if (whoami.getId() == null || whoami.getId().isEmpty()) {
            /* Seems to be a new food source. Generate an ID and set it. */
            whoami.setId(UUID.randomUUID().toString());
        }

        File whoamiFile = new File(getWhoamiGamesStorageFolder(),whoami.getId() + ".json");
        File tmpWhoami = File.createTempFile("whoami", ".tmp", getTmpStorageFolder());
        whoami.setLastModified(new Date());
        ObjectMapper mapper = new ObjectMapper();
        mapper.writeValue(tmpWhoami, whoami);
        Files.move(tmpWhoami.toPath(), whoamiFile.toPath(), StandardCopyOption.ATOMIC_MOVE);
        tmpWhoami.deleteOnExit();
        return whoami;
    }

    public Player storePlayer(Player p) throws IOException {
        if (p == null) {
            throw new IllegalArgumentException("The player to store must not be null");
        }

        if (p.getId() == null || p.getId().isEmpty()) {
            /* Seems to be a new food source. Generate an ID and set it. */
            p.setId(UUID.randomUUID().toString());
        }

        File playerFile = new File(getPlayerStorageFolder(), p.getId() + ".json");
        ObjectMapper mapper = new ObjectMapper();
        mapper.writeValue(playerFile, p);
        return p;
    }

    /**
     * Method which will get the tabu game with the provided id
     *
     * @param id
     * @return
     * @throws IOException
     */
    public Tabu getTabu(String id) throws IOException {
        if (id == null) {
            throw new IllegalArgumentException("The game id to collect must not be null");
        }

        File tabuFile = new File(getTabuGamesStorageFolder(), id + ".json");
        ObjectMapper mapper = new ObjectMapper();
        int tries = 0;
        Boolean read = Boolean.FALSE;
        Tabu returnValue = null;
        while (!read || tries > 5) {
            tries++;
            try {
                returnValue = mapper.readValue(tabuFile, Tabu.class);
                read = Boolean.TRUE;
            } catch (Exception e) {
                LOGGER.warn("Error during read of file: "+e.getMessage());
                try {
                    Thread.sleep(200);
                } catch (InterruptedException ex) {
                    LOGGER.warn("Interprupted during wait");
                }
            }
        }
        LOGGER.info("Read file after "+tries+" tries");
        return returnValue;
    }
    
    /**
     * Method which will get the tabu game with the provided id
     *
     * @param id
     * @return
     * @throws IOException
     */
    public Whoami getWhoami(String id) throws IOException {
        if (id == null) {
            throw new IllegalArgumentException("The game id to collect must not be null");
        }

        File whoamiFile = new File(getWhoamiGamesStorageFolder(), id + ".json");
        ObjectMapper mapper = new ObjectMapper();
        int tries = 0;
        Boolean read = Boolean.FALSE;
        Whoami returnValue = null;
        while (!read || tries > 5) {
            tries++;
            try {
                returnValue = mapper.readValue(whoamiFile, Whoami.class);
                read = Boolean.TRUE;
            } catch (Exception e) {
                LOGGER.warn("Error during read of file: "+e.getMessage());
                try {
                    Thread.sleep(200);
                } catch (InterruptedException ex) {
                    LOGGER.warn("Interprupted during wait");
                }
            }
        }
        LOGGER.info("Read file after "+tries+" tries");
        return returnValue;
    }

    public List<Tabu> getAllTabuGames() throws IOException {
        File storageFolder = getTabuGamesStorageFolder();
        List<Tabu> list = new ArrayList<>();
        for (File f : storageFolder.listFiles(new JsonFileFilter())) {
            list.add(getTabu(f.getName().replace(".json", "")));
        }
        return list;
    }
    
    public List<Whoami> getAllWhoamiGames() throws IOException {
        File storageFolder = getWhoamiGamesStorageFolder();
        List<Whoami> list = new ArrayList<>();
        for (File f : storageFolder.listFiles(new JsonFileFilter())) {
            list.add(getWhoami(f.getName().replace(".json", "")));
        }
        return list;
    }

    /**
     * Method which will get the player with the provided id
     *
     * @param id
     * @return
     * @throws IOException
     */
    public Player getPlayer(String id) throws IOException {
        if (id == null) {
            throw new IllegalArgumentException("The player id to collect must not be null");
        }

        File playerFile = new File(getPlayerStorageFolder(), id + ".json");
        if (!playerFile.exists()) {
            return null;
        }
        ObjectMapper mapper = new ObjectMapper();
        return mapper.readValue(playerFile, Player.class);
    }

    /**
     * Method checks whether the provided folder exists, if not it will be
     * created
     *
     * @param folder
     */
    private void createFolderIfNotExist(File folder) {
        if (!folder.exists()) {
            folder.mkdirs();
        }
    }

    /**
     * Deletes a file or a folder. Try three times in case of an error
     *
     * @param file
     * @return
     */
    public boolean deleteFileOrFolder(File file) {
        int retries = 0;
        Boolean fileDeleted = Boolean.FALSE;

        while (retries < 3 & !fileDeleted) {
            retries = retries + 1;
            try {
                FileUtils.forceDelete(file);
                fileDeleted = Boolean.TRUE;
            } catch (FileNotFoundException fnfe) {
                /* Folder should be deleted, was not there, so it's okay */
                fileDeleted = Boolean.TRUE;
            } catch (IOException ex) {
                LOGGER.error("Unable to delete whole migration data", ex);
                try {
                    Thread.sleep(5000);
                } catch (InterruptedException ex1) {
                    LOGGER.debug("Was interrupted");
                }
            }
        }
        return fileDeleted;
    }

    /**
     *
     * @param is
     * @return
     * @throws IOException
     */
    private static String getStringContentFrom(InputStream is) throws IOException {
        StringBuilder stringBuilder = new StringBuilder();
        try ( InputStreamReader isr = new InputStreamReader(is, StandardCharsets.UTF_8)) {
            char[] buffer = new char[1024];
            stringBuilder = new StringBuilder();
            int length = 0;
            while ((length = isr.read(buffer, 0, buffer.length)) >= 0) {
                stringBuilder.append(buffer, 0, length);
            }
        }

        return stringBuilder.toString();
    }

}
