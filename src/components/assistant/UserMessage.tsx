import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { AccountCircle as UserIcon } from '@mui/icons-material';
import { Message } from '../../store/assistantStore';
import { useUserStore } from '../../store/userStore';

interface UserMessageProps {
  message: Message;
}

const MessageBubble = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.8, 2.2),
  maxWidth: '85%',
  borderRadius: '18px 18px 4px 18px',
  background: theme.palette.mode === 'dark' 
    ? `linear-gradient(135deg, ${theme.palette.secondary.dark}, ${theme.palette.secondary.main})` 
    : `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
  color: '#ffffff',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 12px rgba(0, 0, 0, 0.3)'
    : '0 4px 12px rgba(0, 0, 0, 0.1)',
  transform: 'translateY(0)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 6px 14px rgba(0, 0, 0, 0.4)'
      : '0 6px 14px rgba(0, 0, 0, 0.15)',
  },
  '& p': {
    margin: 0,
    lineHeight: 1.6,
    fontWeight: 400,
  },
}));

const TimeStamp = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5),
  marginRight: theme.spacing(1),
  fontStyle: 'italic',
  opacity: 0.8,
}));

const AvatarStyled = styled(Avatar)(({ theme }) => ({
  width: 38,
  height: 38,
  background: `linear-gradient(45deg, ${theme.palette.secondary.dark}, ${theme.palette.primary.dark})`,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  border: '2px solid rgba(255, 255, 255, 0.2)',
}));

const formatTime = (timestamp: Date): string => {
  try {
    // Ensure we have a valid date object
    const date = timestamp instanceof Date ? 
      timestamp : 
      new Date(timestamp);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return '';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};

const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
  const { currentUser } = useUserStore();
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2, width: '100%', justifyContent: 'flex-end' }}>
      <Box sx={{ textAlign: 'right' }}>
        <MessageBubble elevation={2}>
          <Typography variant="body1" component="p">
            {message.text}
          </Typography>
        </MessageBubble>
        <TimeStamp>
          {formatTime(message.timestamp)}
        </TimeStamp>
      </Box>
      <AvatarStyled src={currentUser?.photoURL}>
        <UserIcon />
      </AvatarStyled>
    </Box>
  );
};

export default UserMessage; 