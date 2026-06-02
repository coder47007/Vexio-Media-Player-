package com.neonamp.app;

import android.content.ContentResolver;
import android.database.Cursor;
import android.net.Uri;
import android.provider.MediaStore;
import android.Manifest;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

@CapacitorPlugin(
    name = "MediaScanner",
    permissions = {
        @Permission(
            alias = "storage",
            strings = {
                Manifest.permission.READ_EXTERNAL_STORAGE,
                Manifest.permission.READ_MEDIA_AUDIO
            }
        )
    }
)
public class MediaScannerPlugin extends Plugin {

    @PluginMethod
    public void scanFiles(PluginCall call) {
        if (getPermissionState("storage") != com.getcapacitor.PermissionState.GRANTED) {
            requestPermissionForAlias("storage", call, "storagePermsCallback");
            return;
        }
        
        performScan(call);
    }

    @com.getcapacitor.annotation.PermissionCallback
    public void storagePermsCallback(PluginCall call) {
        if (getPermissionState("storage") == com.getcapacitor.PermissionState.GRANTED) {
            performScan(call);
        } else {
            call.reject("Permission is required to scan media");
        }
    }

    private void performScan(PluginCall call) {
        JSArray songsArray = new JSArray();
        ContentResolver contentResolver = getContext().getContentResolver();
        Uri uri = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI;
        
        String[] projection = {
            MediaStore.Audio.Media._ID,
            MediaStore.Audio.Media.TITLE,
            MediaStore.Audio.Media.ARTIST,
            MediaStore.Audio.Media.ALBUM,
            MediaStore.Audio.Media.DURATION,
            MediaStore.Audio.Media.DATA,
            MediaStore.Audio.Media.IS_MUSIC
        };
        
        // Filter only music files
        String selection = MediaStore.Audio.Media.IS_MUSIC + " != 0";

        try (Cursor cursor = contentResolver.query(uri, projection, selection, null, null)) {
            if (cursor != null && cursor.moveToFirst()) {
                int idColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media._ID);
                int titleColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.TITLE);
                int artistColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ARTIST);
                int albumColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM);
                int durationColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DURATION);
                int dataColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DATA);

                do {
                    long id = cursor.getLong(idColumn);
                    String title = cursor.getString(titleColumn);
                    String artist = cursor.getString(artistColumn);
                    String album = cursor.getString(albumColumn);
                    long durationMs = cursor.getLong(durationColumn);
                    String data = cursor.getString(dataColumn);

                    JSObject song = new JSObject();
                    song.put("id", "native-" + id);
                    song.put("title", title != null ? title : "Unknown Title");
                    song.put("artist", artist != null && !artist.equals("<unknown>") ? artist : "Unknown Artist");
                    song.put("album", album != null ? album : "Unknown Album");
                    song.put("duration", durationMs / 1000.0); // Convert to seconds
                    song.put("path", data); // Absolute file path
                    song.put("addedAt", System.currentTimeMillis());

                    songsArray.put(song);
                } while (cursor.moveToNext());
            }
            
            JSObject result = new JSObject();
            result.put("songs", songsArray);
            call.resolve(result);
            
        } catch (Exception e) {
            call.reject("Failed to scan media: " + e.getMessage());
        }
    }
}
