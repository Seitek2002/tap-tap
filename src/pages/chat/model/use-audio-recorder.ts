import { useEffect, useRef, useState } from "react";

export type AudioRecorderStatus = "idle" | "recording";

export const MAX_VOICE_RECORDING_SEC = 120;

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

/** Запись голосового сообщения через MediaRecorder — в отличие от анкеты-7
 * (голосовой ВВОД, распознаётся в текст), здесь нужен сам аудиофайл: его
 * потом можно переслушать/перематывать (см. VoiceMessagePlayer). Не хранит
 * свой собственный audioUrl — вызывающий код сам решает, что делать с
 * готовым blob (здесь: положить в pendingAttachments), и сам владеет
 * жизненным циклом object URL. onRecorded зовётся один раз на каждую
 * завершённую (не отменённую) запись. */
export function useAudioRecorder(
  onRecorded?: (blob: Blob, durationSec: number) => void,
) {
  const [status, setStatus] = useState<AudioRecorderStatus>("idle");
  const [durationSec, setDurationSec] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<null | ReturnType<typeof setInterval>>(null);
  const durationRef = useRef(0);
  const cancelledRef = useRef(false);

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
    setDurationSec(0);
    durationRef.current = 0;
    cancelledRef.current = false;

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
      setStatus("idle");
      stopStream();
      if (!cancelledRef.current) onRecorded?.(blob, durationRef.current);
    };

    recorder.start();
    recorderRef.current = recorder;
    setStatus("recording");

    intervalRef.current = setInterval(() => {
      setDurationSec((seconds) => {
        const next = seconds + 1;
        durationRef.current = next;
        if (next >= MAX_VOICE_RECORDING_SEC) recorderRef.current?.stop();
        return next;
      });
    }, 1000);
  };

  const stop = () => {
    stopTimer();
    recorderRef.current?.stop();
  };

  // Отменить запись в процессе — тот же stop, но onRecorded не зовётся.
  const cancel = () => {
    cancelledRef.current = true;
    stopTimer();
    recorderRef.current?.stop();
    setStatus("idle");
  };

  return { cancel, durationSec, start, status, stop };
}
