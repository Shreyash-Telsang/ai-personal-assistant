import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

// Message categories for different types of assistant interactions
export type MessageCategory = 
  'general' | 
  'task' | 
  'note' | 
  'focus' | 
  'habit' | 
  'learning' | 
  'schedule' | 
  'goal';

// Intent types for the assistant
export type AssistantIntent = 
  'create' | 
  'update' | 
  'delete' | 
  'list' | 
  'search' | 
  'start' | 
  'stop' | 
  'help' | 
  'settings' | 
  'general_query';

// Entity types that can be extracted from user input
export type EntityType = 
  'task' | 
  'note' | 
  'focus_session' | 
  'habit' | 
  'goal' | 
  'date' | 
  'time' | 
  'duration' | 
  'category' | 
  'priority' | 
  'reminder';

// Message interface for storing conversation
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  category?: MessageCategory;
  metadata?: {
    intent?: string;
    relatedEntities?: any[];
    suggestedActions?: string[];
    isError?: boolean;
  };
}

// Define interface for conversation context
export interface ConversationContext {
  recentTopics: string[];
  activeSessionType?: 'focus' | 'study' | 'work';
  currentGoalId?: string;
  currentTaskId?: string;
  currentNoteId?: string;
  previousCommands: string[];
  lastRequestTimestamp?: Date;
  locationContext?: string;
  timeContext?: 'morning' | 'afternoon' | 'evening' | 'night';
}

// Define assistant voice settings
export interface VoiceSettings {
  enabled: boolean;
  voice: string;
  rate: number;  // 0.5 to 2
  pitch: number; // 0 to 2
  volume: number; // 0 to 1
  language: string;
  useWakeWord: boolean;
  wakeWord: string;
  listeningTimeout: number; // in seconds
  autoListenAfterResponse: boolean;
}

// Define assistant preferences
export interface AssistantPreferences {
  proactiveMode: boolean;
  suggestionFrequency: 'low' | 'medium' | 'high' | 'off';
  responseStyle: 'concise' | 'friendly' | 'detailed' | 'professional';
  useAI: boolean;
  usePreviousContext: boolean;
  enableTimeAwareness: boolean;
  defaultPriority: 'low' | 'medium' | 'high';
}

// Store interface
interface AssistantState {
  messages: Message[];
  inputText: string;
  isProcessing: boolean;
  isSpeaking: boolean;
  isMicrophoneActive: boolean;
  useSpeech: boolean;
  voiceType: 'default' | 'friendly' | 'professional';
  voiceVolume: number;
  voiceSpeed: number;
  voicePitch: number;
  context: ConversationContext;
  voiceSettings: VoiceSettings;
  preferences: AssistantPreferences;
  isListening: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // Actions
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  setInputText: (text: string) => void;
  clearMessages: () => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setIsSpeaking: (isSpeaking: boolean) => void;
  setIsMicrophoneActive: (isActive: boolean) => void;
  setUseSpeech: (useSpeech: boolean) => void;
  setVoiceType: (type: 'default' | 'friendly' | 'professional') => void;
  setVoiceSettings: (settings: { volume?: number; speed?: number; pitch?: number }) => void;
  
  // Chat interaction methods
  addUserMessage: (text: string, voiceData?: any) => string;
  addAssistantMessage: (
    text: string,
    category?: MessageCategory,
    options?: Partial<Omit<Message, 'id' | 'text' | 'sender' | 'timestamp'>>
  ) => string;
  
  // Context management
  updateContext: (updates: Partial<ConversationContext>) => void;
  resetContext: () => void;
  addToRecentTopics: (topic: string) => void;
  addToPreviousCommands: (command: string) => void;
  
  // Voice settings
  updateVoiceSettings: (updates: Partial<VoiceSettings>) => void;
  toggleVoice: () => void;
  
  // Preferences
  updatePreferences: (updates: Partial<AssistantPreferences>) => void;
  
  // Assistant state
  setListening: (isListening: boolean) => void;
  setProcessing: (isProcessing: boolean) => void;
  setError: (error: string | null) => void;
  
  // Initialization
  initialize: () => void;
}

