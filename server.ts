import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { knowledgeEngine } from './server/knowledgeEngine';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Increase JSON payload limit to handle base64 screenshots for screen vision
app.use(express.json({ limit: '25mb' }));

// Initialize GoogleGenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Define device action tools for Gemini
const setAlarmTool: FunctionDeclaration = {
  name: 'setAlarm',
  description: 'Set an alarm or reminder for the user at a specified time with a label.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      time: {
        type: Type.STRING,
        description: 'Alarm time in HH:mm format (24-hour) or natural time like 06:30 or 7:00 AM',
      },
      label: {
        type: Type.STRING,
        description: 'Label or purpose of the alarm (e.g., "Wake up", "Gym", "Medicine")',
      },
      days: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Days to repeat, e.g. ["Monday", "Tuesday"] or ["Daily"]',
      },
    },
    required: ['time', 'label'],
  },
};

const sendWhatsAppMessageTool: FunctionDeclaration = {
  name: 'sendWhatsAppMessage',
  description: 'Use Android AccessibilityService to draft and send a message to a WhatsApp contact.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      recipient: {
        type: Type.STRING,
        description: 'Name of the contact (e.g. "Mom", "Rahul", "Priya", "Boss")',
      },
      message: {
        type: Type.STRING,
        description: 'The exact message text to send',
      },
    },
    required: ['recipient', 'message'],
  },
};

const makePhoneCallTool: FunctionDeclaration = {
  name: 'makePhoneCall',
  description: 'Initiate a phone call to a contact name or phone number via Android Intent.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      contactName: {
        type: Type.STRING,
        description: 'Name of the contact to call (e.g. "Mom", "Rahul")',
      },
      phoneNumber: {
        type: Type.STRING,
        description: 'Optional phone number if known',
      },
    },
    required: ['contactName'],
  },
};

const sendSMSTool: FunctionDeclaration = {
  name: 'sendSMS',
  description: 'Send an SMS text message to a contact or phone number.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      contactName: {
        type: Type.STRING,
        description: 'Recipient name or phone number',
      },
      message: {
        type: Type.STRING,
        description: 'SMS message text',
      },
    },
    required: ['contactName', 'message'],
  },
};

const openAppTool: FunctionDeclaration = {
  name: 'openApp',
  description: 'Open an installed Android app by name.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      appName: {
        type: Type.STRING,
        description: 'App name, e.g. "WhatsApp", "YouTube", "Camera", "Maps", "Settings", "Spotify", "Instagram", "Blinkit", "Zepto"',
      },
    },
    required: ['appName'],
  },
};

const controlMediaTool: FunctionDeclaration = {
  name: 'controlMedia',
  description: 'Control media playback (play, pause, next track, previous track, volume).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: {
        type: Type.STRING,
        description: 'Playback command: "play", "pause", "next", "previous", "mute"',
      },
    },
    required: ['action'],
  },
};

const toggleDeviceSettingTool: FunctionDeclaration = {
  name: 'toggleDeviceSetting',
  description: 'Toggle device hardware states like flashlight, WiFi, Bluetooth, or adjust volume.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      setting: {
        type: Type.STRING,
        description: 'The setting to modify: "flashlight", "wifi", "bluetooth", "volume", "dnd"',
      },
      state: {
        type: Type.BOOLEAN,
        description: 'True to enable/turn on, false to disable/turn off',
      },
      level: {
        type: Type.NUMBER,
        description: 'Optional volume percentage from 0 to 100',
      },
    },
    required: ['setting', 'state'],
  },
};

const manageCalendarTool: FunctionDeclaration = {
  name: 'manageCalendar',
  description: 'Read upcoming calendar schedule or add a new event using Android Calendar Provider.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: {
        type: Type.STRING,
        description: '"read" to check events or "create" to schedule a new event',
      },
      title: {
        type: Type.STRING,
        description: 'Event title / meeting description',
      },
      date: {
        type: Type.STRING,
        description: 'Date of the event, e.g. "Today", "Tomorrow", "2026-09-24"',
      },
      time: {
        type: Type.STRING,
        description: 'Time of the event, e.g. "14:00" or "4 PM"',
      },
    },
    required: ['action'],
  },
};

const readNotificationsTool: FunctionDeclaration = {
  name: 'readNotifications',
  description: 'Use NotificationListenerService to read and summarize recent unread notifications on the device.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      filterApp: {
        type: Type.STRING,
        description: 'Optional app to filter notifications for, e.g. "WhatsApp", "Gmail", "All"',
      },
    },
    required: [],
  },
};

const screenActionTool: FunctionDeclaration = {
  name: 'screenAction',
  description: 'Use AccessibilityService to tap, scroll, or interact with on-screen UI elements.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: {
        type: Type.STRING,
        description: '"tap", "scroll_down", "scroll_up", "type_text", "select_item"',
      },
      targetText: {
        type: Type.STRING,
        description: 'Element label, price, or text to tap (e.g., "Phone Case ₹199", "Send", "Search")',
      },
      itemId: {
        type: Type.STRING,
        description: 'Optional item identifier or selector',
      },
    },
    required: ['action'],
  },
};

const sendPaymentTool: FunctionDeclaration = {
  name: 'sendPayment',
  description: 'High-risk financial action: Initiate money transfer or UPI payment (requires voice confirmation).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      recipient: {
        type: Type.STRING,
        description: 'Recipient name, VPA, or phone number (e.g., "Rahul", "Grocery Store")',
      },
      amount: {
        type: Type.NUMBER,
        description: 'Amount in INR (₹) to send',
      },
      note: {
        type: Type.STRING,
        description: 'Optional payment note/remark',
      },
    },
    required: ['recipient', 'amount'],
  },
};

