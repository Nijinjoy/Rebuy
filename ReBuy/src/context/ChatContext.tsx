import { createContext, ReactNode, useContext, useMemo } from 'react';
import { useSessionState } from './useSessionState';
import { Chat, MessageImage } from '../types/chat';
import type { Product } from '../types/listing';

type ChatContextValue = {
  chats: Chat[];
  getChat: (id: string) => Chat | undefined;
  markRead: (id: string) => void;
  // Returns the chat with this product's seller, creating it if needed.
  startChat: (product: Product) => string;
  sendMessage: (
    id: string,
    message: { text: string; image?: MessageImage },
  ) => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

function currentTime() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

// Holds conversations in memory until the chat API exists.
export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useSessionState<Chat[]>([]);

  const value = useMemo<ChatContextValue>(
    () => ({
      chats,
      getChat: id => chats.find(c => c.id === id),
      markRead: id =>
        setChats(current =>
          current.map(c => (c.id === id && c.unread ? { ...c, unread: 0 } : c)),
        ),
      startChat: product => {
        const existing = chats.find(
          c =>
            c.role === 'buying' &&
            c.name === product.sellerName &&
            c.productTitle === product.title,
        );
        if (existing) {
          return existing.id;
        }
        const id = `product-${product.id}`;
        setChats(current =>
          current.some(c => c.id === id)
            ? current
            : [
                {
                  id,
                  name: product.sellerName,
                  productTitle: product.title,
                  productImage: product.images[0] ?? '',
                  role: 'buying',
                  messages: [],
                  unread: 0,
                },
                ...current,
              ],
        );
        return id;
      },
      sendMessage: (id, { text, image }) => {
        const trimmed = text.trim();
        if (!trimmed && !image) {
          return;
        }
        setChats(current => {
          const chat = current.find(c => c.id === id);
          if (!chat) {
            return current;
          }
          const updated: Chat = {
            ...chat,
            messages: [
              ...chat.messages,
              {
                id: `${Date.now()}`,
                text: trimmed,
                image,
                fromMe: true,
                time: currentTime(),
              },
            ],
          };
          // Most recent conversation first.
          return [updated, ...current.filter(c => c.id !== id)];
        });
      },
    }),
    [chats, setChats],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChats() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChats must be used inside ChatProvider');
  }
  return context;
}
