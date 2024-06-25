import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChatMessage {
  content: string;
  role: 'user' | 'assistant' | 'system';
}

interface SettingsStore {
  messages: ChatMessage[];
  model: string;
  temperature: number;
  systemPrompt: string;
  setModel: (model: string) => void;
  setTemperature: (temperature: number) => void;
  setSystemPrompt: (prompt: string) => void;
  addMessage: (message: ChatMessage) => void;
  updateLastAIMessage: (content: string) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      messages: [],
      model: 'gpt-4o',
      temperature: 0.7,
      systemPrompt: "You are Reminisc, a super friendly AI assistant, excited to meet a new person.",
      setModel: (model) => set({ model }),
      setTemperature: (temperature) => set({ temperature }),
      setSystemPrompt: (prompt) => set({ systemPrompt: prompt }),
      addMessage: (message) => {
        set((state) => ({
          messages: [...state.messages, message],
        }));
      },
      updateLastAIMessage: (content) => {
        set((state) => {
          const updatedMessages = [...state.messages];
          const lastMessage = updatedMessages[updatedMessages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            updatedMessages[updatedMessages.length - 1] = {
              ...lastMessage,
              content: lastMessage.content + content,
            };
          } else {
            updatedMessages.push({ content, role: 'assistant' });
          }
          return { messages: updatedMessages };
        });
      },
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({
        model: state.model,
        temperature: state.temperature,
        systemPrompt: state.systemPrompt,
      }),
    }
  )
);