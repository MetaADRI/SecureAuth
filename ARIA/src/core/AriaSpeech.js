let femaleVoice = null;
let voicesReady = false;

function findFemaleVoice(voices) {
  const femaleNames = [
    'zira', 'hazel', 'helena', 'catherine', 'samantha', 'karen',
    'moira', 'fiona', 'tessa', 'veena', 'amalee', 'alice',
    'anna', 'jenny', 'libby', 'aria', 'susan', 'linda',
    'julie', 'emma', 'olivia', 'ava', 'sophia', 'isabella',
    'megan', 'heather', 'female', 'girl', 'woman'
  ];
  const en = voices.filter(v => v.lang && v.lang.startsWith('en'));
  for (const name of femaleNames) {
    const found = en.find(v => v.name.toLowerCase().includes(name));
    if (found) return found;
  }
  return en[0] || null;
}

function refreshVoices() {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length) {
    femaleVoice = findFemaleVoice(voices);
    voicesReady = true;
  }
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  refreshVoices();
  window.speechSynthesis.onvoiceschanged = refreshVoices;
}

export function speakMessage(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  if (!text || !text.trim()) return;
  if (!voicesReady) refreshVoices();
  const utter = new SpeechSynthesisUtterance(text.trim());
  utter.rate = 0.88;
  utter.pitch = 1.35;
  if (femaleVoice) utter.voice = femaleVoice;
  window.speechSynthesis.speak(utter);
}

export function stopSpeaking() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
