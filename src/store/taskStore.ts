import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  category: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  subtasks?: SubTask[];
}

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

interface TaskState {
  tasks: Task[];
  categories: string[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, taskData: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  addSubTask: (taskId: string, subtask: { title: string }) => void;
  toggleSubTaskCompletion: (taskId: string, subtaskId: string) => void;
  deleteSubTask: (taskId: string, subtaskId: string) => void;
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],
      categories: ['Personal', 'Work', 'Shopping', 'Health', 'Other'],
      
      addTask: (task) => set((state) => {
        const newTask: Task = {
          id: uuidv4(),
          ...task,
          createdAt: new Date(),
          updatedAt: new Date(),
          completed: false,
          subtasks: task.subtasks || [],
        };
        
        return { tasks: [...state.tasks, newTask] };
      }),
      
      updateTask: (id, taskData) => set((state) => {
        const taskIndex = state.tasks.findIndex(task => task.id === id);
        if (taskIndex === -1) return state;

        const updatedTasks = [...state.tasks];
        updatedTasks[taskIndex] = {
          ...updatedTasks[taskIndex],
          ...taskData,
          updatedAt: new Date(),
        };
        
        return { tasks: updatedTasks };
      }),
      
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(task => task.id !== id),
      })),
      
      toggleTaskCompletion: (id) => set((state) => {
        const taskIndex = state.tasks.findIndex(task => task.id === id);
        if (taskIndex === -1) return state;

        const updatedTasks = [...state.tasks];
        updatedTasks[taskIndex] = {
          ...updatedTasks[taskIndex],
          completed: !updatedTasks[taskIndex].completed,
          updatedAt: new Date(),
        };
        
        return { tasks: updatedTasks };
      }),
      
      addSubTask: (taskId, subtask) => set((state) => {
        const taskIndex = state.tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) return state;

        const updatedTasks = [...state.tasks];
        const newSubtask: SubTask = {
          id: uuidv4(),
          title: subtask.title,
          completed: false,
        };

        updatedTasks[taskIndex] = {
          ...updatedTasks[taskIndex],
          subtasks: [...(updatedTasks[taskIndex].subtasks || []), newSubtask],
          updatedAt: new Date(),
        };
        
        return { tasks: updatedTasks };
      }),
      
      toggleSubTaskCompletion: (taskId, subtaskId) => set((state) => {
        const taskIndex = state.tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) return state;

        const updatedTasks = [...state.tasks];
        const subtasks = updatedTasks[taskIndex].subtasks || [];
        const subtaskIndex = subtasks.findIndex(st => st.id === subtaskId);
        
        if (subtaskIndex === -1) return state;
        
        const updatedSubtasks = [...subtasks];
        updatedSubtasks[subtaskIndex] = {
          ...updatedSubtasks[subtaskIndex],
          completed: !updatedSubtasks[subtaskIndex].completed,
        };

        updatedTasks[taskIndex] = {
          ...updatedTasks[taskIndex],
          subtasks: updatedSubtasks,
          updatedAt: new Date(),
        };
        
        return { tasks: updatedTasks };
      }),
      
      deleteSubTask: (taskId, subtaskId) => set((state) => {
        const taskIndex = state.tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) return state;

        const updatedTasks = [...state.tasks];
        const subtasks = updatedTasks[taskIndex].subtasks || [];
        
        updatedTasks[taskIndex] = {
          ...updatedTasks[taskIndex],
          subtasks: subtasks.filter(st => st.id !== subtaskId),
          updatedAt: new Date(),
        };
        
        return { tasks: updatedTasks };
      }),
      
      addCategory: (category) => set((state) => {
        if (state.categories.includes(category)) return state;
        return { categories: [...state.categories, category] };
      }),
      
      deleteCategory: (category) => set((state) => ({
        categories: state.categories.filter(c => c !== category),
      })),
    }),
    {
      name: 'task-storage',
    }
  )
); 