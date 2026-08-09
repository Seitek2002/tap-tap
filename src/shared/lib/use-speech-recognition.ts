import { useEffect, useRef, useState } from "react";

export type SpeechRecognitionStatus = "idle" | "listening";

function getSpeechRecognitionCtor() {
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}

export function isSpeechRecognitionSupported(): boolean {
  return Boolean(getSpeechRecognitionCtor());
}

/** Голосовой ввод (диктовка в текстовое поле, см. anketa-7) через
 * Web Speech API — не запись звука, а сразу распознанный текст.
 * continuous:true — сессия слушает до explicit stop(), не обрывается на
 * первой паузе между фразами; onResult зовётся с каждым НОВЫМ финальным
 * куском текста (не с накопленной целиком стенограммой). */
export function useSpeechRecognition(
  onResult: (text: string) => void,
  onError?: (error: SpeechRecognitionErrorCode) => void,
) {
  const [status, setStatus] = useState<SpeechRecognitionStatus>("idle");
  const recognitionRef = useRef<null | SpeechRecognition>(null);

  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  const start = () => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) throw new Error("Speech recognition not supported");

    const recognition = new Ctor();
    recognition.lang = "ru-RU";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (transcript) onResult(transcript);
    };
    recognition.onerror = (event) => {
      setStatus("idle");
      onError?.(event.error);
    };
    recognition.onend = () => setStatus("idle");

    recognition.start();
    recognitionRef.current = recognition;
    setStatus("listening");
  };

  const stop = () => {
    recognitionRef.current?.stop();
  };

  return { start, status, stop };
}
