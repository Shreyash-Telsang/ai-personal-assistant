import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// AI Service Settings Store
interface AISettingsState {
  // API Configuration
  apiKey: string | null;
  useLocalProcessing: boolean;
  model: string;
  temperature: number;

  // Methods
  setApiKey: (key: string) => void;
  setUseLocalProcessing: (useLocal: boolean) => void;
  setModel: (model: string) => void;
  setTemperature: (temp: number) => void;
  resetSettings: () => void;
}

// Default initial settings
const initialSettings = {
  apiKey: process.env.OPENAI_API_KEY, //set your own 
  useLocalProcessing: true, // Default to local processing
  model: 'gpt-3.5-turbo',   // Default to ChatGPT 3.5
  temperature: 0.7          // Default temperature for responses
};

export const useAISettings = create<AISettingsState>()(
  persist(
    (set) => ({
      ...initialSettings,

      // Set API key
      setApiKey: (key: string) => set({ 
        apiKey: key,
        useLocalProcessing: false // Automatically switch to API mode when key is set
      }),

      // Toggle local processing
      setUseLocalProcessing: (useLocal: boolean) => set({ 
        useLocalProcessing: useLocal
      }),

      // Set model
      setModel: (model: string) => set({ 
        model: model 
      }),

      // Set temperature
      setTemperature: (temp: number) => set({ 
        temperature: temp 
      }),

      // Reset settings to defaults
      resetSettings: () => set(initialSettings)
    }),
    {
      name: 'ai-settings', // localStorage key
      partialize: (state) => {
        // Don't persist sensitive API key to localStorage for security
        const { apiKey, ...rest } = state;
        return rest;
      }
    }
  )
);

export default useAISettings; 