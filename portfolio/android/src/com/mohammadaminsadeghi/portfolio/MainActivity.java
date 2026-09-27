package com.mohammadaminsadeghi.portfolio;

import android.app.Activity;
import android.content.Intent;
import android.graphics.drawable.ColorDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.view.Window;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

/**
 * The portfolio site, bundled in assets/site and shown full screen.
 *
 * Pages are served from https://appassets.androidplatform.net (a host reserved
 * for app-local content) instead of file://, so web fonts, localStorage, blob:
 * URLs and the 3D model iframes behave exactly as they do on the live site.
 * Anything outside that host (phone, email, Telegram, LinkedIn, the 3D engine
 * CDN) goes to the network or to the matching app.
 */
public class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String START = "https://" + HOST + "/site/index.html";
    private static final int BG = 0xFF0A0B0D;

    private WebView web;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        Window window = getWindow();
        window.setBackgroundDrawable(new ColorDrawable(BG));
        paintSystemBars(window);

        web = new WebView(this);
        web.setBackgroundColor(BG);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        web.setWebViewClient(new AssetClient());
        web.setWebChromeClient(new WebChromeClient());
        setContentView(web);

        if (state == null || web.restoreState(state) == null) web.loadUrl(START);
    }

    /** Dark status and navigation bars (API 21+, called reflectively: compiled against an older SDK). */
    private static void paintSystemBars(Window w) {
        try {
            w.addFlags(0x80000000); // FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS
            Window.class.getMethod("setStatusBarColor", int.class).invoke(w, BG);
            Window.class.getMethod("setNavigationBarColor", int.class).invoke(w, BG);
        } catch (Exception ignored) {
            // older devices keep the system default
        }
    }

    private class AssetClient extends WebViewClient {
        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
            Uri uri = Uri.parse(url);
            if (!HOST.equals(uri.getHost())) return null;
            String path = uri.getPath();
            if (path == null || path.equals("/") || path.equals("/site/")) path = "/site/index.html";
            path = path.substring(1);
            String mime = mimeOf(path);
            try {
                InputStream in = getAssets().open(path);
                return new WebResourceResponse(mime, mime.startsWith("text/") || mime.endsWith("javascript") ? "utf-8" : null, in);
            } catch (IOException e) {
                return new WebResourceResponse("text/plain", "utf-8", new ByteArrayInputStream(new byte[0]));
            }
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            Uri uri = Uri.parse(url);
            if (HOST.equals(uri.getHost())) return false;
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, uri));
            } catch (Exception ignored) {
                // no app can open it
            }
            return true;
        }
    }

    private static String mimeOf(String path) {
        String p = path.toLowerCase();
        if (p.endsWith(".html")) return "text/html";
        if (p.endsWith(".css")) return "text/css";
        if (p.endsWith(".js")) return "application/javascript";
        if (p.endsWith(".json") || p.endsWith(".webmanifest")) return "application/json";
        if (p.endsWith(".webp")) return "image/webp";
        if (p.endsWith(".png")) return "image/png";
        if (p.endsWith(".jpg") || p.endsWith(".jpeg")) return "image/jpeg";
        if (p.endsWith(".svg")) return "image/svg+xml";
        if (p.endsWith(".woff2")) return "font/woff2";
        if (p.endsWith(".txt")) return "text/plain";
        return "application/octet-stream";
    }

    @Override
    public void onBackPressed() {
        if (web != null && web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        if (web != null) web.saveState(out);
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (web != null) web.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) web.onResume();
    }
}
