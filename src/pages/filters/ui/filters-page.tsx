import { useState } from "react";
import { useNavigate } from "react-router";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Modal } from "@/shared/ui/modal";
import { Pill } from "@/shared/ui/pill";
import { RangeSlider, Slider } from "@/shared/ui/slider";
import { Toggle } from "@/shared/ui/toggle";

const AUDIENCE = [
  { label: "Мужчины", value: "men" },
  { label: "Женщины", value: "women" },
  { label: "Все", value: "all" },
];

const TOGGLES = [
  { defaultOn: true, key: "hasPhoto", label: "Только с фото" },
  { defaultOn: false, key: "hasBio", label: "Есть описание" },
  { defaultOn: true, key: "hasJob", label: "Есть работа" },
  { defaultOn: true, key: "hasCar", label: "Есть машина" },
  { defaultOn: true, key: "hasCredit", label: "Хорошая кредитная история" },
] as const;

const SEEKING_OPTIONS = [
  { emoji: "💬", label: "Просто общаться" },
  { emoji: "💕", label: "Серьезные отношения" },
  { emoji: "💜", label: "Построить семью" },
];

const DEFAULT_SEEKING = SEEKING_OPTIONS[0].label;

const INTERESTS = [
  "🎳 Боулинг",
  "🧘 Йога",
  "⛰️ Горы",
  "🍷 Вино",
  "🌱 Вегетерианство",
  "🎾 Теннис",
  "💃 Танцы",
  "🐱 Кошки",
  "🐶 Собаки",
  "🎪 Фестивали",
  "🎤 Пение",
  "🎬 Кино",
  "🎵 Музыка",
  "🧁 Выпечка",
  "🧩 Паззлы",
  "✈️ Путешествия",
  "🎮 Игры",
  "👗 Мода",
  "⚽ Спорт",
  "🎧 RnB",
  "💻 Технологии",
  "🎲 Настолки",
  "🌲 Природа",
  "🎉 Вечеринки",
  "🏳️‍🌈 ЛГБТК+",
  "👻 Ужасы",
  "🎫 Концерты",
  "🎙️ Подкасты",
  "📚 Книги",
  "🕹️ Онлайн-игры",
  "🍺 Бары",
  "🍳 Готовка",
  "🏍️ Мотоциклы",
];

const DEFAULT_INTERESTS = ["🌱 Вегетерианство", "🧩 Паззлы", "🌲 Природа"];

const ZODIAC_SIGNS = [
  "♈ Овен",
  "♉ Телец",
  "♊ Близнецы",
  "♋ Рак",
  "♌ Лев",
  "♍ Дева",
  "♎ Весы",
  "♏ Скорпион",
  "♐ Стрелец",
  "♑ Козерог",
  "♒ Водолей",
  "♓ Рыбы",
];

const DEFAULT_ZODIAC = "♋ Рак";

// Поля с вертикальным списком пилюль (одиночный или до max=2 вариантов).
// Конфиг вместо восьми одинаковых блоков разметки — вся разница между ними в
// наборе опций и лимите выбора.
const OPTION_FIELDS = [
  {
    key: "education",
    label: "Образование",
    max: 1,
    options: [
      "Бакалавриат",
      "Средне-специальное",
      "Техникум",
      "Доктор наук",
      "Аспирантура",
      "Магистратура",
      "9 классов",
      "11 классов",
    ],
    title: "Образование партнера",
  },
  {
    key: "alcohol",
    label: "Алкоголь",
    max: 1,
    options: [
      "Я не пью",
      "Категорически против",
      "Пью редко",
      "По особым случаям",
      "Пью за компанию",
      "Иногда",
      "Люблю выпить",
      "По выходным",
    ],
    title: "Алкоголь партнера",
  },
  {
    key: "smoking",
    label: "Курение",
    max: 1,
    options: [
      "Я не курю",
      "Категорически против",
      "Редко курю",
      "Бросаю",
      "Активно курю",
      "Курю за компанию",
      "Курю, когда выпью",
    ],
    title: "Курение партнера",
  },
  {
    key: "sport",
    label: "Спорт",
    max: 1,
    options: ["Каждый день", "Иногда", "Очень редко"],
    title: "Спорт партнера",
  },
  {
    key: "loveLanguage",
    label: "Язык любви",
    max: 2,
    options: [
      "Жесты внимания",
      "Комплименты",
      "Забота",
      "Подарки",
      "Совместное время",
      "Прикосновения",
      "Интеллектуальная любовь",
      "Эмоции",
    ],
    title: "Язык любви партнера",
  },
  {
    key: "children",
    label: "Дети",
    max: 1,
    options: [
      "Хочу когда-нибудь",
      "Пока не знаю",
      "Дети есть и хочу еще",
      "Дети есть, больше не хочу",
    ],
    title: "Дети партнера",
  },
  {
    key: "pets",
    label: "Питомцы",
    max: 2,
    options: [
      "Собаки",
      "Кошки",
      "Рыбы",
      "Рептилии",
      "Птицы",
      "Черепахи",
      "Хомяки",
      "Кролики",
      "Всех",
      "У меня аллергия",
      "Другое",
    ],
    title: "Питомцы партнера",
  },
  {
    key: "religion",
    label: "Религия",
    max: 1,
    options: [
      "Ислам",
      "Атеизм",
      "Христианство",
      "Мормонизм",
      "Агностицизм",
      "Спиритуализм",
      "Протестантизм",
      "Иудаизм",
      "Буддизм",
      "Католичество",
      "Другое",
    ],
    title: "Религия партнера",
  },
] as const;