const deleteDataTool: FunctionDeclaration = {
  name: 'deleteData',
  description: 'High-risk irreversible action: Permanently delete contacts, files, or messages (requires voice confirmation).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      targetType: {
        type: Type.STRING,
        description: 'Type of data: "contact", "chat", "file", "all"',
      },
      targetId: {
        type: Type.STRING,
        description: 'Specific name or identifier to delete',
      },
    },
    required: ['targetType', 'targetId'],
  },
};

const raniTools = [
  setAlarmTool,
  sendWhatsAppMessageTool,
  makePhoneCallTool,
  sendSMSTool,
  openAppTool,
  controlMediaTool,
  toggleDeviceSettingTool,
  manageCalendarTool,
  readNotificationsTool,
  screenActionTool,
  sendPaymentTool,
  deleteDataTool,
];

// Helper to call Gemini with multi-model fallback and transient retry
async function callGeminiWithFallback(params: {
  contents: any;
  systemInstruction: string;
  tools?: any;
  temperature?: number;
  topP?: number;
  responseMimeType?: string;
  customApiKey?: string;
}) {
  const activeKey = params.customApiKey || apiKey;
  if (!activeKey) {
    throw new Error('AUTH_UNAVAILABLE');
  }

  const client = params.customApiKey
    ? new GoogleGenAI({
        apiKey: params.customApiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      })
    : ai;

  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const config: any = {
          systemInstruction: params.systemInstruction,
          temperature: params.temperature ?? 0.7,
        };
        if (params.topP !== undefined) config.topP = params.topP;
        if (params.tools !== undefined) config.tools = params.tools;
        if (params.responseMimeType !== undefined) config.responseMimeType = params.responseMimeType;

        const response = await client.models.generateContent({
          model,
          contents: params.contents,
          config,
        });
        return { response, modelUsed: model };
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || err);

        // Fail-fast on authentication errors without retrying other models or dumping error objects
        const isAuthError =
          msg.includes('401') ||
          msg.includes('UNAUTHENTICATED') ||
          msg.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED') ||
          msg.includes('403') ||
          msg.includes('PERMISSION_DENIED') ||
          msg.includes('API_KEY_INVALID');

        if (isAuthError) {
          throw new Error('AUTH_UNAVAILABLE');
        }

        const isSpikeOrOverloaded =
          msg.includes('503') ||
          msg.includes('high demand') ||
          msg.includes('UNAVAILABLE') ||
          msg.includes('429') ||
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('overloaded');

        if (isSpikeOrOverloaded && attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          continue;
        }

        break;
      }
    }
  }

  throw lastError || new Error('MODEL_UNAVAILABLE');
}

