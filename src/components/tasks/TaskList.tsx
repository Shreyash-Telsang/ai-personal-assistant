import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Typography,
  Box,
  Paper,
  Checkbox,
  Tooltip,
  Divider,
  Zoom,
  Fade,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircleOutline as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon,
  CalendarToday as CalendarIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import { Task, useTaskStore } from '../../store/taskStore';

interface TaskListProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

const StyledListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: '12px',
  marginBottom: '8px',
  transition: 'all 0.2s ease',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
  backdropFilter: 'blur(8px)',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },
  '&.completed': {
    opacity: 0.7,
    background: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.03)',
  },
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
  },
}));

const TaskChip = styled(Chip)(({ theme }) => ({
  borderRadius: '50px',
  fontWeight: 500,
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)',
  },
}));

const EmptyStateBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '300px',
  padding: theme.spacing(6),
  textAlign: 'center',
  borderRadius: '16px',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(to right bottom, rgba(26, 32, 46, 0.7), rgba(20, 24, 34, 0.7))'
    : 'linear-gradient(to right bottom, rgba(255, 255, 255, 0.8), rgba(249, 250, 251, 0.8))',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
  backdropFilter: 'blur(10px)',
}));

const TaskList: React.FC<TaskListProps> = ({ tasks, onEditTask }) => {
  const { toggleTaskCompletion, deleteTask } = useTaskStore();

  const handleToggleCompletion = (taskId: string) => {
    toggleTaskCompletion(taskId);
  };

  const handleDelete = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId);
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'No date';
    return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  if (tasks.length === 0) {
    return (
      <Fade in={true} timeout={800}>
        <EmptyStateBox>
          <CheckIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tasks found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add a new task above to get started.
          </Typography>
        </EmptyStateBox>
      </Fade>
    );
  }

  return (
    <List sx={{ width: '100%', bgcolor: 'transparent', p: 0 }}>
      {tasks.map((task, index) => (
        <Zoom 
          in={true} 
          style={{ transitionDelay: `${index * 50}ms` }} 
          key={task.id}
        >
          <Box>
            {index > 0 && <Divider sx={{ my: 1, opacity: 0.5 }} />}
            <StyledListItem
              alignItems="flex-start"
              className={task.completed ? 'completed' : ''}
            >
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={task.completed}
                  onClick={() => handleToggleCompletion(task.id)}
                  icon={<UncheckedIcon />}
                  checkedIcon={<CheckIcon />}
                  sx={{ 
                    color: task.completed ? 'success.main' : 'inherit',
                    '&:hover': { transform: 'scale(1.1)' },
                    transition: 'transform 0.2s ease',
                  }}
                />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    variant="subtitle1"
                    component="div"
                    sx={{
                      fontWeight: task.priority === 'high' ? 600 : 500,
                      textDecoration: task.completed ? 'line-through' : 'none',
                      mb: 0.5,
                    }}
                  >
                    {task.title}
                  </Typography>
                }
                secondary={
                  <React.Fragment>
                    {task.description && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        component="div"
                        sx={{ 
                          mb: 1,
                          textDecoration: task.completed ? 'line-through' : 'none',
                          opacity: task.completed ? 0.7 : 1,
                        }}
                      >
                        {task.description.substring(0, 120)}{task.description.length > 120 ? '...' : ''}
                      </Typography>
                    )}
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <TaskChip
                        size="small"
                        icon={<FlagIcon fontSize="small" />}
                        label={task.priority}
                        color={getPriorityColor(task.priority) as any}
                        sx={{ fontWeight: task.priority === 'high' ? 600 : 500 }}
                      />
                      <TaskChip
                        size="small"
                        label={task.category}
                        variant="outlined"
                        sx={{ borderColor: 'primary.main', color: 'primary.main' }}
                      />
                      {task.dueDate && (
                        <TaskChip
                          size="small"
                          icon={<CalendarIcon fontSize="small" />}
                          label={formatDate(task.dueDate)}
                          color="info"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </React.Fragment>
                }
              />
              <ListItemSecondaryAction sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Edit">
                  <ActionButton
                    edge="end"
                    onClick={() => onEditTask(task)}
                    aria-label="edit"
                    size="small"
                    sx={{ color: 'primary.main' }}
                  >
                    <EditIcon fontSize="small" />
                  </ActionButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <ActionButton
                    edge="end"
                    onClick={() => handleDelete(task.id)}
                    aria-label="delete"
                    size="small"
                    sx={{ color: 'error.main' }}
                  >
                    <DeleteIcon fontSize="small" />
                  </ActionButton>
                </Tooltip>
              </ListItemSecondaryAction>
            </StyledListItem>
          </Box>
        </Zoom>
      ))}
    </List>
  );
};

export default TaskList; 