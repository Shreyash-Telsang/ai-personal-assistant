import React, { useState } from 'react';
import {
  Paper,
  InputBase,
  Button,
  IconButton,
  Box,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  SelectChangeEvent,
  Stack,
  Typography,
  useTheme,
  Collapse,
  Tooltip,
  Fade,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Add as AddIcon,
  CalendarMonth as CalendarIcon,
  Flag as FlagIcon,
  Category as CategoryIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';
import { useTaskStore } from '../../store/taskStore';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: '16px',
  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(to right bottom, rgba(26, 32, 46, 0.8), rgba(20, 24, 34, 0.8))'
    : 'linear-gradient(to right bottom, rgba(255, 255, 255, 0.9), rgba(249, 250, 251, 0.9))',
  backdropFilter: 'blur(10px)',
  '&:hover': {
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-2px)',
  },
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  fontSize: '1rem',
  padding: theme.spacing(0.5, 1),
  borderRadius: '8px',
  flex: 1,
  transition: 'all 0.2s ease',
  '&:focus-within': {
    background: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(0, 0, 0, 0.03)',
  },
}));

const AddButton = styled(Button)(({ theme }) => ({
  borderRadius: '30px',
  padding: theme.spacing(1, 2.5),
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)',
    transform: 'translateY(-2px)',
  },
  '&:active': {
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    transform: 'translateY(0)',
  },
}));

const OptionsToggle = styled(IconButton)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  transition: 'transform 0.3s ease',
  color: theme.palette.primary.main,
  '&.expanded': {
    transform: 'rotate(180deg)',
  },
}));

const TaskQuickAdd: React.FC = () => {
  const theme = useTheme();
  const { addTask, categories } = useTaskStore();
  const [title, setTitle] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState(categories[0] || 'Personal');

  const handleAddTask = () => {
    if (!title.trim()) return;
    
    addTask({
      title: title.trim(),
      priority,
      category,
      dueDate: dueDate || undefined,
      completed: false,
    });
    
    // Reset form
    setTitle('');
    setDueDate(null);
    setPriority('medium');
    setCategory(categories[0] || 'Personal');
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleAddTask();
    }
  };

  const handlePriorityChange = (event: SelectChangeEvent) => {
    setPriority(event.target.value as 'low' | 'medium' | 'high');
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setCategory(event.target.value);
  };

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  return (
    <StyledPaper>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <StyledInputBase
          placeholder="Add a new task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyPress={handleKeyPress}
          startAdornment={
            <AddIcon color="action" sx={{ mr: 1, opacity: 0.6 }} fontSize="small" />
          }
        />
        <Tooltip title="Show more options" placement="top">
          <OptionsToggle
            size="small"
            onClick={toggleOptions}
            className={showOptions ? 'expanded' : ''}
          >
            <ArrowDownIcon fontSize="small" />
          </OptionsToggle>
        </Tooltip>
        <AddButton
          variant="contained"
          color="primary"
          onClick={handleAddTask}
          disabled={!title.trim()}
          sx={{ ml: 2 }}
        >
          Add
        </AddButton>
      </Box>

      <Collapse in={showOptions} timeout="auto">
        <Fade in={showOptions}>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            sx={{ mt: 2.5 }}
            alignItems="center"
          >
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Due Date"
                value={dueDate}
                onChange={(newValue) => setDueDate(newValue)}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    sx: { 
                      minWidth: '140px',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                        },
                      },
                    },
                  },
                }}
              />
            </LocalizationProvider>

            <FormControl 
              size="small" 
              sx={{ 
                minWidth: 120,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  transition: 'all 0.2s',
                },
              }}
            >
              <InputLabel id="priority-select-label">Priority</InputLabel>
              <Select
                labelId="priority-select-label"
                id="priority-select"
                value={priority}
                label="Priority"
                onChange={handlePriorityChange}
                startAdornment={
                  <FlagIcon 
                    fontSize="small" 
                    color={
                      priority === 'high' ? 'error' : 
                      priority === 'medium' ? 'warning' : 'action'
                    } 
                    sx={{ mr: 1 }}
                  />
                }
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>

            <FormControl 
              size="small" 
              sx={{ 
                minWidth: 150,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  transition: 'all 0.2s',
                },
              }}
            >
              <InputLabel id="category-select-label">Category</InputLabel>
              <Select
                labelId="category-select-label"
                id="category-select"
                value={category}
                label="Category"
                onChange={handleCategoryChange}
                startAdornment={
                  <CategoryIcon fontSize="small" sx={{ mr: 1 }} />
                }
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Fade>
      </Collapse>
    </StyledPaper>
  );
};

export default TaskQuickAdd; 