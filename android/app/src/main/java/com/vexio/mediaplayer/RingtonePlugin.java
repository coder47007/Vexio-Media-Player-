package com.vexio.mediaplayer;

import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.provider.MediaStore;
import android.provider.Settings;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;

@CapacitorPlugin(name = "Ringtone")
public class RingtonePlugin extends Plugin {

    @PluginMethod
    public void setRingtone(PluginCall call) {
        String path = call.getString("path");
        if (path == null) {
            call.reject("Must provide a file path");
            return;
        }

        Context context = getContext();
        
        // Check if we have permission to write settings
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (!Settings.System.canWrite(context)) {
                Intent intent = new Intent(Settings.ACTION_MANAGE_WRITE_SETTINGS);
                intent.setData(Uri.parse("package:" + context.getPackageName()));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(intent);
                call.reject("Permission requested. Try again after granting permission.");
                return;
            }
        }

        try {
            // Path might be a file:// URI or an absolute path
            File ringtoneFile;
            if (path.startsWith("file://")) {
                ringtoneFile = new File(Uri.parse(path).getPath());
            } else {
                ringtoneFile = new File(path);
            }

            ContentValues values = new ContentValues();
            values.put(MediaStore.MediaColumns.DATA, ringtoneFile.getAbsolutePath());
            values.put(MediaStore.MediaColumns.TITLE, ringtoneFile.getName());
            values.put(MediaStore.MediaColumns.MIME_TYPE, "audio/mpeg");
            values.put(MediaStore.Audio.Media.IS_RINGTONE, true);
            values.put(MediaStore.Audio.Media.IS_NOTIFICATION, false);
            values.put(MediaStore.Audio.Media.IS_ALARM, false);
            values.put(MediaStore.Audio.Media.IS_MUSIC, false);

            // Need to handle Android 10+ scoped storage limits?
            // Actually MediaStore insertion works if the file is in public directories.
            
            Uri uri = MediaStore.Audio.Media.getContentUriForPath(ringtoneFile.getAbsolutePath());
            Uri newUri = context.getContentResolver().insert(uri, values);

            if (newUri != null) {
                RingtoneManager.setActualDefaultRingtoneUri(
                        context,
                        RingtoneManager.TYPE_RINGTONE,
                        newUri
                );
            } else {
                // If insertion fails, it might already exist, try to use the direct file URI
                RingtoneManager.setActualDefaultRingtoneUri(
                        context,
                        RingtoneManager.TYPE_RINGTONE,
                        Uri.fromFile(ringtoneFile)
                );
            }

            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to set ringtone: " + e.getMessage());
        }
    }
}
