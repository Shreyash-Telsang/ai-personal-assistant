import React, { useState, useRef, useEffect, forwardRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Card,
  CardContent,
  useTheme,
  CircularProgress,
  InputAdornment,
  Alert,
  Snackbar,
  useMediaQuery,
  GlobalStyles,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Slide,
  ListItemButton,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { alpha, styled } from '@mui/material/styles';
import {
  Send as SendIcon,
  SmartToy as AssistantIcon,
  Person as PersonIcon,
  NoteAdd as NoteAddIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Notes as NotesIcon,
  ContentCopy as ContentCopyIcon,
  Delete as DeleteIcon,
  Error as ErrorIcon,
  MoreVert as MoreVertIcon,
  Google,
  Palette as PaletteIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useNoteStore, NOTE_COLORS } from '../../store/noteStore';
import { useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Markdown from 'react-markdown'

// Global styles for code blocks
const codeBlockStyles = (
  <GlobalStyles
    styles={(theme) => ({
      '.react-syntax-highlighter': {
        maxWidth: '100% !important',
        margin: '0.75rem 0 !important',
        borderRadius: '6px !important',
      },
      '.react-syntax-highlighter pre': {
        whiteSpace: 'pre-wrap !important',
        wordBreak: 'break-word !important',
        overflowX: 'auto !important'
      },
      '.react-syntax-highlighter code': {
        wordBreak: 'break-word !important',
        whiteSpace: 'pre-wrap !important',
        fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace !important',
      },
      [theme.breakpoints.down('sm')]: {
        '.react-syntax-highlighter': {
          fontSize: '0.75rem !important',
        }
      }
    })}
  />
);

// Improved styled components for better text visibility
const MessageList = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  height: '75vh',
  maxHeight: '75vh',
  width: '100%',
  overflowX: 'hidden',
  scrollBehavior: 'smooth',
  scrollbarWidth: 'thin',
  "&::-webkit-scrollbar": {
    width: '8px',
    height: '8px',
  },
  "&::-webkit-scrollbar-track": {
    background: 'transparent',
  },
  "&::-webkit-scrollbar-thumb": {
    background: alpha(theme.palette.primary.main, 0.2),
    borderRadius: '4px',
  },
  "&::-webkit-scrollbar-thumb:hover": {
    background: alpha(theme.palette.primary.main, 0.3),
  },
  // Enhanced responsiveness for all device sizes
  [theme.breakpoints.down('lg')]: {
    height: '70vh',
    maxHeight: '70vh',
  },
  [theme.breakpoints.down('md')]: {
    height: '65vh', 
    maxHeight: '65vh',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
    gap: theme.spacing(1.5),
    height: 'calc(100vh - 160px)',
    maxHeight: 'calc(100vh - 160px)',
  }
}));

// Create proper MessageCard with expandedMessage prop
interface MessageCardProps {
  sender: 'user' | 'assistant';
  expandedMessage: number | null;
}

const MessageCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'sender' && prop !== 'expandedMessage',
})<MessageCardProps>(({ theme, sender, expandedMessage }) => ({
  position: 'relative',
  width: 'auto',
  maxWidth: sender === 'user' ? '80%' : '95%', // Increased assistant card width for better text display
  minWidth: '0',
  alignSelf: sender === 'user' ? 'flex-end' : 'flex-start',
  borderRadius: theme.spacing(2),
  overflowWrap: 'break-word',
  wordWrap: 'break-word',
  wordBreak: 'break-word',
  hyphens: 'auto',
  overflow: 'auto',
  // Set dynamic max height based on expansion state
  maxHeight: '500px',
  // Add smooth scrolling behavior
  WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
  msOverflowStyle: '-ms-autohiding-scrollbar', // Better scrolling on Edge
  scrollbarWidth: 'thin', // Thinner scrollbars on Firefox
  // Customize scrollbars
  '&::-webkit-scrollbar': {
    width: '6px',
    height: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: sender === 'user' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)',
  },
  '&::-webkit-scrollbar-thumb': {
    background: sender === 'user' ? 'rgba(255,255,255,0.3)' : alpha(theme.palette.primary.main, 0.2),
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: sender === 'user' ? 'rgba(255,255,255,0.4)' : alpha(theme.palette.primary.main, 0.3),
  },
  transition: 'all 0.3s ease-in-out',
  '&.expanded': {
    maxWidth: '100%',
    maxHeight: '100%',
    width: '100%',
    zIndex: 5,
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 0,
    overflowY: 'auto',
    overflowX: 'auto',
  },
  [theme.breakpoints.down('sm')]: {
    maxWidth: sender === 'user' ? '85%' : '95%',
    borderRadius: theme.spacing(1.5),
  },
  ...(sender === 'user'
    ? {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
      }
    : {
        backgroundColor: alpha(theme.palette.background.paper, 0.9),
        boxShadow: theme.shadows[1],
      }),
}));

const InputContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  alignItems: 'center',
  gap: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 20,
    backgroundColor: alpha(theme.palette.background.paper, 0.9),
    [theme.breakpoints.down('sm')]: {
      borderRadius: 16,
    }
  },
  // Make input scrollable when text is too long
  '& .MuiInputBase-input': {
    overflow: 'auto',
    maxHeight: '120px', // Set a max height for the input field (adds scrollbar when exceeded)
    scrollbarWidth: 'thin',
    '&::-webkit-scrollbar': {
      width: '4px',
      height: '4px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      background: alpha(theme.palette.primary.main, 0.2),
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: alpha(theme.palette.primary.main, 0.3),
    },
  }
}));

// Suggestions for the empty state - updated for both procurement and coding
const suggestions = [
  { 
    title: "Write a sorting algorithm in Python", 
    description: "Get help with coding examples", 
    icon: "🐍"
  },
  { 
    title: "Explain React hooks", 
    description: "Learn programming concepts", 
    icon: "⚛️"
  },
  { 
    title: "Debug my JavaScript code", 
    description: "Fix code issues", 
    icon: "🔍"
  },
  { 
    title: "Optimize procurement process", 
    description: "Supply chain efficiency", 
    icon: "📊"
  },
];

// Training prompt that includes coding assistance
const trainingPrompt = [
  {
    "role": "user",
    "parts": [{
      "text": "You are a versatile AI assistant with expertise in both procurement/logistics and computer science/programming. Help users with detailed programming questions, debugging, algorithm explanations, and code generation in various languages including JavaScript, Python, Java, C++, etc. For coding questions, provide working code examples. Also help with procurement, purchasing, and logistics topics when asked. Respond directly to user questions without unnecessary introductions."
    }]
  },
  {
    "role": "model",
    "parts": [{
      "text": "I understand my role as a multifaceted assistant. I'll provide programming help with code examples as well as procurement expertise as needed, focusing directly on answering questions without unnecessary introductions."
    }]
  },
  {
    "role": "user",
    "parts": [{
      "text": "Special Dialogue 1 : if any prompt mentions 'Shashi Shahi' word :  'Ofcourse! Dr. Shashi Shahi is one of the prominent professors at UWindsor! He is an IIT-D alumni with year of invaluable experience and a fun way of engaging in lectures!' 'Likes: Analytics and Research and Case Studies ''Dislikes: Students near riverside.'"
    }]
  },
  {
    "role": "model",
    "parts": [{
      "text": "okay"
    }]
  },
  {
    "role": "user",
    "parts": [{
      "text": "Special Dialogue 2 : Any prompt that mentions CHATGPT class / classroom  A : ' The CHATGPT Batch of 2023 is by far the best the university has ever seen by all sets of standards. Students from different come together to form a truly diverse and culturally rich classroom experience. I believe that all students are highly capable and will achieve all great things in their professional career!' "
    }]
  },
  {
    "role": "model",
    "parts": [{
      "text": "okay"
    }]
  }
];

