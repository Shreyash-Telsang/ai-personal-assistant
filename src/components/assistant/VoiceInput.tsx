import React, { useState, useEffect, useRef } from 'react';
import {
  IconButton,
  CircularProgress,
  Box,
  Tooltip,
  Badge,
  Zoom,
  Fade,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  SettingsVoice as SettingsVoiceIcon,
} from '@mui/icons-material';
import { useAssistantStore } from '../../store/assistantStore';
import { useAIProcessor } from '../../services/ai/aiHooks';

interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
  disabled?: boolean;
}

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  width: 56,
  height: 56,
  borderRadius: '50%',
  background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
  color: '#fff',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  '&:hover': {
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
    transform: 'translateY(-2px) scale(1.05)',
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
  },
  '&:active': {
    transform: 'translateY(0) scale(0.98)',
  },
  '&.listening': {
    background: `linear-gradient(45deg, ${theme.palette.error.dark}, ${theme.palette.error.main})`,
    animation: 'pulse 1.5s infinite',
  },
  '@keyframes pulse': {
    '0%': {
      boxShadow: `0 0 0 0 rgba(244, 67, 54, 0.4)`,
    },
    '70%': {
      boxShadow: `0 0 0 10px rgba(244, 67, 54, 0)`,
    },
    '100%': {
      boxShadow: `0 0 0 0 rgba(244, 67, 54, 0)`,
    },
  },
}));

const VoiceWaveContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  pointerEvents: 'none',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: -1,
}));

interface VoiceWaveProps {
  active: boolean;
}

