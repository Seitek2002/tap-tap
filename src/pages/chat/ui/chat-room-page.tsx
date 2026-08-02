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
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";

import { ROUTES } from "@/shared/config";
import { NotificationType, triggerNotificationHaptic } from "@/shared/lib/haptics";
import { useKeyboardInset } from "@/shared/lib/use-keyboard-inset";
import { isAndroid } from "@/shared/lib/platform";
import { cn } from "@/shared/lib/utils";
import { Modal } from "@/shared/ui/modal";

import { CHATS } from "../model/chats";
import {
  CONVERSATION_DATE,
  INITIAL_MESSAGES,
  type Message,
} from "../model/messages";
import { REPORT_REASONS } from "../model/report-reasons";
import { PhotoViewer } from "./photo-viewer";

// Вложения выбраны, но ещё не отправлены — лежат рядом с инпутом до нажатия
// на иконку отправки, как в Telegram/WhatsApp. Можно накопить несколько штук.
type PendingAttachment = { id: number } & (
  | { fileName: string; kind: "file" }
  | { imageUrl: string; kind: "image" }
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

  if (message.kind === "image") {
    return (
      <div
        className={cn(
          "flex flex-col gap-1",
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
        {message.seen && (
          <span className="flex items-center gap-1 text-xs text-[#6B7280]">
            <Check className="text-primary size-3.5" />
            Просмотрено
          </span>
        )}
      </div>
    );
  }

  if (message.kind === "file") {
    return (
      <div
        className={cn(
          "flex max-w-[75%] items-center gap-3 rounded-2xl px-3 py-3",
          isOutgoing
            ? "bg-primary self-end text-white"
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
  }

  return (
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
  );
};

export const ChatRoomPage = () => {
  const navigate = useNavigate();
  const { chatId } = useParams<{ chatId: string }>();
  const chat = CHATS.find((item) => String(item.id) === chatId);
  const keyboardInset = useKeyboardInset();

  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
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

  const sendMessage = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text && pendingAttachments.length === 0) return;

    setMessages((prev) => {
      const next = [...prev];

      for (const attachment of pendingAttachments) {
        if (attachment.kind === "image") {
          next.push({
            id: next.length + 1,
            imageUrl: attachment.imageUrl,
            kind: "image",
            type: "outgoing",
          });
        } else {
          next.push({
            fileName: attachment.fileName,
            id: next.length + 1,
            kind: "file",
            type: "outgoing",
          });
        }
      }

      if (text) {
        next.push({ id: next.length + 1, kind: "text", text, type: "outgoing" });
      }

      return next;
    });

    setDraft("");
    setPendingAttachments([]);
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
        toast.error(`Можно прикрепить не больше ${MAX_ATTACHMENTS} файлов за раз`);
      }

      return [
        ...prev,
        ...allowedFiles.slice(0, freeSlots).map((file, index) => {
          const id = prev.length + index + 1;
          return isImageFile(file)
            ? { id, imageUrl: URL.createObjectURL(file), kind: "image" as const }
            : { fileName: file.name, id, kind: "file" as const };
        }),
      ];
    });
  };

  const removeAttachment = (id: number) => {
    setPendingAttachments((prev) => {
      const attachment = prev.find((item) => item.id === id);
      if (attachment?.kind === "image") URL.revokeObjectURL(attachment.imageUrl);
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
  const confirmUnmatch = () => {
    setIsUnmatchOpen(false);
    navigate(ROUTES.chat);
  };

  const confirmBlock = () => {
    setIsBlockOpen(false);
    navigate(ROUTES.chat);
  };

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
        <img
          src={chat?.photo}
          alt=""
          className="size-11 shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-bold">{chat?.name ?? "Собеседник"}</h1>
          <p className="text-sm text-[#6B7280]">Печатает...</p>
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

      <p className="py-2 text-center text-xs text-[#6B7280]">
        {CONVERSATION_DATE}
      </p>

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
          onSubmit={sendMessage}
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
          onChange={(event) => setDraft(event.target.value)}
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
              data-haptic="medium"
              aria-label="Отправить"
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={{ damping: 22, stiffness: 500, type: "spring" }}
              className="flex h-9 w-15.5 shrink-0 items-center justify-center rounded-full bg-[#1C1E24] text-white"
            >
              <Send className="size-5" />
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
          <h2 className="text-lg font-bold">
            Удалить пару с {chat?.name}?
          </h2>
          <p className="text-sm text-[#6B7280]">
            Ваша пара будет аннулирована и удалится чат у обоих
          </p>
        </div>
        <button
          type="button"
          onClick={confirmUnmatch}
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
          <h2 className="text-lg font-bold">Заблокировать {chat?.name}?</h2>
          <p className="text-sm text-[#6B7280]">
            Мы скроем ваш профиль друг от друга,
            <br />а общение станет недоступно.
          </p>
        </div>
        <button
          type="button"
          onClick={confirmBlock}
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
              onClick={() => setIsReportOpen(false)}
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
