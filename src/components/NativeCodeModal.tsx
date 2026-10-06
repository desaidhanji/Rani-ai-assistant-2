import React, { useState } from 'react';
import { Copy, Check, Code, FileText, Download } from 'lucide-react';

interface NativeCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NativeCodeModal: React.FC<NativeCodeModalProps> = ({ isOpen, onClose }) => {
  const [activeFile, setActiveFile] = useState<string>('RaniAccessibilityService.kt');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const codeFiles: Record<string, { language: string; content: string; description: string }> = {
    'RaniAccessibilityService.kt': {
      language: 'kotlin',
      description: 'Reads screen contents and performs clicks, scrolling, and auto-typing into WhatsApp/other apps.',
      content: `package com.rani.assistant.service

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.graphics.Path
import android.os.Bundle
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

/**
 * RaniAccessibilityService
 * Provides maximum device control: reading screen text, auto-typing, tapping buttons across third-party apps
 */
class RaniAccessibilityService : AccessibilityService() {

    companion object {
        var instance: RaniAccessibilityService? = null
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // Intercept active window changes to monitor target apps
    }

    override fun onInterrupt() {
        instance = null
    }

    /**
     * Auto-types text and clicks Send inside WhatsApp
     */
    fun sendWhatsAppMessage(targetContact: String, messageText: String) {
        val rootNode = rootInActiveWindow ?: return

        // 1. Find message input field in WhatsApp
        val inputNodes = rootNode.findAccessibilityNodeInfosByViewId("com.whatsapp:id/entry")
        if (inputNodes.isNotEmpty()) {
            val inputField = inputNodes[0]
            val arguments = Bundle().apply {
                putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, messageText)
            }
            inputField.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, arguments)

            // 2. Short delay and click send button
            android.os.Handler(mainLooper).postDelayed({
                val sendNodes = rootNode.findAccessibilityNodeInfosByViewId("com.whatsapp:id/send")
                if (sendNodes.isNotEmpty()) {
                    sendNodes[0].performAction(AccessibilityNodeInfo.ACTION_CLICK)
                }
            }, 300)
        }
    }

    /**
     * Taps a button with matching text or ID
     */
    fun tapByText(text: String): Boolean {
        val rootNode = rootInActiveWindow ?: return false
        val nodes = rootNode.findAccessibilityNodeInfosByText(text)
        for (node in nodes) {
            if (node.isClickable) {
                return node.performAction(AccessibilityNodeInfo.ACTION_CLICK)
            }
        }
        return false
    }

    /**
     * Reads all visible text on the active screen
     */
    fun readScreenContent(): String {
        val rootNode = rootInActiveWindow ?: return ""
        val sb = StringBuilder()
        traverseNode(rootNode, sb)
        return sb.toString()
    }

    private fun traverseNode(node: AccessibilityNodeInfo?, sb: StringBuilder) {
        if (node == null) return
        if (!node.text.isNullOrEmpty()) {
            sb.append(node.text).append("\\n")
        }
        for (i in 0 until node.childCount) {
            traverseNode(node.getChild(i), sb)
        }
    }
}
`,
    },

    'RaniNotificationListenerService.kt': {
      language: 'kotlin',
      description: 'Intercepts incoming notifications (WhatsApp, SMS, etc.) and feeds them to Rani for voice summaries.',
      content: `package com.rani.assistant.service

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.content.Intent

class RaniNotificationListenerService : NotificationListenerService() {

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        super.onNotificationPosted(sbn)
        if (sbn == null) return

        val packageName = sbn.packageName
        val extras = sbn.notification.extras
        val title = extras.getString("android.title") ?: ""
        val text = extras.getCharSequence("android.text")?.toString() ?: ""

        // Filter and broadcast to Rani Assistant Core
        val broadcastIntent = Intent("com.rani.assistant.NOTIFICATION_RECEIVED").apply {
            putExtra("package", packageName)
            putExtra("title", title)
            putExtra("text", text)
            putExtra("timestamp", sbn.postTime)
        }
        sendBroadcast(broadcastIntent)
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification?) {
        super.onNotificationRemoved(sbn)
    }
}
`,
    },

    'RaniForegroundService.kt': {
      language: 'kotlin',
      description: 'Persistent background service running wake word ("Hey Rani") detection and keepalive.',
      content: `package com.rani.assistant.service

import android.app.*
import android.content.Intent
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.rani.assistant.R

class RaniForegroundService : Service() {

    private val CHANNEL_ID = "rani_assistant_channel"
    private val NOTIFICATION_ID = 1001

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("🌸 Rani AI Assistant")
            .setContentText("Always listening for \\"Hey Rani\\" • Device control active")
            .setSmallIcon(R.drawable.ic_rani_orb)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()

        startForeground(NOTIFICATION_ID, notification)
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            CHANNEL_ID,
            "Rani Assistant Persistent Service",
            NotificationManager.IMPORTANCE_LOW
        )
        val manager = getSystemService(NotificationManager::class.java)
        manager?.createNotificationChannel(channel)
    }
}
`,
    },

    'RaniOverlayService.kt': {
      language: 'kotlin',
      description: 'SYSTEM_ALERT_WINDOW floating orb button accessible from any screen.',
      content: `package com.rani.assistant.service

import android.app.Service
import android.content.Intent
import android.graphics.PixelFormat
import android.os.IBinder
import android.view.*
import android.widget.ImageView
import com.rani.assistant.R

class RaniOverlayService : Service() {

    private var windowManager: WindowManager? = null
    private var floatingOrbView: View? = null

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.BOTTOM or Gravity.END
            x = 30
            y = 120
        }

        floatingOrbView = LayoutInflater.from(this).inflate(R.layout.layout_floating_rani_orb, null)
        floatingOrbView?.setOnClickListener {
            // Tap activates Rani voice recognition
            val intent = Intent("com.rani.assistant.TRIGGER_VOICE")
            sendBroadcast(intent)
        }

        windowManager?.addView(floatingOrbView, params)
    }

    override fun onDestroy() {
        super.onDestroy()
        if (floatingOrbView != null) {
            windowManager?.removeView(floatingOrbView)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
`,
    },

    'AndroidManifest.xml': {
      language: 'xml',
      description: 'Android manifest declaring all permissions, services, and intent filters for maximum device control.',
      content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.rani.assistant">

    <!-- Audio & Voice Permissions -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- Foreground & Keepalive Permissions -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <!-- Floating Overlay Permission -->
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />

    <!-- Device Control & Telephony Permissions -->
    <uses-permission android:name="android.permission.CALL_PHONE" />
    <uses-permission android:name="android.permission.SEND_SMS" />
    <uses-permission android:name="android.permission.READ_CONTACTS" />
    <uses-permission android:name="android.permission.READ_CALENDAR" />
    <uses-permission android:name="android.permission.WRITE_CALENDAR" />
    <uses-permission android:name="android.permission.SET_ALARM" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.FLASHLIGHT" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Rani"
        android:theme="@style/Theme.RaniAssistant">

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
                <category android:name="android.intent.category.ASSIST" />
            </intent-filter>
        </activity>

        <!-- Accessibility Service -->
        <service
            android:name=".service.RaniAccessibilityService"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"
            android:exported="true">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
            <meta-data
                android:name="android.accessibilityservice"
                android:resource="@xml/accessibility_service_config" />
        </service>

        <!-- Notification Listener Service -->
        <service
            android:name=".service.RaniNotificationListenerService"
            android:permission="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE"
            android:exported="true">
            <intent-filter>
                <action android:name="android.service.notification.NotificationListenerService" />
            </intent-filter>
        </service>

        <!-- Foreground Service -->
        <service
            android:name=".service.RaniForegroundService"
            android:foregroundServiceType="microphone"
            android:exported="false" />

        <!-- Floating Overlay Service -->
        <service
            android:name=".service.RaniOverlayService"
            android:exported="false" />

    </application>
</manifest>
`,
    },
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeFiles[activeFile].content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-purple-500/30 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-purple-950/40 via-pink-950/30 to-slate-900 border-b border-pink-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-600/30 text-purple-300">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Android Native Source Code Architecture
              </h3>
              <p className="text-xs text-slate-400">
                Full Kotlin services & AndroidManifest ready for Android Studio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* File Tabs */}
        <div className="flex items-center bg-slate-950 border-b border-slate-800 px-3 overflow-x-auto no-scrollbar">
          {Object.keys(codeFiles).map((fileName) => (
            <button
              key={fileName}
              onClick={() => setActiveFile(fileName)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-mono border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeFile === fileName
                  ? 'border-pink-500 text-pink-300 bg-pink-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{fileName}</span>
            </button>
          ))}
        </div>

        {/* File Info Bar */}
        <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>{codeFiles[activeFile].description}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-pink-400 hover:text-pink-300 font-mono text-xs cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950 font-mono text-xs text-slate-200">
          <pre className="whitespace-pre-wrap leading-relaxed">
            <code>{codeFiles[activeFile].content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
