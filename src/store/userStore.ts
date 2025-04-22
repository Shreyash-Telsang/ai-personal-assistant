import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  preferences?: {
    productivityStyle?: 'pomodoro' | 'deepWork' | 'timeBlocking';
    assistantTone?: 'casual' | 'professional' | 'fun';
    notificationsEnabled?: boolean;
  };
}

interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  updatePreferences: (preferences: Partial<User['preferences']>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: (user) => set({ 
        currentUser: user, 
        isAuthenticated: true,
        error: null 
      }),
      
      logout: () => set({ 
        currentUser: null, 
        isAuthenticated: false 
      }),
      
      updateUser: (userData) => set((state) => {
        if (!state.currentUser) return state;
        
        return {
          currentUser: {
            ...state.currentUser,
            ...userData,
          },
        };
      }),
      
      updatePreferences: (preferences) => set((state) => {
        if (!state.currentUser) return state;
        
        return {
          currentUser: {
            ...state.currentUser,
            preferences: {
              ...state.currentUser.preferences,
              ...preferences,
            },
          },
        };
      }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
    }),
    {
      name: 'user-storage',
    }
  )
); 