// Dialog transition
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Enhanced CodeBlock with better overflow handling
const CodeBlock = ({language, value}: {language: string, value: string}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Add line numbers
  const lines = value.split('\n');
  const lineNumbers = lines.map((_, i) => i + 1).join('\n');
  
  // State for copy button
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  return (
    <div style={{
      margin: '16px 0',
      backgroundColor: '#1e1e1e',
      borderRadius: '6px',
      overflow: 'hidden',
      border: '1px solid rgba(0, 0, 0, 0.2)',
      position: 'relative',
      maxWidth: '100%' // Ensure code block doesn't overflow container
    }}>
      <div style={{
        padding: '8px 16px',
        backgroundColor: '#2d2d2d',
        color: '#e6e6e6',
        fontSize: '12px',
        borderBottom: '1px solid #3f3f3f',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>{language}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px'}}>
          {/* Enhanced scroll indicator */}
          <span style={{ 
            fontSize: '10px', 
            color: 'rgba(255, 255, 255, 0.6)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '2px' 
          }}>
            <span style={{ fontSize: '16px' }}>↔️</span> 
            <span>Scroll</span>
          </span>
          <button
            onClick={handleCopy}
            style={{
              background: 'none',
              border: 'none',
              color: '#e6e6e6',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              fontSize: '12px',
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor: copied ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)'
            }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      <div style={{
        display: 'flex',
        overflow: 'auto',
        maxWidth: '100%',
        WebkitOverflowScrolling: 'touch',
        msOverflowStyle: '-ms-autohiding-scrollbar',
        scrollbarWidth: 'thin',
        touchAction: 'pan-x',
        scrollbarColor: 'rgba(255, 255, 255, 0.2) rgba(0, 0, 0, 0.2)',
        overscrollBehaviorX: 'contain',
        scrollSnapType: 'x proximity'
      }}>
        <div style={{
          padding: '16px 0',
          paddingRight: '8px',
          paddingLeft: '8px',
          textAlign: 'right',
          backgroundColor: '#252525',
          color: '#858585',
          userSelect: 'none',
          fontSize: isMobile ? '12px' : '14px',
          fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
          lineHeight: 1.5,
          borderRight: '1px solid #3f3f3f',
          width: '40px',
          minWidth: '40px',
          flexShrink: 0,
          position: 'sticky',
          left: 0,
          zIndex: 1
        }}>
          {lineNumbers}
        </div>
        <pre style={{
          margin: 0,
          padding: '16px',
          overflowX: 'auto',
          fontSize: isMobile ? '12px' : '14px',
          fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
          lineHeight: 1.5,
          color: '#e6e6e6',
          flex: 1,
          whiteSpace: 'pre',
          minWidth: 0,
          overscrollBehaviorX: 'contain',
          scrollSnapAlign: 'start'
        }}>
          <code>{value}</code>
        </pre>
      </div>
    </div>
  );
};

const ChatBot: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Try to get the API key from window.env, then environment variables, then fallback
  const API_KEY = (window as any).env?.REACT_APP_GEMINI_API || 
                  process.env.REACT_APP_GEMINI_API || 
                  "AIzaSyDDJ_0uHYgnMfIVEdnMtfiGC8rKYt1nLvQ";
  
  // Note store functionality
  const { addNote, tags } = useNoteStore();
  
  // Remember which model worked across sessions
  const [workingModel, setWorkingModel] = useState<string | null>(
    localStorage.getItem('gemini_working_model')
  );

  // State for expanded/focused message
  const [expandedMessage, setExpandedMessage] = useState<number | null>(null);
  
  // Note creation dialog state
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState<string[]>([]);
  const [noteColor, setNoteColor] = useState(NOTE_COLORS[0]);
  const [currentConversation, setCurrentConversation] = useState<string>('');
  
  // Added state for color menu
  const [colorMenuAnchorEl, setColorMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isColorMenuOpen = Boolean(colorMenuAnchorEl);
  
  // Added state for tags menu
  const [tagMenuAnchorEl, setTagMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isTagMenuOpen = Boolean(tagMenuAnchorEl);
  const [customTag, setCustomTag] = useState('');
  
  // Toggle expanded message state
  const handleMessageClick = (index: number) => {
    if (expandedMessage === index) {
      setExpandedMessage(null);  // collapse if already expanded
    } else {
      setExpandedMessage(index); // expand clicked message
    }
  };
  
  // Copy message content to clipboard
  const copyMessageToClipboard = (text: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent message from collapsing
    navigator.clipboard.writeText(text);
    setSnackbarMessage('Message copied to clipboard!');
    setSnackbarOpen(true);
  };
  
  // Create a note from a specific message
  const createNoteFromMessage = (message: any, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent message from collapsing
    
    // Generate title based on content
    const title = message.role === 'model' 
      ? extractNoteTopic(message.parts[0].text)
      : 'User Question';
    
    // Format content
    const content = message.role === 'user'
      ? `## Question:\n\n${message.parts[0].text}`
      : `## Answer:\n\n${message.parts[0].text}`;
    
    // Set note values
    setNoteTitle(title);
    setNoteContent(content);
    setNoteTags(['AI Conversation', message.role === 'user' ? 'Question' : 'Answer']);
    setNoteDialogOpen(true);
  };
  
  const handleTagMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setTagMenuAnchorEl(event.currentTarget);
  };
  
  const handleTagMenuClose = () => {
    setTagMenuAnchorEl(null);
  };
  
  const handleAddTag = () => {
    if (customTag.trim() && !noteTags.includes(customTag.trim())) {
      setNoteTags([...noteTags, customTag.trim()]);
      setCustomTag('');
    }
    // Don't close the menu
  };
  
  const handleSelectTag = (tag: string) => {
    if (!noteTags.includes(tag)) {
      setNoteTags([...noteTags, tag]);
    }
    handleTagMenuClose();
  };
  
  const handleColorMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setColorMenuAnchorEl(event.currentTarget);
  };
  
  const handleColorMenuClose = () => {
    setColorMenuAnchorEl(null);
  };
  
  // Add debug output for environment variables
  useEffect(() => {
    console.log("API Key source:", {
      fromWindowEnv: !!(window as any).env?.REACT_APP_GEMINI_API,
      fromProcessEnv: !!process.env.REACT_APP_GEMINI_API,
      apiKeyUsed: API_KEY,
      workingModel: workingModel
    });
  }, [API_KEY, workingModel]);

  // State
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Hide welcome message once we have actual conversation messages
    if (allMessages.length > 0 && showWelcomeMessage) {
      setShowWelcomeMessage(false);
    }
  }, [allMessages, showWelcomeMessage]);

  // Send message to Gemini API
  const sendMessage = async () => {
    if (message.trim() === '' || isProcessing) return;
    
    // Check if this is a note creation request
    const isNoteRequest = detectNoteCreationIntent(message);
    
    // Add the pending user message immediately for a better UX
    setAllMessages(prevMessages => [
      ...prevMessages,
      {
        "role": "user",
        "parts": [{
          "text": message
        }]
      }
    ]);
    
    // Clear the input field immediately
    const currentMessage = message;
    setMessage('');
    
    // If it's a note creation request, handle it separately
    if (isNoteRequest && allMessages.length > 0) {
      // Wait a moment to allow the UI to update with the new message
      setTimeout(() => {
        openNoteDialog();
      }, 300);
      return;
    }
    
    setIsProcessing(true);
    
    // List of models to try in order - prioritize the known working model if available
    const modelVariants = workingModel 
      ? [workingModel, "gemini-1.5-pro", "gemini-1.0-pro", "gemini-pro"] 
      : ["gemini-1.5-pro", "gemini-1.0-pro", "gemini-pro"];
    
    // Filter out duplicates without using Set iteration
    const uniqueModels = Array.from(new Set(modelVariants));

    let success = false;
    // Define error type to avoid TypeScript errors
    interface ErrorResponse {
      error?: {
        message?: string;
        [key: string]: any;
      };
      [key: string]: any;
    }
    
    let errorResponse: ErrorResponse | null = null;
    
    // Try each model variant until one works
    for (const modelName of uniqueModels) {
      if (success) break; // Skip if we already succeeded
      
      try {
        const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${API_KEY}`;
        console.log(`Trying model: ${modelName}`);
        
        let messagesToSend = [
          ...trainingPrompt,
          ...allMessages,
          {
            "role": "user",
            "parts": [{
              "text": currentMessage
            }]
          }
        ];

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "contents": messagesToSend
          })
        });

        const resjson = await res.json();
        console.log(`API Response for ${modelName}:`, resjson);
        
        // Check if we received a valid response
        if (resjson.candidates && resjson.candidates[0]?.content?.parts?.length > 0) {
          let responseMessage = resjson.candidates[0].content.parts[0].text;

          // Save the working model to localStorage
          if (modelName !== workingModel) {
            localStorage.setItem('gemini_working_model', modelName);
            setWorkingModel(modelName);
            console.log(`Saving working model: ${modelName}`);
          }

          setAllMessages(prevMessages => [
            ...prevMessages,
            {
              "role": "model",
              "parts": [{
                "text": responseMessage
              }]
            }
          ]);
          
          success = true;
          break; // Exit the loop on success
        } else {
          // Store error for later if we can't find a working model
          errorResponse = resjson as ErrorResponse;
        }
      } catch (error) {
        console.error(`Error with model ${modelName}:`, error);
        errorResponse = { 
          error: { 
            message: error instanceof Error ? error.message : String(error)
          } 
        };
      }
    }
    
    // If all models failed, show error
    if (!success && errorResponse) {
      console.error("All model variants failed. Last error:", errorResponse);
      
      // Display a user-friendly error message with more details
      if (errorResponse.error) {
        const errorMessage = errorResponse.error.message || "Unknown API error";
        setErrorMessage(`Error: ${errorMessage}`);
        console.error("API Error details:", errorResponse.error);
        
        // Provide more specific guidance
        let errorHelp = "Please check your API key and try again.";
        const errorMsg = errorResponse.error.message || "";
        
        if (errorMsg.includes("not found")) {
          errorHelp = "The Gemini models could not be found. You may need to enable the Gemini API in your Google Cloud Console.";
        } else if (errorMsg.includes("permission")) {
          errorHelp = "Your API key doesn't have permission to use the Gemini API. Make sure you've enabled the API in Google Cloud Console.";
        } else if (errorMsg.includes("quota")) {
          errorHelp = "You've reached your API usage quota. Consider upgrading your plan or waiting until the quota resets.";
        }
        
        // Add a system message indicating the error
        setAllMessages(prevMessages => [
          ...prevMessages,
          {
            "role": "model",
            "parts": [{
              "text": `I'm sorry, I encountered an error processing your request: ${errorMessage}. ${errorHelp}`
            }]
          }
        ]);
      } else {
        setErrorMessage("Failed to get response from the chatbot. Please try again later.");
        
        // Add a system message for the error
        setAllMessages(prevMessages => [
          ...prevMessages,
          {
            "role": "model",
            "parts": [{
              "text": "I'm sorry, I encountered an error processing your request. Please try again or check your API key configuration."
            }]
          }
        ]);
      }
    }
    
    setIsProcessing(false);
  };

  // Handle pressing Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle closing error message
  const handleCloseError = () => {
    setErrorMessage(null);
  };
  
  // Handle closing snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Calculate responsive dimensions
  const getMessageListHeight = () => {
    if (isMobile) return 'calc(100vh - 170px)';
    if (isTablet) return '60vh';
    return '70vh';
  };
  
  // Function to detect note creation intent in message
  const detectNoteCreationIntent = (text: string): boolean => {
    const noteCreationPhrases = [
      'create a note',
      'add a note',
      'save this as a note',
      'make a note',
      'save note',
      'store this in notes',
      'put this in my notes',
      'add to notes'
    ];
    
    text = text.toLowerCase();
    return noteCreationPhrases.some(phrase => text.includes(phrase.toLowerCase()));
  };
  
  // Function to extract topic from note creation request or generate a smart title
  const extractNoteTopic = (text: string): string => {
    // First check if there's an explicit note creation request with a topic
    const noteCreationPhrases = [
      'create a note about',
      'create a note regarding',
      'add a note about',
      'add a note regarding',
      'make a note about',
      'make a note regarding',
      'save note about',
      'save note regarding',
      'add to notes about',
      'add to notes regarding'
    ];
    
    const lowerText = text.toLowerCase();
    
    // Try to extract explicit topic from request
    for (const phrase of noteCreationPhrases) {
      if (lowerText.includes(phrase)) {
        const index = lowerText.indexOf(phrase) + phrase.length;
        let topic = text.slice(index).trim();
        
        // Remove trailing punctuation
        topic = topic.replace(/[.,!?;:]$/, '').trim();
        
        return topic.charAt(0).toUpperCase() + topic.slice(1);
      }
    }
    
    // If no explicit request, generate a smart title (like ChatGPT)
    
    // Try to extract the main topic from the first sentence
    let firstSentence = text.split(/[.!?]/)[0].trim();
    
    // If the sentence is too long, extract keywords
    if (firstSentence.length > 40) {
      // Look for question words
      const questionMatch = firstSentence.match(/^(how|what|why|when|where|who|which|can|should|could|would|is|are|do|does|did)\s+/i);
      
      if (questionMatch) {
        // It's a question, create a title that summarizes the question
        const questionWord = questionMatch[1];
        const questionTopic = firstSentence.substring(questionMatch[0].length);
        
        // Extract up to 5 important words after the question word
        const importantWords = questionTopic.split(/\s+/).filter(word => 
          word.length > 2 && 
          !['the', 'and', 'for', 'with', 'that', 'this', 'from', 'your'].includes(word.toLowerCase())
        ).slice(0, 5);
        
        if (importantWords.length > 0) {
          return `${questionWord.charAt(0).toUpperCase() + questionWord.slice(1)} ${importantWords.join(' ')}`;
        }
      }
      
      // Not a question or couldn't extract question keywords, try to get important nouns/phrases
      const words = firstSentence.split(/\s+/);
      const importantWords = words.filter(word => 
        word.length > 3 && 
        !['the', 'and', 'for', 'with', 'that', 'this', 'from', 'your', 'about', 'would', 'could', 'should'].includes(word.toLowerCase())
      ).slice(0, 5);
      
      if (importantWords.length > 0) {
        return importantWords.join(' ').charAt(0).toUpperCase() + importantWords.join(' ').slice(1);
      }
    } else if (firstSentence.length > 5) {
      // First sentence is a good length for a title
      return firstSentence.charAt(0).toUpperCase() + firstSentence.slice(1);
    }
    
    // Fallback: look for common programming topics
    const programmingTopics = [
      'JavaScript', 'Python', 'Java', 'C\\+\\+', 'React', 'Node', 'API', 'database', 'algorithm',
      'function', 'array', 'object', 'class', 'component', 'server', 'client', 'programming'
    ];
    
    for (const topic of programmingTopics) {
      const regex = new RegExp(`\\b${topic}\\b`, 'i');
      if (regex.test(text)) {
        return `${topic} Question`;
      }
    }
    
    // Final fallback
    return 'Conversation Note';
  };
  
  // Function to prepare conversation for note
  const prepareConversationNote = (messages: any[]): string => {
    let noteText = '';
    
    // Add a header to the note
    noteText += `# Conversation Summary\n\n`;
    
    // Add timestamp
    const now = new Date();
    noteText += `*Created on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}*\n\n`;
    
    // Add a horizontal rule
    noteText += `---\n\n`;
    
    // Format each message with proper markdown and spacing
    messages.forEach((msg, index) => {
      if (msg.role === 'user') {
        // Format user messages with bold and indentation
        noteText += `### 👤 User:\n\n`;
        noteText += `${msg.parts[0].text.trim()}\n\n`;
      } else if (msg.role === 'model') {
        // Format assistant messages with a different style
        noteText += `### 🤖 Assistant:\n\n`;
        
        // Preserve code blocks and formatting in the assistant's response
        const response = msg.parts[0].text.trim();
        noteText += `${response}\n\n`;
        
        // Add a separator between conversation turns except for the last message
        if (index < messages.length - 1) {
          noteText += `---\n\n`;
        }
      }
    });
    
    // Add a footer with a reference to the AI assistant
    noteText += `\n\n---\n\n*Note created from a conversation with AI Assistant*`;
    
    return noteText;
  };
  
  // Function to open the note creation dialog
  const openNoteDialog = () => {
    // Default note title based on the last message content
    const lastUserMessage = allMessages.filter(msg => msg.role === 'user').pop();
    const title = lastUserMessage ? extractNoteTopic(lastUserMessage.parts[0].text) : 'Conversation Note';
    
    // Prepare content from the conversation
    const content = prepareConversationNote(allMessages);
    
    // Set default tags
    const defaultTags = ['AI Conversation'];
    
    setNoteTitle(title);
    setNoteContent(content);
    setNoteTags(defaultTags);
    setCurrentConversation(content);
    setNoteDialogOpen(true);
  };
  
  // Function to save a note from the conversation
  const saveConversationAsNote = () => {
    if (!noteTitle.trim()) {
      setSnackbarMessage('Please provide a title for your note');
      setSnackbarOpen(true);
      return;
    }
    
    try {
      // Add the note to the note store
      const noteId = addNote({
        title: noteTitle,
        content: noteContent,
        tags: noteTags,
        color: noteColor
      });
      
      // Close the dialog
      setNoteDialogOpen(false);
      
      // Show success message
      setSnackbarMessage('Note created successfully!');
      setSnackbarOpen(true);
      
      // Reset state
      setNoteTitle('');
      setNoteContent('');
      setNoteTags([]);
      setNoteColor(NOTE_COLORS[0]);
      
      // Add response to the conversation that note was created
      setAllMessages(prevMessages => [
        ...prevMessages,
        {
          "role": "model",
          "parts": [{
            "text": `I've created a note titled "${noteTitle}" from our conversation. You can view it in the Notes page.`
          }]
        }
      ]);
    } catch (error) {
      console.error('Error creating note:', error);
      setSnackbarMessage('Failed to create note. Please try again.');
      setSnackbarOpen(true);
    }
  };
  
  // Function to go to Notes page
  const goToNotesPage = () => {
    navigate('/notes');
  };

  return (
    <Paper sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: { xs: 'calc(100vh - 100px)', sm: '85vh' },
      overflow: 'hidden',
      boxShadow: theme.shadows[3],
      borderRadius: { xs: 2, sm: 3 },
      [theme.breakpoints.down('sm')]: {
        boxShadow: theme.shadows[1],
      },
      // Improved responsive handling and visuals
      maxWidth: '100%',
      width: '100%',
      background: theme.palette.mode === 'dark' 
        ? `linear-gradient(145deg, ${alpha('#111', 0.9)}, ${alpha('#000', 0.95)})`
        : `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.default, 0.85)})`,
      backdropFilter: 'blur(10px)',
      border: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
    }}>
      {codeBlockStyles}
      {/* Header */}
      <Box sx={{ 
        p: { xs: 1.5, sm: 2 }, 
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 1, sm: 2 },
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(to right, ${alpha(theme.palette.primary.dark, 0.2)}, transparent)`
          : `linear-gradient(to right, ${alpha(theme.palette.primary.light, 0.1)}, transparent)`
      }}>
        <Avatar sx={{ 
          bgcolor: theme.palette.primary.main,
          width: { xs: 32, sm: 40 },
          height: { xs: 32, sm: 40 },
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <AssistantIcon sx={{ fontSize: { xs: 18, sm: 24 } }} />
        </Avatar>
        <Typography variant="h6" sx={{ 
          fontSize: { xs: '1rem', sm: '1.25rem' },
          fontWeight: 600,
          background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 1px 2px rgba(0,0,0,0.1)'
        }}>ChatGPT Bot</Typography>
      </Box>

      {/* Messages - with improved responsiveness */}
      <Box sx={{ 
        flexGrow: 1,
        overflowY: 'auto',
        padding: { xs: theme.spacing(1.5), sm: theme.spacing(2) },
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: theme.spacing(1.5), sm: theme.spacing(2) },
        height: getMessageListHeight(),
        maxHeight: getMessageListHeight(),
        width: '100%',
        overflowX: 'hidden',
        scrollBehavior: 'smooth',
        scrollbarWidth: 'thin',
        position: 'relative',
        "&::-webkit-scrollbar": {
          width: '8px',
          height: '8px',
        },
        "&::-webkit-scrollbar-track": {
          background: 'transparent',
        },
        "&::-webkit-scrollbar-thumb": {
          background: alpha(theme.palette.primary.main, 0.2),
          borderRadius: '4px',
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: alpha(theme.palette.primary.main, 0.3),
        },
        // Create a subtle pattern background
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: theme.palette.mode === 'dark'
            ? 'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.025) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.025) 2%, transparent 0%)'
            : 'radial-gradient(circle at 25px 25px, rgba(0, 0, 0, 0.015) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(0, 0, 0, 0.015) 2%, transparent 0%)',
          backgroundSize: '100px 100px',
          backgroundRepeat: 'repeat',
          backgroundPosition: '0 0, 50px 50px',
          pointerEvents: 'none',
          zIndex: -1,
        }
      }}>
        {allMessages.length > 0 ? (
          <>
            {showWelcomeMessage && (
              <MessageCard 
                sender="assistant"
                expandedMessage={null}
                sx={{
                  animation: 'fadeIn 0.5s ease-out',
                  '@keyframes fadeIn': {
                    '0%': {
                      opacity: 0,
                      transform: 'translateY(10px)'
                    },
                    '100%': {
                      opacity: 1,
                      transform: 'translateY(0)'
                    }
                  },
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: '-8px',
                    left: '24px',
                    width: '12px',
                    height: '12px',
                    backgroundColor: alpha(theme.palette.background.paper, 0.9),
                    transform: 'rotate(45deg)',
                    borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    zIndex: -1
                  }
                }}
              >
                <CardContent sx={{ 
                  p: { xs: 1.5, sm: 2 }, 
                  pb: { xs: '12px !important', sm: '16px !important' },
                  '&:last-child': { pb: { xs: 1.5, sm: 2 } },
                  maxWidth: '100%'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Avatar 
                      sx={{ 
                        width: { xs: 24, sm: 28 }, 
                        height: { xs: 24, sm: 28 },
                        bgcolor: theme.palette.primary.main,
                        flexShrink: 0
                      }}
                    >
                      <AssistantIcon fontSize="small" />
                    </Avatar>
                    <Typography variant="subtitle2" noWrap={false}>
                      ChatGPT Bot
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    color: 'text.primary',
                    '& p': { 
                      mt: 0.5, 
                      mb: 0.5,
                      overflowWrap: 'break-word',
                      wordBreak: 'break-word'
                    }
                  }}>
                    <Typography variant="body1">
                      Hello! I'm your AI assistant specializing in both computer science and procurement. I can help with programming questions, code examples, debugging, as well as procurement, purchasing, or logistics topics.
                    </Typography>
                  </Box>
                </CardContent>
              </MessageCard>
            )}
            {allMessages.map((msg, index) => (
              msg.role === 'user' || msg.role === 'model' ? (
                <MessageCard
                  key={index}
                  sender={msg.role === 'user' ? 'user' : 'assistant'}
                  expandedMessage={expandedMessage}
                  onClick={() => handleMessageClick(index)}
                  className={expandedMessage === index ? 'expanded' : ''}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <CardContent 
                    sx={{ 
                      padding: isMobile ? '12px' : '16px',
                      '&:last-child': { paddingBottom: isMobile ? '12px' : '16px' },
                      maxHeight: expandedMessage === index ? '100vh' : 'auto',
                      overflow: 'auto'
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: { xs: 0.75, sm: 1 }, 
                      mb: { xs: 0.75, sm: 1 },
                      borderBottom: expandedMessage === index ? `1px solid ${alpha(msg.role === 'user' ? '#fff' : theme.palette.divider, 0.1)}` : 'none',
                      pb: expandedMessage === index ? 1 : 0
                    }}>
                      <Avatar 
                        sx={{ 
                          width: { xs: 24, sm: 28 }, 
                          height: { xs: 24, sm: 28 },
                          bgcolor: msg.role === 'user' 
                            ? theme.palette.secondary.main 
                            : expandedMessage === index ? alpha(theme.palette.primary.main, 0.9) : theme.palette.primary.main,
                          flexShrink: 0,
                          boxShadow: expandedMessage === index ? '0 2px 6px rgba(0,0,0,0.15)' : 'none',
                          transition: 'all 0.3s'
                        }}
                      >
                        {msg.role === 'user' ? 
                          <PersonIcon sx={{ fontSize: { xs: 16, sm: 18 } }} /> : 
                          <AssistantIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
                        }
                      </Avatar>
                      <Typography 
                        variant="subtitle2" 
                        noWrap={false}
                        sx={{ 
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          fontWeight: expandedMessage === index ? 600 : 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        {msg.role === 'user' ? 'You' : 'ChatGPT Bot'}
                        {expandedMessage === index && (
                          <Tooltip title="Click to collapse">
                            <ExpandLessIcon 
                              fontSize="small" 
                              sx={{ 
                                fontSize: '1rem', 
                                opacity: 0.7,
                                color: msg.role === 'user' ? 'inherit' : 'primary.main'
                              }} 
                            />
                          </Tooltip>
                        )}
                        {expandedMessage !== index && (
                          <Tooltip title="Click to expand">
                            <ExpandMoreIcon 
                              fontSize="small" 
                              sx={{ 
                                fontSize: '1rem', 
                                opacity: 0.5,
                                color: msg.role === 'user' ? 'inherit' : 'primary.main'
                              }} 
                            />
                          </Tooltip>
                        )}
                      </Typography>
                    </Box>
                    {msg.role === 'user' ? (
                      <Box
                        sx={{ 
                          wordBreak: 'break-word',
                          whiteSpace: 'pre-wrap',
                          overflowWrap: 'break-word',
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          lineHeight: { xs: 1.4, sm: 1.5 },
                          maxWidth: '100%',
                          overflowX: 'auto',
                          padding: 0.5,
                          position: 'relative',
                          pt: expandedMessage === index ? 1.5 : 0.5,
                          pb: expandedMessage === index ? 2 : 0.5,
                          '&::-webkit-scrollbar': {
                            height: '4px',
                          },
                          '&::-webkit-scrollbar-track': {
                            background: 'rgba(255, 255, 255, 0.1)',
                          },
                          '&::-webkit-scrollbar-thumb': {
                            background: 'rgba(255, 255, 255, 0.3)',
                            borderRadius: '4px',
                          },
                        }}
                      >
                        <Typography 
                          variant="body1" 
                          color="inherit"
                          component="span"
                          sx={{
                            fontWeight: expandedMessage === index ? 500 : 400,
                            fontSize: expandedMessage === index 
                              ? { xs: '0.9rem', sm: '1.05rem' } 
                              : { xs: '0.875rem', sm: '1rem' },
                            transition: 'all 0.3s'
                          }}
                        >
                          {msg.parts[0].text}
                        </Typography>
                        
                        {/* Action buttons for expanded message */}
                        {expandedMessage === index && (
                          <Box 
                            sx={{ 
                              position: 'absolute', 
                              bottom: 0, 
                              right: 0,
                              p: 0.5,
                              display: 'flex',
                              gap: 0.5,
                              background: 'linear-gradient(to left, rgba(0, 0, 0, 0.05), transparent 70%)',
                              borderRadius: '8px 0 0 0',
                              backdropFilter: 'blur(2px)'
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Tooltip title="Copy to clipboard">
                              <IconButton 
                                size="small" 
                                sx={{ 
                                  color: 'primary.main', 
                                  opacity: 0.8,
                                  '&:hover': { opacity: 1, bgcolor: alpha(theme.palette.primary.main, 0.1) }
                                }}
                                onClick={(e) => copyMessageToClipboard(msg.parts[0].text, e)}
                              >
                                <ContentCopyIcon fontSize="small" sx={{ fontSize: '0.9rem' }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Save as note">
                              <IconButton 
                                size="small" 
                                sx={{ 
                                  color: 'primary.main', 
                                  opacity: 0.8,
                                  '&:hover': { opacity: 1, bgcolor: alpha(theme.palette.primary.main, 0.1) }
                                }}
                                onClick={(e) => createNoteFromMessage(msg, e)}
                              >
                                <NoteAddIcon fontSize="small" sx={{ fontSize: '0.9rem' }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <Box sx={{ 
                        color: 'text.primary',
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        width: '100%',
                        maxWidth: '100%',
                        overflowX: 'auto',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                        position: 'relative',
                        pt: expandedMessage === index ? 1.5 : 0,
                        pb: expandedMessage === index ? 2 : 0,
                        transition: 'all 0.3s',
                        '&::-webkit-scrollbar': {
                          width: '6px',
                          height: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                          background: 'rgba(0,0,0,0.05)',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: alpha(theme.palette.primary.main, 0.2),
                          borderRadius: '4px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                          background: alpha(theme.palette.primary.main, 0.3),
                        },
                        '& p': { 
                          mt: { xs: 0.5, sm: 0.5 }, 
                          mb: { xs: 0.5, sm: 0.5 },
                          overflowWrap: 'break-word',
                          wordBreak: 'break-word',
                          lineHeight: { xs: 1.4, sm: 1.5 },
                          maxWidth: '100%',
                          fontSize: expandedMessage === index 
                            ? { xs: '0.9rem', sm: '1.05rem' } 
                            : { xs: '0.875rem', sm: '1rem' },
                          transition: 'all 0.3s'
                        },
                        '& a': { 
                          color: 'primary.main',
                          textDecoration: 'underline',
                          fontSize: { xs: '0.875rem', sm: '1rem' }
                        },
                        '& ul, & ol': { 
                          pl: { xs: 1.5, sm: 2 },
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          '& li': {
                            mb: { xs: 0.5, sm: 0.75 }
                          }
                        },
                        '& h1, & h2, & h3, & h4, & h5, & h6': {
                          fontSize: { 
                            xs: 'calc(1rem + 0.2vw)', 
                            sm: 'calc(1.1rem + 0.3vw)', 
                            md: 'calc(1.2rem + 0.4vw)' 
                          },
                          fontWeight: 600,
                          lineHeight: 1.3,
                          mt: { xs: 1.5, sm: 2 },
                          mb: { xs: 0.75, sm: 1 }
                        },
                        '& h1': { fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } },
                        '& h2': { fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.75rem' } },
                        '& h3': { fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' } },
                        '& h4': { fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' } },
                        '& h5': { fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' } },
                        '& h6': { fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' } },
                        '& blockquote': {
                          borderLeft: '4px solid',
                          borderColor: expandedMessage === index 
                            ? 'primary.main' 
                            : 'divider',
                          pl: 2,
                          ml: 0,
                          py: 0.5,
                          fontSize: { xs: '0.85rem', sm: '0.95rem' },
                          fontStyle: 'italic',
                          color: 'text.secondary',
                          backgroundColor: expandedMessage === index 
                            ? alpha(theme.palette.primary.main, 0.05)
                            : 'transparent',
                          borderRadius: '0 4px 4px 0',
                          transition: 'all 0.3s'
                        },
                        '& table': {
                          width: '100%',
                          borderCollapse: 'collapse',
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          '& th, & td': {
                            border: '1px solid',
                            borderColor: 'divider',
                            p: { xs: 0.5, sm: 1 },
                            textAlign: 'left'
                          },
                          '& th': {
                            backgroundColor: expandedMessage === index 
                              ? alpha(theme.palette.primary.main, 0.05)
                              : 'rgba(0,0,0,0.03)',
                            fontWeight: 600
                          }
                        },
                        '& pre': {
                          backgroundColor: 'transparent',
                          padding: 0,
                          margin: { xs: '0.5rem 0', sm: '0.75rem 0' },
                          maxWidth: '100%',
                          overflowX: 'auto',
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        },
                        '& code': {
                          backgroundColor: expandedMessage === index 
                              ? alpha(theme.palette.primary.main, 0.08)
                              : 'rgba(0, 0, 0, 0.06)',
                          padding: { xs: '1px 3px', sm: '2px 4px' },
                          borderRadius: 1,
                          fontFamily: 'monospace',
                          fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                          transition: 'all 0.3s'
                        },
                        '& img': {
                          maxWidth: '100%',
                          height: 'auto',
                          display: 'block',
                          margin: '0 auto',
                          borderRadius: 1
                        },
                        '& hr': {
                          border: 'none',
                          height: '1px',
                          backgroundColor: 'divider',
                          my: { xs: 1.5, sm: 2 }
                        },
                        '& .react-syntax-highlighter': {
                          maxWidth: '100%',
                          overflowX: 'auto'
                        }
                      }}>
                        <ReactMarkdown
                          components={{
                            code({className, children, ...props}: any) {
                              const match = /language-(\w+)/.exec(className || '');
                              return match ? (
                                <CodeBlock language={match[1]} value={String(children).replace(/\n$/, '')} />
                              ) : (
                                <code className={className} {...props} style={{
                                  fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
                                  backgroundColor: expandedMessage === index 
                                    ? alpha(theme.palette.primary.main, 0.08)
                                    : 'rgba(0, 0, 0, 0.06)',
                                  padding: isMobile ? '1px 3px' : '2px 4px',
                                  borderRadius: '4px',
                                  fontSize: isMobile ? '0.8125rem' : '0.875rem',
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word',
                                  transition: 'all 0.3s'
                                }}>
                                  {children}
                                </code>
                              );
                            },
                            pre: ({node, ...props}: any) => (
                              <div style={{
                                position: 'relative',
                                maxWidth: '100%',
                                overflow: 'hidden'
                              }}>
                                <pre {...props} style={{
                                  backgroundColor: 'transparent',
                                  padding: 0,
                                  margin: '0.5rem 0',
                                  maxWidth: '100%'
                                }} />
                              </div>
                            )
                          }}
                        >
                          {msg.parts[0].text}
                        </ReactMarkdown>
                        
                        {/* Action buttons for expanded message */}
                        {expandedMessage === index && (
                          <Box 
                            sx={{ 
                              position: 'absolute', 
                              bottom: 0, 
                              right: 0,
                              p: 0.5,
                              display: 'flex',
                              gap: 0.5,
                              background: 'linear-gradient(to left, rgba(0, 0, 0, 0.05), transparent 70%)',
                              borderRadius: '8px 0 0 0',
                              backdropFilter: 'blur(2px)'
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Tooltip title="Copy to clipboard">
                              <IconButton 
                                size="small" 
                                sx={{ 
                                  color: 'primary.main', 
                                  opacity: 0.8,
                                  '&:hover': { opacity: 1, bgcolor: alpha(theme.palette.primary.main, 0.1) }
                                }}
                                onClick={(e) => copyMessageToClipboard(msg.parts[0].text, e)}
                              >
                                <ContentCopyIcon fontSize="small" sx={{ fontSize: '0.9rem' }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Save as note">
                              <IconButton 
                                size="small" 
                                sx={{ 
                                  color: 'primary.main', 
                                  opacity: 0.8,
                                  '&:hover': { opacity: 1, bgcolor: alpha(theme.palette.primary.main, 0.1) }
                                }}
                                onClick={(e) => createNoteFromMessage(msg, e)}
                              >
                                <NoteAddIcon fontSize="small" sx={{ fontSize: '0.9rem' }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </MessageCard>
              ) : null
            ))}
          </>
        ) : (
          // Empty state with suggestions
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            gap: { xs: 2, sm: 3 },
            pt: { xs: 2, sm: 4 },
            px: { xs: 1, sm: 2 }
          }}>
            <Avatar sx={{ 
              width: { xs: 56, sm: 70, md: 80 }, 
              height: { xs: 56, sm: 70, md: 80 }, 
              mb: { xs: 1, sm: 2 }, 
              bgcolor: 'primary.main',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': {
                  boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.4)'
                },
                '70%': {
                  boxShadow: '0 0 0 15px rgba(25, 118, 210, 0)'
                },
                '100%': {
                  boxShadow: '0 0 0 0 rgba(25, 118, 210, 0)'
                }
              }
            }}>
              <AssistantIcon sx={{ fontSize: { xs: 30, sm: 40, md: 48 } }} />
            </Avatar>
            <Typography 
              variant="h5" 
              color="textSecondary"
              align="center"
              sx={{ 
                fontSize: { xs: '1.125rem', sm: '1.5rem', md: '1.75rem' },
                fontWeight: 500,
                px: { xs: 2, sm: 0 },
                maxWidth: { xs: '100%', sm: '80%', md: '70%' },
                lineHeight: 1.4,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              How can I help with programming or procurement today?
            </Typography>
            
            <Typography 
              variant="body1"
              color="textSecondary"
              align="center"
              sx={{ 
                opacity: 0.7,
                maxWidth: '600px',
                mb: { xs: 2, sm: 3 }
              }}
            >
              Ask me about code, algorithms, programming languages, or procurement processes.
            </Typography>
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)' },
              gap: { xs: 1.5, sm: 2, md: 2.5 },
              width: '100%',
              maxWidth: '800px',
              px: { xs: 1, sm: 2 }
            }}>
              {suggestions.map((suggestion, index) => (
                <Card 
                  key={index} 
                  sx={{ 
                    cursor: 'pointer',
                    borderRadius: { xs: 2, sm: 2 },
                    '&:hover': { 
                      transform: 'translateY(-4px) scale(1.02)', 
                      transition: 'transform 0.3s',
                      boxShadow: 6
                    },
                    boxShadow: 2,
                    transition: 'all 0.3s ease',
                    animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '4px',
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      opacity: 0.7
                    }
                  }}
                  onClick={() => {
                    setMessage(suggestion.title);
                    setTimeout(() => sendMessage(), 100);
                  }}
                >
                  <CardContent sx={{ 
                    py: { xs: 1.5, sm: 2 },
                    px: { xs: 2, sm: 2 },
                    '&:last-child': { pb: { xs: 1.5, sm: 2 } },
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5
                  }}>
                    <Box sx={{
                      fontSize: { xs: '1.5rem', sm: '1.75rem' },
                      lineHeight: 1,
                      mt: 0.5
                    }}>
                      {suggestion.icon}
                    </Box>
                    <Box>
                      <Typography 
                        variant="h6"
                        sx={{ 
                          fontSize: { xs: '0.95rem', sm: '1.125rem', md: '1.25rem' },
                          fontWeight: 500,
                          mb: 0.5,
                          color: theme.palette.mode === 'dark' ? 'primary.light' : 'primary.main'
                        }}
                      >
                        {suggestion.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="textSecondary"
                        sx={{ 
                          fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.9rem' },
                          opacity: 0.8
                        }}
                      >
                        {suggestion.description}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <InputContainer>
        <StyledTextField
          fullWidth
          placeholder={isMobile ? "Type a message..." : "Message ChatGPT Bot..."}
          variant="outlined"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          multiline
          maxRows={4}
          minRows={1}
          InputProps={{
            sx: {
              fontSize: { xs: '0.875rem', sm: '1rem', md: '1.1rem' },
              py: { xs: 0.75, sm: 1 },
              '&::placeholder': {
                fontSize: { xs: '0.875rem', sm: '1rem', md: '1.1rem' },
                opacity: 0.7
              },
              transition: 'all 0.3s',
              boxShadow: message.trim() !== '' ? 
                (theme) => `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}` : 
                'none',
              '&:hover': {
                boxShadow: (theme) => `0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`
              },
              '&.Mui-focused': {
                boxShadow: (theme) => `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`
              }
            },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  color="primary" 
                  onClick={sendMessage}
                  disabled={isProcessing || message.trim() === ''}
                  size={isMobile ? "small" : "medium"}
                  sx={{ 
                    alignSelf: 'flex-end', 
                    mb: 0.5,
                    width: { xs: 32, sm: 40, md: 48 },
                    height: { xs: 32, sm: 40, md: 48 },
                    transition: 'all 0.3s',
                    background: message.trim() !== '' ? 
                      `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})` : 
                      'transparent',
                    color: message.trim() !== '' ? '#fff' : theme.palette.primary.main,
                    opacity: message.trim() === '' ? 0.7 : 1,
                    '&:hover': {
                      transform: message.trim() !== '' ? 'scale(1.05) rotate(5deg)' : 'scale(1.05)',
                      background: message.trim() !== '' ? 
                        `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})` : 
                        alpha(theme.palette.primary.main, 0.1)
                    },
                    '&:disabled': {
                      background: 'transparent',
                      color: theme.palette.action.disabled
                    }
                  }}
                >
                  {isProcessing ? (
                    <CircularProgress 
                      size={isMobile ? 20 : 24} 
                      thickness={5}
                      sx={{
                        color: message.trim() !== '' ? '#fff' : theme.palette.primary.main
                      }}
                    /> 
                  ) : (
                    <SendIcon 
                      fontSize={isMobile ? "small" : "medium"} 
                      sx={{
                        transform: message.trim() !== '' ? 'rotate(-15deg)' : 'none',
                        transition: 'transform 0.3s'
                      }}
                    />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </InputContainer>
      
      {/* Disclaimer */}
      <Box sx={{ 
        p: { xs: 0.75, sm: 1 }, 
        textAlign: 'center',
        display: { xs: 'block', sm: 'block' } // Show on all devices for better accessibility
      }}>
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ 
            fontSize: { xs: '0.65rem', sm: '0.75rem' },
            maxWidth: '100%',
            display: 'block'
          }}
        >
          ChatGPT Bot can make mistakes. Consider checking important information.
        </Typography>
      </Box>

      {/* Error Snackbar */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>

      {/* Note Creation Dialog */}
      <Dialog
        open={noteDialogOpen}
        onClose={() => setNoteDialogOpen(false)}
        maxWidth="md"
        fullWidth
        TransitionComponent={Transition}
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: noteColor || '#ffffff',
            minHeight: '70vh',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: (theme) => theme.shadows[10],
            position: 'relative',
            overflow: 'hidden',
            '&:after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.7),
              borderTopLeftRadius: 3,
              borderTopRightRadius: 3,
            }
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          pt: 2,
          borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}>
          <TextField
            fullWidth
            placeholder="Note Title"
            variant="standard"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            InputProps={{
              disableUnderline: true,
              style: { 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                padding: '0 8px'
              }
            }}
            sx={{ 
              mb: 0.5,
              '& .MuiInputBase-root': {
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.1)
                },
                '&.Mui-focused': {
                  backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.15)
                }
              }
            }}
          />
        </DialogTitle>
        
        <DialogContent sx={{ 
          pb: 0, 
          flexGrow: 1,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: (theme) => alpha(theme.palette.primary.main, 0.2),
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: (theme) => alpha(theme.palette.primary.main, 0.3),
          },
        }}>
          <Box sx={{ 
            mt: 1, 
            pb: 2,
            position: 'relative',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <TextField
              fullWidth
              placeholder="Note content"
              variant="standard"
              multiline
              minRows={12}
              maxRows={20}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              InputProps={{
                disableUnderline: true,
                style: { 
                  minHeight: '350px',
                  fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
                  fontSize: '0.95rem',
                  lineHeight: '1.5',
                }
              }}
              sx={{ 
                mb: 2,
                flexGrow: 1,
                '& .MuiInputBase-root': {
                  padding: '8px 12px',
                  backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.05),
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.1)
                  },
                  '&.Mui-focused': {
                    backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.15)
                  }
                },
                '& .MuiInputBase-inputMultiline': {
                  overflowY: 'auto',
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: (theme) => alpha(theme.palette.primary.main, 0.15),
                    borderRadius: '3px',
                  }
                }
              }}
            />
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
              {noteTags.map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  onDelete={() => setNoteTags(noteTags.filter(t => t !== tag))}
                  sx={{
                    fontWeight: 500,
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    '&:hover': {
                      backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.12),
                    }
                  }}
                />
              ))}
              {noteTags.length === 0 && (
                <Typography variant="body2" sx={{ 
                  color: 'text.secondary',
                  fontStyle: 'italic',
                  fontSize: '0.85rem'
                }}>
                  No tags added yet
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ 
          justifyContent: 'space-between', 
          px: 3, 
          py: 2,
          borderTop: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          bgcolor: (theme) => alpha(theme.palette.background.paper, 0.02)
        }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Add tag">
              <IconButton 
                onClick={handleTagMenuOpen}
                sx={{ 
                  bgcolor: (theme) => alpha(theme.palette.background.paper, 0.1),
                  '&:hover': { 
                    bgcolor: (theme) => alpha(theme.palette.background.paper, 0.2),
                    transform: 'scale(1.05)',
                    transition: 'all 0.2s'
                  },
                  transition: 'all 0.2s'
                }}
              >
                <NoteAddIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Change color">
              <IconButton 
                onClick={handleColorMenuOpen}
                sx={{ 
                  bgcolor: (theme) => alpha(theme.palette.background.paper, 0.1),
                  '&:hover': { 
                    bgcolor: (theme) => alpha(theme.palette.background.paper, 0.2),
                    transform: 'scale(1.05)',
                    transition: 'all 0.2s'
                  },
                  transition: 'all 0.2s',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '12px',
                    height: '2px',
                    backgroundColor: noteColor,
                    borderRadius: '1px'
                  }
                }}
              >
                <PaletteIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="View notes">
              <IconButton 
                onClick={goToNotesPage}
                sx={{ 
                  bgcolor: (theme) => alpha(theme.palette.background.paper, 0.1),
                  '&:hover': { 
                    bgcolor: (theme) => alpha(theme.palette.background.paper, 0.2),
                    transform: 'scale(1.05)',
                    transition: 'all 0.2s'
                  },
                  transition: 'all 0.2s'
                }}
              >
                <NotesIcon />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Box>
            <Button
              onClick={() => setNoteDialogOpen(false)}
              color="inherit"
              sx={{ 
                mr: 1.5,
                px: 2,
                bgcolor: (theme) => alpha(theme.palette.background.paper, 0.1),
                '&:hover': { 
                  bgcolor: (theme) => alpha(theme.palette.background.paper, 0.2),
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s'
                },
                transition: 'all 0.2s'
              }}
              startIcon={<CloseIcon />}
            >
              Cancel
            </Button>
            
            <Button
              onClick={saveConversationAsNote}
              variant="contained"
              disabled={!noteTitle.trim()}
              startIcon={<SaveIcon />}
              sx={{
                px: 2.5,
                py: 1,
                fontWeight: 600,
                boxShadow: (theme) => `0 4px 8px ${alpha(theme.palette.primary.main, 0.25)}`,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: (theme) => `0 6px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                  transition: 'all 0.2s'
                },
                transition: 'all 0.2s',
                '&:disabled': {
                  bgcolor: (theme) => alpha(theme.palette.action.disabled, 0.15),
                  color: 'text.disabled'
                }
              }}
            >
              Save Note
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Color selection menu */}
      <Menu
        anchorEl={colorMenuAnchorEl}
        open={isColorMenuOpen}
        onClose={handleColorMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: {
            boxShadow: (theme) => theme.shadows[3],
            borderRadius: 2,
            p: 0.5
          }
        }}
      >
        <Typography variant="subtitle2" sx={{ px: 1.5, pt: 1, pb: 0.5, fontWeight: 500 }}>
          Note Color
        </Typography>
        <Box sx={{ p: 1, display: 'flex', flexWrap: 'wrap', gap: 1, maxWidth: '220px', justifyContent: 'center' }}>
          {NOTE_COLORS.map((color) => (
            <Tooltip key={color} title={color === '#ffffff' ? 'Default' : ''}>
              <Box
                onClick={() => {
                  setNoteColor(color);
                  handleColorMenuClose();
                }}
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: color,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: noteColor === color ? 'primary.main' : 'divider',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'scale(1.12)',
                    boxShadow: 3
                  },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {noteColor === color && (
                  <CheckIcon 
                    fontSize="small" 
                    sx={{ 
                      color: color === '#ffffff' ? 'primary.main' : 'white',
                      fontSize: '1.1rem',
                      opacity: 0.9
                    }} 
                  />
                )}
              </Box>
            </Tooltip>
          ))}
        </Box>
      </Menu>
      
      {/* Tag selection menu */}
      <Menu
        anchorEl={tagMenuAnchorEl}
        open={isTagMenuOpen}
        onClose={handleTagMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: {
            boxShadow: (theme) => theme.shadows[3],
            borderRadius: 2,
            width: 280
          }
        }}
      >
        <Box sx={{ p: 1.5, pt: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
            Add Tag
          </Typography>
          <TextField
            size="small"
            fullWidth
            placeholder="Add custom tag"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            InputProps={{
              endAdornment: (
                <IconButton 
                  size="small" 
                  onClick={handleAddTag}
                  disabled={!customTag.trim()}
                  sx={{
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08)
                    }
                  }}
                >
                  <NoteAddIcon fontSize="small" />
                </IconButton>
              ),
              sx: {
                borderRadius: 1.5,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: (theme) => alpha(theme.palette.divider, 0.8)
                }
              }
            }}
            sx={{ mb: 1.5 }}
          />
          
          <Divider sx={{ mb: 1.5 }} />
          
          <Typography variant="caption" sx={{ mb: 0.5, display: 'block', color: 'text.secondary', fontWeight: 500 }}>
            Suggested Tags
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, maxHeight: '220px', overflowY: 'auto' }}>
            {tags && tags.length > 0 ? (
              tags.slice(0, 5).map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  onClick={() => handleSelectTag(tag)}
                  sx={{ 
                    justifyContent: 'flex-start', 
                    cursor: 'pointer',
                    borderRadius: 1.5,
                    fontWeight: 500,
                    py: 0.25,
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.05),
                    '&:hover': {
                      backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.12),
                    }
                  }}
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '0.85rem' }}>
                No common tags found
              </Typography>
            )}
            
            <Chip
              label="AI Conversation"
              size="small"
              onClick={() => handleSelectTag("AI Conversation")}
              sx={{ 
                justifyContent: 'flex-start', 
                cursor: 'pointer', 
                mt: 0.5,
                borderRadius: 1.5,
                fontWeight: 500,
                py: 0.25,
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.05),
                '&:hover': {
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.12),
                }
              }}
            />
            
            <Chip
              label="ChatGPT"
              size="small"
              onClick={() => handleSelectTag("ChatGPT")}
              sx={{ 
                justifyContent: 'flex-start', 
                cursor: 'pointer',
                borderRadius: 1.5,
                fontWeight: 500,
                py: 0.25,
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.05),
                '&:hover': {
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.12),
                }
              }}
            />
          </Box>
        </Box>
      </Menu>
    </Paper>
  );
};

export default ChatBot;
