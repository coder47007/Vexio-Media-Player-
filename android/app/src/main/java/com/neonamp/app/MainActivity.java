package com.neonamp.app;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(RingtonePlugin.class);
        registerPlugin(MediaScannerPlugin.class);
        super.onCreate(savedInstanceState);
        
        WebView webView = this.bridge.getWebView();
        webView.getSettings().setMediaPlaybackRequiresUserGesture(false);
    }
}
