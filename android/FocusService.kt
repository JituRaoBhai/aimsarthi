package com.yourcompany.tasky

import android.app.*
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.*
import androidx.core.app.NotificationCompat

/** Foreground service for a focus session. Every 3 seconds it checks which app is in front (needs Usage access).
 *  If it is one of DISTRACTING, it brings Tasky back to the front. Phone, contacts, messages for calls, clock and Settings are never touched. */
class FocusService : Service() {
    private val h = Handler(Looper.getMainLooper())
    private var endAt = 0L
    private val DISTRACTING = setOf("com.instagram.android", "com.google.android.youtube", "com.whatsapp", "com.facebook.katana",
        "com.snapchat.android", "com.twitter.android", "com.zhiliaoapp.musically", "in.mohalla.sharechat", "com.reddit.frontpage")

    private val tick = object : Runnable {
        override fun run() {
            if (System.currentTimeMillis() >= endAt) { stopSelf(); return }
            val us = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val now = System.currentTimeMillis()
            val top = us.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, now - 10_000, now).maxByOrNull { it.lastTimeUsed }?.packageName
            if (top != null && top in DISTRACTING)
                startActivity(packageManager.getLaunchIntentForPackage(packageName)?.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_REORDER_TO_FRONT))
            h.postDelayed(this, 3000)
        }
    }

    override fun onStartCommand(i: Intent?, f: Int, id: Int): Int {
        val min = i?.getIntExtra("min", 25) ?: 25
        endAt = System.currentTimeMillis() + min * 60_000L
        val ch = "focus"
        (getSystemService(NOTIFICATION_SERVICE) as NotificationManager).createNotificationChannel(NotificationChannel(ch, "Focus session", NotificationManager.IMPORTANCE_LOW))
        val open = PendingIntent.getActivity(this, 0, packageManager.getLaunchIntentForPackage(packageName), PendingIntent.FLAG_IMMUTABLE)
        startForeground(7, NotificationCompat.Builder(this, ch).setSmallIcon(R.mipmap.ic_launcher).setContentTitle("Focus session running")
            .setContentText("Tasky is helping you stay on track").setContentIntent(open).setOngoing(true).build())
        h.removeCallbacks(tick); h.post(tick)
        return START_NOT_STICKY
    }

    override fun onDestroy() { h.removeCallbacks(tick); super.onDestroy() }
    override fun onBind(i: Intent?): IBinder? = null
}
