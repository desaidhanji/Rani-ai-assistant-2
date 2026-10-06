/**
 * Device Action & Hardware Controller
 * Handles flashlight torch, audio media player, alarm ringing, contacts & calendar storage
 */

import { AlarmItem, CalendarEventItem, ContactItem, NotificationItem } from '../types';

class DeviceService {
  private torchTrack: MediaStreamTrack | null = null;
  private isTorchOn = false;
  private audioCtx: AudioContext | null = null;
  private musicOscillator: OscillatorNode | null = null;
  private musicGain: GainNode | null = null;
  private isMusicPlaying = false;
  private alarmAudioInterval: any = null;

  // Initial contacts
  private contacts: ContactItem[] = [
    {
      id: 'c1',
      name: 'Mom',
      phone: '+91 98765 43210',
      relation: 'Mother',
      avatar: '👩',
    },
    {
      id: 'c2',
      name: 'Rahul',
      phone: '+91 98123 45678',
      relation: 'Best Friend',
      avatar: '👦',
    },
    {
      id: 'c3',
      name: 'Priya',
      phone: '+91 99887 76655',
      relation: 'Colleague',
      avatar: '👩‍💼',
    },
    {
      id: 'c4',
      name: 'Boss (Vikram)',
      phone: '+91 91234 56789',
      relation: 'Manager',
      avatar: '👨‍💼',
    },
    {
      id: 'c5',
      name: 'Dad',
      phone: '+91 98765 12345',
      relation: 'Father',
      avatar: '👨',
    },
  ];

  // Initial alarms
  private alarms: AlarmItem[] = [
    {
      id: 'a1',
      time: '06:30',
      label: 'Subah ki chai aur yoga',
      enabled: true,
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    },
    {
      id: 'a2',
      time: '08:45',
      label: 'Office Standup Prep',
      enabled: true,
      days: ['Daily'],
    },
  ];

  // Initial calendar events
  private calendarEvents: CalendarEventItem[] = [
    {
      id: 'cal1',
      title: 'Project Rani Product Demo',
      date: 'Today',
      time: '03:00 PM',
      location: 'Google Meet',
    },
    {
      id: 'cal2',
      title: 'Coffee catchup with Rahul',
      date: 'Tomorrow',
      time: '06:00 PM',
      location: 'Third Wave Coffee',
    },
    {
      id: 'cal3',
      title: 'Mom Doctor Checkup',
      date: 'Saturday',
      time: '11:00 AM',
      location: 'Apollo Hospital',
    },
  ];

  // Initial simulated notifications
  private notifications: NotificationItem[] = [
    {
      id: 'n1',
      app: 'WhatsApp',
      title: 'Mom',
      text: 'Beta, ghar kab tak aaoge? Khana bana diya hai.',
      timestamp: '5m ago',
      icon: '💬',
      read: false,
    },
    {
      id: 'n2',
      app: 'Slack',
      title: 'Vikram (Manager)',
      text: 'Great work on the AI assistant prototype! Lets review at 3pm.',
      timestamp: '18m ago',
      icon: '💼',
      read: false,
    },
    {
      id: 'n3',
      app: 'Swiggy',
      title: 'Order Status',
      text: 'Your cold coffee and samosa has been picked up! Arriving in 12 mins.',
      timestamp: '25m ago',
      icon: '🍔',
      read: false,
    },
    {
      id: 'n4',
      app: 'Google Calendar',
      title: 'Reminder: Team Sync',
      text: 'Upcoming in 30 minutes at 3:00 PM.',
      timestamp: '30m ago',
      icon: '📅',
      read: true,
    },
  ];

