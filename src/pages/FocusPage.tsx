import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Chip,
  IconButton,
  LinearProgress,
  Divider,
  useTheme,
  alpha,
  Stack,
  Zoom,
  Tooltip,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Timer as TimerIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  LightMode as LightModeIcon,
  NightsStay as NightsStayIcon,
  MusicNote as MusicIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  FormatListBulleted as FormatListBulletedIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
  TipsAndUpdates as TipsIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import GridWrapper from '../utils/GridWrapper';
import TimerModal from '../components/assistant/TimerModal';
import { useTaskStore } from '../store/taskStore';

// Define session types
type SessionType = 'focus' | 'shortBreak' | 'longBreak';

interface Session {
  type: SessionType;
  duration: number;
  color: string;
  label: string;
}

const SESSION_TYPES: Record<SessionType, Session> = {
  focus: {
    type: 'focus',
    duration: 25 * 60,
    color: '#d32f2f',
    label: 'Focus',
  },
  shortBreak: {
    type: 'shortBreak',
    duration: 5 * 60,
    color: '#4caf50',
    label: 'Short Break',
  },
  longBreak: {
    type: 'longBreak',
    duration: 15 * 60,
    color: '#2196f3',
    label: 'Long Break',
  },
};

// Enhanced styled components for better dark mode support
const TimerContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(3),
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.default, 0.8)})`
    : `linear-gradient(145deg, ${alpha('#ffffff', 0.98)}, ${alpha('#f8fafc', 0.92)})`,
  backdropFilter: 'blur(10px)',
  boxShadow: theme.palette.mode === 'dark'
    ? `0 10px 30px ${alpha('#000', 0.25)}`
    : `0 10px 30px ${alpha('#000', 0.1)}`,
  transition: 'all 0.3s ease',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  minHeight: '400px',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

const TimerDisplay = styled(Typography)(({ theme }) => ({
  fontFamily: 'monospace',
  fontSize: '5rem',
  fontWeight: 'bold',
  letterSpacing: '0.1em',
  textAlign: 'center',
  marginBottom: theme.spacing(2),
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(45deg, #6366f1, #ec4899)'
    : 'linear-gradient(45deg, #4f46e5, #f43f5e)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  textShadow: `0 4px 10px ${alpha('#000', theme.palette.mode === 'dark' ? 0.3 : 0.1)}`,
  [theme.breakpoints.down('sm')]: {
    fontSize: '3.5rem',
  },
}));

const SessionChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  fontWeight: 600,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 4px 8px ${alpha('#000', 0.1)}`,
  },
  '&.MuiChip-filled': {
    background: theme.palette.mode === 'dark'
      ? `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.8)}, ${alpha(theme.palette.primary.dark, 0.9)})`
      : `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  borderRadius: '30px',
  padding: theme.spacing(1, 3),
  transition: 'all 0.3s ease',
  fontWeight: 600,
  boxShadow: `0 4px 10px ${alpha('#000', 0.1)}`,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 6px 15px ${alpha('#000', 0.15)}`,
  },
  '&.MuiButton-contained': {
    background: theme.palette.mode === 'dark'
      ? `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.8)}, ${alpha(theme.palette.primary.dark, 0.9)})`
      : `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
  boxShadow: theme.palette.mode === 'dark'
    ? `0 8px 25px ${alpha('#000', 0.3)}`
    : `0 8px 25px ${alpha('#000', 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.palette.mode === 'dark'
      ? `0 12px 30px ${alpha('#000', 0.4)}`
      : `0 12px 30px ${alpha('#000', 0.15)}`,
  },
  background: theme.palette.mode === 'dark'
    ? alpha(theme.palette.background.paper, 0.8)
    : alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

const FocusPage: React.FC = () => {
  const theme = useTheme();
  const { tasks } = useTaskStore();
  
  // State for timer
  const [sessionType, setSessionType] = useState<SessionType>('focus');
  const [timeRemaining, setTimeRemaining] = useState(SESSION_TYPES.focus.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [showTasksDialog, setShowTasksDialog] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  
  // Timer interval reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Audio reference for notification sound
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/notification.mp3');
    audioRef.current.onerror = () => {
      console.error('Could not load notification sound');
      audioRef.current = null;
    };
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);
  
  // Handle timer logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);
  
  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle session type change
  const handleSessionChange = (type: SessionType) => {
    if (!isRunning) {
      setSessionType(type);
      setTimeRemaining(SESSION_TYPES[type].duration);
    } else {
      setAlertMessage("Please pause the timer before changing session type.");
      setShowAlert(true);
    }
  };
  
  // Handle timer controls
  const handleStart = () => {
    if (timeRemaining <= 0) {
      setTimeRemaining(SESSION_TYPES[sessionType].duration);
    }
    setIsRunning(true);
    
    // Request wake lock to prevent screen from sleeping
    if ('wakeLock' in navigator) {
      // @ts-ignore - TypeScript might not have the wake lock API types
      navigator.wakeLock.request('screen').catch(err => {
        console.error('Wake lock error:', err);
      });
    }
  };
  
  const handlePause = () => {
    setIsRunning(false);
  };
  
  const handleReset = () => {
    setIsRunning(false);
    setTimeRemaining(SESSION_TYPES[sessionType].duration);
  };
  
  // Handle session completion
  const handleSessionComplete = () => {
    setIsRunning(false);
    
    // Play notification sound if not muted
    if (!isMuted && audioRef.current) {
      audioRef.current.play().catch(err => {
        console.error('Error playing notification sound:', err);
      });
    }
    
    // Increment completed sessions counter
    setCompletedSessions(prev => prev + 1);
    
    // Show completion message
    setAlertMessage(`${SESSION_TYPES[sessionType].label} session completed!`);
    setShowAlert(true);
    
    // Auto switch to break or focus
    if (sessionType === 'focus') {
      // After 4 focus sessions, take a long break
      if ((completedSessions + 1) % 4 === 0) {
        handleSessionChange('longBreak');
      } else {
        handleSessionChange('shortBreak');
      }
    } else {
      handleSessionChange('focus');
    }
  };
  
  // Handle task selection
  const handleSelectTask = (taskId: string) => {
    setSelectedTask(taskId);
    setShowTasksDialog(false);
  };
  
  // Calculate progress percentage
  const calculateProgress = (): number => {
    const total = SESSION_TYPES[sessionType].duration;
    return ((total - timeRemaining) / total) * 100;
  };
  
  // Get progress color based on session type
  const getProgressColor = (): string => {
    switch (sessionType) {
      case 'focus': return theme.palette.error.main;
      case 'shortBreak': return theme.palette.success.main;
      case 'longBreak': return theme.palette.info.main;
      default: return theme.palette.primary.main;
    }
  };
  
  return (
    <Box sx={{ 
      width: '100%',
      minHeight: '100vh',
      p: { xs: 2, sm: 3 },
      background: theme.palette.mode === 'dark' 
        ? `linear-gradient(145deg, ${alpha(theme.palette.background.default, 0.9)}, ${alpha('#000', 0.95)})`
        : `linear-gradient(145deg, ${alpha('#fff', 0.95)}, ${alpha('#f8fafc', 0.9)})`,
    }}>
      {/* Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, sm: 3 }, 
          mb: 3,
          borderRadius: 3,
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 },
            }}
          >
            <TimerIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, fontWeight: 600 }}>
              Focus Timer
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Boost your productivity with the Pomodoro Technique
            </Typography>
          </Box>
          <Tooltip title="About the Pomodoro Technique" arrow>
            <IconButton 
              sx={{ ml: 'auto' }}
              onClick={() => setShowTimerModal(true)}
            >
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Main Timer Section */}
        <GridWrapper xs={12} md={8}>
          <TimerContainer>
            {/* Session Type Selector */}
            <Box sx={{ width: '100%', mb: 4 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 1,
                mb: 3
              }}>
                {Object.entries(SESSION_TYPES).map(([key, session]) => (
                  <SessionChip
                    key={key}
                    label={session.label}
                    color={session.type === sessionType ? 'primary' : 'default'}
                    variant={session.type === sessionType ? 'filled' : 'outlined'}
                    onClick={() => handleSessionChange(session.type as SessionType)}
                  />
                ))}
              </Box>

              <LinearProgress
                variant="determinate"
                value={calculateProgress()}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: alpha(getProgressColor(), 0.2),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getProgressColor(),
                    backgroundImage: `linear-gradient(90deg, 
                      ${alpha('#fff', 0.2)} 0%, 
                      ${alpha('#fff', 0.3)} 50%, 
                      ${alpha('#fff', 0.2)} 100%
                    )`,
                    backgroundSize: '200% 100%',
                    animation: 'moveGradient 2s linear infinite',
                  },
                }}
              />
            </Box>

            {/* Timer Display */}
            <TimerDisplay variant="h1">
              {formatTime(timeRemaining)}
            </TimerDisplay>

            {/* Timer Controls */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              gap: 2,
              justifyContent: 'center',
              alignItems: 'center',
              mt: 4
            }}>
              <ActionButton
                variant="contained"
                size="large"
                startIcon={isRunning ? <PauseIcon /> : <PlayIcon />}
                onClick={isRunning ? handlePause : handleStart}
                sx={{ 
                  minWidth: 140,
                  bgcolor: isRunning ? theme.palette.warning.main : theme.palette.success.main,
                  '&:hover': {
                    bgcolor: isRunning ? theme.palette.warning.dark : theme.palette.success.dark,
                  }
                }}
              >
                {isRunning ? 'Pause' : 'Start'}
              </ActionButton>

              <ActionButton
                variant="outlined"
                size="large"
                startIcon={<RefreshIcon />}
                onClick={handleReset}
                disabled={!isRunning && timeRemaining === SESSION_TYPES[sessionType].duration}
                sx={{ minWidth: 140 }}
              >
                Reset
              </ActionButton>
            </Box>

            {/* Additional Controls */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 2,
              mt: 3 
            }}>
              <Tooltip title={isMuted ? "Unmute Notifications" : "Mute Notifications"}>
                <IconButton onClick={() => setIsMuted(!isMuted)}>
                  {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                </IconButton>
              </Tooltip>

              <Tooltip title="Select Task">
                <IconButton onClick={() => setShowTasksDialog(true)}>
                  <FormatListBulletedIcon />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Selected Task Display */}
            {selectedTask && (
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Current Task:
                </Typography>
                <Chip 
                  label={tasks.find(t => t.id === selectedTask)?.title || "Selected Task"}
                  color="secondary"
                  sx={{ borderRadius: 2 }}
                />
              </Box>
            )}
          </TimerContainer>
        </GridWrapper>

        {/* Stats Section */}
        <GridWrapper xs={12} md={4}>
          <Stack spacing={3}>
            {/* Session Stats */}
            <StyledCard>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                    <BarChartIcon />
                  </Avatar>
                }
                title="Focus Statistics"
                titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
              />
              <CardContent>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Completed Sessions
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                      <Typography variant="h3" fontWeight="bold">
                        {completedSessions}
                      </Typography>
                      <Chip
                        size="small"
                        label={`${Math.floor((completedSessions * 25) / 60)} hours`}
                        sx={{ 
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                        }}
                      />
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Current Session
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={SESSION_TYPES[sessionType].label}
                        size="small"
                        sx={{ 
                          bgcolor: alpha(getProgressColor(), 0.1),
                          color: getProgressColor(),
                          fontWeight: 500
                        }}
                      />
                      <Chip
                        label={isRunning ? "Active" : "Paused"}
                        size="small"
                        color={isRunning ? "success" : "default"}
                      />
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </StyledCard>

            {/* Focus Tips */}
            <StyledCard>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.main }}>
                    <TipsIcon />
                  </Avatar>
                }
                title="Focus Tips"
                titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
              />
              <CardContent>
                <Stack spacing={2}>
                  {[
                    { tip: "Eliminate distractions - Put your phone away and close unnecessary tabs." },
                    { tip: "Stay hydrated - Keep water nearby to maintain focus." },
                    { tip: "Take breaks - Use them to stretch and rest your eyes." }
                  ].map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                      <Avatar 
                        sx={{ 
                          width: 24, 
                          height: 24, 
                          fontSize: '0.875rem',
                          bgcolor: alpha(theme.palette.success.main, 0.1),
                          color: theme.palette.success.main
                        }}
                      >
                        {index + 1}
                      </Avatar>
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {item.tip}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </StyledCard>
          </Stack>
        </GridWrapper>
      </Grid>

      {/* Snackbar for alerts */}
      <Snackbar
        open={showAlert}
        autoHideDuration={6000}
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowAlert(false)} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
      
      {/* Timer info modal */}
      <TimerModal
        open={showTimerModal}
        onClose={() => setShowTimerModal(false)}
      />
      
      {/* Task selection dialog */}
      <Dialog
        open={showTasksDialog}
        onClose={() => setShowTasksDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: theme.palette.background.paper,
          }
        }}
      >
        <DialogTitle>Select Task</DialogTitle>
        <DialogContent dividers>
          {tasks.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
              No tasks available. Create tasks in the Tasks section.
            </Typography>
          ) : (
            <Stack spacing={1} sx={{ mt: 1 }}>
              {tasks
                .filter(task => !task.completed)
                .map(task => (
                  <Paper
                    key={task.id}
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      cursor: 'pointer',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      bgcolor: task.id === selectedTask 
                        ? alpha(theme.palette.primary.main, 0.1)
                        : alpha(theme.palette.background.paper, 0.7),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                      },
                    }}
                    onClick={() => handleSelectTask(task.id)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body1">{task.title}</Typography>
                      {task.id === selectedTask && (
                        <CheckCircleIcon 
                          fontSize="small" 
                          color="primary" 
                          sx={{ ml: 'auto' }} 
                        />
                      )}
                    </Box>
                  </Paper>
                ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTasksDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => setShowTasksDialog(false)}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FocusPage; 