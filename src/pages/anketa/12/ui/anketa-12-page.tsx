import { type ChangeEvent, useRef, useState } from "react";
import { useNavigate } from "react-router";

import {
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  Image as ImageIcon,
  Plus,
  X,
} from "lucide-react";

import goodImg1 from "@/shared/assets/images/good-img-1.jpg";
import goodImg2 from "@/shared/assets/images/good-img-2.jpg";
import notGoodImg1 from "@/shared/assets/images/not-good-img-1.jpg";
import notGoodImg2 from "@/shared/assets/images/not-good-img-2.jpg";
import { isAndroid } from "@/shared/lib/platform";
import { useAnketaFlow } from "@/shared/lib/use-anketa-flow";
import { Modal } from "@/shared/ui/modal";
import { Progress } from "@/shared/ui/progress";

const PHOTO_SLOTS = 6;

const TIPS = [
  {
    bad: notGoodImg1,
    good: goodImg1,
    text: "Выбирай свои настоящие фото, не вводя других в заблуждение",
    title: "Будь честным",
  },
  {
    bad: notGoodImg2,
    good: goodImg2,
    text: "Выбирай такие фото, на которых хорошо видно лицо",
    title: "Ясность — это важно",
  },
];

export const Anketa12Page = () => {
  const navigate = useNavigate();
  const { goNext, progress } = useAnketaFlow();
  const [photos, setPhotos] = useState<(null | string)[]>(
    Array(PHOTO_SLOTS).fill(null),
  );
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const targetSlot = useRef<null | number>(null);

  const openSlot = (index: number) => {
    targetSlot.current = index;
    // Android: свой шит с выбором источника. iOS/прочее: нативный пикер сам
    // предложит «Медиатека / Снять фото / Выбрать файл».
    if (isAndroid()) {
      setIsPickerOpen(true);
    } else {
      galleryInputRef.current?.click();
    }
  };

  const pickFromGallery = () => {
    setIsPickerOpen(false);
    galleryInputRef.current?.click();
  };

  const takePhoto = () => {
    setIsPickerOpen(false);
    cameraInputRef.current?.click();
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const index = targetSlot.current;
    event.target.value = ""; // чтобы повторный выбор того же файла срабатывал
    if (!file || index === null) return;

    const url = URL.createObjectURL(file);
    setPhotos((prev) =>
      prev.map((value, i) => {
        if (i !== index) return value;
        if (value) URL.revokeObjectURL(value);
        return url;
      }),
    );
  };

  const removePhoto = (index: number) =>
    setPhotos((prev) =>
      prev.map((value, i) => {
        if (i !== index) return value;
        if (value) URL.revokeObjectURL(value);
        return null;
      }),
    );

  return (
    <div className="flex h-dvh flex-col bg-[#FAF9FD] text-[#1C1E24]">
      {/* Верхняя прокручиваемая часть */}
      <div className="flex-1 overflow-y-auto px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex size-9 items-center justify-center rounded-full border border-[#6B7280] bg-white"
          >
            <ChevronLeft className="size-5" />
          </button>
        </div>

        {/* Прогресс */}
        <Progress className="mt-3" value={progress} />

        <h1 className="mt-5 text-2xl font-bold">Добавь свои крутые фото</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Мы будем сравнивать ваше фото с фотографией тундука
        </p>

        {/* Сетка фото */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="relative aspect-[3/4] overflow-hidden rounded-2xl"
            >
              {photo ? (
                <>
                  <img src={photo} alt="" className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-white shadow"
                  >
                    <X className="size-3.5" />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => openSlot(index)}
                  className="flex size-full items-center justify-center bg-[#F2F1F3]"
                >
                  <span className="relative">
                    <Camera className="size-8" />
                    <span className="absolute -top-1 -right-2 flex size-4 items-center justify-center rounded-full bg-primary text-white">
                      <Plus className="size-3" />
                    </span>
                  </span>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Скрытые инпуты: галерея и камера */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFile}
        />

        {/* Рекомендации */}
        <p className="mt-6 text-center text-sm text-[#6B7280]">
          Следуй нашим рекомендациям, чтобы твой профиль смотрелся намного лучше
        </p>
        <div className="mt-2 flex justify-center text-[#6B7280]">
          <ChevronDown className="size-5" />
        </div>

        <div className="mt-3 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TIPS.map((tip) => (
            <div
              key={tip.title}
              className="w-[85%] shrink-0 rounded-2xl bg-white p-4"
            >
              <h3 className="text-center text-sm font-bold">{tip.title}</h3>
              <p className="mt-1 text-center text-xs text-[#6B7280]">
                {tip.text}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="relative">
                  <div className="aspect-[3/4] overflow-hidden rounded-xl bg-[#E4E7EC]">
                    <img
                      src={tip.bad}
                      alt=""
                      className="size-full object-cover"
                    />
                  </div>
                  <span className="absolute bottom-0 left-1/2 flex size-7 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-red-500 text-white">
                    <X className="size-4" />
                  </span>
                </div>
                <div className="relative">
                  <div className="aspect-[3/4] overflow-hidden rounded-xl bg-[#E4E7EC]">
                    <img
                      src={tip.good}
                      alt=""
                      className="size-full object-cover"
                    />
                  </div>
                  <span className="absolute bottom-0 left-1/2 flex size-7 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-green-500 text-white">
                    <Check className="size-4" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Нижняя панель */}
      <div className="px-4 pt-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={goNext}
          className="w-full rounded-full bg-primary py-4 text-sm font-semibold text-white transition-transform active:scale-[0.99]"
        >
          Далее
        </button>
      </div>

      {/* Выбор источника фото — только на Android */}
      <Modal isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)}>
        <div className="space-y-2">
          <button
            type="button"
            onClick={pickFromGallery}
            className="flex w-full items-center gap-3 rounded-2xl bg-[#F2F1F3] p-4 font-medium"
          >
            <ImageIcon className="size-5 text-primary" />
            Выбрать из галереи
          </button>
          <button
            type="button"
            onClick={takePhoto}
            className="flex w-full items-center gap-3 rounded-2xl bg-[#F2F1F3] p-4 font-medium"
          >
            <Camera className="size-5 text-primary" />
            Сделать фотографию
          </button>
        </div>
      </Modal>
    </div>
  );
};