type OptionFieldKey = (typeof OPTION_FIELDS)[number]["key"];

const DEFAULT_OPTION_VALUES: Record<OptionFieldKey, string[]> = {
  alcohol: ["Пью редко"],
  children: ["Пока не знаю"],
  education: ["9 классов"],
  loveLanguage: ["Совместное время"],
  pets: ["Собаки"],
  religion: ["Буддизм"],
  smoking: ["Я не курю"],
  sport: ["Иногда"],
};

const DEFAULT_TOGGLES = Object.fromEntries(
  TOGGLES.map((toggle) => [toggle.key, toggle.defaultOn]),
) as Record<(typeof TOGGLES)[number]["key"], boolean>;

/** Склонение «интерес/интереса/интересов» по числу. */
const interestsWord = (count: number) => {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "интерес";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20))
    return "интереса";
  return "интересов";
};

export const FiltersPage = () => {
  const navigate = useNavigate();
  const [audience, setAudience] = useState("men");
  const [age, setAge] = useState<[number, number]>([18, 28]);
  const [distance, setDistance] = useState(80);
  const [height, setHeight] = useState(175);
  const [toggles, setToggles] = useState(DEFAULT_TOGGLES);

  const [seeking, setSeeking] = useState(DEFAULT_SEEKING);
  const [isSeekingOpen, setIsSeekingOpen] = useState(false);

  const [interests, setInterests] = useState<string[]>(DEFAULT_INTERESTS);
  const [isInterestsOpen, setIsInterestsOpen] = useState(false);

  const [zodiac, setZodiac] = useState(DEFAULT_ZODIAC);
  const [isZodiacOpen, setIsZodiacOpen] = useState(false);

  const [optionValues, setOptionValues] = useState(DEFAULT_OPTION_VALUES);
  const [openField, setOpenField] = useState<null | OptionFieldKey>(null);

  const toggleInterest = (value: string) =>
    setInterests((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );

  // max=1 — выбор сразу закрывает шит (радио-семантика: тап = готово).
  // max>1 — тап только переключает опцию, шит остаётся открытым.
  const selectOption = (
    field: (typeof OPTION_FIELDS)[number],
    option: string,
  ) => {
    if (field.max === 1) {
      setOptionValues((prev) => ({ ...prev, [field.key]: [option] }));
      setOpenField(null);
      return;
    }
    setOptionValues((prev) => {
      const current = prev[field.key];
      if (current.includes(option)) {
        return {
          ...prev,
          [field.key]: current.filter((item) => item !== option),
        };
      }
      if (current.length >= field.max) return prev;
      return { ...prev, [field.key]: [...current, option] };
    });
  };

  const clearFilters = () => {
    setAudience("men");
    setAge([18, 28]);
    setDistance(80);
    setHeight(175);
    setToggles(DEFAULT_TOGGLES);
    setSeeking(DEFAULT_SEEKING);
    setInterests(DEFAULT_INTERESTS);
    setZodiac(DEFAULT_ZODIAC);
    setOptionValues(DEFAULT_OPTION_VALUES);
  };

  return (
    <div className="flex h-dvh flex-col bg-[#FAF9FD] text-[#1C1E24]">
      {/* Шапка */}
      <header className="grid grid-cols-[auto_1fr_auto] items-center gap-2 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex size-9 items-center justify-center rounded-full border border-[#6B7280] bg-white justify-self-start"
        >
          <ChevronLeft className="size-5" />
        </button>
        <h1 className="text-center text-base font-bold">Фильтры</h1>
        <button
          type="button"
          onClick={clearFilters}
          className="text-sm font-medium text-[#1C1E24] underline underline-offset-2 justify-self-end"
        >
          Очистить
        </button>
      </header>

      {/* Прокручиваемая часть */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {/* Тебя интересуют */}
        <div className="rounded-2xl bg-white p-4">
          <h2 className="text-sm font-bold">Тебя интересуют</h2>
          {/* Сегмент-контрол (как antd Segmented): общий фон, выбранная
              опция — плавающая пилюля внутри, а не отдельные чипы с зазором. */}
          <div className="mt-3 flex gap-1 rounded-full bg-[#F2F1F3] p-1">
            {AUDIENCE.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setAudience(item.value)}
                className={cn(
                  "flex-1 rounded-full py-2 text-sm font-medium transition-colors",
                  audience === item.value
                    ? "bg-[#1C1E24] text-white"
                    : "text-[#6B7280]",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Возраст + расстояние */}
        <div className="mt-3 space-y-6 rounded-2xl bg-white p-4">
          <div>
            <h2 className="text-sm font-bold">Возраст</h2>
            <RangeSlider
              className="mt-3 rounded-none border-0 px-0 py-0"
              min={18}
              max={60}
              value={age}
              onChange={setAge}
            />
          </div>

          <div>
            <h2 className="text-sm font-bold">Расстояние</h2>
            <div className="mt-3 flex items-center gap-3">
              <Slider
                className="flex-1"
                min={1}
                max={150}
                value={distance}
                onChange={setDistance}
              />
              <span className="shrink-0 text-sm text-[#6B7280]">
                {distance} км
              </span>
            </div>
          </div>
        </div>

        {/* Больше фильтров */}
        <div className="mt-6 flex items-center gap-2">
          <h2 className="text-lg font-bold">Больше фильтров</h2>
          <span className="rounded-full bg-linear-to-r from-primary to-[#F5A623] px-2.5 py-1 text-[10px] font-bold tracking-wide text-white uppercase">
            Premium
          </span>
        </div>

        <div className="mt-3 divide-y divide-[#E4E7EC] rounded-2xl bg-white px-4">
          {TOGGLES.map((toggle) => (
            <div
              key={toggle.key}
              className="flex items-center justify-between py-3.5"
            >
              <span className="text-sm font-medium">{toggle.label}</span>
              <Toggle
                checked={toggles[toggle.key]}
                onChange={(event) =>
                  setToggles((prev) => ({
                    ...prev,
                    [toggle.key]: event.target.checked,
                  }))
                }
              />
            </div>
          ))}

          <div className="py-3.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Рост от</span>
              <span className="text-sm text-[#6B7280]">{height} см</span>
            </div>
            <Slider
              className="mt-3"
              min={140}
              max={210}
              value={height}
              onChange={setHeight}
            />
          </div>

          {/* Ищет — открывает шит одиночного выбора */}
          <button
            type="button"
            onClick={() => setIsSeekingOpen(true)}
            className="flex w-full items-center justify-between py-3.5 text-left"
          >
            <span className="text-sm font-medium">Ищет</span>
            <span className="flex items-center gap-1 text-sm text-[#6B7280]">
              {seeking}
              <ChevronRight className="size-4" />
            </span>
          </button>

          {/* Интересы — открывает шит мультивыбора */}
          <button
            type="button"
            onClick={() => setIsInterestsOpen(true)}
            className="flex w-full items-center justify-between py-3.5 text-left"
          >
            <span className="text-sm font-medium">Интересы</span>
            <span className="flex items-center gap-1 text-sm text-[#6B7280]">
              {interests.length} {interestsWord(interests.length)}
              <ChevronRight className="size-4" />
            </span>
          </button>

          {/* Знак зодиака — открывает шит одиночного выбора */}
          <button
            type="button"
            onClick={() => setIsZodiacOpen(true)}
            className="flex w-full items-center justify-between py-3.5 text-left"
          >
            <span className="text-sm font-medium">Знак зодиака</span>
            <span className="flex items-center gap-1 text-sm text-[#6B7280]">
              {zodiac}
              <ChevronRight className="size-4" />
            </span>
          </button>

          {/* Остальные поля — тот же вертикальный список пилюль, 1 или 2
              варианта на выбор (см. OPTION_FIELDS) */}
          {OPTION_FIELDS.map((field) => {
            const selected = optionValues[field.key];
            return (
              <button
                key={field.key}
                type="button"
                onClick={() => setOpenField(field.key)}
                className="flex w-full items-center justify-between py-3.5 text-left"
              >
                <span className="text-sm font-medium">{field.label}</span>
                <span className="flex items-center gap-1 text-sm text-[#6B7280]">
                  {selected.length > 0 ? selected.join(", ") : "Указать"}
                  <ChevronRight className="size-4 shrink-0" />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Шит: «Партнёр ищет» — одиночный выбор */}
      <Modal isOpen={isSeekingOpen} onClose={() => setIsSeekingOpen(false)}>
        <h2 className="text-center text-lg font-bold">Партнёр ищет</h2>

        <div className="mt-4 space-y-2">
          {SEEKING_OPTIONS.map((option) => {
            const selected = seeking === option.label;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => {
                  setSeeking(option.label);
                  setIsSeekingOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-full px-4 py-3.5 text-sm font-medium transition-colors",
                  selected
                    ? "bg-primary text-white"
                    : "bg-[#F2F1F3] text-[#1C1E24]",
                )}
              >
                <span className="text-lg">{option.emoji}</span>
                {option.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setIsSeekingOpen(false)}
          className="mt-5 w-full rounded-full bg-[#1C1E24] py-3 text-sm font-semibold text-white"
        >
          Готово
        </button>
      </Modal>

      {/* Шит: «Выбери интересы партнера» — мультивыбор */}
      <Modal isOpen={isInterestsOpen} onClose={() => setIsInterestsOpen(false)}>
        <h2 className="text-lg font-bold">Выбери интересы партнера</h2>

        <div className="mt-4 flex flex-wrap gap-2 pb-4">
          {INTERESTS.map((item) => (
            <Pill
              key={item}
              variant="outline"
              selected={interests.includes(item)}
              onClick={() => toggleInterest(item)}
            >
              {item}
            </Pill>
          ))}
        </div>

        <div className="sticky bottom-0 -mx-5 -mb-5 bg-linear-to-t from-white via-white to-transparent px-5 pt-6 pb-5">
          <button
            type="button"
            onClick={() => setIsInterestsOpen(false)}
            className="w-full rounded-full bg-[#1C1E24] py-4 text-sm font-semibold text-white"
          >
            Готово
          </button>
        </div>
      </Modal>

      {/* Шит: «Знак зодиака партнера» — одиночный выбор */}
      <Modal isOpen={isZodiacOpen} onClose={() => setIsZodiacOpen(false)}>
        <h2 className="text-center text-lg font-bold">Знак зодиака партнера</h2>

        <div className="mt-4 flex flex-wrap gap-2">
          {ZODIAC_SIGNS.map((sign) => (
            <Pill
              key={sign}
              selected={zodiac === sign}
              onClick={() => {
                setZodiac(sign);
                setIsZodiacOpen(false);
              }}
            >
              {sign}
            </Pill>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsZodiacOpen(false)}
          className="mt-5 w-full rounded-full bg-[#1C1E24] py-3 text-sm font-semibold text-white"
        >
          Готово
        </button>
      </Modal>

      {/* Шиты остальных полей — вертикальный список пилюль, 1 из OPTION_FIELDS */}
      {OPTION_FIELDS.map((field) => (
        <Modal
          key={field.key}
          isOpen={openField === field.key}
          onClose={() => setOpenField(null)}
        >
          <h2 className="text-center text-lg font-bold">{field.title}</h2>

          <div className="mt-4 space-y-2">
            {field.options.map((option) => {
              const selected = optionValues[field.key].includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => selectOption(field, option)}
                  className={cn(
                    "w-full rounded-full px-4 py-3.5 text-center text-sm font-medium transition-colors",
                    selected
                      ? "bg-primary text-white"
                      : "bg-[#F2F1F3] text-[#1C1E24]",
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setOpenField(null)}
            className="mt-5 w-full rounded-full bg-[#1C1E24] py-3 text-sm font-semibold text-white"
          >
            Готово
          </button>
        </Modal>
      ))}
    </div>
  );
};