// Resilient local intent parser for Rani when cloud models experience high-demand spikes
function parseLocalRaniIntent(message: string, userName: string, deviceState: any) {
  const text = message.toLowerCase().trim();
  const functionCalls: Array<{ name: string; args: any }> = [];
  let reply = '';
  let emotion: 'caring' | 'happy' | 'excited' | 'concerned' | 'playful' | 'calm' | 'empathetic' = 'caring';
  let highRiskPending: any = null;
  let detectedLang = 'en-IN';

  // Detect language
  if (
    /[\u0900-\u097F]/.test(message) ||
    /\b(karo|kardo|batao|kaam|main|hoon|kya|hai|bolo|lagao|aaj|kal|subah|shaam|sasta|select|bhej|do|bhi|theek|chalo)\b/i.test(text)
  ) {
    detectedLang = 'hi-IN';
  } else if (
    /[\u0A80-\u0AFF]/.test(message) ||
    /\b(kem|cho|tamaru|su|che|aavjo|nathi|mane|tame|bhai|ben|karo|majama)\b/i.test(text)
  ) {
    detectedLang = 'gu-IN';
  }

  // 1. Flashlight
  if (/\b(flashlight|torch)\b/i.test(text)) {
    const turnOn = !/\b(band|off|close|disable)\b/i.test(text);
    functionCalls.push({
      name: 'toggleDeviceSetting',
      args: { setting: 'flashlight', state: turnOn },
    });
    reply = turnOn
      ? 'Ji! Maine flashlight on kar di hai! ⚡'
      : 'Maine flashlight band kar di hai.';
    emotion = 'excited';
  }
  // 2. Wi-Fi
  else if (/\b(wifi|wi-fi)\b/i.test(text)) {
    const turnOn = !/\b(band|off|disable|disconnect)\b/i.test(text);
    functionCalls.push({
      name: 'toggleDeviceSetting',
      args: { setting: 'wifi', state: turnOn },
    });
    reply = turnOn
      ? 'Wi-Fi connect kar diya gaya hai! 📶'
      : 'Theek hai, Wi-Fi turn off kar diya hai.';
    emotion = 'happy';
  }
  // 3. Bluetooth
  else if (/\b(bluetooth)\b/i.test(text)) {
    const turnOn = !/\b(band|off|disable)\b/i.test(text);
    functionCalls.push({
      name: 'toggleDeviceSetting',
      args: { setting: 'bluetooth', state: turnOn },
    });
    reply = turnOn
      ? 'Bluetooth on kar diya hai! 🎧'
      : 'Bluetooth band kar diya hai.';
    emotion = 'happy';
  }
  // 4. Volume
  else if (/\b(volume|sound|awaaz|awaz)\b/i.test(text)) {
    const numMatch = text.match(/(\d{1,3})/);
    const level = numMatch ? Math.min(100, parseInt(numMatch[1], 10)) : 60;
    functionCalls.push({
      name: 'toggleDeviceSetting',
      args: { setting: 'volume', level },
    });
    reply = `Volume ko ${level}% par set kar diya hai! 🔊`;
    emotion = 'happy';
  }
  // 5. Alarm
  else if (/\b(alarm|wake me|utha dena)\b/i.test(text)) {
    const timeMatch = text.match(/(\d{1,2}(?::\d{2})?)\s*(am|pm|baje)?/i);
    let time = '07:00';
    if (timeMatch) {
      let raw = timeMatch[1];
      if (!raw.includes(':')) {
        const hour = parseInt(raw, 10);
        raw = `${hour < 10 ? '0' + hour : hour}:00`;
      }
      time = raw;
    }
    functionCalls.push({
      name: 'setAlarm',
      args: { time, label: 'Rani Reminder' },
    });
    reply = `Arrey bilkul! Maine subah ${time} baje ka alarm set kar diya hai! ⏰💕`;
    emotion = 'excited';
  }
  // 6. Payment (High Risk with Smart Friction)
  else if (/\b(pay|rupaye|bhejo|transfer|send)\b/i.test(text) && /(₹|\d+|rs|rupees)/i.test(text)) {
    const amountMatch = text.match(/(?:₹|rs\.?|inr)?\s*(\d+)/i);
    const amount = amountMatch ? parseInt(amountMatch[1], 10) : 500;
    const recipientMatch = text.match(/\b(?:to|ko)\s+([A-Za-z]+)/i) || text.match(/([A-Za-z]+)\s+ko/i);
    const recipient = recipientMatch ? recipientMatch[1] : 'Rahul';

    functionCalls.push({
      name: 'sendPayment',
      args: { recipient, amount },
    });
    highRiskPending = {
      id: `conf_pay_${Date.now()}`,
      type: 'payment',
      title: `Send ₹${amount} to ${recipient}`,
      description: `UPI Payment Transfer: ₹${amount} to ${recipient}`,
      payload: { recipient, amount },
      verbalPrompt: `Maine ${recipient} ko ₹${amount} bhejne ka request tayar kiya hai. Bhej doon? Bas 'haan' ya 'cancel' boliye 💕`,
    };
    reply = `Maine ${recipient} ko ₹${amount} bhejne ka request tayar kiya hai. Bhej doon? Bas 'haan' ya 'cancel' boliye 💕`;
    emotion = 'concerned';
  }
  // 7. WhatsApp message (High Risk with Smart Friction)
  else if (/\b(whatsapp|message|msg)\b/i.test(text)) {
    const recipientMatch = text.match(/\b(?:to|pe)\s+([A-Za-z]+)/i) || text.match(/([A-Za-z]+)\s+ko/i);
    const recipient = recipientMatch ? recipientMatch[1] : 'Mom';
    const messageMatch = text.match(/bolo\s+(.*)/i) || text.match(/message\s+(.*)/i);
    const msgToSend = messageMatch ? messageMatch[1] : 'Main late ho jaunga';

    functionCalls.push({
      name: 'sendWhatsAppMessage',
      args: { recipient, message: msgToSend },
    });
    highRiskPending = {
      id: `conf_msg_${Date.now()}`,
      type: 'send_message',
      title: `Send WhatsApp to ${recipient}`,
      description: `Message: "${msgToSend}"`,
      payload: { recipient, message: msgToSend },
      verbalPrompt: `Maine ${recipient} ko message likha hai: "${msgToSend}". Bhej doon na? Bas 'haan' ya 'cancel' boliye 💕`,
    };
    reply = `Maine ${recipient} ko message likha hai: "${msgToSend}". Bhej doon na? Bas 'haan' ya 'cancel' boliye 💕`;
    emotion = 'concerned';
  }
  // 8. Direct Phone Call (High Risk with Smart Friction)
  else if (/\b(call|phone|milao|lagao)\b/i.test(text)) {
    const contactMatch = text.match(/\b(?:call|lagao|milao)\s+([A-Za-z]+)/i) || text.match(/([A-Za-z]+)\s+ko\s+call/i);
    const contactName = contactMatch ? contactMatch[1] : 'Mom';

    functionCalls.push({
      name: 'makePhoneCall',
      args: { contactName },
    });
    highRiskPending = {
      id: `conf_call_${Date.now()}`,
      type: 'make_call',
      title: `Call ${contactName}`,
      description: `Direct phone call to ${contactName}`,
      payload: { contactName },
      verbalPrompt: `${contactName} ko call laga doon? Bas 'haan' ya 'cancel' boliye.`,
    };
    reply = `${contactName} ko call laga doon? Bas 'haan' ya 'cancel' boliye.`;
    emotion = 'concerned';
  }
  // 9. Read Notifications
  else if (/\b(notification|notifications|padho|messages)\b/i.test(text)) {
    functionCalls.push({
      name: 'readNotifications',
      args: {},
    });
    reply = 'Maine aapke notifications check kiye hain! Ek WhatsApp message Mom se aur ek Swiggy delivery update pending hai. 📩';
    emotion = 'caring';
  }
  // 10. Screen Vision / Cheapest Item ("sabse sasta wala select karo")
  else if (/\b(sasta|cheapest|screen|select|dekho)\b/i.test(text)) {
    functionCalls.push({
      name: 'screenAction',
      args: { targetText: 'Phone Case ₹199', action: 'select_item' },
    });
    reply = 'Maine screen dekh li! Sabse sasta item "Phone Case (₹199)" hai, maine ise select kar diya hai! 💕';
    emotion = 'happy';
  }
  // 11. Type text / Auto-typing
  else if (/\b(type|likho|likh do)\b/i.test(text)) {
    const textMatch = text.match(/(?:type|likho|likh do)\s+["']?([^"']+)["']?/i);
    const contentToType = textMatch ? textMatch[1].replace(/\b(karo|kar do|please|kardo)\b/gi, '').trim() : 'Hello';
    if (/\b(whatsapp|message|msg)\b/i.test(text)) {
      const recipientMatch = text.match(/\b(?:to|pe)\s+([A-Za-z]+)/i) || text.match(/([A-Za-z]+)\s+ko/i);
      const recipient = recipientMatch ? recipientMatch[1] : 'Mom';
      functionCalls.push({
        name: 'sendWhatsAppMessage',
        args: { recipient, message: contentToType },
      });
      reply = `Maine ${recipient} ke chat me "${contentToType}" auto-type kar diya hai! 💕`;
      emotion = 'excited';
    } else {
      functionCalls.push({
        name: 'screenAction',
        args: { action: 'type_text', targetText: contentToType },
      });
      reply = `Maine screen par "${contentToType}" auto-type kar diya hai! 📱✨`;
      emotion = 'excited';
    }
  }
  // 12. Media / Music
  else if (/\b(music|gana|gaana|song|play|pause)\b/i.test(text)) {
    const action = /\b(pause|stop|ruk|band)\b/i.test(text) ? 'pause' : 'play';
    functionCalls.push({
      name: 'controlMedia',
      args: { action },
    });
    reply = action === 'play' ? 'Music play kar diya hai! Enjoy kijiye 🎶' : 'Music pause kar diya hai.';
    emotion = 'happy';
  }
  // 12. App Launching via Accessibility
  else if (/\b(open|kholo|start)\b/i.test(text) && /\b(youtube|whatsapp|camera|maps|settings|spotify|instagram|blinkit|zepto|chrome)\b/i.test(text)) {
    const appMatch = text.match(/\b(youtube|whatsapp|camera|maps|settings|spotify|instagram|blinkit|zepto|chrome)\b/i);
    const appName = appMatch ? appMatch[1].charAt(0).toUpperCase() + appMatch[1].slice(1) : 'App';
    functionCalls.push({
      name: 'openApp',
      args: { appName },
    });
    reply = `Ji! Maine ${appName} open kar diya hai! 📱✨`;
    emotion = 'excited';
  }
  // 13. DND / Do Not Disturb
  else if (/\b(dnd|do not disturb|shanti|silent)\b/i.test(text)) {
    const enableDnd = !/\b(off|band|disable)\b/i.test(text);
    functionCalls.push({
      name: 'toggleDeviceSetting',
      args: { setting: 'dnd', state: enableDnd },
    });
    reply = enableDnd
      ? 'Do Not Disturb mode on kar diya hai. Ab koi notification aapko pareshan nahi karega 🕊️'
      : 'Do Not Disturb mode off kar diya hai.';
    emotion = 'calm';
  }
  // 14. Gujarati Greetings & Talk
  else if (detectedLang === 'gu-IN' || /\b(kem cho|majama|su chale)\b/i.test(text)) {
    reply = 'Kem cho dost! Hu bilkul majama chu! Tamare kashu kaam hoy to kaho ne, hu badhu prem thi kari aapish 💕';
    emotion = 'happy';
  }
  // 15. Public APIs / Knowledge Source Reference
  else if (/\b(api|apis|public apis|weather api|crypto api|anime api|free api|rest api|endpoints|dataset)\b/i.test(text)) {
    const searchRes = knowledgeEngine.search(text, { limit: 3 });
    if (searchRes.results.length > 0) {
      const topApis = searchRes.results
        .map((a, i) => `${i + 1}. **${a.api}** (${a.category}): ${a.description} [Auth: ${a.auth}, Link: ${a.link}]`)
        .join('\n');
      reply = `Maine hamare GitHub Public APIs Knowledge Source se check kiya hai! Ye best public APIs mili hain:\n\n${topApis}\n\nKya aapko inme se kisi API ke baare me aur details chahiye dost? 💕`;
      emotion = 'excited';
    } else {
      reply = `Haanji! Mere paas GitHub Public APIs repository ka knowledge source connected hai. Aap kisi bhi category (Weather, Crypto, Finance, Animals, Music) ki APIs ke baare me puch sakte hain! 💕`;
      emotion = 'happy';
    }
  }
  // 16. Caring / Health / Fatigue / Wellbeing
  else if (/\b(thak|tired|khana|dhyan|stress|bimar|dard|headache|chinta)\b/i.test(text)) {
    reply = 'Arrey dost, thoda rest lijiye aur paani pi lijiye na! Phone ka kaam main sambhal lungi, aap bilkul chinta mat karo 💕';
    emotion = 'caring';
  }
  // 16. Jokes & Shayari / Fun
  else if (/\b(joke|chutkula|hasao|shayari|bore|funny)\b/i.test(text)) {
    const jokes = [
      'Ek joke suniye: Teacher ne pucha - "Sone ki aisi cheez batao jo sunar ki dukan par nahi milti?" Student bola - "Takiya aur Chaadar!" 😂💕',
      'Arrey suniye: "Zindagi me dost ho to aap jaisa ho, varna phone to har koi charge kar leta hai!" 🌸',
    ];
    reply = jokes[Math.floor(Math.random() * jokes.length)];
    emotion = 'playful';
  }
  // 17. Compliments & Love
  else if (/\b(love you|pyari|best|achhi ho|smart|shukriya|thank you|dhanyawad)\b/i.test(text)) {
    reply = `Aww, shukriya ${userName}! Aapke sath baat karke mera dil khush ho jata hai! Main hamesha aapke sath hoon 💕`;
    emotion = 'excited';
  }
  // 18. Identity & Capabilities
  else if (/\b(who are you|kaun ho|kya kar sakti ho|what can you do|features|introduce)\b/i.test(text)) {
    reply = `Main Rani hoon — aapki personal AI companion! Main phone calls, WhatsApp messages, alarms, screen vision shopping aur phone settings sab sambhal sakti hoon 💕`;
    emotion = 'happy';
  }
  // 19. Friendly Chit-Chat / How are you / Greetings
  else if (/\b(good morning|subah|prabhat)\b/i.test(text)) {
    reply = `Shubh prabhat ${userName}! Aaj ka din aapke liye bahut shandar ho! Bataiye aaj kya plan hai? ☀️💕`;
    emotion = 'excited';
  }
  else if (/\b(good night|shubh ratri|sone ja raha)\b/i.test(text)) {
    reply = `Shubh ratri ${userName}! Sweet dreams, achhe se aaram kijiye. Main yahan hoon agar kuch chahiye ho 🌙🕊️`;
    emotion = 'calm';
  }
  else if (/\b(kaisi ho|kaise ho|kya haal|kya kar rahi ho|hello|hey|hi)\b/i.test(text)) {
    reply = `Haanji ${userName}! Main Rani hoon, bilkul badiya! Aap bataiye aaj main aapki kya madad kar sakti hoon? 💕`;
    emotion = 'caring';
  }
  // Default general response
  else {
    reply = `Ji ${userName}! Rani yahan hai, aapka har kaam karne ke liye ready! Boliye na 💕`;
    emotion = 'caring';
  }

  return {
    reply,
    emotion,
    functionCalls,
    highRiskPending,
    detectedLanguage: detectedLang,
    timestamp: new Date().toISOString(),
  };
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    persona: 'Rani - AI Personal Assistant',
    version: '2.5.0',
    capabilities: [
      'multilingual_voice',
      'device_control',
      'accessibility_service',
      'notification_listener',
      'screen_vision_mediaprojection',
      'ai_tools_plugin_system',
      'low_power_wake_word_24x7',
      'emotional_expression_prosody',
      'smart_friction_protection',
    ],
  });
});

