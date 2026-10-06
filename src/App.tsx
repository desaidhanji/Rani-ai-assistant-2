/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  ShieldCheck,
  Code,
  Radio,
  Layers,
  Sparkles,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  Eye,
  BatteryCharging,
  Zap,
  Download,
  Volume2,
  BookOpen,
} from 'lucide-react';
import { RaniOrb } from './components/RaniOrb';
import { ChatView } from './components/ChatView';
import { DeviceSimulator } from './components/DeviceSimulator';
import { PermissionsModal } from './components/PermissionsModal';
import { CallScreenModal } from './components/CallScreenModal';
import { FloatingOverlay } from './components/FloatingOverlay';
import { NativeCodeModal } from './components/NativeCodeModal';
import { AIToolsModal } from './components/AIToolsModal';
import { ElevenLabsVoiceModal } from './components/ElevenLabsVoiceModal';
import { KnowledgeModal } from './components/KnowledgeModal';
import { BatteryOptimizationModal } from './components/BatteryOptimizationModal';
import { MediaProjectionPermissionModal } from './components/MediaProjectionPermissionModal';
import { ScreenVisionOverlay } from './components/ScreenVisionOverlay';
import { QuickConfirmationBanner } from './components/QuickConfirmationBanner';
import { InstallModal } from './components/InstallModal';
import { raniTTS } from './services/ttsService';
import { raniSTT } from './services/sttService';
import { deviceService } from './services/deviceService';
import { vaultService } from './services/vaultService';
import {
  Message,
  DeviceState,
  PermissionItem,
  ContactItem,
  EmotionType,
  PendingActionConfirmation,
  ScreenVisionState,
} from './types';

const INITIAL_PERMISSIONS: PermissionItem[] = [
  {
    id: 'perm_mic',
    name: 'Microphone & Low-Power VAD',
    androidPermission: 'RECORD_AUDIO',
    description: 'Enables real-time speech recognition and 24/7 low-power wake word listening.',
    raniReason: 'Taki main aapki pyari awaz sun kar samajh sakoon 💕',
    granted: true,
    category: 'core',
    icon: 'mic',
  },
  {
    id: 'perm_access',
    name: 'Accessibility Service',
    androidPermission: 'BIND_ACCESSIBILITY_SERVICE',
    description: 'Reads screen contents and performs clicks & auto-typing in WhatsApp, shopping and other apps.',
    raniReason: 'WhatsApp pe Mom ko message bhejna ho ya apps tap karna ho, ye permission magic karti hai!',
    granted: true,
    category: 'accessibility',
    icon: 'accessibility',
  },
  {
    id: 'perm_projection',
    name: 'Screen Vision (MediaProjection)',
    androidPermission: 'MEDIA_PROJECTION',
    description: 'Captures on-demand screenshots so Rani visually understands screens with Gemini Vision.',
    raniReason: '"Isme se sabse sasta wala select karo" jaise commands ke liye screen dekhne me madad karti hai!',
    granted: true,
    category: 'vision',
    icon: 'eye',
  },
  {
    id: 'perm_notif',
    name: 'Notification Listener',
    androidPermission: 'BIND_NOTIFICATION_LISTENER_SERVICE',
    description: 'Intercepts incoming notifications to summarize or respond to them via voice.',
    raniReason: 'Taki aane wale urgent messages aur calls main aapko bol kar suna sakoon.',
    granted: true,
    category: 'system',
    icon: 'notification',
  },
  {
    id: 'perm_overlay',
    name: 'Floating Window Overlay',
    androidPermission: 'SYSTEM_ALERT_WINDOW',
    description: 'Displays a floating Rani orb button over other apps from any screen.',
    raniReason: 'Taki kisi bhi screen par meri choti si glowing orb aapke sath rahe!',
    granted: true,
    category: 'system',
    icon: 'overlay',
  },
  {
    id: 'perm_phone',
    name: 'Direct Phone Calls',
    androidPermission: 'CALL_PHONE',
    description: 'Initiates direct phone calls to contacts via voice commands.',
    raniReason: 'Aapki voice command par turant direct phone calls connect karne ke liye.',
    granted: true,
    category: 'personal',
    icon: 'phone',
  },
  {
    id: 'perm_sms',
    name: 'SMS Messaging',
    androidPermission: 'SEND_SMS',
    description: 'Composes and sends text SMS messages hands-free.',
    raniReason: 'Aapki command par quick SMS send karne ke liye.',
    granted: true,
    category: 'personal',
    icon: 'sms',
  },
  {
    id: 'perm_contacts',
    name: 'Contacts Access',
    androidPermission: 'READ_CONTACTS',
    description: 'Accesses phonebook to recognize contacts like "Mom", "Rahul", etc.',
    raniReason: '"Call Rahul" ya "Message Mom" me contact number pehchan ne ke liye.',
    granted: true,
    category: 'personal',
    icon: 'contacts',
  },
];

