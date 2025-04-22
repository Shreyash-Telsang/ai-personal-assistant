import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  useTheme,
  alpha,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Event as EventIcon,
  Today as TodayIcon,
  Assignment as AssignmentIcon,
  Alarm as AlarmIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import GridWrapper from '../utils/GridWrapper';
import { useTaskStore } from '../store/taskStore';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, 
         eachDayOfInterval, isSameMonth, isSameDay, parseISO, isToday } from 'date-fns';

// Event interface
interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'task' | 'event';
  color: string;
  taskId?: string;
}

const CalendarPage: React.FC = () => {
  const theme = useTheme();
  const { tasks } = useTaskStore();
  
  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventColor, setEventColor] = useState('#4f46e5'); // Default color
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Event colors
  const EVENT_COLORS = [
    '#4f46e5', // Primary blue
    '#f43f5e', // Pink
    '#10b981', // Green
    '#f59e0b', // Amber
    '#8b5cf6', // Purple
    '#ec4899', // Magenta
    '#06b6d4', // Cyan
    '#ef4444', // Red
  ];
  
  // Generate calendar days
  const calendarDays = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });
  
  // Add days from previous and next month to fill the calendar grid
  const startDay = startOfMonth(currentDate).getDay();
  const endDay = 6 - endOfMonth(currentDate).getDay();
  
  const prevMonthDays = startDay > 0 
    ? eachDayOfInterval({
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), -startDay + 1),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 0)
      })
    : [];
    
  const nextMonthDays = endDay > 0
    ? eachDayOfInterval({
        start: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, endDay)
      })
    : [];
    
  const allDays = [...prevMonthDays, ...calendarDays, ...nextMonthDays];
  
  // Update events when tasks change
  useEffect(() => {
    // Convert tasks to calendar events
    const taskEvents = tasks
      .filter(task => task.dueDate)
      .map(task => ({
        id: `task-${task.id}`,
        title: task.title,
        date: new Date(task.dueDate!),
        type: 'task' as const,
        color: task.priority === 'high' ? '#ef4444' : 
               task.priority === 'medium' ? '#f59e0b' : '#10b981',
        taskId: task.id,
      }));
    
    // Merge with custom events (stored in localStorage)
    const storedEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
    const customEvents = storedEvents.map((event: any) => ({
      ...event,
      date: new Date(event.date),
    }));
    
    setEvents([...taskEvents, ...customEvents]);
  }, [tasks]);
  
  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  const handleToday = () => {
    setCurrentDate(new Date());
  };
  
  // Event handlers
  const handleAddEvent = () => {
    setIsEventDialogOpen(true);
    setIsEditMode(false);
    setSelectedEvent(null);
    setEventTitle('');
    setEventDate(format(new Date(), 'yyyy-MM-dd'));
    setEventColor(EVENT_COLORS[0]);
  };
  
  const handleEditEvent = (event: CalendarEvent) => {
    // Don't allow editing task events directly
    if (event.type === 'task') {
      setSnackbarMessage('Task events can only be edited from the Tasks page');
      setSnackbarOpen(true);
      return;
    }
    
    setIsEventDialogOpen(true);
    setIsEditMode(true);
    setSelectedEvent(event);
    setEventTitle(event.title);
    setEventDate(format(event.date, 'yyyy-MM-dd'));
    setEventColor(event.color);
  };
  
  const handleDeleteEvent = (event: CalendarEvent) => {
    // Don't allow deleting task events directly
    if (event.type === 'task') {
      setSnackbarMessage('Task events can only be deleted from the Tasks page');
      setSnackbarOpen(true);
      return;
    }
    
    const updatedEvents = events.filter(e => e.id !== event.id);
    setEvents(updatedEvents);
    
    // Save to localStorage
    const customEvents = updatedEvents.filter(e => e.type === 'event');
    localStorage.setItem('calendarEvents', JSON.stringify(customEvents));
    
    setSnackbarMessage('Event deleted');
    setSnackbarOpen(true);
  };
  
  const handleSaveEvent = () => {
    if (!eventTitle.trim()) {
      setSnackbarMessage('Event title cannot be empty');
      setSnackbarOpen(true);
      return;
    }
    
    const newEvent: CalendarEvent = {
      id: isEditMode && selectedEvent ? selectedEvent.id : `event-${Date.now()}`,
      title: eventTitle,
      date: new Date(eventDate),
      type: 'event',
      color: eventColor,
    };
    
    let updatedEvents: CalendarEvent[];
    
    if (isEditMode && selectedEvent) {
      updatedEvents = events.map(event => 
        event.id === selectedEvent.id ? newEvent : event
      );
      setSnackbarMessage('Event updated');
    } else {
      updatedEvents = [...events, newEvent];
      setSnackbarMessage('Event added');
    }
    
    setEvents(updatedEvents);
    
    // Save to localStorage (only custom events, not tasks)
    const customEvents = updatedEvents.filter(e => e.type === 'event');
    localStorage.setItem('calendarEvents', JSON.stringify(customEvents));
    
    setSnackbarOpen(true);
    setIsEventDialogOpen(false);
  };
  
  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(new Date(event.date), day));
  };
  
  // Render calendar cell
  const renderCell = (day: Date) => {
    const isCurrentMonth = isSameMonth(day, currentDate);
    const dayEvents = getEventsForDay(day);
    const isCurrentDay = isToday(day);
    
    return (
      <Box
        key={day.toString()}
        sx={{
          p: 1,
          height: 120,
          border: '1px solid',
          borderColor: theme.palette.divider,
          bgcolor: isCurrentMonth ? 'background.paper' : alpha(theme.palette.action.disabledBackground, 0.3),
          opacity: isCurrentMonth ? 1 : 0.6,
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.05),
          },
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: isCurrentDay ? 'bold' : 'normal',
            color: isCurrentDay ? 'primary.main' : 'text.primary',
            display: 'inline-block',
            width: 24,
            height: 24,
            lineHeight: '24px',
            textAlign: 'center',
            borderRadius: '50%',
            bgcolor: isCurrentDay ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
          }}
        >
          {format(day, 'd')}
        </Typography>
        
        <Box sx={{ mt: 1, maxHeight: 80, overflowY: 'auto' }}>
          {dayEvents.map(event => (
            <Box
              key={event.id}
              sx={{
                p: 0.5,
                mb: 0.5,
                borderRadius: 1,
                bgcolor: alpha(event.color, 0.2),
                borderLeft: `3px solid ${event.color}`,
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: alpha(event.color, 0.3),
                }
              }}
              onClick={() => handleEditEvent(event)}
            >
              {event.type === 'task' ? (
                <AssignmentIcon fontSize="small" sx={{ color: event.color, mr: 0.5, fontSize: 14 }} />
              ) : (
                <EventIcon fontSize="small" sx={{ color: event.color, mr: 0.5, fontSize: 14 }} />
              )}
              <Typography
                variant="caption"
                noWrap
                sx={{
                  fontWeight: 500,
                  color: 'text.primary',
                }}
              >
                {event.title}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };
  
  return (
    <Box>
      {/* Header */}
      <Paper 
        sx={{ 
          p: 3, 
          mb: 3,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)}, ${alpha(theme.palette.primary.dark, 0.05)})`,
        }}
      >
        <Grid container alignItems="center" spacing={2}>
          <GridWrapper item>
            <CalendarIcon fontSize="large" color="primary" />
          </GridWrapper>
          <GridWrapper item xs>
            <Typography variant="h4" fontWeight="bold">Calendar</Typography>
            <Typography variant="body1" color="textSecondary">
              View and manage your schedule
            </Typography>
          </GridWrapper>
          <GridWrapper item>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddEvent}
              sx={{ borderRadius: 8 }}
            >
              Add Event
            </Button>
          </GridWrapper>
        </Grid>
      </Paper>
      
      {/* Calendar Controls */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handlePrevMonth}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="h5" sx={{ mx: 2 }}>
            {format(currentDate, 'MMMM yyyy')}
          </Typography>
          <IconButton onClick={handleNextMonth}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
        
        <Button
          variant="outlined"
          startIcon={<TodayIcon />}
          onClick={handleToday}
          size="small"
        >
          Today
        </Button>
      </Box>
      
      {/* Calendar Grid */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        {/* Weekday Headers */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Box
              key={day}
              sx={{
                p: 1.5,
                textAlign: 'center',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="subtitle2" fontWeight="bold">
                {day}
              </Typography>
            </Box>
          ))}
        </Box>
        
        {/* Calendar Cells */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {allDays.map(day => renderCell(day))}
        </Box>
      </Paper>
      
      {/* Legend */}
      <Paper sx={{ borderRadius: 3, p: 2, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Legend
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ef4444', mr: 1 }} />
            <Typography variant="body2">High Priority Task</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f59e0b', mr: 1 }} />
            <Typography variant="body2">Medium Priority Task</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#10b981', mr: 1 }} />
            <Typography variant="body2">Low Priority Task</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4f46e5', mr: 1 }} />
            <Typography variant="body2">Custom Event</Typography>
          </Box>
        </Box>
      </Paper>
      
      {/* Event Dialog */}
      <Dialog
        open={isEventDialogOpen}
        onClose={() => setIsEventDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {isEditMode ? 'Edit Event' : 'Add Event'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Event Title"
            fullWidth
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Date"
            type="date"
            fullWidth
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Color</InputLabel>
            <Select
              value={eventColor}
              onChange={(e) => setEventColor(e.target.value)}
              label="Color"
            >
              {EVENT_COLORS.map((color) => (
                <MenuItem key={color} value={color}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: color,
                        mr: 1,
                      }}
                    />
                    <Typography variant="body2">
                      {color === '#4f46e5' ? 'Blue' :
                       color === '#f43f5e' ? 'Pink' :
                       color === '#10b981' ? 'Green' :
                       color === '#f59e0b' ? 'Amber' :
                       color === '#8b5cf6' ? 'Purple' :
                       color === '#ec4899' ? 'Magenta' :
                       color === '#06b6d4' ? 'Cyan' :
                       'Red'}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEventDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          {isEditMode && selectedEvent && (
            <Button 
              onClick={() => {
                handleDeleteEvent(selectedEvent);
                setIsEventDialogOpen(false);
              }} 
              color="error"
              startIcon={<DeleteIcon />}
            >
              Delete
            </Button>
          )}
          <Button onClick={handleSaveEvent} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CalendarPage; 