// Create store with persistence
export const useAssistantStore = create<AssistantState>()(
  devtools(
    persist(
      (set, get) => ({
        messages: [],
        inputText: '',
        isProcessing: false,
        isSpeaking: false,
        isMicrophoneActive: false,
        useSpeech: true,
        voiceType: 'friendly',
        voiceVolume: 1.0,
        voiceSpeed: 1.0,
        voicePitch: 1.0,
        context: {
          recentTopics: [],
          previousCommands: [],
          timeContext: getTimeOfDay(),
        },
        voiceSettings: {
          enabled: true,
          voice: 'default',
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0,
          language: 'en-US',
          useWakeWord: false,
          wakeWord: 'assistant',
          listeningTimeout: 10,
          autoListenAfterResponse: true,
        },
        preferences: {
          proactiveMode: true,
          suggestionFrequency: 'medium',
          responseStyle: 'friendly',
          useAI: true,
          usePreviousContext: true,
          enableTimeAwareness: true,
          defaultPriority: 'medium',
        },
        isListening: false,
        isInitialized: false,
        error: null,
        
        // Actions
        addMessage: (message) => set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
              timestamp: new Date(),
            },
          ],
        })),
        
        updateMessage: (id, updates) => set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, ...updates } : msg
          ),
        })),
        
        setInputText: (text) => set({ inputText: text }),
        
        clearMessages: () => set({ messages: [] }),
        
        setIsProcessing: (isProcessing) => set({ isProcessing }),
        
        setIsSpeaking: (isSpeaking) => set({ isSpeaking }),
        
        setIsMicrophoneActive: (isActive) => set({ isMicrophoneActive: isActive }),
        
        setUseSpeech: (useSpeech) => set({ useSpeech }),
        
        setVoiceType: (type) => set({ voiceType: type }),
        
        setVoiceSettings: (settings) => set((state) => ({
          voiceVolume: settings.volume ?? state.voiceVolume,
          voiceSpeed: settings.speed ?? state.voiceSpeed,
          voicePitch: settings.pitch ?? state.voicePitch,
        })),
        
        // Chat interaction methods
        addUserMessage: (text, voiceData) => {
          const id = `msg_${Date.now()}_${uuidv4()}`;
          set((state) => {
            const message: Message = {
              id,
              text,
              sender: 'user',
              timestamp: new Date(),
              category: 'general',
              metadata: voiceData ? { relatedEntities: voiceData } : undefined
            };
            
            return {
              messages: [...state.messages, message],
              context: {
                ...state.context,
                recentTopics: [...state.context.recentTopics, text].slice(-5),
              }
            };
          });
          return id;
        },
        
        addAssistantMessage: (
          text: string,
          category?: MessageCategory,
          options?: Partial<Omit<Message, 'id' | 'text' | 'sender' | 'timestamp'>>
        ) => {
          const id = `msg_${Date.now()}_${uuidv4()}`;
          set((state) => {
            const newMessage: Message = {
              id,
              text,
              sender: 'assistant',
              timestamp: new Date(),
              category: category || 'general',
              ...options,
            };
            return {
              messages: [...state.messages, newMessage],
              isProcessing: false,
            };
          });
          return id;
        },
        
        // Context management
        updateContext: (updates) => set((state) => ({
          context: {
            ...state.context,
            ...updates,
          },
        })),
        
        resetContext: () => set({
          context: {
            recentTopics: [],
            previousCommands: [],
            timeContext: getTimeOfDay(),
          },
        }),
        
        addToRecentTopics: (topic) => set((state) => {
          // Add topic if not already present, and keep list limited to 5 items
          const existingTopics = state.context.recentTopics;
          const newTopics = existingTopics.includes(topic)
            ? existingTopics
            : [topic, ...existingTopics].slice(0, 5);
          
          return {
            context: {
              ...state.context,
              recentTopics: newTopics,
            },
          };
        }),
        
        addToPreviousCommands: (command) => set((state) => {
          // Add command to the front of the list and keep list limited to 10 items
          const newCommands = [command, ...state.context.previousCommands].slice(0, 10);
          
          return {
            context: {
              ...state.context,
              previousCommands: newCommands,
            },
          };
        }),
        
        // Voice settings
        updateVoiceSettings: (updates) => set((state) => ({
          voiceSettings: {
            ...state.voiceSettings,
            ...updates,
          },
        })),
        
        toggleVoice: () => set((state) => ({
          voiceSettings: {
            ...state.voiceSettings,
            enabled: !state.voiceSettings.enabled,
          },
        })),
        
        // Preferences
        updatePreferences: (updates) => set((state) => ({
          preferences: {
            ...state.preferences,
            ...updates,
          },
        })),
        
        // Assistant state
        setListening: (isListening) => set({ isListening }),
        setProcessing: (isProcessing) => set({ isProcessing }),
        setError: (error) => set({ error }),
        
        // Initialization
        initialize: () => {
          // Update time context
          const timeContext = getTimeOfDay();
          
          // Add welcome message
          const welcomeMessage = getWelcomeMessage(timeContext);
          get().addAssistantMessage(
            welcomeMessage,
            'general',
            {
              metadata: { intent: 'help' }
            }
          );
          
          set({
            isInitialized: true,
            context: {
              ...get().context,
              timeContext,
            },
          });
        },
      }),
      {
        name: 'assistant-storage',
        partialize: (state) => ({
          messages: state.messages.slice(-50), // Only persist last 50 messages
          useSpeech: state.useSpeech,
          voiceType: state.voiceType,
          voiceVolume: state.voiceVolume,
          voiceSpeed: state.voiceSpeed,
          voicePitch: state.voicePitch,
        }),
      }
    )
  )
);

// Helper functions
function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return 'morning';
  } else if (hour >= 12 && hour < 17) {
    return 'afternoon';
  } else if (hour >= 17 && hour < 22) {
    return 'evening';
  } else {
    return 'night';
  }
}

function getWelcomeMessage(timeContext: 'morning' | 'afternoon' | 'evening' | 'night'): string {
  switch (timeContext) {
    case 'morning':
      return "Good morning! I'm your AI assistant. I can help with tasks, notes, focus sessions, study planning, and answer general knowledge questions. How can I help you today?";
    case 'afternoon':
      return "Good afternoon! I'm your AI assistant. I'm here to help with productivity tasks, answer questions, or provide code examples. What would you like to do?";
    case 'evening':
      return "Good evening! I'm your AI assistant. Need help with tasks, notes, focus sessions, coding questions, or general information? Just ask!";
    case 'night':
      return "Hello! Working late? I'm your AI assistant and can help with tasks, study planning, programming help, or answering any questions you might have. How can I assist you tonight?";
    default:
      return "Hello! I'm your AI assistant. I can help with tasks, notes, focus sessions, study planning, and answer questions on virtually any topic. What would you like help with?";
  }
}

export default useAssistantStore; 