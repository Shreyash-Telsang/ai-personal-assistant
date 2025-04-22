import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

// Type definitions
export interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  customFrequency?: string;
  targetDays?: number[];
  targetCount?: number;
  currentStreak: number;
  longestStreak: number;
  completedDates: string[];
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
  category?: string;
  tags?: string[];
  reminderTime?: string;
}

export interface LearningGoal {
  id: string;
  name: string;
  description?: string;
  category: string;
  targetDate?: Date;
  progress: number; // 0-100
  milestones: Milestone[];
  relatedSkills: string[];
  createdAt: Date;
  updatedAt: Date;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
}

export interface Milestone {
  id: string;
  name: string;
  completed: boolean;
  dueDate?: Date;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: number; // 1-10
  targetLevel: number;
  progress: number[]; // Array of historical progress points
  lastPracticed?: Date;
  createdAt: Date;
  updatedAt: Date;
  relatedGoals?: string[];
  tags?: string[];
}

export interface GrowthInsight {
  id: string;
  type: 'habit' | 'goal' | 'skill' | 'general';
  message: string;
  data?: any;
  createdAt: Date;
  dismissed: boolean;
}

interface GrowthState {
  habits: Habit[];
  learningGoals: LearningGoal[];
  skills: Skill[];
  insights: GrowthInsight[];
  categories: string[];
  
  // Habit functions
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'currentStreak' | 'longestStreak' | 'completedDates' | 'archived'>) => string;
  updateHabit: (id: string, habitData: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  archiveHabit: (id: string, archived: boolean) => void;
  completeHabit: (id: string, date: Date) => void;
  uncompleteHabit: (id: string, date: Date) => void;
  
  // Learning goal functions
  addLearningGoal: (goal: Omit<LearningGoal, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'completed'>) => string;
  updateLearningGoal: (id: string, goalData: Partial<LearningGoal>) => void;
  deleteLearningGoal: (id: string) => void;
  completeLearningGoal: (id: string, completed: boolean) => void;
  updateGoalProgress: (id: string, progress: number) => void;
  addMilestone: (goalId: string, milestone: Omit<Milestone, 'id' | 'completed'>) => string;
  completeMilestone: (goalId: string, milestoneId: string, completed: boolean) => void;
  deleteMilestone: (goalId: string, milestoneId: string) => void;
  
  // Skill functions
  addSkill: (skill: Omit<Skill, 'id' | 'createdAt' | 'updatedAt' | 'progress'>) => string;
  updateSkill: (id: string, skillData: Partial<Skill>) => void;
  deleteSkill: (id: string) => void;
  updateSkillLevel: (id: string, level: number) => void;
  logSkillPractice: (id: string) => void;
  
  // Insight functions
  addInsight: (insight: Omit<GrowthInsight, 'id' | 'createdAt' | 'dismissed'>) => string;
  dismissInsight: (id: string) => void;
  clearInsights: () => void;
  
  // Category functions
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
}