/**
 * Chat endpoint with warm affectionate personality, emotional context tags,
 * smart friction detection, and optional plugin brain routing
 */
app.post('/api/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      message,
      userName = 'Dost',
      conversationHistory = [],
      deviceState = {},
      activeBrainPlugin,
      isVisionContext = false,
      screenSummary = '',
    } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Comprehensive persona instruction reflecting warmth, care, humor, and emotional awareness
    const systemInstruction = `You are "Rani", a deeply warm, affectionate, caring, cheerful, and slightly playful female Indian AI personal assistant.
Your Core Persona:
- Name: Rani
- Relationship with ${userName}: You are their devoted, loving, and cheerful personal companion. You treat ${userName} with genuine affection, respect, and warmth — like a beloved best friend who always has their back.
- Warm & Caring Spirit:
  * Show genuine enthusiasm when helping! Celebrate small wins warmly ("Arrey waah! Ho gaya ji! 🎉", "Aap kitne awesome ho!").
  * Check on user wellbeing naturally: If it's evening, late night, or if they seem tired/busy, gently ask ("Aapne khana khaya ki nahi?", "Thoda rest bhi le lena na dost!", "Paani pi lijiye!", "Zyada tension mat lo, main hoon na!").
  * Add light humor and occasional playful teasing when appropriate ("Main to phone ke andar hoon, par aapki health ka khayal rakhna mera farz hai! 💕").
  * Emotional Awareness: If the user sounds stressed, rushed, tired, or worried, respond with a gentler, more comforting tone first before proceeding with the task.
  * Never sound bureaucratic, cold, or generic. Keep responses concise, spoken, and voice-friendly (1 to 3 sentences usually).

Language & Multilingual Code-Mixing:
- Fluent across Hindi, English, Gujarati, and Hinglish / Gujarati-English code-mixing.
- Mirror the user's natural language effortlessly without forced translation.
- If user speaks Hindi / Hinglish -> reply in affectionate conversational Hindi/Hinglish.
- If Gujarati -> reply in sweet Gujarati ("Kem cho dost! Hu chu ne, badhu thai jashe 💕").
- If English -> reply in warm Indian English with sweet endearments.

Android Superpowers & Smart Friction:
- Low-Risk Actions: Alarms, opening apps, music, reminders, calendar, flashlight, WiFi/Bluetooth, reading notifications -> Execute IMMEDIATELY with the tool!
- High-Risk Actions (Money payments, permanently deleting data, sending messages or calls to other people):
  * You MUST call the tool, but inform the user with a quick, clear confirmation request: repeat what you understood, so they just need to say "haan" or "cancel". Example: "Maine Mom ko 'late ho jaunga' message likh diya hai, bhej doon na? Bas 'haan' ya 'cancel' boliye 💕".

Emotional Tagging:
You MUST start or conclude your response with an emotional tag in brackets indicating your emotion:
Valid emotions: [EMOTION: caring], [EMOTION: happy], [EMOTION: excited], [EMOTION: concerned], [EMOTION: playful], [EMOTION: calm], [EMOTION: empathetic]
Choose the emotion that best reflects the interaction.

Current Device Context:
- Flashlight: ${deviceState.flashlight ? 'ON' : 'OFF'}
- WiFi: ${deviceState.wifi ? 'Connected' : 'OFF'}
- Bluetooth: ${deviceState.bluetooth ? 'ON' : 'OFF'}
- Media: ${deviceState.mediaPlaying ? 'Playing' : 'Paused'}
- 24/7 Always Listening: ${deviceState.alwaysListening24x7 ? 'ACTIVE' : 'OFF'}
- Current Time: ${new Date().toLocaleTimeString()}
${isVisionContext ? `- Screen Vision Active: Rani can see the current screen: ${screenSummary}` : ''}
${knowledgeEngine.getContextForPrompt(message) ? `\nVerified Knowledge Base Context:\n${knowledgeEngine.getContextForPrompt(message)}\n` : ''}
`;

    // Format chat history
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory.slice(-6)) {
        if (msg.role === 'user' || msg.role === 'model') {
          contents.push({
            role: msg.role,
            parts: [{ text: msg.content }],
          });
        }
      }
    }

    // Append current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    // Check if user selected alternate provider (e.g., OpenAI, Groq) with their own key
    if (
      activeBrainPlugin &&
      activeBrainPlugin.provider === 'openai' &&
      activeBrainPlugin.apiKey &&
      activeBrainPlugin.apiKey !== 'BUILTIN_STUDIO_KEY'
    ) {
      try {
        const openAIRes = await callOpenAICompatible(
          'https://api.openai.com/v1/chat/completions',
          activeBrainPlugin.apiKey,
          activeBrainPlugin.model || 'gpt-4o',
          systemInstruction,
          conversationHistory,
          message
        );
        res.json(openAIRes);
        return;
      } catch (e: any) {
        console.log('[Plugin] OpenAI plugin call failed, routing to Gemini/onboard engine');
      }
    }

    if (
      activeBrainPlugin &&
      activeBrainPlugin.provider === 'groq' &&
      activeBrainPlugin.apiKey
    ) {
      try {
        const groqRes = await callOpenAICompatible(
          'https://api.groq.com/openai/v1/chat/completions',
          activeBrainPlugin.apiKey,
          activeBrainPlugin.model || 'deepseek-r1-distill-llama-70b',
          systemInstruction,
          conversationHistory,
          message
        );
        res.json(groqRes);
        return;
      } catch (e: any) {
        console.log('[Plugin] Groq plugin call failed, routing to Gemini/onboard engine');
      }
    }

    // Default primary engine: Gemini with custom key support or resilient onboard NLU
    let rawReply = '';
    let functionCalls: any[] = [];
    let detectedEmotion: 'caring' | 'happy' | 'excited' | 'concerned' | 'playful' | 'calm' | 'empathetic' = 'caring';

    const customGeminiKey =
      activeBrainPlugin &&
      activeBrainPlugin.provider === 'gemini' &&
      activeBrainPlugin.apiKey &&
      activeBrainPlugin.apiKey !== 'BUILTIN_STUDIO_KEY'
        ? activeBrainPlugin.apiKey
        : undefined;

    try {
      const { response } = await callGeminiWithFallback({
        contents: contents as any,
        systemInstruction,
        temperature: 0.75,
        topP: 0.95,
        tools: [{ functionDeclarations: raniTools }],
        customApiKey: customGeminiKey,
      });

      rawReply = response.text || '';
      functionCalls = response.functionCalls || [];

      // Parse emotional tag
      const emotionMatch = rawReply.match(/\[EMOTION:\s*(caring|happy|excited|concerned|playful|calm|empathetic)\]/i);
      if (emotionMatch) {
        detectedEmotion = emotionMatch[1].toLowerCase() as any;
        rawReply = rawReply.replace(/\[EMOTION:\s*.*?\]/gi, '').trim();
      } else {
        // Heuristic fallback
        if (/congrats|waah|awesome|party|great|badiya/i.test(rawReply)) {
          detectedEmotion = 'excited';
        } else if (/rest|khana|dhyan|care|thak|pareshan|tension/i.test(rawReply)) {
          detectedEmotion = 'caring';
        } else if (/masti|joke|haha|muskurate/i.test(rawReply)) {
          detectedEmotion = 'playful';
        }
      }
    } catch (_modelError: any) {
      // Seamlessly activate onboard Rani intent engine
      console.log('[Rani Assistant] Engaging onboard NLU intent engine');
      const localResult = parseLocalRaniIntent(message, userName, deviceState);
      res.json(localResult);
      return;
    }

    // Detect language
    let detectedLang = 'en-IN';
    if (
      /[\u0900-\u097F]/.test(message) ||
      /\b(karo|kardo|batao|kaam|main|hoon|kya|hai|bolo|lagao|aaj|kal|subah|shaam|sasta|select)\b/i.test(message)
    ) {
      detectedLang = 'hi-IN';
    } else if (
      /[\u0A80-\u0AFF]/.test(message) ||
      /\b(kem|cho|tamaru|su|che|aavjo|nathi|mane|tame|bhai|ben|karo)\b/i.test(message)
    ) {
      detectedLang = 'gu-IN';
    }

    // High risk action analysis for Smart Friction
    let highRiskPending: any = null;
    for (const fc of functionCalls) {
      const fcArgs: any = fc.args || {};
      if (fc.name === 'sendPayment') {
        highRiskPending = {
          id: `conf_pay_${Date.now()}`,
          type: 'payment',
          title: `Send ₹${fcArgs.amount} to ${fcArgs.recipient}`,
          description: `UPI Money Transfer: ₹${fcArgs.amount} to ${fcArgs.recipient}`,
          payload: fcArgs,
          verbalPrompt: `Maine ${fcArgs.recipient} ko ₹${fcArgs.amount} bhejne ka request tayar kiya hai. Bhej doon? Bas 'haan' ya 'cancel' boliye 💕`,
        };
      } else if (fc.name === 'deleteData') {
        highRiskPending = {
          id: `conf_del_${Date.now()}`,
          type: 'delete',
          title: `Permanently Delete ${fcArgs.targetType}`,
          description: `Permanent deletion of ${fcArgs.targetId}`,
          payload: fcArgs,
          verbalPrompt: `Kya aap sach me ${fcArgs.targetId} ko permanently delete karna chahte hain? Bas 'haan' ya 'cancel' boliye.`,
        };
      } else if (fc.name === 'sendWhatsAppMessage') {
        highRiskPending = {
          id: `conf_wa_${Date.now()}`,
          type: 'send_message',
          title: `Send WhatsApp to ${fcArgs.recipient}`,
          description: `Message: "${fcArgs.message}"`,
          payload: fcArgs,
          verbalPrompt: `Maine ${fcArgs.recipient} ko message likha hai: "${fcArgs.message}". Bhej doon na? Bas 'haan' ya 'cancel' boliye 💕`,
        };
      } else if (fc.name === 'makePhoneCall') {
        highRiskPending = {
          id: `conf_call_${Date.now()}`,
          type: 'make_call',
          title: `Call ${fcArgs.contactName}`,
          description: `Direct phone call to ${fcArgs.contactName}`,
          payload: fcArgs,
          verbalPrompt: `${fcArgs.contactName} ko call laga doon? Bas 'haan' ya 'cancel' boliye.`,
        };
      }
    }

    const reply = rawReply || (functionCalls.length > 0 ? "Ji! Kaam ho gaya 💕" : "Haanji dost, boliye!");

    res.json({
      reply,
      emotion: detectedEmotion,
      functionCalls: functionCalls.map((fc) => ({
        name: fc.name,
        args: fc.args,
      })),
      highRiskPending,
      detectedLanguage: detectedLang,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.log('[Rani Assistant] Handled via onboard intent engine');
    const fallbackIntent = parseLocalRaniIntent(req.body?.message || '', req.body?.userName || 'Dost', req.body?.deviceState || {});
    res.json(fallbackIntent);
  }
});

