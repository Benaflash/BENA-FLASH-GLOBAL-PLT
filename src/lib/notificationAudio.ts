// Bena Flash Global PLT - Audio Chime & Speech Synthesizer for PWA Notifications

/**
 * Plays a signature 2-tone chime followed by spoken voice "Bena Flash"
 */
export function playBenaFlashRingtone(): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // Tone 1 - High clarity C5 (523.25 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      // Tone 2 - Golden G5 (783.99 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(783.99, now + 0.15);
      gain2.gain.setValueAtTime(0.4, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.55);

      // Tone 3 - Brilliance C6 (1046.50 Hz)
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = "sine";
      osc3.frequency.setValueAtTime(1046.50, now + 0.3);
      gain3.gain.setValueAtTime(0.35, now + 0.3);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now + 0.3);
      osc3.stop(now + 0.8);
    }
  } catch (e) {
    console.warn("Audio Context playback failed or restricted:", e);
  }

  // Speak "Bena Flash" via SpeechSynthesis after short delay
  if ("speechSynthesis" in window) {
    setTimeout(() => {
      try {
        window.speechSynthesis.cancel(); // cancel any ongoing speech
        const utterance = new SpeechSynthesisUtterance("Bena Flash!");
        utterance.lang = "ms-MY";
        utterance.rate = 1.0;
        utterance.pitch = 1.1;
        utterance.volume = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("Speech synthesis error:", err);
      }
    }, 350);
  }
}

/**
 * Triggers a web browser notification and plays the "BENA FLASH" sound
 */
export async function triggerBenaFlashNotification(
  title: string = "Bena Flash Global PLT",
  body: string = "Terima kasih kerana memilih Bena Flash Global. Servis anda sedang diproses!"
): Promise<boolean> {
  // Always play the ringtone
  playBenaFlashRingtone();

  if (!("Notification" in window)) {
    return false;
  }

  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      vibrate: [200, 100, 200],
    } as any);
    return true;
  } else if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      new Notification(title, {
        body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        vibrate: [200, 100, 200],
      } as any);
      return true;
    }
  }
  return false;
}
