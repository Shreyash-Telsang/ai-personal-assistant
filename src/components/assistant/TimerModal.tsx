import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  LinearProgress,
  IconButton,
  Slider,
  Stack,
  Avatar,
  Chip,
  Fade,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Add,
  Remove,
  Timer as TimerIcon,
  AccessAlarm as AlarmIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import GridWrapper from '../../utils/GridWrapper';

const TIMER_MODES = [
  { label: 'Focus', color: '#d32f2f', duration: 25 * 60 },
  { label: 'Short Break', color: '#4caf50', duration: 5 * 60 },
  { label: 'Long Break', color: '#2196f3', duration: 15 * 60 },
];

interface TimerModalProps {
  open: boolean;
  onClose: () => void;
}

// Styled components
const TimerDisplay = styled(Typography)(({ theme }) => ({
  fontFamily: 'monospace',
  fontSize: '4rem',
  fontWeight: 'bold',
  letterSpacing: '0.1em',
  textAlign: 'center',
  marginBottom: theme.spacing(2),
  background: 'linear-gradient(45deg, #4f46e5, #f43f5e)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  textShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
}));

interface ModeChipProps {
  active: boolean;
  modecolor: string;
}

const ModeChip = styled(Chip)<ModeChipProps>(({ theme, active, modecolor }) => ({
  height: 40,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: active ? modecolor : theme.palette.action.hover,
  color: active ? '#fff' : theme.palette.text.primary,
  boxShadow: active ? '0 4px 10px rgba(0, 0, 0, 0.15)' : 'none',
  transform: active ? 'translateY(-2px)' : 'translateY(0)',
  '&:hover': {
    backgroundColor: active ? modecolor : theme.palette.action.selected,
    opacity: 0.9,
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
  },
}));

interface StyledLinearProgressProps {
  barcolor: string;
}

const StyledLinearProgress = styled(LinearProgress)<StyledLinearProgressProps>(({ barcolor }) => ({
  height: 10,
  borderRadius: 5,
  marginTop: 8,
  marginBottom: 8,
  '& .MuiLinearProgress-bar': {
    backgroundColor: barcolor,
    backgroundImage: `linear-gradient(45deg, ${barcolor} 30%, ${barcolor}99 90%)`,
  },
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  transition: 'all 0.2s ease',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
  background: theme.palette.background.paper,
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  },
}));