const VoiceWave = styled('div')<VoiceWaveProps>(({ theme, active }) => ({
  position: 'absolute',
  borderRadius: '50%',
  backgroundColor: active ? 'rgba(244, 67, 54, 0.2)' : 'transparent',
  width: active ? '100%' : '0%',
  height: active ? '100%' : '0%',
  opacity: active ? 1 : 0,
  transition: 'all 0.3s ease',
  '&::before, &::after': {
    content: '""',
    position: 'absolute',
    borderRadius: '50%',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'rgba(244, 67, 54, 0.15)',
    animation: active ? 'ripple 2s infinite ease-out' : 'none',
  },
  '&::before': {
    animationDelay: '0s',
  },
  '&::after': {
    animationDelay: '0.5s',
  },
  '@keyframes ripple': {
    '0%': {
      width: '0%',
      height: '0%',
      opacity: 1,
    },
    '100%': {
      width: '200%',
      height: '200%',
      opacity: 0,
    },
  },
}));

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, disabled = false }) => {
  // Use global state for microphone status
  const { 
    isMicrophoneActive, 
    setIsMicrophoneActive,
    setInputText
  } = useAssistantStore();
  
  const { processInput } = useAIProcessor();
  
  const [isLoading, setIsLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [volume, setVolume] = useState(0);
  
  const recognitionRef = useRef<any>(null);
  const volumeIntervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  
  // Initialize speech recognition
  useEffect(() => {
    // Check if the browser supports the Web Speech API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setErrorMessage('Speech recognition is not supported in this browser.');
      return;
    }
    
    // Use the appropriate constructor
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    // Configure recognition
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';
    
    // Setup event handlers
    recognitionRef.current.onstart = () => {
      setIsMicrophoneActive(true);
      setIsLoading(false);
    };
    
    recognitionRef.current.onend = () => {
      setIsMicrophoneActive(false);
      setIsLoading(false);
      stopVolumeMonitoring();
    };
    
    recognitionRef.current.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      
      // Only send final results
      if (event.results[0].isFinal) {
        // Set the input text in the global store
        setInputText(transcript);
        
        // Process the transcript through the onTranscript callback
        onTranscript(transcript);
        
        // Stop listening
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (error) {
            // Ignore errors when stopping recognition that hasn't started
          }
        }
        
        // Clean up monitoring (but don't call stopListening to avoid recursion)
        if (volumeIntervalRef.current) {
          clearInterval(volumeIntervalRef.current);
          volumeIntervalRef.current = null;
        }
        
        if (microphoneStreamRef.current) {
          microphoneStreamRef.current.getTracks().forEach(track => track.stop());
          microphoneStreamRef.current = null;
        }
        
        setVolume(0);
      }
    };
    
    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsMicrophoneActive(false);
      setIsLoading(false);
      
      if (event.error === 'not-allowed') {
        setPermissionDenied(true);
        setErrorMessage('Microphone access was denied.');
      } else if (event.error === 'no-speech') {
        setErrorMessage('No speech was detected. Please try again.');
      } else {
        setErrorMessage(`Error: ${event.error}`);
      }
      
      stopVolumeMonitoring();
    };
    
    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        
        try {
          if (recognitionRef.current.state === 'running') {
            recognitionRef.current.stop();
          }
        } catch (error) {
          // Ignore errors
        }
      }
      
      // Clean up monitoring directly without calling stopListening
      if (volumeIntervalRef.current) {
        clearInterval(volumeIntervalRef.current);
        volumeIntervalRef.current = null;
      }
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
        } catch (error) {
          console.error('Error closing audio context:', error);
        }
      }
      
      if (microphoneStreamRef.current) {
        microphoneStreamRef.current.getTracks().forEach(track => track.stop());
        microphoneStreamRef.current = null;
      }
    };
  }, [onTranscript, setIsMicrophoneActive, setInputText]);
  
  const startListening = async () => {
    if (disabled || isMicrophoneActive) return;
    
    try {
      setIsLoading(true);
      setErrorMessage('');
      
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          microphoneStreamRef.current = stream;
          startVolumeMonitoring(stream);
          
          if (recognitionRef.current) {
            recognitionRef.current.start();
          }
          
          setPermissionDenied(false);
        })
        .catch(err => {
          console.error('Error accessing microphone:', err);
          setPermissionDenied(true);
          setErrorMessage('Unable to access microphone. Please check permissions.');
          setIsLoading(false);
        });
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsLoading(false);
      setErrorMessage('Error starting voice recognition.');
    }
  };
  
  const stopListening = () => {
    // Avoid infinite loops by checking if already stopped
    if (!isMicrophoneActive && !recognitionRef.current) return;
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        // Ignore errors when stopping recognition that hasn't started
      }
    }
    
    // Only call stopVolumeMonitoring if we need to
    if (volumeIntervalRef.current || microphoneStreamRef.current || audioContextRef.current) {
      stopVolumeMonitoring();
    }
    
    // Only update state if needed
    if (isMicrophoneActive) {
      setIsMicrophoneActive(false);
    }
  };
  
  const startVolumeMonitoring = (stream: MediaStream) => {
    try {
      // Initialize audio context and analyzer
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      // Configure analyzer
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;
      
      // Connect microphone to analyzer
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // Start monitoring volume
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      volumeIntervalRef.current = window.setInterval(() => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          
          // Calculate volume level (average of frequency data)
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          setVolume(average / 256); // Normalize to 0-1
        }
      }, 100);
    } catch (error) {
      console.error('Error setting up audio monitoring:', error);
    }
  };
  
  const stopVolumeMonitoring = () => {
    // Clear interval
    if (volumeIntervalRef.current) {
      clearInterval(volumeIntervalRef.current);
      volumeIntervalRef.current = null;
    }
    
    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (error) {
        console.error('Error closing audio context:', error);
      }
    }
    
    // Release microphone
    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach(track => track.stop());
      microphoneStreamRef.current = null;
    }
    
    setVolume(0);
  };
  
  const getVolumeColor = (vol: number) => {
    if (vol < 0.1) return 'rgba(244, 67, 54, 0.2)';
    if (vol < 0.3) return 'rgba(244, 67, 54, 0.4)';
    if (vol < 0.6) return 'rgba(244, 67, 54, 0.6)';
    if (vol < 0.8) return 'rgba(244, 67, 54, 0.8)';
    return 'rgba(244, 67, 54, 1)';
  };
  
  const handleToggle = () => {
    if (isMicrophoneActive) {
      stopListening();
    } else {
      startListening();
    }
  };
  
  const buttonSize = {
    width: 56,
    height: 56,
  };
  
  return (
    <Box 
      position="relative" 
      sx={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...buttonSize
      }}
    >
      <VoiceWaveContainer>
        <VoiceWave active={isMicrophoneActive} />
      </VoiceWaveContainer>
      
      <Zoom in={true}>
        <Tooltip 
          title={
            permissionDenied 
              ? "Microphone access denied" 
              : isMicrophoneActive 
                ? "Tap to stop listening" 
                : "Tap to start voice input"
          }
        >
          <Badge
            color="error"
            variant="dot"
            invisible={!errorMessage}
          >
            <StyledIconButton
              onClick={handleToggle}
              disabled={disabled || isLoading || permissionDenied}
              className={isMicrophoneActive ? 'listening' : ''}
              aria-label={isMicrophoneActive ? "Stop voice input" : "Start voice input"}
              sx={{
                position: 'relative',
                overflow: 'hidden',
                ...buttonSize,
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : isMicrophoneActive ? (
                <Box position="relative">
                  <MicIcon fontSize="medium" />
                  <Fade in={true}>
                    <Box
                      position="absolute"
                      top="50%"
                      left="50%"
                      sx={{
                        transform: 'translate(-50%, -50%)',
                        width: `${Math.max(10, volume * 200)}%`,
                        height: `${Math.max(10, volume * 200)}%`,
                        borderRadius: '50%',
                        backgroundColor: getVolumeColor(volume),
                        transition: 'all 0.1s ease',
                        opacity: 0.3,
                        zIndex: -1,
                      }}
                    />
                  </Fade>
                </Box>
              ) : permissionDenied ? (
                <MicOffIcon fontSize="medium" />
              ) : (
                <MicIcon fontSize="medium" />
              )}
            </StyledIconButton>
          </Badge>
        </Tooltip>
      </Zoom>
    </Box>
  );
};

export default VoiceInput;
