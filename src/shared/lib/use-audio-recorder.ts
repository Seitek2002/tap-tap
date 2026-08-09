import { useEffect, useRef, useState } from "react";

export type AudioRecorderStatus = "idle" | "recorded" | "recording";

export const MAX_VOICE_RECORDING_SEC = 60;

// Chrome/Android отдают webm/opus, Safari/iOS — mp4/aac; без явного mimeType
// MediaRecorder иногда выбирает то, для чего на бэке нет расширения (см.
// MIME_TO_EXTENSION в bakai-server/lib/mime.js).
const CANDIDATE_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg",
];

function pickSupportedMimeType(): string | undefined {
  return CANDIDATE_MIME_TYPES.find((type) =>
    MediaRecorder.isTypeSupported(type),
  );
}

/** Запись голоса через MediaRecorder. onRecorded зовётся один раз на каждую
 * завершённую запись — так вызывающий код может сразу залить файл, не
 * дожидаясь отдельного эффекта. */
export function useAudioRecorder(onRecorded?: (blob: Blob) => void) {
  const [status, setStatus] = useState<AudioRecorderStatus>("idle");
  const [durationSec, setDurationSec] = useState(0);
  const [audioUrl, setAudioUrl] = useState<null | string>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<null | ReturnType<typeof setInterval>>(null);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const stopTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  // Уход со страницы во время записи не должен оставлять микрофон висеть
  // активным в фоне.
  useEffect(() => {
    return () => {
      stopTimer();
      stopStream();
    };
  }, []);

  const start = async () => {
    if (status === "recording") return;
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setDurationSec(0);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    chunksRef.current = [];

    const recorder = new MediaRecorder(stream, {
      mimeType: pickSupportedMimeType(),
    });
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
      setAudioUrl(URL.createObjectURL(blob));
      setStatus("recorded");
      stopStream();
      onRecorded?.(blob);
    };

    recorder.start();
    recorderRef.current = recorder;
    setStatus("recording");

    intervalRef.current = setInterval(() => {
      setDurationSec((seconds) => {
        const next = seconds + 1;
        if (next >= MAX_VOICE_RECORDING_SEC) recorderRef.current?.stop();
        return next;
      });
    }, 1000);
  };

  const stop = () => {
    stopTimer();
    recorderRef.current?.stop();
  };

  const reset = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setDurationSec(0);
    setStatus("idle");
  };

  return { audioUrl, durationSec, reset, start, status, stop };
}
