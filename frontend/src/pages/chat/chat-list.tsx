import { cn, elementIsVisibleInViewport, waitForElm } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarImage } from "../../components/ui/avatar";
import { AnimatePresence, motion } from "framer-motion";
import { Message } from "typings";
import useAuth from "@/hooks/use-auth";
import RoomStore from "@/state/room";
import { ArrowDown } from "lucide-react";
import MessageFile from "@/components/shared/message/message-file";
import { backendURL } from "@/config";

interface ChatListProps {
  messages?: Message[];
}

export function ChatList({
  messages,
}: ChatListProps) {
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const { auth } = useAuth();
  const { currentChat, rooms } = RoomStore();
  const [showScrollBottom, setShowScrollToBottom] = useState<boolean>(!!messages);

  const scrollToBottom = (): void => {
    if (!messages) return;
    const lastMessage = messages[messages.length - 1];
    waitForElm(`#msg-${lastMessage.id}`).then(() => {
      const chatContainer = messagesContainerRef.current;
      if (chatContainer) {
        document.getElementById(`msg-${lastMessage?.id}`)?.scrollIntoView({ behavior: "smooth" });
        setShowScrollToBottom(true);
      }
    });
  }


  useEffect(() => {
    if (!messages) return;
    if (!showScrollBottom) {
      scrollToBottom();
    }

  }, [rooms]);

  if (!auth?.user) {
    return null;
  }

  const avatar = (message: Message) => {
    const dumpUrl = "https://cdn4.iconfinder.com/data/icons/avatars-xmas-giveaway/128/batman_hero_avatar_comics-512.png"
    if (!message.userId) return dumpUrl;
    if (message.user && message.user.avatar) return backendURL + message.user.avatar;
    const avatar = currentChat?.users.find((user) => user.id === message.userId);
    if (avatar) return backendURL + avatar.avatar;
    return dumpUrl;
  };

  return (
    <div
      style={{ height: "calc(100% - 80px)" }}
      className="pt-16 w-full overflow-y-auto overflow-x-hidden flex flex-col">
      <div
        ref={messagesContainerRef}
        onScroll={() => {
          if (!messages?.length) return;
          const lastMessageEl = document.querySelector(`#msg-${messages[messages.length - 1].id}`) as Element;
          if (!elementIsVisibleInViewport(lastMessageEl, true)) {
            setShowScrollToBottom(true);
          } else {
            setShowScrollToBottom(false);
          }
        }}
        className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col">
        <AnimatePresence>
          {messages?.map((message, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, scale: 1, y: 50, x: 0 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 1, y: 1, x: 0 }}
              transition={{
                opacity: { duration: 0.1 },
                layout: {
                  type: "spring",
                  bounce: 0.3,
                  duration: messages.indexOf(message) * 0.05 + 0.2,
                },
              }}
              style={{
                originX: 0.5,
                originY: 0.5,
              }}
              className={cn(
                "flex flex-col gap-2 p-4 whitespace-pre-wrap",
                message.userId !== auth.user.id ? "items-start" : "items-end"
              )}
            >
              <div className="flex gap-3 items-center" id={`msg-${message.id}`}>
                {message.userId !== auth.user.id && (
                  <Avatar className="flex justify-center items-center">
                    <AvatarImage
                      src={avatar(message)}
                      alt={"asd"}
                      width={6}
                      height={6}
                    />
                  </Avatar>
                )}
                {message.type === "TEXT" && (
                  <span className="bg-accent p-3 rounded-md max-w-80 min-w-20 break-words">
                    {message.text}
                  </span>
                )}

                {message.type === "FILE" && (
                  <MessageFile message={message} />
                )}


              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {showScrollBottom && (
          <div
            onClick={() => scrollToBottom()}
            className="cursor-pointer absolute z-20 right-1/2 translate-x-1/2 bottom-28">
            <div className="bg-white rounded-xl p-1 shadow-xl animate-bounce">
              <ArrowDown
                size={24}
                className="text-black"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}