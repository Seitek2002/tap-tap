import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate, useParams } from "react-router";

import {
  Camera,
  Check,
  ChevronLeft,
  File,
  Image as ImageIcon,
  Mic,
  MoreHorizontal,
  Plus,
  Send,
  Smile,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { useSessionStore } from "@/entities/session";
import {
  useBlockUserMutation,
  useChatMessagesQuery,
  useChatQuery,
  useChatSocket,
  useReportUserMutation,
  useUnmatchMutation,
  useUploadChatAttachmentMutation,
} from "@/entities/user";

import { resolveUploadUrl } from "@/shared/api";
import person1 from "@/shared/assets/images/person-1.jpg";
import { REPORT_REASONS, ROUTES } from "@/shared/config";
import { formatDateRu } from "@/shared/lib/format-date-ru";
import { formatLastSeen } from "@/shared/lib/format-last-seen";
import {
  NotificationType,
  triggerNotificationHaptic,
} from "@/shared/lib/haptics";
import { isMockMode } from "@/shared/lib/mock-mode";
import { isAndroid } from "@/shared/lib/platform";
import { useKeyboardInset } from "@/shared/lib/use-keyboard-inset";
import { cn } from "@/shared/lib/utils";
import { ImageWithSkeleton } from "@/shared/ui/image-with-skeleton";
import { Modal } from "@/shared/ui/modal";
import { Skeleton } from "@/shared/ui/skeleton";
import { Spinner } from "@/shared/ui/spinner";

import { CHATS } from "../model/chats";
import { INITIAL_MESSAGES, type Message } from "../model/messages";
import { PhotoViewer } from "./photo-viewer";
import { TypingIndicator } from "./typing-indicator";

// Пока у собеседника нет ни одного загруженного фото.
const FALLBACK_PHOTO = person1;

// Вложения выбраны, но ещё не отправлены — лежат рядом с инпутом до нажатия
// на иконку отправки, как в Telegram/WhatsApp. Можно накопить несколько штук.
type PendingAttachment = { file: File; id: number } & (
  { fileName: string; kind: "file" } | { imageUrl: string; kind: "image" }
);

// Ограничение типов вложений в чате: только картинки и документы (задача
// "Тартар" — pdf/jpeg/png/jpg/webp/avif; jpg и jpeg — один и тот же MIME).
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];
const ALLOWED_FILE_TYPES_ACCEPT = ALLOWED_FILE_TYPES.join(",");
const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"];
const ALLOWED_FILE_EXTENSIONS = ["pdf", ...ALLOWED_IMAGE_EXTENSIONS];
// Сколько вложений можно накопить в одном сообщении, пока не отправил.
const MAX_ATTACHMENTS = 10;

const getFileExtension = (file: File) =>
  file.name.split(".").pop()?.toLowerCase() ?? "";

// Некоторые файловые провайдеры (особенно на Android) отдают File без MIME
// (file.type === "") — тогда сверяемся по расширению, иначе такие файлы
// ошибочно попадали бы в "не тот тип", хотя по факту могут быть валидными.
const isAllowedFile = (file: File) =>
  file.size > 0 &&
  (file.type
    ? ALLOWED_FILE_TYPES.includes(file.type)
    : ALLOWED_FILE_EXTENSIONS.includes(getFileExtension(file)));

const isImageFile = (file: File) =>
  file.type
    ? file.type.startsWith("image/")
    : ALLOWED_IMAGE_EXTENSIONS.includes(getFileExtension(file));

