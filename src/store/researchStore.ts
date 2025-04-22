import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

// Type definitions
export interface ProductivitySession {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  type: 'focus' | 'study' | 'work' | 'creative';
  category?: string;
  tags?: string[];
  rating?: number; // 1-10
  distractions?: number;
  notes?: string;
  mood?: 'great' | 'good' | 'neutral' | 'tired' | 'stressed';
  location?: string;
  environment?: {
    noise?: 'silent' | 'quiet' | 'moderate' | 'noisy';
    lighting?: 'dark' | 'dim' | 'moderate' | 'bright';
    temperature?: 'cold' | 'cool' | 'comfortable' | 'warm' | 'hot';
  };
  metrics?: {
    tasksCompleted?: number;
    pagesRead?: number;
    wordsWritten?: number;
    customMetric?: {
      name: string;
      value: number;
    };
  };
}

export interface ProductivityPattern {
  id: string;
  name: string;
  description: string;
  insights: string[];
  recommendations: string[];
  strength: 'weak' | 'moderate' | 'strong';
  relevantMetrics: string[];
  createdAt: Date;
}

export interface ProductivityMetric {
  id: string;
  name: string;
  data: Array<{ date: Date; value: number }>;
  targetValue?: number;
  unit?: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductivityGoal {
  id: string;
  name: string;
  targetMetric: string;
  targetValue: number;
  currentValue: number;
  startDate: Date;
  endDate?: Date;
  progress: number; // 0-100
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResearchConsent {
  consentGiven: boolean;
  consentDate?: Date;
  dataToCollect: {
    sessions: boolean;
    tasks: boolean;
    habits: boolean;
    goals: boolean;
    notes: boolean;
    anonymizedContent: boolean;
  };
  demographicInfo?: {
    ageRange?: string;
    occupation?: string;
    education?: string;
    location?: string;
  };
}

interface ResearchState {
  sessions: ProductivitySession[];
  patterns: ProductivityPattern[];
  metrics: ProductivityMetric[];
  goals: ProductivityGoal[];
  consent: ResearchConsent;
  
  // Session functions
  addSession: (session: Omit<ProductivitySession, 'id'>) => string;
  updateSession: (id: string, sessionData: Partial<ProductivitySession>) => void;
  deleteSession: (id: string) => void;
  
  // Pattern functions
  addPattern: (pattern: Omit<ProductivityPattern, 'id' | 'createdAt'>) => string;
  updatePattern: (id: string, patternData: Partial<ProductivityPattern>) => void;
  deletePattern: (id: string) => void;
  
  // Metric functions
  addMetric: (metric: Omit<ProductivityMetric, 'id' | 'createdAt' | 'updatedAt' | 'data'>) => string;
  updateMetric: (id: string, metricData: Partial<ProductivityMetric>) => void;
  deleteMetric: (id: string) => void;
  addMetricDataPoint: (id: string, date: Date, value: number) => void;
  
  // Goal functions
  addGoal: (goal: Omit<ProductivityGoal, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'completed' | 'currentValue'>) => string;
  updateGoal: (id: string, goalData: Partial<ProductivityGoal>) => void;
  deleteGoal: (id: string) => void;
  updateGoalProgress: (id: string, currentValue: number) => void;
  
  // Consent functions
  updateConsent: (consent: Partial<ResearchConsent>) => void;
  
  // Analytics functions
  getSessionsByDateRange: (startDate: Date, endDate: Date) => ProductivitySession[];
  getSessionsByType: (type: ProductivitySession['type']) => ProductivitySession[];
  getAverageSessionDuration: () => number;
  getMostProductiveTimeOfDay: () => { hour: number; productivity: number }[];
  getMostProductiveDayOfWeek: () => { day: number; productivity: number }[];
  getProductivityTrend: (days: number) => Array<{ date: Date; productivity: number }>;
  getPredictedProductivity: (date: Date, type: ProductivitySession['type']) => number;
}

export const useResearchStore = create<ResearchState>()(
  persist(
    (set, get) => ({
      sessions: [],
      patterns: [],
      metrics: [],
      goals: [],
      consent: {
        consentGiven: false,
        dataToCollect: {
          sessions: false,
          tasks: false,
          habits: false,
          goals: false,
          notes: false,
          anonymizedContent: false,
        },
      },
      
      // Session functions
      addSession: (session) => {
        const id = uuidv4();
        
        set((state) => ({
          sessions: [
            ...state.sessions,
            {
              id,
              ...session,
            },
          ],
        }));
        
        // Update relevant metrics
        const { updateMetrics } = get() as any;
        updateMetrics(session);
        
        return id;
      },
      
      updateSession: (id, sessionData) => set((state) => {
        const sessionIndex = state.sessions.findIndex(session => session.id === id);
        if (sessionIndex === -1) return state;
        
        const updatedSessions = [...state.sessions];
        
        updatedSessions[sessionIndex] = {
          ...updatedSessions[sessionIndex],
          ...sessionData,
        };
        
        return { sessions: updatedSessions };
      }),
      
      deleteSession: (id) => set((state) => ({
        sessions: state.sessions.filter(session => session.id !== id),
      })),
      
      // Pattern functions
      addPattern: (pattern) => {
        const id = uuidv4();
        
        set((state) => ({
          patterns: [
            ...state.patterns,
            {
              id,
              ...pattern,
              createdAt: new Date(),
            },
          ],
        }));
        
        return id;
      },
      
      updatePattern: (id, patternData) => set((state) => {
        const patternIndex = state.patterns.findIndex(pattern => pattern.id === id);
        if (patternIndex === -1) return state;
        
        const updatedPatterns = [...state.patterns];
        
        updatedPatterns[patternIndex] = {
          ...updatedPatterns[patternIndex],
          ...patternData,
        };
        
        return { patterns: updatedPatterns };
      }),
      
      deletePattern: (id) => set((state) => ({
        patterns: state.patterns.filter(pattern => pattern.id !== id),
      })),
      
      // Metric functions
      addMetric: (metric) => {
        const id = uuidv4();
        const now = new Date();
        
        set((state) => ({
          metrics: [
            ...state.metrics,
            {
              id,
              ...metric,
              data: [],
              createdAt: now,
              updatedAt: now,
            },
          ],
        }));
        
        return id;
      },
      
      updateMetric: (id, metricData) => set((state) => {
        const metricIndex = state.metrics.findIndex(metric => metric.id === id);
        if (metricIndex === -1) return state;
        
        const updatedMetrics = [...state.metrics];
        
        updatedMetrics[metricIndex] = {
          ...updatedMetrics[metricIndex],
          ...metricData,
          updatedAt: new Date(),
        };
        
        return { metrics: updatedMetrics };
      }),
      
      deleteMetric: (id) => set((state) => ({
        metrics: state.metrics.filter(metric => metric.id !== id),
      })),
      
      addMetricDataPoint: (id, date, value) => set((state) => {
        const metricIndex = state.metrics.findIndex(metric => metric.id === id);
        if (metricIndex === -1) return state;
        
        const metric = state.metrics[metricIndex];
        
        // Check if a data point for this date already exists
        const dateStr = date.toISOString().split('T')[0];
        const existingPointIndex = metric.data.findIndex(
          point => point.date.toISOString().split('T')[0] === dateStr
        );
        
        const updatedData = [...metric.data];
        
        if (existingPointIndex !== -1) {
          // Update existing point
          updatedData[existingPointIndex] = {
            ...updatedData[existingPointIndex],
            value,
          };
        } else {
          // Add new point
          updatedData.push({ date, value });
        }
        
        // Sort by date
        updatedData.sort((a, b) => a.date.getTime() - b.date.getTime());
        
        const updatedMetrics = [...state.metrics];
        
        updatedMetrics[metricIndex] = {
          ...metric,
          data: updatedData,
          updatedAt: new Date(),
        };
        
        // Update any goals tied to this metric
        const goalsToUpdate = state.goals.filter(goal => goal.targetMetric === id);
        
        if (goalsToUpdate.length > 0) {
          const updatedGoals = [...state.goals];
          
          goalsToUpdate.forEach(goal => {
            const goalIndex = updatedGoals.findIndex(g => g.id === goal.id);
            
            if (goalIndex !== -1) {
              const updatedGoal = {
                ...goal,
                currentValue: value,
                progress: Math.min(100, Math.round((value / goal.targetValue) * 100)),
                completed: value >= goal.targetValue,
                updatedAt: new Date(),
              };
              
              updatedGoals[goalIndex] = updatedGoal;
            }
          });
          
          return {
            metrics: updatedMetrics,
            goals: updatedGoals,
          };
        }
        
        return { metrics: updatedMetrics };
      }),
      
      // Goal functions
      addGoal: (goal) => {
        const id = uuidv4();
        const now = new Date();
        
        set((state) => ({
          goals: [
            ...state.goals,
            {
              id,
              ...goal,
              currentValue: 0,
              progress: 0,
              completed: false,
              createdAt: now,
              updatedAt: now,
            },
          ],
        }));
        
        return id;
      },
      
      updateGoal: (id, goalData) => set((state) => {
        const goalIndex = state.goals.findIndex(goal => goal.id === id);
        if (goalIndex === -1) return state;
        
        const updatedGoals = [...state.goals];
        
        updatedGoals[goalIndex] = {
          ...updatedGoals[goalIndex],
          ...goalData,
          updatedAt: new Date(),
        };
        
        return { goals: updatedGoals };
      }),
      
      deleteGoal: (id) => set((state) => ({
        goals: state.goals.filter(goal => goal.id !== id),
      })),
      
      updateGoalProgress: (id, currentValue) => set((state) => {
        const goalIndex = state.goals.findIndex(goal => goal.id === id);
        if (goalIndex === -1) return state;
        
        const goal = state.goals[goalIndex];
        const progress = Math.min(100, Math.round((currentValue / goal.targetValue) * 100));
        const completed = currentValue >= goal.targetValue;
        
        const updatedGoals = [...state.goals];
        
        updatedGoals[goalIndex] = {
          ...goal,
          currentValue,
          progress,
          completed,
          updatedAt: new Date(),
        };
        
        return { goals: updatedGoals };
      }),
      
      // Consent functions
      updateConsent: (consent) => set((state) => {
        // If consent is being given for the first time, add date
        const consentDate = !state.consent.consentGiven && consent.consentGiven 
          ? new Date() 
          : consent.consentDate || state.consent.consentDate;
        
        return {
          consent: {
            ...state.consent,
            ...consent,
            consentDate,
          },
        };
      }),
      
      // Analytics functions
      getSessionsByDateRange: (startDate, endDate) => {
        return get().sessions.filter(session => {
          const sessionDate = new Date(session.startTime);
          return sessionDate >= startDate && sessionDate <= endDate;
        });
      },
      
      getSessionsByType: (type) => {
        return get().sessions.filter(session => session.type === type);
      },
      
      getAverageSessionDuration: () => {
        const sessions = get().sessions;
        if (sessions.length === 0) return 0;
        
        const totalDuration = sessions.reduce((sum, session) => sum + session.duration, 0);
        return totalDuration / sessions.length;
      },
      
      getMostProductiveTimeOfDay: () => {
        const sessions = get().sessions;
        const hourlyProductivity: { [hour: number]: { total: number; count: number } } = {};
        
        // Initialize hours
        for (let i = 0; i < 24; i++) {
          hourlyProductivity[i] = { total: 0, count: 0 };
        }
        
        // Collect data
        sessions.forEach(session => {
          const hour = new Date(session.startTime).getHours();
          const productivity = session.rating || 0;
          
          hourlyProductivity[hour].total += productivity;
          hourlyProductivity[hour].count += 1;
        });
        
        // Calculate average
        return Object.entries(hourlyProductivity).map(([hour, data]) => ({
          hour: parseInt(hour),
          productivity: data.count > 0 ? data.total / data.count : 0,
        }));
      },
      
      getMostProductiveDayOfWeek: () => {
        const sessions = get().sessions;
        const dailyProductivity: { [day: number]: { total: number; count: number } } = {};
        
        // Initialize days (0 = Sunday, 6 = Saturday)
        for (let i = 0; i < 7; i++) {
          dailyProductivity[i] = { total: 0, count: 0 };
        }
        
        // Collect data
        sessions.forEach(session => {
          const day = new Date(session.startTime).getDay();
          const productivity = session.rating || 0;
          
          dailyProductivity[day].total += productivity;
          dailyProductivity[day].count += 1;
        });
        
        // Calculate average
        return Object.entries(dailyProductivity).map(([day, data]) => ({
          day: parseInt(day),
          productivity: data.count > 0 ? data.total / data.count : 0,
        }));
      },
      
      getProductivityTrend: (days) => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        const sessions = get().getSessionsByDateRange(startDate, endDate);
        const dailyProductivity: { [dateStr: string]: { total: number; count: number } } = {};
        
        // Initialize all days in range
        for (let i = 0; i < days; i++) {
          const date = new Date(startDate);
          date.setDate(date.getDate() + i);
          const dateStr = date.toISOString().split('T')[0];
          dailyProductivity[dateStr] = { total: 0, count: 0 };
        }
        
        // Collect data
        sessions.forEach(session => {
          const dateStr = new Date(session.startTime).toISOString().split('T')[0];
          const productivity = session.rating || 0;
          
          if (dailyProductivity[dateStr]) {
            dailyProductivity[dateStr].total += productivity;
            dailyProductivity[dateStr].count += 1;
          }
        });
        
        // Calculate average and format
        return Object.entries(dailyProductivity).map(([dateStr, data]) => ({
          date: new Date(dateStr),
          productivity: data.count > 0 ? data.total / data.count : 0,
        }));
      },
      
      getPredictedProductivity: (date, type) => {
        // Simple prediction based on day of week and time of day
        const hour = date.getHours();
        const day = date.getDay();
        
        const hourlyData = get().getMostProductiveTimeOfDay();
        const dailyData = get().getMostProductiveDayOfWeek();
        
        const hourlyProductivity = hourlyData.find(data => data.hour === hour)?.productivity || 0;
        const dailyProductivity = dailyData.find(data => data.day === day)?.productivity || 0;
        
        // Weight hourly and daily factors
        let prediction = (hourlyProductivity * 0.6) + (dailyProductivity * 0.4);
        
        // Adjust for session type if we have type-specific data
        const typeSpecificSessions = get().getSessionsByType(type);
        if (typeSpecificSessions.length > 0) {
          const typeAvgRating = typeSpecificSessions.reduce((sum, session) => 
            sum + (session.rating || 0), 0) / typeSpecificSessions.length;
          
          // Blend general prediction with type-specific data
          prediction = (prediction * 0.7) + (typeAvgRating * 0.3);
        }
        
        return Math.min(10, Math.max(0, prediction));
      },
    }),
    {
      name: 'research-storage',
    }
  )
);