const TimerModal: React.FC<TimerModalProps> = ({ open, onClose }) => {
  const [modeIndex, setModeIndex] = useState(0);
  const [time, setTime] = useState(TIMER_MODES[0].duration);
  const [originalTime, setOriginalTime] = useState(TIMER_MODES[0].duration);
  const [isRunning, setIsRunning] = useState(false);
  const [customDuration, setCustomDuration] = useState('25');
  const [volume, setVolume] = useState(0.5);
  const [label, setLabel] = useState('');
  const [notes, setNotes] = useState('');
  const [completedSessions, setCompletedSessions] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Create audio element for timer completion sound
  useEffect(() => {
    audioRef.current = new Audio('/notification.mp3');
    
    // Fallback to browser API if audio file not available
    audioRef.current.onerror = () => {
      audioRef.current = null;
    };
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);
  
  // Reset timer when mode changes
  useEffect(() => {
    const newDuration = TIMER_MODES[modeIndex].duration;
    setTime(newDuration);
    setOriginalTime(newDuration);
    setCustomDuration((newDuration / 60).toString());
    stopTimer();
  }, [modeIndex]);
  
  // Handle timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => {
          if (prevTime <= 1) {
            timerComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);
  
  const timerComplete = () => {
    stopTimer();
    
    // Increment completed sessions counter (only for Focus sessions)
    if (modeIndex === 0) {
      setCompletedSessions(prev => prev + 1);
    }
    
    // Play notification sound
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.play().catch(error => {
        console.error('Error playing notification sound:', error);
        
        // Fallback to native notification
        if ('Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification('Timer Complete', {
              body: `Your ${TIMER_MODES[modeIndex].label} session is complete!`,
              icon: '/timer-icon.png'
            });
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission();
          }
        }
      });
    }
    
    // Switch to break after focus or back to focus after break
    if (modeIndex === 0) {
      // After 4 focus sessions, take a long break
      if (completedSessions % 4 === 0) {
        setModeIndex(2); // Long Break
      } else {
        setModeIndex(1); // Short Break
      }
    } else {
      setModeIndex(0); // Switch back to Focus
    }
  };
  
  const startTimer = () => {
    setIsRunning(true);
    if ('wakeLock' in navigator) {
      // @ts-ignore - Wake Lock API may not be in TypeScript defs yet
      navigator.wakeLock.request('screen').catch(err => {
        console.error('Wake Lock error:', err);
      });
    }
  };
  
  const pauseTimer = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };
  
  const stopTimer = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setTime(originalTime);
  };
  
  const adjustTime = (minutes: number) => {
    if (!isRunning) {
      const newTime = Math.max(60, originalTime + (minutes * 60));
      setTime(newTime);
      setOriginalTime(newTime);
      setCustomDuration((newTime / 60).toString());
    }
  };
  
  const handleCustomDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomDuration(value);
    
    const minutes = parseInt(value, 10);
    if (!isNaN(minutes) && minutes > 0) {
      const newTime = minutes * 60;
      setTime(newTime);
      setOriginalTime(newTime);
    }
  };
  
  const applyCustomDuration = () => {
    const minutes = parseInt(customDuration, 10);
    if (!isNaN(minutes) && minutes > 0) {
      const newTime = minutes * 60;
      setTime(newTime);
      setOriginalTime(newTime);
    }
  };
  
  // Format time display (mm:ss)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const progress = ((originalTime - time) / originalTime) * 100;
  
  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    setVolume(newValue as number);
    if (audioRef.current) {
      audioRef.current.volume = newValue as number;
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
          background: theme => theme.palette.mode === 'dark' 
            ? 'linear-gradient(to right bottom, rgba(30, 30, 30, 0.95), rgba(25, 25, 25, 0.98))'
            : 'linear-gradient(to right bottom, rgba(255, 255, 255, 0.95), rgba(249, 250, 251, 0.98))',
          backdropFilter: 'blur(20px)',
          border: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
        }
      }}
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 500 }}
    >
      <DialogTitle sx={{ 
        pb: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
      }}>
        <Box display="flex" alignItems="center">
          <Avatar sx={{ 
            bgcolor: TIMER_MODES[modeIndex].color, 
            mr: 1,
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
          }}>
            <TimerIcon />
          </Avatar>
          <Typography variant="h5">
            Focus Timer
            <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>
              {completedSessions} sessions completed
            </Typography>
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Box textAlign="center" mb={3}>
          <Stack 
            direction="row" 
            spacing={1} 
            justifyContent="center" 
            mb={3}
          >
            {TIMER_MODES.map((mode, idx) => (
              <ModeChip
                key={mode.label}
                label={mode.label}
                active={modeIndex === idx}
                modecolor={mode.color}
                onClick={() => !isRunning && setModeIndex(idx)}
                icon={idx === 0 ? <TimerIcon /> : idx === 1 ? <AlarmIcon /> : <NotificationsIcon />}
              />
            ))}
          </Stack>
          
          <Fade in={true} timeout={800}>
            <Box>
              <TimerDisplay>
                {formatTime(time)}
              </TimerDisplay>
              
              <StyledLinearProgress 
                variant="determinate" 
                value={progress} 
                barcolor={TIMER_MODES[modeIndex].color}
              />
            </Box>
          </Fade>
          
          <GridWrapper container spacing={2} alignItems="center" justifyContent="center" sx={{ mt: 3 }}>
            <GridWrapper item xs>
              <ActionButton 
                color="primary" 
                onClick={() => adjustTime(-5)} 
                disabled={isRunning}
                size="large"
              >
                <Remove />
              </ActionButton>
            </GridWrapper>
            <GridWrapper item xs={4}>
              <TextField
                label="Duration (min)"
                value={customDuration}
                onChange={handleCustomDurationChange}
                onBlur={applyCustomDuration}
                type="number"
                size="small"
                inputProps={{ min: 1, max: 120 }}
                fullWidth
                disabled={isRunning}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  }
                }}
              />
            </GridWrapper>
            <GridWrapper item xs>
              <ActionButton 
                color="primary" 
                onClick={() => adjustTime(5)} 
                disabled={isRunning}
                size="large"
              >
                <Add />
              </ActionButton>
            </GridWrapper>
          </GridWrapper>
        </Box>
        
        <Box display="flex" justifyContent="center" gap={2}>
          {!isRunning ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayArrow />}
              onClick={startTimer}
              size="large"
              sx={{ 
                px: 4, 
                py: 1.5, 
                borderRadius: 4,
                background: `linear-gradient(45deg, ${TIMER_MODES[modeIndex].color} 30%, ${TIMER_MODES[modeIndex].color}99 90%)`,
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                '&:hover': {
                  background: `linear-gradient(45deg, ${TIMER_MODES[modeIndex].color}CC 30%, ${TIMER_MODES[modeIndex].color} 90%)`,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Start
            </Button>
          ) : (
            <Button
              variant="contained"
              color="warning"
              startIcon={<Pause />}
              onClick={pauseTimer}
              size="large"
              sx={{ 
                px: 4, 
                py: 1.5, 
                borderRadius: 4,
                background: `linear-gradient(45deg, #f44336 30%, #ff9800 90%)`,
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                '&:hover': {
                  background: `linear-gradient(45deg, #f44336 10%, #ff9800 90%)`,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Pause
            </Button>
          )}
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<Stop />}
            onClick={stopTimer}
            size="large"
            disabled={!isRunning && time === originalTime}
            sx={{ 
              px: 4, 
              py: 1.5, 
              borderRadius: 4,
              transition: 'all 0.3s ease',
              '&:hover:not(:disabled)': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            Reset
          </Button>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography id="timer-slider" gutterBottom>
            Notification Volume
          </Typography>
          <Slider
            aria-labelledby="timer-slider"
            value={volume}
            onChange={handleVolumeChange}
            min={0}
            max={1}
            step={0.05}
            marks={[
              { value: 0, label: '0%' },
              { value: 0.5, label: '50%' },
              { value: 1, label: '100%' },
            ]}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
            sx={{
              color: TIMER_MODES[modeIndex].color,
              '& .MuiSlider-thumb': {
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                '&:hover, &.Mui-focusVisible': {
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
                }
              }
            }}
          />
        </Box>

        <GridWrapper container spacing={2} sx={{ mt: 3 }}>
          <GridWrapper item xs={12} md={6}>
            <TextField
              label="Timer Label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              fullWidth
              size="small"
              variant="outlined"
              placeholder="What are you focusing on?"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                }
              }}
            />
          </GridWrapper>
          <GridWrapper item xs={12} md={6}>
            <TextField
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              size="small"
              variant="outlined"
              multiline
              rows={1}
              placeholder="Add any notes about this session"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                }
              }}
            />
          </GridWrapper>
        </GridWrapper>
      </DialogContent>
      
      <DialogActions sx={{ 
        borderTop: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`, 
        px: 3, 
        py: 2 
      }}>
        <Typography variant="body2" color="textSecondary" sx={{ flex: 1 }}>
          {isRunning ? 'Timer is running. Stay focused!' : 'Ready to start your session?'}
        </Typography>
        <Button 
          onClick={onClose} 
          color="inherit"
          sx={{
            borderRadius: '10px',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              transform: 'translateY(-2px)',
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TimerModal;
