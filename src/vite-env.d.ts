/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_MOCK_MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Web Speech API — TS lib.dom.d.ts включает вспомогательные типы события
// (SpeechRecognitionEvent и т.п.), но не сам конструктор: он до сих пор
// везде за префиксом webkit- (см. use-speech-recognition.ts).
interface SpeechRecognition extends EventTarget {
  abort(): void;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start(): void;
  stop(): void;
}

declare const SpeechRecognition: {
  new (): SpeechRecognition;
  prototype: SpeechRecognition;
};

interface Window {
  SpeechRecognition?: typeof SpeechRecognition;
  webkitSpeechRecognition?: typeof SpeechRecognition;
}
