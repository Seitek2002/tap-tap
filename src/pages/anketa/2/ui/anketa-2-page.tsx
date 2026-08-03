import { Suspense, lazy, useState } from "react";
import { useNavigate } from "react-router";

import { ChevronLeft, Navigation } from "lucide-react";

import distanceCircle from "@/shared/assets/images/distance-circle.png";
import { useAnketaFlow } from "@/shared/lib/use-anketa-flow";
import { Modal } from "@/shared/ui/modal";
import { Progress } from "@/shared/ui/progress";
import { RangeSlider, Slider } from "@/shared/ui/slider";

// Карта (с Leaflet) грузится лениво — только после включения геолокации,
// чтобы тяжёлая библиотека не попадала в стартовый бандл.
const RadiusMap = lazy(() =>
  import("@/shared/ui/radius-map").then((module) => ({
    default: module.RadiusMap,
  })),
);

const MAX_DISTANCE = 150;

type Coords = { lat: number; lng: number };

export const Anketa2Page = () => {
  const navigate = useNavigate();
  const { goNext, progress } = useAnketaFlow();
  const [age, setAge] = useState<[number, number]>([18, 28]);
  const [distance, setDistance] = useState(80);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [isGeoOpen, setIsGeoOpen] = useState(false);

  const requestGeolocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Координаты получены — включаем слайдер и карту.
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsGeoOpen(false);
      },
      () => {
        // Отказ/ошибка — оставляем слайдер выключенным, шит закрываем.
        setIsGeoOpen(false);
      },
    );
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
            onClick={goNext}
            className="text-sm text-[#1C1E24]"
          >
            Пропустить
          </button>
        </div>

        {/* Прогресс */}
        <Progress className="mt-3" value={progress} />

        <h1 className="mt-5 text-2xl font-bold">Настрой рекомендации</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Подкорректируй под себя для удобства
        </p>

        {/* Возраст */}
        <div className="mt-8">
          <h2 className="mb-3 text-center text-sm font-bold">Возраст</h2>
          <RangeSlider min={18} max={80} value={age} onChange={setAge} />
        </div>

        {/* Расстояние */}
        <div className="mt-8">
          <h2 className="mb-3 text-center text-sm font-bold">
            Расстояние от тебя
          </h2>
          <div className="flex items-center gap-4 rounded-full border border-border-soft px-5 py-3">
            <Slider
              className="flex-1"
              disabled={!coords}
              min={1}
              max={MAX_DISTANCE}
              value={distance}
              onChange={setDistance}
            />
            <span className="shrink-0 text-sm text-foreground">
              {distance} км
            </span>
          </div>

          {/* До геолокации — кнопка; после — карта с радиусом */}
          {coords ? (
            <Suspense
              fallback={
                <div className="mt-4 h-56 w-full animate-pulse rounded-2xl bg-[#6B7280]" />
              }
            >
              <RadiusMap
                className="mt-4 h-56 w-full overflow-hidden rounded-2xl"
                lat={coords.lat}
                lng={coords.lng}
                radiusKm={distance}
              />
            </Suspense>
          ) : (
            <button
              type="button"
              onClick={() => setIsGeoOpen(true)}
              className="mt-3 w-full rounded-full border border-border-soft py-3.5 text-sm font-semibold text-foreground transition-colors active:bg-[#6B7280]"
            >
              Указать расстояние
            </button>
          )}
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

      {/* Шит «Включи геолокацию» */}
      <Modal isOpen={isGeoOpen} onClose={() => setIsGeoOpen(false)}>
        <div className="text-center">
          <h2 className="text-xl font-bold">Включи геолокацию</h2>
          <p className="mx-auto mt-2 max-w-xs text-sm text-[#6B7280]">
            Это поможет показывать тебе людей поближе к тебе и рекомендовать
            тем, кто рядом
          </p>

          <img
            src={distanceCircle}
            alt=""
            className="mx-auto my-6 w-full max-w-xs"
          />

          <button
            type="button"
            onClick={requestGeolocation}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-semibold text-white transition-transform active:scale-[0.99]"
          >
            <Navigation className="size-5" />
            Включить геолокацию
          </button>
        </div>
      </Modal>
    </div>
  );
};
