package de.homuth.games.server;

import java.io.File;
import java.io.FileFilter;

/**
 *
 * @author jhomuth
 */
public class JsonFileFilter implements FileFilter {

    public static final JsonFileFilter INSTANCE = new JsonFileFilter();
    
    @Override
    public boolean accept(File file) {
        if (file.exists() && file.isFile() && file.getName().toLowerCase().endsWith(".json")) {
            return Boolean.TRUE;
        }
        return Boolean.FALSE;
    }

}