export default function App() {
  const [userName, setUserName] = useState<string>('Dost');
  const [orbState, setOrbState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>('caring');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Modals
  const [showPermissionsModal, setShowPermissionsModal] = useState<boolean>(false);
  const [showNativeCodeModal, setShowNativeCodeModal] = useState<boolean>(false);
  const [showAIToolsModal, setShowAIToolsModal] = useState<boolean>(false);
  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);
  const [showKnowledgeModal, setShowKnowledgeModal] = useState<boolean>(false);
  const [currentVoiceName, setCurrentVoiceName] = useState<string>(() => vaultService.getSelectedVoiceName());
  const [showBatteryModal, setShowBatteryModal] = useState<boolean>(false);
  const [showMediaProjectionModal, setShowMediaProjectionModal] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);

  // Smart friction & confirmations
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingActionConfirmation | null>(null);

  // Screen Vision State
  const [visionState, setVisionState] = useState<ScreenVisionState>({
    isWatching: false,
    permissionGranted: true,
    analyzing: false,
  });

  const [permissions, setPermissions] = useState<PermissionItem[]>(INITIAL_PERMISSIONS);
  const [activeCallContact, setActiveCallContact] = useState<ContactItem | null>(null);
  const [lastAccessibilityAction, setLastAccessibilityAction] = useState<{
    app: string;
    action: string;
    details: string;
    recipient?: string;
    timestamp: number;
  } | null>(null);

  const [deviceState, setDeviceState] = useState<DeviceState>({
    flashlight: false,
    wifi: true,
    bluetooth: true,
    volume: 80,
    dnd: false,
    mediaPlaying: false,
    foregroundServiceActive: true,
    wakeWordActive: false,
    alwaysListening24x7: false,
    overlayActive: false,
    batteryOptimized: false, // unrestricted = good for 24/7
  });

  const [mobileTab, setMobileTab] = useState<'rani' | 'device'>('rani');
  const hasGreetedRef = useRef(false);

  // Initial greeting
  useEffect(() => {
    if (!hasGreetedRef.current) {
      hasGreetedRef.current = true;
      const initialGreeting = `Hey ${userName}! Rani here, kaam bata do 💕`;
      const initialMsg: Message = {
        id: `msg_${Date.now()}`,
        role: 'model',
        content: initialGreeting,
        timestamp: new Date().toISOString(),
        detectedLanguage: 'hi-IN',
        emotion: 'caring',
      };
      setMessages([initialMsg]);

      // Check if user has first launch permission done
      const hasOnboarded = localStorage.getItem('rani_onboarded_v2');
      if (!hasOnboarded) {
        setShowPermissionsModal(true);
        localStorage.setItem('rani_onboarded_v2', 'true');
      }

      // Warm voice greeting with sweet intonation
      setTimeout(() => {
        raniTTS.speak(initialGreeting, {
          language: 'hi-IN',
          emotion: 'caring',
          onStart: () => setOrbState('speaking'),
          onEnd: () => setOrbState('idle'),
          onError: () => setOrbState('idle'),
        });
      }, 700);
    }
  }, [userName]);

  // Handle incoming voice recognition text
  const handleUserSpeech = (transcript: string) => {
    raniSTT.stopListening();
    if (!transcript.trim()) {
      setOrbState('idle');
      return;
    }

    // Check if waiting for smart friction confirmation
    if (pendingConfirmation) {
      handleConfirmationSpeech(transcript.trim());
      return;
    }

    // Check if voice command triggers screen vision
    const lower = transcript.toLowerCase();
    if (
      lower.includes('install') ||
      lower.includes('download') ||
      lower.includes('kaise install kare') ||
      lower.includes('phone me kaise dale')
    ) {
      setShowInstallModal(true);
      const installReply = "Rani ko install karna bahut easy hai! Maine installation guide open kar di hai 💕";
      setOrbState('speaking');
      raniTTS.speak(installReply, {
        emotion: 'happy',
        onEnd: () => setOrbState('idle'),
      });
      return;
    }

    if (
      lower.includes('sasta') ||
      lower.includes('cheapest') ||
      lower.includes('screen dekho') ||
      lower.includes('screen vision') ||
      lower.includes('what is on screen')
    ) {
      triggerScreenVisionAnalysis(transcript.trim());
      return;
    }

    processMessage(transcript.trim());
  };

  // Smart friction verbal confirmation check
  const handleConfirmationSpeech = (speech: string) => {
    const text = speech.toLowerCase();
    const yesPattern = /\b(haan|yes|theek hai|bhej do|kardo|confirm|kar do|sure|proceed)\b/i;
    const noPattern = /\b(cancel|nahi|na|mat karo|ruk jao|rehne do|no|stop)\b/i;

    if (yesPattern.test(text)) {
      confirmPendingAction();
    } else if (noPattern.test(text)) {
      cancelPendingAction();
    } else {
      // Re-prompt user
      raniTTS.speak("Maine theek se suna nahi. Bas 'haan' ya 'cancel' boliye na 💕", {
        emotion: 'concerned',
      });
    }
  };

  // Confirm high-risk action
  const confirmPendingAction = async () => {
    if (!pendingConfirmation) return;
    const action = pendingConfirmation;
    setPendingConfirmation(null);

    let confirmationFeedback = 'Ji, kaam ho gaya!';
    let actionResult: Message['action'] = undefined;

    if (action.type === 'payment') {
      actionResult = {
        name: 'sendPayment',
        args: action.payload,
        status: 'success',
        details: `₹${action.payload.amount} sent to ${action.payload.recipient}`,
      };
      confirmationFeedback = `Arrey waah! ${action.payload.recipient} ko ₹${action.payload.amount} bhej diye gaye hain! 🎉`;
    } else if (action.type === 'send_message') {
      actionResult = {
        name: 'sendWhatsAppMessage',
        args: action.payload,
        status: 'success',
        details: `Message sent to ${action.payload.recipient}`,
      };
      setLastAccessibilityAction({
        app: 'WhatsApp',
        action: 'auto_type_and_send',
        details: action.payload.message,
        recipient: action.payload.recipient,
        timestamp: Date.now(),
      });
      confirmationFeedback = `Ji! ${action.payload.recipient} ko WhatsApp message bhej diya hai 💕`;
    } else if (action.type === 'delete') {
      actionResult = {
        name: 'deleteData',
        args: action.payload,
        status: 'success',
        details: `Deleted ${action.payload.targetId}`,
      };
      confirmationFeedback = `Theek hai, ${action.payload.targetId} ko delete kar diya gaya hai.`;
    } else if (action.type === 'make_call') {
      const contact = deviceService.findContact(action.payload.contactName) || {
        id: `c_${Date.now()}`,
        name: action.payload.contactName,
        phone: action.payload.phoneNumber || '+91 98765 43210',
        relation: 'Contact',
        avatar: '📞',
      };
      setActiveCallContact(contact);
      confirmationFeedback = `${contact.name} ko call mila rahi hoon...`;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `asst_conf_${Date.now()}`,
        role: 'model',
        content: confirmationFeedback,
        timestamp: new Date().toISOString(),
        action: actionResult,
        emotion: 'excited',
      },
    ]);

    setOrbState('speaking');
    setCurrentEmotion('excited');
    raniTTS.speak(confirmationFeedback, {
      emotion: 'excited',
      onEnd: () => setOrbState('idle'),
      onError: () => setOrbState('idle'),
    });
  };

  // Cancel high-risk action
  const cancelPendingAction = () => {
    setPendingConfirmation(null);
    const cancelMsg = "Theek hai ji, maine request cancel kar di hai. Koi problem nahi! 💕";
    setMessages((prev) => [
      ...prev,
      {
        id: `asst_cancel_${Date.now()}`,
        role: 'model',
        content: cancelMsg,
        timestamp: new Date().toISOString(),
        emotion: 'calm',
      },
    ]);
    setOrbState('speaking');
    setCurrentEmotion('calm');
    raniTTS.speak(cancelMsg, {
      emotion: 'calm',
      onEnd: () => setOrbState('idle'),
      onError: () => setOrbState('idle'),
    });
  };

  // Toggle mic for voice input
  const handleMicToggle = () => {
    if (orbState === 'listening') {
      raniSTT.stopListening();
      setOrbState('idle');
    } else {
      deviceService.playChime();
      raniTTS.stop();
      setOrbState('listening');

      raniSTT.startListening({
        onStart: () => setOrbState('listening'),
        onResult: (transcript, isFinal) => {
          if (isFinal) {
            handleUserSpeech(transcript);
          }
        },
        onError: (err) => {
          console.warn('STT Error:', err);
          setOrbState('idle');
        },
        onEnd: () => {
          setOrbState((prev) => (prev === 'listening' ? 'idle' : prev));
        },
      });
    }
  };

  // 24/7 Always-Listening Toggle with Low-Power VAD
  const handleToggle24x7 = () => {
    const nextState = !deviceState.alwaysListening24x7;
    setDeviceState((prev) => ({
      ...prev,
      alwaysListening24x7: nextState,
      wakeWordActive: nextState,
    }));

    if (nextState) {
      // Guide user to battery optimization if not already done
      if (deviceState.batteryOptimized) {
        setShowBatteryModal(true);
      }

      deviceService.playChime();
      const wakePrompt =
        'Rani 24/7 Always-Listening Active! Foreground Service is keeping me awake in background 💕';
      raniTTS.speak(wakePrompt, { emotion: 'excited' });

      // Start continuous low-power wake word listening
      raniSTT.startListening(
        {
          onWakeWord: () => {
            deviceService.playChime();
            const promptWake = 'Haanji! Rani sun rahi hoon, boliye na 💕';
            raniTTS.speak(promptWake, {
              language: 'hi-IN',
              emotion: 'caring',
              onStart: () => setOrbState('speaking'),
              onEnd: () => {
                handleMicToggle();
              },
            });
          },
        },
        true // wake word only
      );
    } else {
      raniSTT.stopListening();
      raniTTS.speak('24/7 always listening stopped.', { emotion: 'calm' });
    }
  };

  // Toggle standard "Hey Rani" wake word mode
  const handleToggleWakeWord = () => {
    const nextState = !deviceState.wakeWordActive;
    setDeviceState((prev) => ({ ...prev, wakeWordActive: nextState }));

    if (nextState) {
      raniSTT.startListening(
        {
          onWakeWord: () => {
            deviceService.playChime();
            const promptWake = 'Haanji! Rani sun rahi hoon, boliye na 💕';
            raniTTS.speak(promptWake, {
              language: 'hi-IN',
              emotion: 'caring',
              onStart: () => setOrbState('speaking'),
              onEnd: () => {
                handleMicToggle();
              },
            });
          },
        },
        true
      );
    } else {
      raniSTT.stopListening();
    }
  };

  // SCREEN VISION: "See + Act"
  const triggerScreenVisionAnalysis = async (userPrompt: string = 'isme se sabse sasta wala select karo') => {
    if (!visionState.permissionGranted) {
      setShowMediaProjectionModal(true);
      return;
    }

    setVisionState((prev) => ({ ...prev, isWatching: true, analyzing: true }));
    setOrbState('thinking');
    setIsProcessing(true);

    // Append user query in chat
    setMessages((prev) => [
      ...prev,
      {
        id: `usr_vis_${Date.now()}`,
        role: 'user',
        content: userPrompt,
        timestamp: new Date().toISOString(),
      },
    ]);

    try {
      // Capture screenshot canvas of the simulated phone screen
      const phoneElement = document.getElementById('rani-device-phone-screen');
      let base64Image = '';

      if (phoneElement) {
        const canvas = document.createElement('canvas');
        canvas.width = 420;
        canvas.height = 680;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Draw simulated screen frame with shopping items for Gemini multimodal inspection
          ctx.fillStyle = '#020617';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Simulated phone UI items
          ctx.fillStyle = '#0f172a';
          ctx.roundRect(16, 20, 388, 70, 12);
          ctx.fill();
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 16px sans-serif';
          ctx.fillText('Zepto / Blinkit Quick Shopping', 30, 48);

          // Items
          const mockItems = [
            { name: 'True Wireless ANC Earbuds', price: '₹1,499', color: '#1e293b' },
            { name: 'Ultra-Clear Silicon Phone Case (Lowest)', price: '₹199', color: '#0369a1' },
            { name: 'Cotton Crewneck T-Shirt', price: '₹399', color: '#1e293b' },
            { name: 'Smart AMOLED Fitness Watch', price: '₹2,499', color: '#1e293b' },
            { name: 'Braided Fast-Charging USB-C Cable', price: '₹249', color: '#1e293b' },
          ];

          let y = 110;
          for (const item of mockItems) {
            ctx.fillStyle = item.color;
            ctx.roundRect(16, y, 388, 85, 12);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 15px sans-serif';
            ctx.fillText(item.name, 32, y + 36);
            ctx.fillStyle = '#4ade80';
            ctx.font = 'bold 18px monospace';
            ctx.fillText(item.price, 32, y + 66);
            y += 100;
          }

          base64Image = canvas.toDataURL('image/jpeg', 0.85);
        }
      }

      // Call vision endpoint
      const response = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Image,
          userPrompt,
          screenContext: 'E-Commerce Shopping Catalog',
          itemsList: [
            { name: 'True Wireless ANC Earbuds', price: 1499 },
            { name: 'Ultra-Clear Silicon Phone Case', price: 199 },
            { name: 'Cotton Crewneck T-Shirt', price: 399 },
            { name: 'Smart AMOLED Fitness Watch', price: 2499 },
            { name: 'Braided Fast-Charging USB-C Cable', price: 249 },
          ],
        }),
      });

      const visionData = await response.json();
      setIsProcessing(false);

      const detectedEmotion: EmotionType = visionData.emotion || 'happy';
      setCurrentEmotion(detectedEmotion);

      setVisionState((prev) => ({
        ...prev,
        isWatching: true,
        analyzing: false,
        lastScreenshot: base64Image,
        detectedAction: {
          target: visionData.selectedItem || 'Phone Case (₹199)',
          reason: visionData.reason || 'Lowest price found on screen',
        },
      }));

      // Trigger accessibility action on the phone simulator
      setLastAccessibilityAction({
        app: 'ScreenVision',
        action: 'select_item',
        details: visionData.selectedItem || 'Phone Case ₹199',
        timestamp: Date.now(),
      });

      // Append assistant vision response
      const spoken =
        visionData.spokenReply ||
        `Maine screen dekh li! Sabse sasta item "${visionData.selectedItem}" hai, maine ise select kar diya hai! 💕`;

      setMessages((prev) => [
        ...prev,
        {
          id: `asst_vis_${Date.now()}`,
          role: 'model',
          content: spoken,
          timestamp: new Date().toISOString(),
          emotion: detectedEmotion,
          action: {
            name: 'screenAction',
            args: { targetText: visionData.selectedItem || 'Phone Case ₹199', action: 'tap' },
            status: 'success',
            details: `Vision tapped ${visionData.selectedItem}`,
          },
        },
      ]);

      // Speak with emotion
      setOrbState('speaking');
      raniTTS.speak(spoken, {
        emotion: detectedEmotion,
        onEnd: () => setOrbState('idle'),
        onError: () => setOrbState('idle'),
      });
    } catch (err: any) {
      console.error('Screen vision error:', err);
      setIsProcessing(false);
      setOrbState('idle');
      setVisionState((prev) => ({ ...prev, isWatching: false, analyzing: false }));
    }
  };

  // Send message to Gemini API backend
  const processMessage = async (userInput: string) => {
    const userMsgId = `usr_${Date.now()}`;
    const newMessages: Message[] = [
      ...messages,
      {
        id: userMsgId,
        role: 'user',
        content: userInput,
        timestamp: new Date().toISOString(),
      },
    ];
    setMessages(newMessages);
    setIsProcessing(true);
    setOrbState('thinking');

    // Retrieve active brain plugin if configured
    const activeBrainPlugin = vaultService.getActiveBrainPlugin();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userInput,
          userName,
          conversationHistory: newMessages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          deviceState,
          activeBrainPlugin,
        }),
      });

      const data = await response.json();
      setIsProcessing(false);

      if (data.error && !data.fallbackReply) {
        throw new Error(data.error);
      }

      const reply = data.reply || data.fallbackReply || 'Ji! Kaam ho gaya 💕';
      const functionCalls = data.functionCalls || [];
      const emotion: EmotionType = data.emotion || 'caring';
      setCurrentEmotion(emotion);

      // Check Smart Friction for high-risk action
      if (data.highRiskPending) {
        setPendingConfirmation(data.highRiskPending);

        const confirmMsg: Message = {
          id: `asst_${Date.now()}`,
          role: 'model',
          content: reply,
          timestamp: data.timestamp || new Date().toISOString(),
          detectedLanguage: data.detectedLanguage || 'hi-IN',
          emotion: 'concerned',
          highRiskPending: data.highRiskPending,
        };

        setMessages((prev) => [...prev, confirmMsg]);
        setOrbState('speaking');

        raniTTS.speak(reply, {
          language: data.detectedLanguage || 'hi-IN',
          emotion: 'concerned',
          onStart: () => setOrbState('speaking'),
          onEnd: () => {
            setOrbState('idle');
            // Listen for quick verbal "haan" or "cancel"
            handleMicToggle();
          },
          onError: () => setOrbState('idle'),
        });
        return;
      }

      // Execute low-risk tools immediately with zero friction
      let actionResult: Message['action'] = undefined;
      for (const fc of functionCalls) {
        actionResult = await executeToolAction(fc.name, fc.args);
      }

      // Append assistant response
      const assistantMsg: Message = {
        id: `asst_${Date.now()}`,
        role: 'model',
        content: reply,
        timestamp: data.timestamp || new Date().toISOString(),
        detectedLanguage: data.detectedLanguage || 'hi-IN',
        emotion,
        action: actionResult,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Speak response in Rani's warm voice with dynamic emotional prosody
      setOrbState('speaking');
      raniTTS.speak(reply, {
        language: data.detectedLanguage || 'hi-IN',
        emotion,
        onStart: () => setOrbState('speaking'),
        onEnd: () => {
          setOrbState('idle');
          if (deviceState.wakeWordActive || deviceState.alwaysListening24x7) {
            handleToggleWakeWord();
          }
        },
        onError: () => setOrbState('idle'),
      });
    } catch (err: any) {
      console.error('Process error:', err);
      setIsProcessing(false);
      setOrbState('idle');

      const fallback =
        'Thoda sa network issue ho gaya lagta hai, par main aapke sath hoon! Phir se boliye please 💕';
      setMessages((prev) => [
        ...prev,
        {
          id: `asst_err_${Date.now()}`,
          role: 'model',
          content: fallback,
          timestamp: new Date().toISOString(),
          emotion: 'concerned',
        },
      ]);
      raniTTS.speak(fallback, { language: 'hi-IN', emotion: 'concerned' });
    }
  };

  // Execute Gemini low-risk tool calls on simulated Android device
  const executeToolAction = async (toolName: string, args: any): Promise<Message['action']> => {
    switch (toolName) {
      case 'setAlarm': {
        const time = args.time || '07:00';
        const label = args.label || 'Rani Reminder';
        deviceService.addAlarm(time, label, args.days || ['Daily']);
        return {
          name: 'setAlarm',
          args: { time, label },
          status: 'success',
          details: `Alarm set for ${time}`,
        };
      }

      case 'screenAction': {
        setLastAccessibilityAction({
          app: 'ScreenVision',
          action: args.action || 'select_item',
          details: args.targetText || 'Phone Case ₹199',
          timestamp: Date.now(),
        });
        return {
          name: 'screenAction',
          args,
          status: 'success',
          details: `Screen tap on ${args.targetText}`,
        };
      }

      case 'sendWhatsAppMessage': {
        const recipient = args.recipient || 'Mom';
        const message = args.message || 'Hey';
        setLastAccessibilityAction({
          app: 'WhatsApp',
          action: 'auto_type_and_send',
          details: message,
          recipient,
          timestamp: Date.now(),
        });
        return {
          name: 'sendWhatsAppMessage',
          args: { recipient, message },
          status: 'success',
          details: `AccessibilityService sent message to ${recipient}`,
        };
      }

      case 'makePhoneCall': {
        const contactName = args.contactName || 'Mom';
        const contact = deviceService.findContact(contactName) || {
          id: `c_${Date.now()}`,
          name: contactName,
          phone: args.phoneNumber || '+91 98765 43210',
          relation: 'Contact',
          avatar: '📞',
        };
        setActiveCallContact(contact);
        return {
          name: 'makePhoneCall',
          args: { contactName: contact.name, phoneNumber: contact.phone },
          status: 'success',
          details: `Calling ${contact.name}`,
        };
      }

      case 'sendSMS': {
        return {
          name: 'sendSMS',
          args,
          status: 'success',
          details: `SMS prepared for ${args.contactName}`,
        };
      }

      case 'toggleDeviceSetting': {
        const setting = args.setting;
        const state = !!args.state;
        if (setting === 'flashlight') {
          await deviceService.toggleFlashlight(state);
          setDeviceState((prev) => ({ ...prev, flashlight: state }));
        } else if (setting === 'wifi') {
          setDeviceState((prev) => ({ ...prev, wifi: state }));
        } else if (setting === 'bluetooth') {
          setDeviceState((prev) => ({ ...prev, bluetooth: state }));
        } else if (setting === 'volume' && typeof args.level === 'number') {
          setDeviceState((prev) => ({ ...prev, volume: args.level }));
        }
        return {
          name: 'toggleDeviceSetting',
          args,
          status: 'success',
          details: `${setting} set to ${state}`,
        };
      }

      case 'controlMedia': {
        const action = args.action;
        const isPlaying = action === 'play' || action === 'next';
        deviceService.toggleMusic(isPlaying);
        setDeviceState((prev) => ({ ...prev, mediaPlaying: isPlaying }));
        return {
          name: 'controlMedia',
          args,
          status: 'success',
          details: `Media action: ${action}`,
        };
      }

      case 'manageCalendar': {
        if (args.action === 'create' && args.title) {
          deviceService.addCalendarEvent(
            args.title,
            args.date || 'Today',
            args.time || '15:00',
            'Calendar'
          );
        }
        return {
          name: 'manageCalendar',
          args,
          status: 'success',
          details: 'Calendar updated',
        };
      }

      case 'readNotifications': {
        return {
          name: 'readNotifications',
          args,
          status: 'success',
          details: 'Read notifications via voice',
        };
      }

      case 'openApp': {
        return {
          name: 'openApp',
          args,
          status: 'success',
          details: `Opened ${args.appName}`,
        };
      }

      default:
        return undefined;
    }
  };

  // Grant all permissions
  const handleGrantAllPermissions = () => {
    setPermissions((prev) => prev.map((p) => ({ ...p, granted: true })));
    raniTTS.speak(
      'Shukriya! Saari permissions grant ho gayi hain. Ab main aapke phone ka poora khayal rakh sakti hoon 💕',
      { emotion: 'excited' }
    );
  };

  const handleTogglePermission = (id: string) => {
    setPermissions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, granted: !p.granted } : p))
    );
  };

  const handlePlayPermissionReason = (reason: string) => {
    raniTTS.speak(reason, { language: 'hi-IN', emotion: 'caring' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-pink-500/30">
      {/* Top App Bar */}
      <header className="bg-slate-950/80 backdrop-blur-xl border-b border-pink-500/20 px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-500 p-0.5 shadow-lg shadow-pink-500/30 flex items-center justify-center">
              <span className="text-xl">🌸</span>
            </div>
            <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold bg-gradient-to-r from-pink-300 via-fuchsia-200 to-purple-200 bg-clip-text text-transparent">
                Rani AI Assistant
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/30 font-medium">
                Native Android Companion
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Multilingual (Hindi • English • Gujarati • Hinglish)
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* 24/7 Always-Listening Foreground Toggle */}
          <button
            onClick={handleToggle24x7}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              deviceState.alwaysListening24x7
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title="24/7 Foreground Service low-power wake word"
          >
            <Radio
              className={`w-3.5 h-3.5 ${
                deviceState.alwaysListening24x7
                  ? 'text-emerald-400 animate-pulse'
                  : 'text-slate-500'
              }`}
            />
            <span>24/7 "Hey Rani"</span>
          </button>

          {/* Knowledge Base Button */}
          <button
            onClick={() => setShowKnowledgeModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/40 text-xs text-indigo-200 font-medium transition-all shadow-md shadow-indigo-500/10 cursor-pointer"
            title="Public APIs GitHub Knowledge Source (2,000+ APIs)"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Knowledge:</span>
            <span className="font-bold text-indigo-300">Public APIs</span>
          </button>

          {/* AI Tools Plugin Button */}
          <button
            onClick={() => setShowAIToolsModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-xs text-purple-200 font-medium transition-all shadow-md cursor-pointer"
            title="AI Tools & Plugins (OpenAI, Claude, Groq, Perplexity)"
          >
            <span className="text-sm">🔌</span>
            <span className="hidden md:inline">AI Tools</span>
          </button>

          {/* ElevenLabs Hindi Female Voice Actors Button */}
          <button
            onClick={() => setShowVoiceModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-950/60 via-purple-950/50 to-rose-950/60 hover:from-pink-900/70 hover:to-purple-900/70 border border-pink-500/40 text-xs text-pink-200 font-medium transition-all shadow-md shadow-pink-500/10 cursor-pointer"
            title="Choose from sweet Hindi Female Voice Actors"
          >
            <Volume2 className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline">Hindi Voice:</span>
            <span className="font-bold text-pink-300">{currentVoiceName}</span>
          </button>

          {/* Screen Vision Button */}
          <button
            onClick={() => triggerScreenVisionAnalysis('isme se sabse sasta wala select karo')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 text-xs text-cyan-200 font-medium transition-all cursor-pointer"
            title="Screen Vision (MediaProjection)"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">Screen Vision</span>
          </button>

          {/* Battery Optimization Guide */}
          <button
            onClick={() => setShowBatteryModal(true)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
            title="24/7 Battery Optimization Settings"
          >
            <BatteryCharging className="w-3.5 h-3.5 text-amber-400" />
          </button>

          {/* Permissions Dashboard */}
          <button
            onClick={() => setShowPermissionsModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Permissions</span>
            <span className="text-[10px] px-1.5 rounded bg-emerald-500/20 text-emerald-300">
              {permissions.filter((p) => p.granted).length}/8
            </span>
          </button>

          {/* Android Kotlin Source Code */}
          <button
            onClick={() => setShowNativeCodeModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-900/60 to-pink-900/60 hover:from-purple-800/80 hover:to-pink-800/80 border border-pink-500/30 text-xs text-pink-200 font-medium transition-all shadow-md cursor-pointer"
          >
            <Code className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline">Kotlin Code</span>
          </button>

          {/* Install App Button */}
          <button
            onClick={() => setShowInstallModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-xs text-white font-bold transition-all shadow-lg shadow-pink-600/30 cursor-pointer"
            title="Install Rani App on Phone or PC"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex items-center bg-slate-900 border-b border-pink-500/20 px-4 py-2 gap-2">
        <button
          onClick={() => setMobileTab('rani')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mobileTab === 'rani'
              ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
              : 'text-slate-400'
          }`}
        >
          🌸 Rani Voice Assistant
        </button>
        <button
          onClick={() => setMobileTab('device')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mobileTab === 'device'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400'
          }`}
        >
          📱 Device & Shopping Screen
        </button>
      </div>

      {/* Main Grid: Rani Assistant (Left) & Simulated Android Phone (Right) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-hidden">
        {/* LEFT COLUMN: Rani Voice Core & Chat (7 Cols on desktop) */}
        <section
          className={`lg:col-span-7 flex flex-col gap-4 h-[calc(100vh-130px)] lg:h-[calc(100vh-110px)] ${
            mobileTab === 'rani' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Top Orb Widget Area */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950/80 border border-pink-500/20 backdrop-blur-xl shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 right-1/4 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Glowing animated Rani Orb with dynamic emotional aura */}
            <RaniOrb
              state={orbState}
              emotion={currentEmotion}
              onEmotionChange={(em) => setCurrentEmotion(em)}
              onClick={handleMicToggle}
              isWakeWordActive={deviceState.wakeWordActive}
              is24x7Active={deviceState.alwaysListening24x7}
              isWatchingScreen={visionState.isWatching}
            />
          </div>

          {/* Chat History View */}
          <div className="flex-1 overflow-hidden">
            <ChatView
              messages={messages}
              onSpeakAgain={(text, lang, emotion) => {
                setOrbState('speaking');
                raniTTS.speak(text, {
                  language: lang,
                  emotion: emotion || currentEmotion,
                  onStart: () => setOrbState('speaking'),
                  onEnd: () => setOrbState('idle'),
                  onError: () => setOrbState('idle'),
                });
              }}
              onSendText={(text) => handleUserSpeech(text)}
              onQuickPrompt={(text) => handleUserSpeech(text)}
              isProcessing={isProcessing}
            />
          </div>
        </section>

        {/* RIGHT COLUMN: Android Device Controller & Simulator (5 Cols on desktop) */}
        <section
          className={`lg:col-span-5 h-[calc(100vh-130px)] lg:h-[calc(100vh-110px)] flex flex-col ${
            mobileTab === 'device' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <DeviceSimulator
            deviceState={deviceState}
            onUpdateDeviceState={(updated) =>
              setDeviceState((prev) => ({ ...prev, ...updated }))
            }
            onTriggerCall={(contact) => setActiveCallContact(contact)}
            onRaniSpeak={(text) => {
              setOrbState('speaking');
              raniTTS.speak(text, {
                emotion: currentEmotion,
                onEnd: () => setOrbState('idle'),
                onError: () => setOrbState('idle'),
              });
            }}
            onTriggerVisionInspect={(prompt) => triggerScreenVisionAnalysis(prompt)}
            onTriggerPaymentConfirmation={(recipient, amount) => {
              const pending = {
                id: `conf_pay_${Date.now()}`,
                type: 'payment' as const,
                title: `Send ₹${amount} to ${recipient}`,
                description: `UPI Payment Transfer: ₹${amount} to ${recipient}`,
                payload: { recipient, amount },
                verbalPrompt: `Maine ${recipient} ko ₹${amount} bhejne ka request tayar kiya hai. Bhej doon? Bas 'haan' ya 'cancel' boliye 💕`,
              };
              setPendingConfirmation(pending);
              raniTTS.speak(pending.verbalPrompt, { emotion: 'concerned' });
            }}
            onOpenBatteryGuide={() => setShowBatteryModal(true)}
            lastAccessibilityAction={lastAccessibilityAction}
          />
        </section>
      </main>

      {/* Screen Vision Floating Overlay */}
      <ScreenVisionOverlay
        visionState={visionState}
        onCloseWatching={() =>
          setVisionState((prev) => ({ ...prev, isWatching: false, detectedAction: undefined }))
        }
      />

      {/* Smart Friction Voice Confirmation Banner */}
      <QuickConfirmationBanner
        confirmation={pendingConfirmation}
        onConfirm={confirmPendingAction}
        onCancel={cancelPendingAction}
        onPlayPrompt={(prompt) => raniTTS.speak(prompt, { emotion: 'concerned' })}
      />

      {/* Floating Overlay Component */}
      <FloatingOverlay
        isActive={deviceState.overlayActive}
        isListening={orbState === 'listening'}
        isSpeaking={orbState === 'speaking'}
        onMicClick={handleMicToggle}
        onClose={() => setDeviceState((prev) => ({ ...prev, overlayActive: false }))}
        lastReply={messages[messages.length - 1]?.content}
      />

      {/* In-Call Modal when calling contacts */}
      <CallScreenModal
        contact={activeCallContact}
        onEndCall={() => setActiveCallContact(null)}
      />

      {/* AI Tools Plugins Modal */}
      <AIToolsModal
        isOpen={showAIToolsModal}
        onClose={() => setShowAIToolsModal(false)}
        onOpenVoiceStudio={() => setShowVoiceModal(true)}
        onPluginChange={() => {
          setCurrentVoiceName(vaultService.getSelectedVoiceName());
        }}
      />

      {/* ElevenLabs Voice Characters Studio Modal */}
      <ElevenLabsVoiceModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onVoiceSelect={(voice) => {
          setCurrentVoiceName(voice.characterName);
        }}
      />

      {/* Rani Knowledge Hub & Public APIs Modal */}
      <KnowledgeModal
        isOpen={showKnowledgeModal}
        onClose={() => setShowKnowledgeModal(false)}
        onAskRani={(query) => handleUserSpeech(query)}
      />

      {/* 24/7 Battery Optimization Guide Modal */}
      <BatteryOptimizationModal
        isOpen={showBatteryModal}
        onClose={() => setShowBatteryModal(false)}
        isUnrestricted={!deviceState.batteryOptimized}
        onToggleUnrestricted={() =>
          setDeviceState((prev) => ({
            ...prev,
            batteryOptimized: !prev.batteryOptimized,
          }))
        }
      />

      {/* MediaProjection Permission Request Modal */}
      <MediaProjectionPermissionModal
        isOpen={showMediaProjectionModal}
        onClose={() => setShowMediaProjectionModal(false)}
        onConfirmGrant={() => {
          setVisionState((prev) => ({ ...prev, permissionGranted: true }));
          triggerScreenVisionAnalysis('isme se sabse sasta wala select karo');
        }}
      />

      {/* Permissions Onboarding & Dashboard Modal */}
      <PermissionsModal
        isOpen={showPermissionsModal}
        onClose={() => setShowPermissionsModal(false)}
        permissions={permissions}
        onTogglePermission={handleTogglePermission}
        onGrantAll={handleGrantAllPermissions}
        onPlayReason={handlePlayPermissionReason}
      />

      {/* Android Native Kotlin Code Exporter Modal */}
      <NativeCodeModal
        isOpen={showNativeCodeModal}
        onClose={() => setShowNativeCodeModal(false)}
      />

      {/* App Installation Guide Modal */}
      <InstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        onOpenNativeCode={() => setShowNativeCodeModal(true)}
      />
    </div>
  );
}