const MessageBubble = ({
  message,
  onImageClick,
}: {
  message: Message;
  onImageClick: (imageUrl: string) => void;
}) => {
  const isOutgoing = message.type === "outgoing";
  const { imageUrl } = message;

  // Мелкое действие (отправка) — спиннер, а не скелетон: это статус-строка
  // под уже отрисованным сообщением, а не заглушка на месте контента.
  const status = message.sending ? (
    <span className="flex items-center gap-1 text-xs text-[#6B7280]">
      <Spinner className="size-3" />
      Отправка...
    </span>
  ) : message.seen ? (
    <span className="flex items-center gap-1 text-xs text-[#6B7280]">
      <Check className="text-primary size-3.5" />
      Просмотрено
    </span>
  ) : null;

  if (message.kind === "image") {
    return (
      <div
        className={cn(
          "flex flex-col gap-1 w-full",
          isOutgoing ? "self-end items-end" : "self-start items-start",
        )}
      >
        {imageUrl ? (
          <button type="button" onClick={() => onImageClick(imageUrl)}>
            <img
              src={imageUrl}
              alt=""
              className="w-42 rounded-2xl object-cover"
            />
          </button>
        ) : (
          <div className="flex aspect-square w-42 items-center justify-center rounded-2xl bg-[#E4E7EC] text-[#9CA3AF]">
            <ImageIcon className="size-8" />
          </div>
        )}
        {status}
      </div>
    );
  }

  if (message.kind === "file") {
    const fileContent = (
      <div
        className={cn(
          "flex max-w-[75%] items-center gap-3 rounded-2xl px-3 py-3",
          isOutgoing
            ? "bg-primary text-white"
            : "self-start bg-[#EFEDF6] text-[#1C1E24]",
        )}
      >
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            isOutgoing ? "bg-white/20" : "bg-white",
          )}
        >
          <File className="size-5" />
        </div>
        <span className="min-w-0 truncate text-sm font-medium">
          {message.fileName}
        </span>
      </div>
    );

    return (
      <div
        className={cn(
          "flex flex-col gap-1 w-full",
          isOutgoing ? "self-end items-end" : "self-start items-start",
        )}
      >
        {/* Реальный файл (с бэка) — кликабельная ссылка на скачивание;
            локально выбранный, ещё не отправленный — просто превью. */}
        {message.fileUrl ? (
          <a href={message.fileUrl} target="_blank" rel="noreferrer">
            {fileContent}
          </a>
        ) : (
          fileContent
        )}
        {status}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-1 w-full",
        isOutgoing ? "self-end items-end" : "self-start items-start",
      )}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-3xl px-4 py-2.5 text-sm",
          isOutgoing
            ? "bg-primary self-end text-white"
            : "self-start bg-[#EFEDF6] text-[#1C1E24]",
        )}
      >
        {message.text}
      </div>
      {status}
    </div>
  );
};

