package com.yourcompany.tasky

import android.Manifest
import android.app.Activity
import android.app.AppOpsManager
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Process
import android.provider.Settings
import android.webkit.JavascriptInterface
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import org.json.JSONObject

/** The page calls this as window.TaskyNative. Register with:  webView.addJavascriptInterface(FocusBridge(this), "TaskyNative")
 *  SECURITY: only load https://YOUR-DOMAIN in this WebView and block every other origin (see shouldOverrideUrlLoading), because any page
 *  loaded in the WebView could call these methods. */
class FocusBridge(private val a: Activity) {

    @JavascriptInterface
    fun getPermissions(): String = JSONObject().apply {
        put("notif", Build.VERSION.SDK_INT < 33 || ContextCompat.checkSelfPermission(a, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED)
        put("dnd", (a.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager).isNotificationPolicyAccessGranted)
        put("usage", usageGranted())
        put("overlay", Settings.canDrawOverlays(a))
    }.toString()

    /** k = notif | dnd | usage | overlay. Opens the right Android screen; the person decides. Nothing is granted silently. */
    @JavascriptInterface
    fun requestPermission(k: String) = a.runOnUiThread {
        when (k) {
            "notif" -> if (Build.VERSION.SDK_INT >= 33) ActivityCompat.requestPermissions(a, arrayOf(Manifest.permission.POST_NOTIFICATIONS), 11)
            "dnd" -> a.startActivity(Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS))
            "usage" -> a.startActivity(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS, Uri.parse("package:" + a.packageName)))
            "overlay" -> a.startActivity(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + a.packageName)))
        }
    }

    @JavascriptInterface
    fun startFocus(minutes: Int) {
        val nm = a.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (nm.isNotificationPolicyAccessGranted)           // only silences notifications; calls from starred contacts and alarms still come through
            nm.setInterruptionFilter(NotificationManager.INTERRUPTION_FILTER_PRIORITY)
        ContextCompat.startForegroundService(a, Intent(a, FocusService::class.java).putExtra("min", minutes.coerceIn(1, 240)))
    }

    @JavascriptInterface
    fun stopFocus() {
        a.stopService(Intent(a, FocusService::class.java))
        val nm = a.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (nm.isNotificationPolicyAccessGranted) nm.setInterruptionFilter(NotificationManager.INTERRUPTION_FILTER_ALL)
    }

    /** Optional: wire AdMob here. Tasky's ads.js calls this when it exists, so the web house ad is skipped in the app. */
    @JavascriptInterface
    fun showInterstitial(where: String) { /* a.runOnUiThread { InterstitialAd.load(...) ; ad.show(a) } */ }

    private fun usageGranted(): Boolean {
        val ops = a.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = ops.unsafeCheckOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), a.packageName)
        return mode == AppOpsManager.MODE_ALLOWED
    }
}
