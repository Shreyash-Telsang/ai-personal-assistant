import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Divider,
  Chip,
  Button,
  LinearProgress,
  useTheme,
  alpha,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  FormControl,
  Select,
  Container,
  Stack,
  Checkbox,
  Grid,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Flag as FlagIcon,
  Today as TodayIcon,
  MoreVert as MoreVertIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Assignment as AssignmentIcon,
  Category as CategoryIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Note as NoteIcon,
  Description as DescriptionIcon,
  Launch as LaunchIcon,
  StickyNote2Outlined as StickyNote2OutlinedIcon,
  Add as AddIcon,
  Event as EventIcon,
  School as SchoolIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
} from '@mui/icons-material';
import GridWrapper from '../utils/GridWrapper';
import { useTaskStore } from '../store/taskStore';
import { useNoteStore } from '../store/noteStore';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { createTheme } from '@mui/material/styles';
import { useAcademicStore } from '../store/academicStore';
import AIAssistant from '../components/academic/AIAssistant';
import PaperOutline from '../components/academic/PaperOutline';

// Create a default theme for use outside component
const defaultTheme = createTheme();

// Mock data for analytics
const WEEKLY_PRODUCTIVITY = [
  { day: 'Mon', tasks: 5, hours: 2.5 },
  { day: 'Tue', tasks: 7, hours: 4 },
  { day: 'Wed', tasks: 4, hours: 3 },
  { day: 'Thu', tasks: 8, hours: 5 },
  { day: 'Fri', tasks: 6, hours: 3.5 },
  { day: 'Sat', tasks: 3, hours: 1.5 },
  { day: 'Sun', tasks: 2, hours: 1 },
];

// Sample tasks for dashboard
const recentTasks = [
  { id: '1', title: 'Complete project proposal', priority: 'high', completed: false, dueDate: '2023-12-15', category: 'Work' },
  { id: '2', title: 'Review documentation', priority: 'medium', completed: true, dueDate: '2023-12-10', category: 'Study' },
  { id: '3', title: 'Prepare presentation', priority: 'high', completed: false, dueDate: '2023-12-20', category: 'Work' },
  { id: '4', title: 'Schedule team meeting', priority: 'low', completed: false, dueDate: '2023-12-12', category: 'Planning' },
];

// Helper functions for colors
const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'high': return defaultTheme.palette.error.main;
    case 'medium': return defaultTheme.palette.warning.main;
    case 'low': return defaultTheme.palette.success.main;
    default: return defaultTheme.palette.primary.main;
  }
};

const getCategoryColor = (category: string): string => {
  // Simple hash function to generate consistent colors for categories
  const hash = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = [
    defaultTheme.palette.primary.main,
    defaultTheme.palette.secondary.main,
    defaultTheme.palette.info.main,
    defaultTheme.palette.success.main,
    defaultTheme.palette.warning.main,
  ];
  return colors[hash % colors.length];
};

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const { tasks, toggleTaskCompletion } = useTaskStore();
  const { notes } = useNoteStore();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [chartTimeframe, setChartTimeframe] = useState<string>('week');
  const [localTasks, setLocalTasks] = useState<any[]>([]);
  
  // Initialize local tasks from store
  useEffect(() => {
    setLocalTasks([...tasks]);
  }, [tasks]);
  
  // Function to toggle task completion locally for demo purposes
  const handleToggleTaskCompletion = (taskId: string) => {
    // Update the task in the local state for immediate UI feedback
    setLocalTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
    
    // In a real app, this would also update the store
    if (toggleTaskCompletion) {
      toggleTaskCompletion(taskId);
    }
  };
  
  // Calculate task statistics
  const totalTasks = localTasks.length;
  const completedTasks = localTasks.filter(task => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Get tasks due today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  
  const tasksToday = localTasks.filter(task => {
    if (!task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.toISOString().split('T')[0] === todayStr && !task.completed;
  });
  
  // Calculate tasks by priority
  const highPriorityTasks = localTasks.filter(task => task.priority === 'high' && !task.completed).length;
  const mediumPriorityTasks = localTasks.filter(task => task.priority === 'medium' && !task.completed).length;
  const lowPriorityTasks = localTasks.filter(task => task.priority === 'low' && !task.completed).length;
  
  // Calculate tasks by category
  const tasksByCategory: Record<string, number> = {};
  localTasks.forEach(task => {
    if (task.category) {
      if (tasksByCategory[task.category]) {
        tasksByCategory[task.category]++;
      } else {
        tasksByCategory[task.category] = 1;
      }
    }
  });
  
  // Calculate weekly tasks completed
  const totalWeeklyTasks = WEEKLY_PRODUCTIVITY.reduce((sum, day) => sum + day.tasks, 0);
  const totalHours = WEEKLY_PRODUCTIVITY.reduce((sum, day) => sum + day.hours, 0);
  const averageTasksPerDay = Math.round((totalWeeklyTasks / 7) * 10) / 10;
  
  // Get recent notes (not archived, sort by updated date)
  const recentNotes = [...notes]
    .filter(note => !note.isArchived)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);
  
  // Handle menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, taskId: string) => {
    setAnchor(event.currentTarget);
    setSelectedTaskId(taskId);
  };
  
  // Handle menu close
  const handleMenuClose = () => {
    setAnchor(null);
    setSelectedTaskId(null);
  };
  
  // Get chart height from category count
  const getChartHeight = (count: number, max: number) => {
    return (count / max) * 100;
  };
  
  // Get max category count
  const maxCategoryCount = Math.max(...Object.values(tasksByCategory), 1);
  
  // Calculate color based on completion rate
  const getCompletionColor = (rate: number) => {
    if (rate >= 75) return theme.palette.success.main;
    if (rate >= 50) return theme.palette.info.main;
    if (rate >= 25) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  // Get academic store
  const { outlines, citations, pdfs } = useAcademicStore();
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Academic Dashboard
      </Typography>
      <Box sx={{ flexGrow: 1 }}>
        <Stack spacing={3}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <AIAssistant />
          </Paper>
          <PaperOutline />
        </Stack>
      </Box>
    </Container>
  );
};

export default DashboardPage;
