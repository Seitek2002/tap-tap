import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

import { ChevronLeft, Mic, Square, Trash2 } from "lucide-react";

import {
  useAnketaDraftStore,
  useUploadVoiceBioMutation,
} from "@/entities/user";

import { formatDuration } from "@/shared/lib/format";
import { isMockMode } from "@/shared/lib/mock-mode";
import { useAnketaFlow } from "@/shared/lib/use-anketa-flow";
import {
  MAX_VOICE_RECORDING_SEC,
  useAudioRecorder,
} from "@/shared/lib/use-audio-recorder";
import { cn } from "@/shared/lib/utils";
import { Pill } from "@/shared/ui/pill";
import { Progress } from "@/shared/ui/progress";
import { VoicePlayer } from "@/shared/ui/voice-player";

const QUESTIONS = [
  "💪 Ты занимаешься спортом?",
  "🍀 Какие у тебя хобби?",
  "🐆 Каких животных ты любишь?",
  "🧿 Какая у тебя религия?",
];

export const Anketa7Page = () => {
  const navigate = useNavigate();
  const { goNext, progress } = useAnketaFlow();
  const setField = useAnketaDraftStore((state) => state.setField);
  const [bio, setBio] = useState("");
  const uploadVoiceBioMutation = useUploadVoiceBioMutation();

  const { audioUrl, durationSec, reset, start, status, stop } =
    useAudioRecorder((blob) => {
      if (isMockMode()) return;
      const file = new File([blob], "voice-bio", { type: blob.type });
      uploadVoiceBioMutation.mutate(file, {
        onError: () => toast.error("Не получилось сохранить голосовое"),
      });
    });

  const handleMicClick = async () => {
    if (status === "recording") {
      stop();
      return;
    }
    try {
      await start();
    } catch {
      toast.error("Не получилось получить доступ к микрофону");
    }
  };

  const commitAndNext = () => {
    setField("bio", bio);
    goNext();
  };

  return (
    <div className="flex h-dvh flex-col bg-[#FAF9FD] text-[#1C1E24]">
      {/* Верхняя прокручиваемая часть */}
      <div className="flex-1 overflow-y-auto px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex size-9 items-center justify-center rounded-full border border-[#6B7280] bg-white"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={commitAndNext}
            className="text-sm text-[#1C1E24]"
          >
            Пропустить
          </button>
        </div>

        {/* Прогресс */}
        <Progress className="mt-3" value={progress} />

        <h1 className="mt-5 text-2xl font-bold">Напиши немного о себе</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Что хочешь, чтобы другие знали заранее?
        </p>

        {/* Текст о себе */}
        <textarea
          rows={4}
          placeholder="Начинай писать, смелее"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          className="mt-6 w-full resize-none rounded-2xl border border-border-soft bg-white px-4 py-3.5 text-sm text-[#1C1E24] outline-none placeholder:text-[#6B7280]"
        />

        {/* Голосовое */}
        <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#F2F1F3]">
              <Mic className="size-4 text-[#6B7280]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1C1E24]">
                Расскажи о себе в голосовом
              </h3>
              <p className="mt-0.5 text-xs text-[#6B7280]">
                Ответь на несколько вопросов, это поможет другим лучше узнать
                тебя
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {QUESTIONS.map((question) => (
              <Pill key={question} className="text-xs">
                {question}
              </Pill>
            ))}
          </div>

          <div className="mt-5 flex flex-col items-center gap-2">
            {status === "recorded" && audioUrl ? (
              <div className="flex w-full items-center gap-3 rounded-2xl bg-[#F2F1F3] px-4 py-3">
                <VoicePlayer className="flex-1" src={audioUrl} />
                <button
                  type="button"
                  onClick={reset}
                  aria-label="Удалить и записать заново"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-[#6B7280]"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => void handleMicClick()}
                className={cn(
                  "flex size-16 items-center justify-center rounded-full transition-transform active:scale-95",
                  status === "recording"
                    ? "bg-red-500 text-white"
                    : "bg-primary/10 text-primary",
                )}
              >
                {status === "recording" ? (
                  <Square className="size-5" />
                ) : (
                  <Mic className="size-6" />
                )}
              </button>
            )}
            {status === "recording" && (
              <span className="text-sm font-medium text-red-500">
                {formatDuration(durationSec)} /{" "}
                {formatDuration(MAX_VOICE_RECORDING_SEC)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Нижняя панель */}
      <div className="px-4 pt-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={commitAndNext}
          className="w-full rounded-full bg-primary py-4 text-sm font-semibold text-white transition-transform active:scale-[0.99]"
        >
          Далее
        </button>
      </div>
    </div>
  );
};