export const useGrowthStore = create<GrowthState>()(
  persist(
    (set, get) => ({
      habits: [],
      learningGoals: [],
      skills: [],
      insights: [],
      categories: ['Academics', 'Personal', 'Career', 'Health', 'Technology', 'Languages', 'Arts'],
      
      // Habit functions
      addHabit: (habit) => {
        const id = uuidv4();
        const now = new Date();
        set((state) => ({
          habits: [
            ...state.habits,
            {
              id,
              ...habit,
              currentStreak: 0,
              longestStreak: 0,
              completedDates: [],
              createdAt: now,
              updatedAt: now,
              archived: false,
            },
          ],
        }));
        return id;
      },
      
      updateHabit: (id, habitData) => set((state) => {
        const index = state.habits.findIndex(habit => habit.id === id);
        if (index === -1) return state;
        
        const updatedHabits = [...state.habits];
        updatedHabits[index] = {
          ...updatedHabits[index],
          ...habitData,
          updatedAt: new Date(),
        };
        
        return { habits: updatedHabits };
      }),
      
      deleteHabit: (id) => set((state) => ({
        habits: state.habits.filter(habit => habit.id !== id),
      })),
      
      archiveHabit: (id, archived) => set((state) => {
        const index = state.habits.findIndex(habit => habit.id === id);
        if (index === -1) return state;
        
        const updatedHabits = [...state.habits];
        updatedHabits[index] = {
          ...updatedHabits[index],
          archived,
          updatedAt: new Date(),
        };
        
        return { habits: updatedHabits };
      }),
      
      completeHabit: (id, date) => set((state) => {
        const index = state.habits.findIndex(habit => habit.id === id);
        if (index === -1) return state;
        
        const habit = state.habits[index];
        const dateStr = date.toISOString().split('T')[0];
        
        // Skip if already completed for this date
        if (habit.completedDates.includes(dateStr)) return state;
        
        const completedDates = [...habit.completedDates, dateStr];
        
        // Calculate streaks
        let currentStreak = habit.currentStreak;
        let longestStreak = habit.longestStreak;
        
        // Simple streak calculation for daily habits
        // (More complex logic would be needed for other frequencies)
        if (habit.frequency === 'daily') {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          if (habit.completedDates.includes(yesterdayStr) || completedDates.length === 1) {
            currentStreak += 1;
          } else {
            currentStreak = 1;
          }
          
          if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
          }
        }
        
        const updatedHabits = [...state.habits];
        updatedHabits[index] = {
          ...habit,
          completedDates,
          currentStreak,
          longestStreak,
          updatedAt: new Date(),
        };
        
        return { habits: updatedHabits };
      }),
      
      uncompleteHabit: (id, date) => set((state) => {
        const index = state.habits.findIndex(habit => habit.id === id);
        if (index === -1) return state;
        
        const habit = state.habits[index];
        const dateStr = date.toISOString().split('T')[0];
        
        const completedDates = habit.completedDates.filter(d => d !== dateStr);
        
        // We would need to recalculate streaks from scratch for accuracy
        // This is simplified for now
        const currentStreak = dateStr === new Date().toISOString().split('T')[0]
          ? Math.max(0, habit.currentStreak - 1)
          : habit.currentStreak;
        
        const updatedHabits = [...state.habits];
        updatedHabits[index] = {
          ...habit,
          completedDates,
          currentStreak,
          updatedAt: new Date(),
        };
        
        return { habits: updatedHabits };
      }),
      
      // Learning goal functions
      addLearningGoal: (goal) => {
        const id = uuidv4();
        const now = new Date();
        set((state) => ({
          learningGoals: [
            ...state.learningGoals,
            {
              id,
              ...goal,
              progress: 0,
              completed: false,
              createdAt: now,
              updatedAt: now,
            },
          ],
        }));
        return id;
      },
      
      updateLearningGoal: (id, goalData) => set((state) => {
        const index = state.learningGoals.findIndex(goal => goal.id === id);
        if (index === -1) return state;
        
        const updatedGoals = [...state.learningGoals];
        updatedGoals[index] = {
          ...updatedGoals[index],
          ...goalData,
          updatedAt: new Date(),
        };
        
        return { learningGoals: updatedGoals };
      }),
      
      deleteLearningGoal: (id) => set((state) => ({
        learningGoals: state.learningGoals.filter(goal => goal.id !== id),
      })),
      
      completeLearningGoal: (id, completed) => set((state) => {
        const index = state.learningGoals.findIndex(goal => goal.id === id);
        if (index === -1) return state;
        
        const updatedGoals = [...state.learningGoals];
        updatedGoals[index] = {
          ...updatedGoals[index],
          completed,
          progress: completed ? 100 : updatedGoals[index].progress,
          updatedAt: new Date(),
        };
        
        return { learningGoals: updatedGoals };
      }),
      
      updateGoalProgress: (id, progress) => set((state) => {
        const index = state.learningGoals.findIndex(goal => goal.id === id);
        if (index === -1) return state;
        
        const clamped = Math.max(0, Math.min(100, progress));
        const completed = clamped === 100;
        
        const updatedGoals = [...state.learningGoals];
        updatedGoals[index] = {
          ...updatedGoals[index],
          progress: clamped,
          completed,
          updatedAt: new Date(),
        };
        
        return { learningGoals: updatedGoals };
      }),
      
      addMilestone: (goalId, milestone) => {
        const id = uuidv4();
        set((state) => {
          const index = state.learningGoals.findIndex(goal => goal.id === goalId);
          if (index === -1) return state;
          
          const updatedGoals = [...state.learningGoals];
          updatedGoals[index] = {
            ...updatedGoals[index],
            milestones: [
              ...updatedGoals[index].milestones,
              {
                id,
                ...milestone,
                completed: false,
              },
            ],
            updatedAt: new Date(),
          };
          
          return { learningGoals: updatedGoals };
        });
        
        return id;
      },
      
      completeMilestone: (goalId, milestoneId, completed) => set((state) => {
        const goalIndex = state.learningGoals.findIndex(goal => goal.id === goalId);
        if (goalIndex === -1) return state;
        
        const goal = state.learningGoals[goalIndex];
        const milestoneIndex = goal.milestones.findIndex(m => m.id === milestoneId);
        if (milestoneIndex === -1) return state;
        
        const updatedMilestones = [...goal.milestones];
        updatedMilestones[milestoneIndex] = {
          ...updatedMilestones[milestoneIndex],
          completed,
        };
        
        // Calculate new progress based on milestones
        const totalMilestones = updatedMilestones.length;
        const completedMilestones = updatedMilestones.filter(m => m.completed).length;
        const newProgress = totalMilestones > 0
          ? Math.round((completedMilestones / totalMilestones) * 100)
          : goal.progress;
        
        const updatedGoals = [...state.learningGoals];
        updatedGoals[goalIndex] = {
          ...goal,
          milestones: updatedMilestones,
          progress: newProgress,
          completed: newProgress === 100,
          updatedAt: new Date(),
        };
        
        return { learningGoals: updatedGoals };
      }),
      
      deleteMilestone: (goalId, milestoneId) => set((state) => {
        const goalIndex = state.learningGoals.findIndex(goal => goal.id === goalId);
        if (goalIndex === -1) return state;
        
        const goal = state.learningGoals[goalIndex];
        const updatedMilestones = goal.milestones.filter(m => m.id !== milestoneId);
        
        // Recalculate progress
        const totalMilestones = updatedMilestones.length;
        const completedMilestones = updatedMilestones.filter(m => m.completed).length;
        const newProgress = totalMilestones > 0
          ? Math.round((completedMilestones / totalMilestones) * 100)
          : goal.progress;
        
        const updatedGoals = [...state.learningGoals];
        updatedGoals[goalIndex] = {
          ...goal,
          milestones: updatedMilestones,
          progress: newProgress,
          completed: newProgress === 100,
          updatedAt: new Date(),
        };
        
        return { learningGoals: updatedGoals };
      }),
      
      // Skill functions
      addSkill: (skill) => {
        const id = uuidv4();
        const now = new Date();
        set((state) => ({
          skills: [
            ...state.skills,
            {
              id,
              ...skill,
              progress: [skill.level],
              createdAt: now,
              updatedAt: now,
            },
          ],
        }));
        return id;
      },
      
      updateSkill: (id, skillData) => set((state) => {
        const index = state.skills.findIndex(skill => skill.id === id);
        if (index === -1) return state;
        
        const updatedSkills = [...state.skills];
        updatedSkills[index] = {
          ...updatedSkills[index],
          ...skillData,
          updatedAt: new Date(),
        };
        
        return { skills: updatedSkills };
      }),
      
      deleteSkill: (id) => set((state) => ({
        skills: state.skills.filter(skill => skill.id !== id),
      })),
      
      updateSkillLevel: (id, level) => set((state) => {
        const index = state.skills.findIndex(skill => skill.id === id);
        if (index === -1) return state;
        
        const skill = state.skills[index];
        const clamped = Math.max(1, Math.min(10, level));
        
        const updatedSkills = [...state.skills];
        updatedSkills[index] = {
          ...skill,
          level: clamped,
          progress: [...skill.progress, clamped],
          lastPracticed: new Date(),
          updatedAt: new Date(),
        };
        
        return { skills: updatedSkills };
      }),
      
      logSkillPractice: (id) => set((state) => {
        const index = state.skills.findIndex(skill => skill.id === id);
        if (index === -1) return state;
        
        const skill = state.skills[index];
        
        const updatedSkills = [...state.skills];
        updatedSkills[index] = {
          ...skill,
          lastPracticed: new Date(),
          updatedAt: new Date(),
        };
        
        return { skills: updatedSkills };
      }),
      
      // Insight functions
      addInsight: (insight) => {
        const id = uuidv4();
        set((state) => ({
          insights: [
            {
              id,
              ...insight,
              createdAt: new Date(),
              dismissed: false,
            },
            ...state.insights,
          ],
        }));
        return id;
      },
      
      dismissInsight: (id) => set((state) => {
        const index = state.insights.findIndex(insight => insight.id === id);
        if (index === -1) return state;
        
        const updatedInsights = [...state.insights];
        updatedInsights[index] = {
          ...updatedInsights[index],
          dismissed: true,
        };
        
        return { insights: updatedInsights };
      }),
      
      clearInsights: () => set((state) => ({
        insights: state.insights.filter(insight => !insight.dismissed),
      })),
      
      // Category functions
      addCategory: (category) => set((state) => {
        if (state.categories.includes(category)) return state;
        return { categories: [...state.categories, category] };
      }),
      
      deleteCategory: (category) => set((state) => ({
        categories: state.categories.filter(c => c !== category),
      })),
    }),
    {
      name: 'growth-storage',
    }
  )
);
