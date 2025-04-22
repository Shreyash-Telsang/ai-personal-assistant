import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { SmartToy as BotIcon } from '@mui/icons-material';
import { Message } from '../../store/assistantStore';
import ReactMarkdown from 'react-markdown';

interface AssistantMessageProps {
  message: Message;
}

const MessageBubble = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.8, 2.2),
  borderRadius: '18px 18px 18px 4px',
  background: theme.palette.mode === 'dark' 
    ? `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})` 
    : `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
  color: '#ffffff',
  maxWidth: '85%',
  wordBreak: 'break-word',
  position: 'relative',
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
  '& pre': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: theme.spacing(1.2),
    borderRadius: theme.spacing(1),
    overflowX: 'auto',
    color: '#ffffff',
    margin: theme.spacing(1.2, 0),
    backdropFilter: 'blur(4px)',
  },
  '& code': {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: '#ffffff',
    padding: theme.spacing(0.5),
    borderRadius: theme.spacing(0.5),
    fontSize: '0.9em',
  },
  '& ul, & ol': {
    marginLeft: theme.spacing(2),
    paddingLeft: theme.spacing(2),
  },
}));

const TimeStamp = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5),
  marginLeft: theme.spacing(1),
  fontStyle: 'italic',
  opacity: 0.8,
}));

const AvatarStyled = styled(Avatar)(({ theme }) => ({
  width: 38,
  height: 38,
  background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  border: '2px solid rgba(255, 255, 255, 0.2)',
  animation: 'pulse 2s infinite',
  '@keyframes pulse': {
    '0%': {
      boxShadow: '0 0 0 0 rgba(79, 70, 229, 0.4)',
    },
    '70%': {
      boxShadow: '0 0 0 10px rgba(79, 70, 229, 0)',
    },
    '100%': {
      boxShadow: '0 0 0 0 rgba(79, 70, 229, 0)',
    },
  },
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
      hour12: true,
    }).format(date);
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};

// Function to detect if the message contains task list data
const containsTaskList = (content: string): boolean => {
  return content.includes('Here are your tasks') && 
         (content.includes('✅') || content.includes('⬜')) &&
         (content.includes('🔴') || content.includes('🟠') || content.includes('🟢'));
};

const AssistantMessage: React.FC<AssistantMessageProps> = ({ message }) => {
  // Convert newlines to <br> for rendering
  const formattedContent = message.text
    .split('\n')
    .map((line: string, i: number) => (
      <React.Fragment key={i}>
        {line}
        {i < message.text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));

  const isTaskList = containsTaskList(message.text);

  return (
    <Box display="flex" alignItems="flex-start" gap={1.5} mb={2}>
      <AvatarStyled>
        <BotIcon fontSize="small" />
      </AvatarStyled>
      <Box>
        <MessageBubble elevation={2}>
          {isTaskList ? (
            <ReactMarkdown>
              {message.text}
            </ReactMarkdown>
          ) : (
            <Typography variant="body1" sx={{ lineHeight: 1.6, fontWeight: 400 }}>
              {formattedContent}
            </Typography>
          )}
        </MessageBubble>
        <TimeStamp>{formatTime(message.timestamp)}</TimeStamp>
      </Box>
    </Box>
  );
};

export default AssistantMessage; 