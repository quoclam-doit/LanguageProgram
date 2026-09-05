export function playAudioPronunciation(term: string, audioUrl?: string): void {
  if (!term || !term.trim()) return;
  const cleanTerm = term.trim();

  // Helper for Web Speech API fallback
  const speakWebSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // Clear queued speech synthesis to prevent freeze

      const utter = new SpeechSynthesisUtterance(cleanTerm);
      utter.lang = 'en-US';
      utter.rate = 0.95;

      const voices = window.speechSynthesis.getVoices();
      const enVoice = voices.find((v) => v.lang === 'en-US' || v.lang.startsWith('en'));
      if (enVoice) {
        utter.voice = enVoice;
      }

      window.speechSynthesis.speak(utter);
    } catch (err) {
      console.error('[WebSpeech Error]:', err);
    }
  };

  // If audioUrl is provided, race-load it with a 1.2s timeout
  if (audioUrl && audioUrl.startsWith('http')) {
    let handled = false;
    const audio = new Audio();

    const timeoutId = setTimeout(() => {
      if (!handled) {
        handled = true;
        audio.src = ''; // Cancel network loading
        speakWebSpeech();
      }
    }, 1200);

    audio.oncanplaythrough = () => {
      if (!handled) {
        handled = true;
        clearTimeout(timeoutId);
        audio.play().catch(() => {
          speakWebSpeech();
        });
      }
    };

    audio.onerror = () => {
      if (!handled) {
        handled = true;
        clearTimeout(timeoutId);
        speakWebSpeech();
      }
    };

    audio.src = audioUrl;
    audio.load();
  } else {
    speakWebSpeech();
  }
}
