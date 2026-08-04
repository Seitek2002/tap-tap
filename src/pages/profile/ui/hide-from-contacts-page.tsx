import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

import { Check, ChevronLeft, Search, TriangleAlert } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { BottomNav } from "@/widgets/bottom-nav";

import {
  useBlockContactMutation,
  useBlockedContactsQuery,
  useUnblockContactMutation,
} from "@/entities/user";

import { ROUTES } from "@/shared/config";
import { isMockMode } from "@/shared/lib/mock-mode";
import { useMounted } from "@/shared/lib/use-mounted";
import { useScrollLock } from "@/shared/lib/use-scroll-lock";
import { cn } from "@/shared/lib/utils";
import { Modal } from "@/shared/ui/modal";
import { Skeleton } from "@/shared/ui/skeleton";
import { Toggle } from "@/shared/ui/toggle";

import { type Contact, MOCK_BLACKLIST, MOCK_CONTACTS } from "../model/contacts";

const TABS = [
  { key: "contacts", label: "Контакты" },
  { key: "blacklist", label: "Черный список" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const ALPHABET = "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЭЮЯ".split("");

const groupByLetter = (contacts: Contact[]) => {
  const groups = new Map<string, Contact[]>();
  for (const contact of contacts) {
    const letter = contact.name[0]?.toUpperCase() ?? "#";
    groups.set(letter, [...(groups.get(letter) ?? []), contact]);
  }
  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
};

// Центрированный алерт (не боттомщит) — как системный пермишен-диалог,
// тот же паттерн, что EnableNotificationsModal в notifications-page.
const ImportBlockedModal = ({
  isOpen,
  onChangeSettings,
  onClose,
}: {
  isOpen: boolean;
  onChangeSettings: () => void;
  onClose: () => void;
}) => {
  const mounted = useMounted();
  useScrollLock(isOpen);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 px-6"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-xs rounded-3xl bg-white p-6 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ damping: 22, stiffness: 300, type: "spring" }}
          >
            <TriangleAlert className="text-primary mx-auto size-12" />
            <h2 className="mt-4 text-lg font-bold">Ты запретил импорт</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Разреши нам доступ к твоей телефонной книге, чтобы импортировать
              контакты
            </p>
            <button
              type="button"
              onClick={onChangeSettings}
              className="mt-5 w-full rounded-full bg-[#1C1E24] py-4 font-bold text-white"
            >
              Изменить настройки
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 text-sm font-semibold text-[#6B7280]"
            >
              Отмена
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export const HideFromContactsPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>("contacts");
  // По умолчанию контактов нет — импорт ещё не выполнялся.
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [query, setQuery] = useState("");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [isImportBlockedOpen, setIsImportBlockedOpen] = useState(false);
  const [isAccessSettingsOpen, setIsAccessSettingsOpen] = useState(false);
  const [contactsAccessGranted, setContactsAccessGranted] = useState(false);

  // Черный список — в mock-режиме свой набор, пополняемый локально (см.
  // blockSelectedContacts); в реальном — то, что реально хранится на бэке
  // (см. POST/GET/DELETE /api/blocks).
  const [mockBlacklist, setMockBlacklist] = useState<Contact[]>(MOCK_BLACKLIST);
  const [mockBlockedIds, setMockBlockedIds] = useState<number[]>(
    MOCK_BLACKLIST.map((contact) => contact.id),
  );
  const blockedContactsQuery = useBlockedContactsQuery(!isMockMode());
  const blockContactMutation = useBlockContactMutation();
  const unblockContactMutation = useUnblockContactMutation();

  const blacklist = isMockMode()
    ? mockBlacklist
    : (blockedContactsQuery.data ?? []);
  // В реальном режиме blacklist и есть список заблокированных — совпадает
  // тавтологично, зато кнопка строки ниже сама становится всегда
  // "Разблокировать", без отдельной ветки для реального режима.
  const blockedIds = isMockMode()
    ? mockBlockedIds
    : blacklist.map((contact) => contact.id);

  const toggleBlocked = async (contact: Contact) => {
    if (isMockMode()) {
      setMockBlockedIds((prev) =>
        prev.includes(contact.id)
          ? prev.filter((item) => item !== contact.id)
          : [...prev, contact.id],
      );
      return;
    }
    try {
      await unblockContactMutation.mutateAsync(contact.id);
      toast.success(`${contact.name} разблокирован(а)`);
    } catch {
      toast.error("Не получилось разблокировать");
    }
  };

  // Выбор контактов на вкладке «Контакты» для массовой блокировки.
  const [selectedContactIds, setSelectedContactIds] = useState<number[]>([]);

  const toggleContactSelected = (id: number) =>
    setSelectedContactIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );

  const blockSelectedContacts = async () => {
    const toBlock = contacts.filter((contact) =>
      selectedContactIds.includes(contact.id),
    );

    if (isMockMode()) {
      setMockBlacklist((prev) => {
        const existingIds = new Set(prev.map((contact) => contact.id));
        return [...prev, ...toBlock.filter((c) => !existingIds.has(c.id))];
      });
      setMockBlockedIds((prev) => [
        ...new Set([...prev, ...selectedContactIds]),
      ]);
      setSelectedContactIds([]);
      return;
    }

    try {
      // Последовательно, не Promise.all — тот же паттерн, что заливка фото
      // анкеты: одна за одной, без риска гонки на бэке.
      for (const contact of toBlock) {
        await blockContactMutation.mutateAsync({
          name: contact.name,
          phone: contact.phone,
        });
      }
      toast.success("Контакты заблокированы");
    } catch {
      toast.error("Не получилось заблокировать. Попробуй ещё раз");
    } finally {
      setSelectedContactIds([]);
    }
  };

  const activeList = tab === "contacts" ? contacts : blacklist;
  const filteredList = activeList.filter((contact) =>
    contact.name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const groupedList = groupByLetter(filteredList);

  // «Выбрать всех» — только для вкладки «Контакты»: выделяет (или снимает,
  // если уже выбраны все) все контакты, видимые с учётом текущего поиска.
  const allContactsSelected =
    tab === "contacts" &&
    filteredList.length > 0 &&
    filteredList.every((contact) => selectedContactIds.includes(contact.id));

  const selectAllContacts = () => {
    if (tab !== "contacts") return;
    setSelectedContactIds(
      allContactsSelected ? [] : filteredList.map((contact) => contact.id),
    );
  };

  const scrollToLetter = (letter: string) => {
    sectionRefs.current[letter]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const confirmAccessSettings = () => {
    setIsAccessSettingsOpen(false);
    if (contactsAccessGranted) setContacts(MOCK_CONTACTS);
  };

  return (
    <div className="flex h-dvh flex-col bg-[#FAF9FD] text-[#1C1E24]">
      <div className="flex-1 overflow-y-auto pb-4">
        <header className="flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Назад"
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#6B7280] bg-white"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={selectAllContacts}
            disabled={tab !== "contacts" || filteredList.length === 0}
            className={cn(
              "text-sm font-medium",
              tab === "contacts" && filteredList.length > 0
                ? "text-[#1C1E24]"
                : "text-[#6B7280]",
            )}
          >
            {allContactsSelected ? "Снять выбор" : "Выбрать всех"}
          </button>
        </header>

        <div className="px-4">
          <h1 className="text-2xl font-bold">
            Хочешь скрыть свой профиль от знакомых?
          </h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            Выбери контакты, с которыми ты не хочешь пересекаться
          </p>
        </div>

        {/* Сегмент-контрол (как antd Segmented): общий фон, выбранная опция —
            плавающая пилюля, которая переезжает между табами через shared
            layoutId, а не мгновенно перекрашивается. */}
        <div className="mx-4 mt-4 flex gap-1 rounded-full bg-[#F2F1F3] p-1">
          {TABS.map((item) => {
            const active = tab === item.key;
            const badgeCount = item.key === "blacklist" ? blockedIds.length : 0;
            return (
              <button
                key={item.key}
                type="button"
                data-haptic="medium"
                onClick={() => setTab(item.key)}
                className="relative flex-1 rounded-full py-2 text-sm font-medium"
              >
                {active && (
                  <motion.div
                    layoutId="contacts-tab-pill"
                    className="absolute inset-0 rounded-full bg-white shadow-sm"
                    transition={{ damping: 30, stiffness: 400, type: "spring" }}
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 flex items-center justify-center gap-1.5",
                    active ? "text-[#1C1E24]" : "text-[#6B7280]",
                  )}
                >
                  {item.label}
                  {badgeCount > 0 && (
                    <span className="flex size-4 items-center justify-center rounded-full bg-[#1C1E24] text-[10px] font-bold text-white">
                      {badgeCount}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 px-4">
          <div className="flex items-center gap-2 rounded-2xl bg-[#F2F1F3] px-4 py-3">
            <Search className="size-4 shrink-0 text-[#6B7280]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Найти контакт"
              className="w-full bg-transparent text-sm outline-none placeholder:text-[#6B7280]"
            />
          </div>
        </div>

        {tab === "contacts" && contacts.length === 0 && (
          <div className="mt-8 px-4">
            <div className="rounded-2xl border border-[#E4E7EC] bg-white p-4">
              <h2 className="font-bold">Импортируй контакты</h2>
              <p className="mt-2 text-sm text-[#6B7280]">
                Это поможет нам скрыть твой профиль от людей из твоей телефонной
                книги.
              </p>
              <p className="mt-2 text-sm text-[#6B7280]">
                Контакты будут использоваться только для поиска совпадений.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsImportBlockedOpen(true)}
              className="mt-4 w-full rounded-full bg-[#1C1E24] py-4 font-bold text-white"
            >
              Импортировать контакты
            </button>
            <button
              type="button"
              onClick={() => navigate(ROUTES.profileAddContactManually)}
              className="mt-3 w-full text-center text-sm font-semibold"
            >
              Добавить контакт вручную
            </button>
          </div>
        )}

        {tab === "blacklist" &&
        !isMockMode() &&
        blockedContactsQuery.isLoading ? (
          <div className="mt-6 space-y-2 px-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-14 w-full" />
            ))}
          </div>
        ) : (
          (tab === "blacklist" || contacts.length > 0) && (
            <div className="relative mt-6 pr-8">
              <div className="flex flex-col gap-4 px-4">
                {groupedList.map(([letter, items]) => (
                  <div
                    key={letter}
                    ref={(el) => {
                      sectionRefs.current[letter] = el;
                    }}
                  >
                    <span className="text-sm text-[#9CA3AF]">{letter}</span>
                    <div className="mt-2 divide-y divide-[#E4E7EC] overflow-hidden rounded-2xl bg-white">
                      {tab === "contacts"
                        ? items.map((contact) => {
                            const selected = selectedContactIds.includes(
                              contact.id,
                            );
                            return (
                              <button
                                key={contact.id}
                                type="button"
                                onClick={() =>
                                  toggleContactSelected(contact.id)
                                }
                                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                              >
                                <div className="min-w-0">
                                  <p className="truncate font-medium">
                                    {contact.name}
                                  </p>
                                  <p className="text-sm text-[#6B7280]">
                                    {contact.phone}
                                  </p>
                                </div>
                                <AnimatePresence>
                                  {selected && (
                                    <motion.span
                                      initial={{ opacity: 0, scale: 0.4 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.4 }}
                                      transition={{
                                        damping: 22,
                                        stiffness: 500,
                                        type: "spring",
                                      }}
                                      className="bg-primary flex size-6 shrink-0 items-center justify-center rounded-full text-white"
                                    >
                                      <Check className="size-3.5" />
                                    </motion.span>
                                  )}
                                </AnimatePresence>
                              </button>
                            );
                          })
                        : items.map((contact) => (
                            <div
                              key={contact.id}
                              className="flex items-center justify-between gap-3 px-4 py-3"
                            >
                              <div className="min-w-0">
                                <p className="truncate font-medium">
                                  {contact.name}
                                </p>
                                <p className="text-sm text-[#6B7280]">
                                  {contact.phone}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => void toggleBlocked(contact)}
                                className="shrink-0 rounded-full bg-[#1C1E24] px-3 py-2 text-xs font-semibold whitespace-nowrap text-white"
                              >
                                {blockedIds.includes(contact.id)
                                  ? "Разблокировать"
                                  : "Заблокировать"}
                              </button>
                            </div>
                          ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="fixed top-32 right-1 bottom-24 z-10 flex flex-col items-center justify-between py-1">
                {ALPHABET.map((letter) => (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => scrollToLetter(letter)}
                    className="text-[10px] leading-none font-medium text-[#9CA3AF]"
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>
          )
        )}
      </div>

      <ImportBlockedModal
        isOpen={isImportBlockedOpen}
        onClose={() => setIsImportBlockedOpen(false)}
        onChangeSettings={() => {
          setIsImportBlockedOpen(false);
          setIsAccessSettingsOpen(true);
        }}
      />

      <Modal
        isOpen={isAccessSettingsOpen}
        onClose={() => setIsAccessSettingsOpen(false)}
      >
        <h2 className="text-center text-lg font-bold">Доступ к контактам</h2>

        <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#F2F1F3] p-4">
          <span className="font-medium">Разрешить доступ к контактам</span>
          <Toggle
            checked={contactsAccessGranted}
            onChange={(event) => setContactsAccessGranted(event.target.checked)}
          />
        </div>

        <button
          type="button"
          onClick={confirmAccessSettings}
          className="mt-5 w-full rounded-full bg-[#1C1E24] py-4 font-bold text-white"
        >
          Готово
        </button>
      </Modal>

      <AnimatePresence mode="wait" initial={false}>
        {selectedContactIds.length > 0 ? (
          <motion.div
            key="block-bar"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ damping: 24, stiffness: 320, type: "spring" }}
            className="px-4 pt-3 pb-6"
          >
            <button
              type="button"
              onClick={() => void blockSelectedContacts()}
              className="w-full rounded-full bg-[#1C1E24] py-4 font-bold text-white"
            >
              Заблокировать
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="bottom-nav"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ damping: 24, stiffness: 320, type: "spring" }}
          >
            <BottomNav />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
