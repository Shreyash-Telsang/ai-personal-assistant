import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  SelectChangeEvent,
  IconButton,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Checkbox,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircleOutline as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon,
} from '@mui/icons-material';
import { Task, useTaskStore } from '../../store/taskStore';
import GridWrapper from '../../utils/GridWrapper';

interface TaskDialogProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
}

interface SubTaskForm {
  id: string;
  title: string;
  completed: boolean;
}

const TaskDialog: React.FC<TaskDialogProps> = ({ open, onClose, task }) => {
  const { addTask, updateTask, addSubTask, toggleSubTaskCompletion, deleteSubTask, categories } = useTaskStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('');
  const [subtasks, setSubtasks] = useState<SubTaskForm[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [errors, setErrors] = useState({ title: false });

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setDueDate(task.dueDate ? new Date(task.dueDate) : null);
      setPriority(task.priority);
      setCategory(task.category);
      setSubtasks(task.subtasks?.map(st => ({ ...st })) || []);
    } else {
      resetForm();
    }
  }, [task]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate(null);
    setPriority('medium');
    setCategory(categories[0] || 'Personal');
    setSubtasks([]);
    setNewSubtaskTitle('');
    setErrors({ title: false });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = () => {
    const newErrors = { title: false };
    
    if (!title.trim()) {
      newErrors.title = true;
    }
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSave = () => {
    if (!validateForm()) return;
    
    if (task) {
      // Update existing task
      updateTask(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate || undefined,
        priority,
        category,
        subtasks,
      });
    } else {
      // Add new task
      addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate || undefined,
        priority,
        category,
        completed: false,
        subtasks,
      });
    }
    
    handleClose();
  };

  const handlePriorityChange = (event: SelectChangeEvent) => {
    setPriority(event.target.value as 'low' | 'medium' | 'high');
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setCategory(event.target.value);
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    
    const newSubtask: SubTaskForm = {
      id: `temp-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    
    setSubtasks([...subtasks, newSubtask]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (subtaskId: string) => {
    setSubtasks(subtasks.map(subtask => 
      subtask.id === subtaskId 
        ? { ...subtask, completed: !subtask.completed } 
        : subtask
    ));
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    setSubtasks(subtasks.filter(subtask => subtask.id !== subtaskId));
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      aria-labelledby="task-dialog-title"
    >
      <DialogTitle id="task-dialog-title">
        {task ? 'Edit Task' : 'Add New Task'}
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <GridWrapper item xs={12}>
            <TextField
              autoFocus
              margin="dense"
              id="title"
              label="Task Title"
              type="text"
              fullWidth
              variant="outlined"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={errors.title}
              helperText={errors.title ? 'Title is required' : ''}
            />
          </GridWrapper>
          <GridWrapper item xs={12}>
            <TextField
              margin="dense"
              id="description"
              label="Description"
              type="text"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </GridWrapper>
          <GridWrapper item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Due Date"
                value={dueDate}
                onChange={(newValue) => setDueDate(newValue)}
                slotProps={{
                  textField: {
                    variant: 'outlined',
                    fullWidth: true,
                    margin: 'dense',
                  },
                }}
              />
            </LocalizationProvider>
          </GridWrapper>
          <GridWrapper item xs={12} sm={6}>
            <FormControl fullWidth margin="dense">
              <InputLabel id="priority-select-label">Priority</InputLabel>
              <Select
                labelId="priority-select-label"
                id="priority-select"
                value={priority}
                label="Priority"
                onChange={handlePriorityChange}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </GridWrapper>
          <GridWrapper item xs={12}>
            <FormControl fullWidth margin="dense">
              <InputLabel id="category-select-label">Category</InputLabel>
              <Select
                labelId="category-select-label"
                id="category-select"
                value={category}
                label="Category"
                onChange={handleCategoryChange}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </GridWrapper>
          <GridWrapper item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Subtasks
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                size="small"
                label="Add Subtask"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                fullWidth
              />
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddSubtask}
                disabled={!newSubtaskTitle.trim()}
              >
                Add
              </Button>
            </Box>
            <List>
              {subtasks.map((subtask) => (
                <ListItem key={subtask.id}>
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={subtask.completed}
                      onClick={() => handleToggleSubtask(subtask.id)}
                      icon={<UncheckedIcon />}
                      checkedIcon={<CheckIcon />}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={subtask.title}
                    primaryTypographyProps={{
                      style: {
                        textDecoration: subtask.completed ? 'line-through' : 'none',
                      },
                    }}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteSubtask(subtask.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </GridWrapper>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          {task ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDialog; 