export const ChatRoomPage = () => {
  const navigate = useNavigate();
  // Из MatchOverlay — текст, который написали прямо на экране "Это
  // взаимно!". Подставляем как черновик один раз при монтировании, а не
  // отправляем сами — сокет чата подключается чуть ниже и ещё не готов
  // принимать сообщения на этом же рендере.
  const locationState = useLocation().state as {
    initialMessage?: string;
  } | null;
  const { chatId } = useParams<{ chatId: string }>();
  const numericChatId = chatId ? Number(chatId) : null;
  const mockChat = CHATS.find((item) => String(item.id) === chatId);
  const keyboardInset = useKeyboardInset();
  const myUserId = useSessionStore((state) => state.userId);

  const chatQuery = useChatQuery(isMockMode() ? null : numericChatId);
  const messagesQuery = useChatMessagesQuery(
    isMockMode() ? null : numericChatId,
  );
  const partnerId = isMockMode() ? null : (chatQuery.data?.partner.id ?? null);
  const {
    chatRemoved,
    liveMessages,
    notifyStopTyping,
    notifyTyping,
    partnerStatus,
    partnerTyping,
    sendMessage: sendSocketMessage,
  } = useChatSocket(isMockMode() ? null : numericChatId, partnerId);

  // Партнёр разорвал пару/заблокировал, пока этот чат был открыт — сам чат на
  // бэке уже удалён, дальше тут делать нечего.
  useEffect(() => {
    if (!chatRemoved) return;
    toast.error("Собеседник разорвал пару — переписка удалена");
    navigate(ROUTES.chat, { replace: true });
  }, [chatRemoved, navigate]);
  const uploadAttachmentMutation = useUploadChatAttachmentMutation(
    isMockMode() ? null : numericChatId,
  );
  const unmatchMutation = useUnmatchMutation();
  const blockMutation = useBlockUserMutation();
  const reportMutation = useReportUserMutation();
  const [isSendingAttachments, setIsSendingAttachments] = useState(false);

  const displayName = isMockMode()
    ? (mockChat?.name ?? "Собеседник")
    : chatQuery.data?.partner.name || "Собеседник";
  const displayPhoto = isMockMode()
    ? (mockChat?.photo ?? FALLBACK_PHOTO)
    : chatQuery.data?.partner.photo
      ? resolveUploadUrl(chatQuery.data.partner.photo)
      : FALLBACK_PHOTO;
  const isOnline = isMockMode()
    ? (mockChat?.online ?? false)
    : (partnerStatus?.online ?? chatQuery.data?.partner.online === 1);
  const lastSeenAt = isMockMode()
    ? null
    : (partnerStatus?.lastSeenAt ?? chatQuery.data?.partner.lastSeenAt ?? null);

  const [mockMessages, setMockMessages] = useState(INITIAL_MESSAGES);
  // Реальный режим: объединяем историю с REST и то, что доливает сокет, пока
  // страница открыта — сортируем и убираем дубли (история может пересечься с
  // уже пришедшим по сокету сообщением при повторном фетче). useMemo — эта
  // страница держит черновик сообщения в своём же state, и без мемоизации
  // весь список пересобирался бы заново на каждое нажатие клавиши.
  const realMessages: Message[] = useMemo(() => {
    if (isMockMode()) return [];
    return Array.from(
      new Map(
        [...(messagesQuery.data ?? []), ...liveMessages].map((message) => [
          message.id,
          message,
        ]),
      ).values(),
    )
      .sort((a, b) => a.id - b.id)
      .map((message): Message => {
        const type = message.sender_id === myUserId ? "outgoing" : "incoming";
        const seen = message.read === 1;

        if (message.kind === "image" && message.attachment_url) {
          return {
            created_at: message.created_at,
            id: message.id,
            imageUrl: resolveUploadUrl(message.attachment_url),
            kind: "image",
            seen,
            type,
          };
        }
        if (message.kind === "file" && message.attachment_url) {
          return {
            created_at: message.created_at,
            fileName: message.file_name ?? "Файл",
            fileUrl: resolveUploadUrl(message.attachment_url),
            id: message.id,
            kind: "file",
            seen,
            type,
          };
        }
        return {
          created_at: message.created_at,
          id: message.id,
          kind: "text",
          seen,
          text: message.text,
          type,
        };
      });
  }, [messagesQuery.data, liveMessages, myUserId]);
  const messages = isMockMode() ? mockMessages : realMessages;
  // Date.now() — импюрный вызов, нельзя звать прямо в теле рендера (React
  // Compiler это ловит) — фиксируем один раз при монтировании тем же
  // паттерном, что и лениво инициализированный useState ниже.
  const [mockToday] = useState(() => Date.now());
  // Дата начала переписки — раньше тут была статичная строка-заглушка,
  // никогда не менявшаяся ни в одном чате. В мок-режиме у сообщений нет
  // created_at вообще — показываем сегодняшнюю дату для демо; в реальном —
  // дату самого раннего сообщения, а если сообщений ещё нет (только что
  // созданный мэтч) — не показываем плашку вообще, датировать пока нечего.
  const conversationDate = messages[0]?.created_at
    ? formatDateRu(messages[0].created_at)
    : isMockMode()
      ? formatDateRu(mockToday)
      : null;

  const [draft, setDraft] = useState(() => locationState?.initialMessage ?? "");
  const [pendingAttachments, setPendingAttachments] = useState<
    PendingAttachment[]
  >([]);
  const [viewerImageUrl, setViewerImageUrl] = useState<null | string>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUnmatchOpen, setIsUnmatchOpen] = useState(false);
  const [isBlockOpen, setIsBlockOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Object URL живёт, пока явно не отозван (removeAttachment) — если уйти со
  // страницы с неотправленными фото-вложениями, они не отзовутся сами собой
  // и останутся висеть в памяти. Ref держит актуальный список специально для
  // cleanup при размонтировании, а не для рендера.
  const pendingAttachmentsRef = useRef(pendingAttachments);
  useEffect(() => {
    pendingAttachmentsRef.current = pendingAttachments;
  }, [pendingAttachments]);

  useEffect(() => {
    return () => {
      for (const attachment of pendingAttachmentsRef.current) {
        if (attachment.kind === "image") {
          URL.revokeObjectURL(attachment.imageUrl);
        }
      }
    };
  }, []);

  // Mock-режим без бэка — имитируем сетевой раунд-трип: сообщение сразу
  // появляется со статусом "Отправка..." (Spinner), через SEND_DELAY_MS
  // помечается отправленным.
  const SEND_DELAY_MS = 600;

  const sendMockMessage = () => {
    const text = draft.trim();
    const newMessages: Message[] = [];
    let nextId = mockMessages.length + 1;

    for (const attachment of pendingAttachments) {
      if (attachment.kind === "image") {
        newMessages.push({
          id: nextId,
          imageUrl: attachment.imageUrl,
          kind: "image",
          sending: true,
          type: "outgoing",
        });
      } else {
        newMessages.push({
          fileName: attachment.fileName,
          id: nextId,
          kind: "file",
          sending: true,
          type: "outgoing",
        });
      }
      nextId += 1;
    }

    if (text) {
      newMessages.push({
        id: nextId,
        kind: "text",
        sending: true,
        text,
        type: "outgoing",
      });
    }

    setMockMessages((prev) => [...prev, ...newMessages]);

    const sentIds = new Set(newMessages.map((message) => message.id));
    setTimeout(() => {
      setMockMessages((prev) =>
        prev.map((message) =>
          sentIds.has(message.id) ? { ...message, sending: false } : message,
        ),
      );
    }, SEND_DELAY_MS);
  };

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text && pendingAttachments.length === 0) return;

    if (isMockMode()) {
      sendMockMessage();
      setDraft("");
      setPendingAttachments([]);
      return;
    }

    const attachments = pendingAttachments;
    setDraft("");
    setPendingAttachments([]);

    if (attachments.length > 0) {
      setIsSendingAttachments(true);
      try {
        // Последовательно, не Promise.all — сервер пишет вложения по одному
        // в ту же строку чата, параллельные запросы рискуют гонкой.
        for (const attachment of attachments) {
          await uploadAttachmentMutation.mutateAsync(attachment.file);
          if (attachment.kind === "image") {
            URL.revokeObjectURL(attachment.imageUrl);
          }
        }
      } catch {
        toast.error("Не получилось отправить вложение");
      } finally {
        setIsSendingAttachments(false);
      }
    }

    if (text) {
      sendSocketMessage(text);
      notifyStopTyping();
    }
  };

  const handleDraftChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDraft(event.target.value);
    if (isMockMode()) return;
    if (event.target.value.trim()) {
      notifyTyping();
    } else {
      notifyStopTyping();
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    const allowedFiles = files.filter(isAllowedFile);
    if (allowedFiles.length < files.length) {
      triggerNotificationHaptic(NotificationType.Error);
      toast.error("Можно отправлять только картинки и документы (PDF)");
    }
    if (allowedFiles.length === 0) return;

    setPendingAttachments((prev) => {
      const freeSlots = Math.max(0, MAX_ATTACHMENTS - prev.length);
      if (freeSlots < allowedFiles.length) {
        triggerNotificationHaptic(NotificationType.Error);
        toast.error(
          `Можно прикрепить не больше ${MAX_ATTACHMENTS} файлов за раз`,
        );
      }

      return [
        ...prev,
        ...allowedFiles.slice(0, freeSlots).map((file, index) => {
          const id = prev.length + index + 1;
          return isImageFile(file)
            ? {
                file,
                id,
                imageUrl: URL.createObjectURL(file),
                kind: "image" as const,
              }
            : { file, fileName: file.name, id, kind: "file" as const };
        }),
      ];
    });
  };

  const removeAttachment = (id: number) => {
    setPendingAttachments((prev) => {
      const attachment = prev.find((item) => item.id === id);
      if (attachment?.kind === "image")
        URL.revokeObjectURL(attachment.imageUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  // Android: свой шит с выбором источника. iOS/прочее: нативный пикер сам
  // предложит «Медиатека / Снять фото / Выбрать файл».
  const openAttachMenu = () => {
    if (isAndroid()) {
      setIsAttachMenuOpen(true);
      return;
    }
    fileInputRef.current?.click();
  };

  const takePhoto = () => {
    setIsAttachMenuOpen(false);
    cameraInputRef.current?.click();
  };

  const pickFromGallery = () => {
    setIsAttachMenuOpen(false);
    galleryInputRef.current?.click();
  };

  const pickFile = () => {
    setIsAttachMenuOpen(false);
    fileInputRef.current?.click();
  };

  const openUnmatchFromMenu = () => {
    setIsMenuOpen(false);
    setIsUnmatchOpen(true);
  };

  const openBlockFromMenu = () => {
    setIsMenuOpen(false);
    setIsBlockOpen(true);
  };

  const openReportFromMenu = () => {
    setIsMenuOpen(false);
    setIsReportOpen(true);
  };

  const reportFromUnmatch = () => {
    setIsUnmatchOpen(false);
    setIsReportOpen(true);
  };

  const reportFromBlock = () => {
    setIsBlockOpen(false);
    setIsReportOpen(true);
  };

  // Переписка и её элемент в списке живут в разных страницах, поэтому
  // «удалить»/«заблокировать» здесь не мутируют список — просто возвращают
  // к нему, как будто чата больше нет.
  const confirmUnmatch = async () => {
    setIsUnmatchOpen(false);
    if (isMockMode() || partnerId === null) {
      navigate(ROUTES.chat);
      return;
    }
    try {
      await unmatchMutation.mutateAsync(partnerId);
    } catch {
      toast.error("Не получилось удалить пару. Попробуй ещё раз");
      return;
    }
    navigate(ROUTES.chat);
  };

  const confirmBlock = async () => {
    setIsBlockOpen(false);
    if (isMockMode() || partnerId === null) {
      navigate(ROUTES.chat);
      return;
    }
    try {
      await blockMutation.mutateAsync(partnerId);
    } catch {
      toast.error("Не получилось заблокировать. Попробуй ещё раз");
      return;
    }
    navigate(ROUTES.chat);
  };

  const submitReport = async (reason: string) => {
    setIsReportOpen(false);
    if (isMockMode() || partnerId === null) return;
    try {
      await reportMutation.mutateAsync({ reason, reportedId: partnerId });
      toast.success("Жалоба отправлена");
    } catch {
      toast.error("Не получилось отправить жалобу");
    }
  };

  if (!isMockMode() && (chatQuery.isLoading || messagesQuery.isLoading)) {
    return (
      <div className="flex h-dvh flex-col gap-2 bg-[#FAF9FD] p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-11 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="mt-4 h-16 w-2/3 self-start" />
        <Skeleton className="h-10 w-1/2 self-end" />
        <Skeleton className="h-16 w-2/3 self-start" />
      </div>
    );
  }

  return (
    <div
      className="flex h-dvh flex-col bg-[#FAF9FD] text-[#1C1E24]"
      style={
        keyboardInset > 0
          ? { height: `calc(100dvh - ${keyboardInset}px)` }
          : undefined
      }
    >
      <header className="flex items-center gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Назад"
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#6B7280] bg-white"
        >
          <ChevronLeft className="size-5" />
        </button>
        <ImageWithSkeleton
          src={displayPhoto}
          alt=""
          loading="eager"
          className="size-11 shrink-0 rounded-full"
        />
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-bold">{displayName}</h1>
          <p className="flex items-center gap-1 text-sm text-[#6B7280]">
            {partnerTyping ? (
              <>
                Печатает
                <TypingIndicator />
              </>
            ) : isOnline ? (
              "В сети"
            ) : (
              `Был(а) в сети ${formatLastSeen(lastSeenAt)}`
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          aria-label="Меню"
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#6B7280] bg-white"
        >
          <MoreHorizontal className="size-5" />
        </button>
      </header>

      {conversationDate && (
        <p className="py-2 text-center text-xs text-[#6B7280]">
          {conversationDate}
        </p>
      )}

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 pb-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onImageClick={setViewerImageUrl}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-[#E4E7EC] bg-white">
        {pendingAttachments.length > 0 && (
          <div className="flex gap-2 overflow-x-auto px-4 pt-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {pendingAttachments.map((attachment) => (
              <div key={attachment.id} className="relative shrink-0">
                {attachment.kind === "image" ? (
                  <img
                    src={attachment.imageUrl}
                    alt=""
                    className="size-16 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex size-16 flex-col items-center justify-center gap-0.5 rounded-xl bg-[#F2F1F3] p-1">
                    <File className="text-primary size-5" />
                    <span className="w-full truncate text-center text-[9px]">
                      {attachment.fileName}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeAttachment(attachment.id)}
                  aria-label="Убрать вложение"
                  className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-[#1C1E24] text-white"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <form
          onSubmit={(event) => void sendMessage(event)}
          className="flex items-center gap-2 px-4 py-3"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_FILE_TYPES_ACCEPT}
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={openAttachMenu}
            aria-label="Прикрепить файл"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#1C1E24] text-white"
          >
            <Plus className="size-5" />
          </button>
          <input
            value={draft}
            onChange={handleDraftChange}
            placeholder="Напиши сообщение"
            className="h-11 min-w-0 flex-1 rounded-full bg-[#F2F1F6] px-4 text-sm outline-none placeholder:text-[#9CA3AF]"
          />
          <button
            type="button"
            aria-label="Эмодзи"
            className="flex size-9 shrink-0 items-center justify-center text-[#6B7280]"
          >
            <Smile className="size-6" />
          </button>
          <AnimatePresence mode="wait" initial={false}>
            {draft.trim() || pendingAttachments.length > 0 ? (
              <motion.button
                key="send"
                type="submit"
                disabled={isSendingAttachments}
                data-haptic="medium"
                aria-label="Отправить"
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.4 }}
                transition={{ damping: 22, stiffness: 500, type: "spring" }}
                className="flex h-9 w-15.5 shrink-0 items-center justify-center rounded-full bg-[#1C1E24] text-white disabled:opacity-50"
              >
                {isSendingAttachments ? (
                  <Spinner className="size-4" />
                ) : (
                  <Send className="size-5" />
                )}
              </motion.button>
            ) : (
              <motion.button
                key="mic"
                type="button"
                aria-label="Голосовое сообщение"
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.4 }}
                transition={{ damping: 22, stiffness: 500, type: "spring" }}
                className="flex size-9 shrink-0 items-center justify-center text-[#6B7280]"
              >
                <Mic className="size-6" />
              </motion.button>
            )}
          </AnimatePresence>
        </form>
      </div>

      <Modal
        isOpen={isAttachMenuOpen}
        onClose={() => setIsAttachMenuOpen(false)}
      >
        <div className="space-y-2">
          <button
            type="button"
            onClick={takePhoto}
            className="flex w-full items-center gap-3 rounded-2xl bg-[#F2F1F3] p-4 font-medium"
          >
            <Camera className="text-primary size-5" />
            Сделать фотографию
          </button>
          <button
            type="button"
            onClick={pickFromGallery}
            className="flex w-full items-center gap-3 rounded-2xl bg-[#F2F1F3] p-4 font-medium"
          >
            <ImageIcon className="text-primary size-5" />
            Выбрать из галереи
          </button>
          <button
            type="button"
            onClick={pickFile}
            className="flex w-full items-center gap-3 rounded-2xl bg-[#F2F1F3] p-4 font-medium"
          >
            <File className="text-primary size-5" />
            Отправить файл
          </button>
        </div>
      </Modal>

      <Modal isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
        <div className="divide-y divide-[#E4E7EC]">
          <button
            type="button"
            onClick={() => navigate(`/chat/${chatId}/profile`)}
            className="w-full py-4 text-center text-[#1C1E24]"
          >
            Посмотреть профиль
          </button>
          <button
            type="button"
            onClick={openUnmatchFromMenu}
            className="w-full py-4 text-center text-[#1C1E24]"
          >
            Удалить пару
          </button>
          <button
            type="button"
            onClick={openReportFromMenu}
            className="w-full py-4 text-center text-[#1C1E24]"
          >
            Пожаловаться
          </button>
          <button
            type="button"
            onClick={openBlockFromMenu}
            className="w-full py-4 text-center font-semibold text-red-500"
          >
            Заблокировать
          </button>
        </div>
      </Modal>

      <Modal isOpen={isUnmatchOpen} onClose={() => setIsUnmatchOpen(false)}>
        <div className="flex flex-col items-center gap-1 text-center">
          <h2 className="text-lg font-bold">Удалить пару с {displayName}?</h2>
          <p className="text-sm text-[#6B7280]">
            Ваша пара будет аннулирована и удалится чат у обоих
          </p>
        </div>
        <button
          type="button"
          onClick={() => void confirmUnmatch()}
          className="mt-6 w-full rounded-full bg-[#1C1E24] py-4 font-bold text-white"
        >
          Отменить лайк
        </button>
        <button
          type="button"
          onClick={reportFromUnmatch}
          className="mt-4 w-full text-center text-sm font-semibold text-red-500"
        >
          Пожаловаться
        </button>
      </Modal>

      <Modal isOpen={isBlockOpen} onClose={() => setIsBlockOpen(false)}>
        <div className="flex flex-col items-center gap-1 text-center">
          <h2 className="text-lg font-bold">Заблокировать {displayName}?</h2>
          <p className="text-sm text-[#6B7280]">
            Мы скроем ваш профиль друг от друга,
            <br />а общение станет недоступно.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void confirmBlock()}
          className="mt-6 w-full rounded-full bg-[#1C1E24] py-4 font-bold text-white"
        >
          Заблокировать
        </button>
        <button
          type="button"
          onClick={reportFromBlock}
          className="mt-4 w-full text-center text-sm font-semibold text-red-500"
        >
          Пожаловаться
        </button>
      </Modal>

      <Modal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)}>
        <h2 className="text-center text-lg font-bold">Укажи причину жалобы</h2>
        <div className="mt-2 divide-y divide-[#E4E7EC]">
          {REPORT_REASONS.map((reason) => (
            <button
              key={reason}
              type="button"
              onClick={() => void submitReport(reason)}
              className="w-full py-4 text-center text-[#1C1E24]"
            >
              {reason}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setIsReportOpen(false)}
          className="mt-4 w-full rounded-full bg-[#1C1E24] py-4 font-bold text-white"
        >
          Отмена
        </button>
      </Modal>

      <PhotoViewer
        imageUrl={viewerImageUrl}
        onClose={() => setViewerImageUrl(null)}
      />
    </div>
  );
};
