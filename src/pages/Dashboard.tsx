import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Chip,
  IconButton,
  Divider,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  ChatBubbleOutline as ChatIcon,
  CheckCircleOutline as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon,
  CalendarToday as CalendarIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';
import { useUserStore } from '../store/userStore';
import { useTaskStore, Task } from '../store/taskStore';
import TaskQuickAdd from '../components/tasks/TaskQuickAdd';
import GridWrapper from '../utils/GridWrapper';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useUserStore();
  const { tasks } = useTaskStore();

  // Filter tasks for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayTasks = tasks.filter((task) => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  });

  const upcomingTasks = tasks.filter((task) => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() > today.getTime() && !task.completed;
  }).sort((a, b) => {
    if (!a.dueDate || !b.dueDate) return 0;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  }).slice(0, 5);

  // Get high priority tasks
  const highPriorityTasks = tasks.filter((task) => 
    task.priority === 'high' && !task.completed
  ).slice(0, 3);

  // Calculate completion stats
  const completedTasksCount = tasks.filter(task => task.completed).length;
  const totalTasksCount = tasks.length;
  const completionRate = totalTasksCount > 0 
    ? Math.round((completedTasksCount / totalTasksCount) * 100) 
    : 0;

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Welcome Section */}
        <GridWrapper item xs={12}>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <GridWrapper item xs={12} md={8}>
                <Typography variant="h4" gutterBottom>
                  Welcome back, {currentUser?.name || 'User'}
                </Typography>
                <Typography variant="body1">
                  Here's your day at a glance. You have {todayTasks.length} tasks scheduled for today.
                </Typography>
              </GridWrapper>
              <GridWrapper item xs={12} md={4} textAlign="right">
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/tasks')}
                >
                  Add New Task
                </Button>
              </GridWrapper>
            </Grid>
          </Paper>
        </GridWrapper>

        {/* Quick Add Task */}
        <GridWrapper item xs={12}>
          <TaskQuickAdd />
        </GridWrapper>

        {/* Stats Cards */}
        <GridWrapper item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tasks Today
              </Typography>
              <Typography variant="h3">
                {todayTasks.length}
              </Typography>
            </CardContent>
          </Card>
        </GridWrapper>
        
        <GridWrapper item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completed
              </Typography>
              <Typography variant="h3">
                {completedTasksCount}
              </Typography>
            </CardContent>
          </Card>
        </GridWrapper>
        
        <GridWrapper item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completion Rate
              </Typography>
              <Typography variant="h3">
                {completionRate}%
              </Typography>
            </CardContent>
          </Card>
        </GridWrapper>
        
        <GridWrapper item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                High Priority
              </Typography>
              <Typography variant="h3">
                {highPriorityTasks.length}
              </Typography>
            </CardContent>
          </Card>
        </GridWrapper>

        {/* Today's Tasks */}
        <GridWrapper item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Today's Tasks</Typography>
                <Button 
                  endIcon={<ArrowForwardIcon />} 
                  onClick={() => navigate('/tasks')}
                  size="small"
                >
                  View All
                </Button>
              </Box>
              <Divider />
              {todayTasks.length > 0 ? (
                <List>
                  {todayTasks.map((task) => (
                    <ListItem
                      key={task.id}
                      secondaryAction={
                        <Chip 
                          size="small" 
                          color={
                            task.priority === 'high' ? 'error' : 
                            task.priority === 'medium' ? 'warning' : 'default'
                          }
                          label={task.priority}
                        />
                      }
                    >
                      <ListItemIcon>
                        {task.completed ? <CheckIcon color="success" /> : <UncheckedIcon />}
                      </ListItemIcon>
                      <ListItemText 
                        primary={task.title}
                        secondary={task.category}
                        primaryTypographyProps={{
                          style: { 
                            textDecoration: task.completed ? 'line-through' : 'none' 
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" p={3}>
                  <Typography variant="body1" color="textSecondary">
                    No tasks scheduled for today!
                  </Typography>
                  <Button 
                    variant="outlined" 
                    startIcon={<AddIcon />} 
                    onClick={() => navigate('/tasks')}
                    sx={{ mt: 2 }}
                  >
                    Add Task
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </GridWrapper>

        {/* Upcoming Tasks */}
        <GridWrapper item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Coming Up</Typography>
                <Button 
                  endIcon={<ArrowForwardIcon />} 
                  onClick={() => navigate('/calendar')}
                  size="small"
                >
                  Calendar
                </Button>
              </Box>
              <Divider />
              {upcomingTasks.length > 0 ? (
                <List>
                  {upcomingTasks.map((task) => (
                    <ListItem
                      key={task.id}
                      secondaryAction={
                        <Typography variant="caption" color="textSecondary">
                          {task.dueDate && new Date(task.dueDate).toLocaleDateString()}
                        </Typography>
                      }
                    >
                      <ListItemIcon>
                        <CalendarIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={task.title}
                        secondary={task.category}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" p={3}>
                  <Typography variant="body1" color="textSecondary">
                    No upcoming tasks!
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </GridWrapper>

        {/* Quick Access */}
        <GridWrapper item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Access
            </Typography>
            <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', py: 1 }}>
              <Button 
                variant="outlined" 
                startIcon={<ChatIcon />}
                onClick={() => navigate('/assistant')}
              >
                AI Assistant
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<TimerIcon />}
                onClick={() => navigate('/focus')}
              >
                Focus Mode
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<CalendarIcon />}
                onClick={() => navigate('/calendar')}
              >
                Calendar
              </Button>
            </Stack>
          </Paper>
        </GridWrapper>
      </Grid>
    </Box>
  );
};

export default Dashboard; 