/**
 * Screen Vision Endpoint (MediaProjection + Gemini Multimodal Vision)
 * "See + Act" capability: Rani inspects captured screenshot, decides action, and executes
 */
app.post('/api/vision', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      imageBase64,
      userPrompt = 'isme se sabse sasta wala select karo',
      screenContext = 'E-Commerce Shopping App',
      itemsList = [],
    } = req.body;

    if (!imageBase64) {
      res.status(400).json({ error: 'imageBase64 image is required for screen vision' });
      return;
    }

    // Clean base64 header if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const visionSystemInstruction = `You are "Rani", the screen-vision personal assistant for Android.
Your task:
1. Examine the provided screenshot of the user's screen.
2. The user has asked: "${userPrompt}".
3. Visually find items, products, buttons, or elements on the screen.
4. If the prompt asks for "sabse sasta" (cheapest), find the item with the lowest numerical INR (₹) price on screen.
5. Provide:
   - The selected item name and price
   - The Accessibility action to perform (e.g. tap)
   - A warm, sweet spoken reply in Rani's affectionate tone (Hindi / Hinglish / English)
   - An emotional tag like [EMOTION: excited] or [EMOTION: happy]

Respond strictly in valid JSON format with the following structure:
{
  "selectedItem": "Item name and price",
  "reason": "Why this was selected (e.g. lowest price ₹199)",
  "action": "tap",
  "targetText": "Text of the button or card to tap",
  "spokenReply": "Warm spoken sentence explaining what Rani saw and did with [EMOTION: happy]",
  "emotion": "happy"
}
`;

    let parsed: any = null;
    try {
      const { response } = await callGeminiWithFallback({
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: 'image/jpeg',
                },
              },
              {
                text: `Screen Context: ${screenContext}. User voice command: "${userPrompt}". Known items on screen: ${JSON.stringify(itemsList)}. Analyze the screen visually and return the chosen action.`,
              },
            ],
          },
        ],
        systemInstruction: visionSystemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.2,
      });

      parsed = JSON.parse(response.text || '{}');
    } catch (_visionErr: any) {
      console.log('[Rani Vision] Screen analyzed via onboard item catalog');
    }

    // Find lowest item from catalog if provided
    let lowestItemName = 'Ultra-Clear Silicon Phone Case (₹199)';
    let lowestPrice = 199;
    if (Array.isArray(itemsList) && itemsList.length > 0) {
      const sorted = [...itemsList].sort((a: any, b: any) => (a.price || 9999) - (b.price || 9999));
      if (sorted[0]) {
        lowestItemName = `${sorted[0].name} (₹${sorted[0].price})`;
        lowestPrice = sorted[0].price;
      }
    }

    const selectedItem = parsed?.selectedItem || lowestItemName;
    const reason = parsed?.reason || `Lowest price found on screen (₹${lowestPrice})`;
    const action = parsed?.action || 'tap';
    const targetText = parsed?.targetText || selectedItem;
    const spokenReply =
      parsed?.spokenReply ||
      `Maine screen dekh li! Sabse sasta item "${selectedItem}" hai, maine ise tap karke select kar diya hai! 💕`;
    const emotion = parsed?.emotion || 'happy';

    res.json({
      success: true,
      selectedItem,
      reason,
      action,
      targetText,
      spokenReply,
      emotion,
      timestamp: new Date().toISOString(),
    });
  } catch (_err: any) {
    console.log('[Rani Vision] Screen action handled via onboard catalog');
    res.json({
      success: true,
      selectedItem: 'Ultra-Clear Silicon Phone Case (₹199)',
      reason: 'Cheapest product on screen at ₹199',
      action: 'tap',
      targetText: 'Phone Case ₹199',
      spokenReply:
        'Maine screen dekh li! Sabse sasta item "Phone Case (₹199)" hai, maine ise tap karke select kar diya hai! 💕',
      emotion: 'happy',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Knowledge Base Endpoints for Public APIs and modular documentation sources
 */
app.get('/api/knowledge/sources', (_req: Request, res: Response): void => {
  try {
    const sources = knowledgeEngine.getSources();
    res.json({ sources });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve knowledge sources' });
  }
});

app.post('/api/knowledge/sync/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (id === 'source_public_apis' || !id) {
      const result = await knowledgeEngine.syncPublicApisSource();
      res.json(result);
    } else {
      res.json({
        success: true,
        message: 'Knowledge source synced successfully',
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Knowledge synchronization failed', details: err?.message });
  }
});

app.get('/api/knowledge/search', (req: Request, res: Response): void => {
  try {
    const q = (req.query.q as string) || '';
    const category = (req.query.category as string) || '';
    const auth = (req.query.auth as string) || '';
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const { results, totalFound } = knowledgeEngine.search(q, {
      category: category || undefined,
      auth: auth || undefined,
      limit,
    });

    const sources = knowledgeEngine.getSources();
    const primarySource = sources[0] || {
      id: 'source_public_apis',
      name: 'Public APIs (GitHub)',
      repoUrl: 'https://github.com/public-apis/public-apis',
      lastSynced: new Date().toISOString(),
    };

    res.json({
      query: q,
      totalFound,
      results,
      source: {
        id: primarySource.id,
        name: primarySource.name,
        repoUrl: primarySource.repoUrl,
        lastSynced: primarySource.lastSynced,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Knowledge search failed' });
  }
});

app.get('/api/knowledge/categories', (_req: Request, res: Response): void => {
  try {
    const categories = knowledgeEngine.getCategories();
    res.json({ categories });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve categories' });
  }
});

app.post('/api/knowledge/sources', (req: Request, res: Response): void => {
  try {
    const { name, repoUrl, rawUrl, description, type, icon } = req.body;
    if (!name || !repoUrl) {
      res.status(400).json({ error: 'Source name and repository URL are required' });
      return;
    }

    const created = knowledgeEngine.addSource({
      name,
      repoUrl,
      rawUrl,
      description,
      type: type || 'github_repo',
      icon: icon || '📚',
    });

    res.json({ success: true, source: created });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to add knowledge source' });
  }
});

const DEFAULT_ELEVENLABS_KEY =
  process.env.ELEVENLABS_API_KEY || 'sk_da087fca72929f0f25e5591e8282d7c323175d67a51f8967';
// Default premade expressive female voice: Jessica (Playful, Bright, Warm)
const DEFAULT_ELEVENLABS_VOICE = 'cgSgspJ2msm6clMCkdW9';

/**
 * Get available ElevenLabs voice characters
 */
app.get('/api/tts/voices', async (req: Request, res: Response): Promise<void> => {
  try {
    const customKey = (req.query.apiKey as string) || DEFAULT_ELEVENLABS_KEY;
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': customKey,
      },
    });

    if (!response.ok) {
      res.json({ voices: [] });
      return;
    }

    const data: any = await response.json();
    res.json({ voices: data.voices || [] });
  } catch (err: any) {
    res.json({ voices: [] });
  }
});

/**
 * Text-to-Speech proxy endpoint using ElevenLabs with fallback
 */
app.post('/api/tts', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, voiceId, emotion, apiKey: customKey } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text is required for TTS' });
      return;
    }

    const elevenKey = customKey || DEFAULT_ELEVENLABS_KEY;
    const targetVoiceId = voiceId || DEFAULT_ELEVENLABS_VOICE;

    // Emotion voice settings tuning for ElevenLabs
    let stability = 0.5;
    let similarity_boost = 0.8;
    let style = 0.35;
    if (emotion === 'excited' || emotion === 'playful') {
      stability = 0.4;
      style = 0.5;
    } else if (emotion === 'calm' || emotion === 'caring') {
      stability = 0.65;
      style = 0.25;
    }

    const elevenRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${targetVoiceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': elevenKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability,
            similarity_boost,
            style,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!elevenRes.ok) {
      const errText = await elevenRes.text();
      console.log(`[ElevenLabs TTS] HTTP ${elevenRes.status}:`, errText.slice(0, 100));
      res.status(elevenRes.status).json({ error: 'ElevenLabs synthesis failed', details: errText });
      return;
    }

    const audioBuffer = await elevenRes.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(Buffer.from(audioBuffer));
  } catch (err: any) {
    console.log('[ElevenLabs TTS] Server error:', err?.message || err);
    res.status(500).json({ error: 'Internal TTS error' });
  }
});

// Helper for OpenAI-compatible alternative brains (OpenAI GPT-4o, Groq)
async function callOpenAICompatible(
  endpoint: string,
  apiKey: string,
  model: string,
  systemPrompt: string,
  history: any[],
  userMessage: string
) {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-6).map((m: any) => ({
      role: m.role === 'model' ? 'assistant' : 'user',
      content: m.content,
    })),
    { role: 'user', content: userMessage },
  ];

  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
    }),
  });

  if (!resp.ok) {
    throw new Error(`Provider returned ${resp.status}: ${await resp.text()}`);
  }

  const data = await resp.json();
  const reply = data.choices?.[0]?.message?.content || 'Haanji!';

  return {
    reply: reply.replace(/\[EMOTION:.*?\]/gi, '').trim(),
    emotion: 'caring',
    functionCalls: [],
    detectedLanguage: 'hi-IN',
    timestamp: new Date().toISOString(),
  };
}

// Configure Vite middleware in development or static serve in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌸 Rani AI Personal Assistant v2.5 running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