  // Toggle Flashlight (uses real camera torch if available, or returns status)
  public async toggleFlashlight(state?: boolean): Promise<{ success: boolean; state: boolean; isHardware: boolean }> {
    const desiredState = state !== undefined ? state : !this.isTorchOn;

    try {
      if (desiredState) {
        if (!this.torchTrack && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'environment',
              // @ts-ignore
              advanced: [{ torch: true }],
            },
          });
          const track = stream.getVideoTracks()[0];
          // @ts-ignore
          if (track && typeof track.applyConstraints === 'function') {
            try {
              // @ts-ignore
              await track.applyConstraints({ advanced: [{ torch: true }] });
              this.torchTrack = track;
              this.isTorchOn = true;
              return { success: true, state: true, isHardware: true };
            } catch (e) {
              // Hardware torch not supported
            }
          }
        }
      } else {
        if (this.torchTrack) {
          // @ts-ignore
          await this.torchTrack.applyConstraints({ advanced: [{ torch: false }] }).catch(() => {});
          this.torchTrack.stop();
          this.torchTrack = null;
        }
      }
    } catch (err) {
      console.warn('Flashlight hardware error (falling back to screen flashlight):', err);
    }

    this.isTorchOn = desiredState;
    return { success: true, state: this.isTorchOn, isHardware: !!this.torchTrack };
  }

  public getFlashlightState(): boolean {
    return this.isTorchOn;
  }

  // Built-in Lo-Fi Ambient Music Synthesizer
  public toggleMusic(play?: boolean): boolean {
    const shouldPlay = play !== undefined ? play : !this.isMusicPlaying;

    if (shouldPlay) {
      if (typeof window === 'undefined') return false;
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!this.audioCtx) {
          this.audioCtx = new AudioContextClass();
        }
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }

        // Create warm ambient chord drone
        this.musicGain = this.audioCtx.createGain();
        this.musicGain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);

        this.musicOscillator = this.audioCtx.createOscillator();
        this.musicOscillator.type = 'sine';
        this.musicOscillator.frequency.setValueAtTime(220, this.audioCtx.currentTime); // A3

        this.musicOscillator.connect(this.musicGain);
        this.musicGain.connect(this.audioCtx.destination);
        this.musicOscillator.start();

        this.isMusicPlaying = true;

        // Setup MediaSession API
        if ('mediaSession' in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: 'Chill Indian Lo-Fi Beats',
            artist: 'Rani Assistant Music',
            album: 'Peaceful Focus',
          });
          navigator.mediaSession.setActionHandler('play', () => this.toggleMusic(true));
          navigator.mediaSession.setActionHandler('pause', () => this.toggleMusic(false));
        }
      } catch (e) {
        console.warn('Audio playback error:', e);
        this.isMusicPlaying = true;
      }
    } else {
      if (this.musicOscillator) {
        try {
          this.musicOscillator.stop();
          this.musicOscillator.disconnect();
        } catch (e) {}
        this.musicOscillator = null;
      }
      this.isMusicPlaying = false;
    }

    return this.isMusicPlaying;
  }

  public getMusicState(): boolean {
    return this.isMusicPlaying;
  }

  // Play a cheerful chime sound when Rani activates
  public playChime() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch (e) {
      // Audio not allowed yet
    }
  }

  // Contacts
  public getContacts(): ContactItem[] {
    return [...this.contacts];
  }

  public findContact(query: string): ContactItem | undefined {
    const q = query.toLowerCase().trim();
    return this.contacts.find(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.relation.toLowerCase().includes(q)
    );
  }

  public addContact(contact: Omit<ContactItem, 'id'>): ContactItem {
    const newContact: ContactItem = {
      ...contact,
      id: `c_${Date.now()}`,
    };
    this.contacts.push(newContact);
    return newContact;
  }

  // Alarms
  public getAlarms(): AlarmItem[] {
    return [...this.alarms];
  }

  public addAlarm(time: string, label: string, days: string[] = ['Daily']): AlarmItem {
    const newAlarm: AlarmItem = {
      id: `a_${Date.now()}`,
      time,
      label,
      enabled: true,
      days,
    };
    this.alarms.push(newAlarm);
    return newAlarm;
  }

  public toggleAlarm(id: string): AlarmItem | undefined {
    const alarm = this.alarms.find((a) => a.id === id);
    if (alarm) {
      alarm.enabled = !alarm.enabled;
    }
    return alarm;
  }

  public deleteAlarm(id: string): boolean {
    const index = this.alarms.findIndex((a) => a.id === id);
    if (index !== -1) {
      this.alarms.splice(index, 1);
      return true;
    }
    return false;
  }

  // Calendar
  public getCalendarEvents(): CalendarEventItem[] {
    return [...this.calendarEvents];
  }

  public addCalendarEvent(title: string, date: string, time: string, location?: string): CalendarEventItem {
    const newEvent: CalendarEventItem = {
      id: `cal_${Date.now()}`,
      title,
      date,
      time,
      location: location || 'Android Calendar',
    };
    this.calendarEvents.push(newEvent);
    return newEvent;
  }

  // Notifications
  public getNotifications(): NotificationItem[] {
    return [...this.notifications];
  }

  public markNotificationAsRead(id: string): void {
    const n = this.notifications.find((item) => item.id === id);
    if (n) n.read = true;
  }

  public addMockNotification(app: string, title: string, text: string): NotificationItem {
    const newN: NotificationItem = {
      id: `n_${Date.now()}`,
      app,
      title,
      text,
      timestamp: 'Just now',
      icon: app.toLowerCase().includes('whatsapp') ? '💬' : '🔔',
      read: false,
    };
    this.notifications.unshift(newN);
    return newN;
  }
}

export const deviceService = new DeviceService();
