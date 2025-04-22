import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  Chip,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Zoom,
  Fade,
  Divider,
  Alert,
  Snackbar,
  useTheme,
  alpha,
  ClickAwayListener,
  Popper,
  Grow,
  ListItemIcon,
  Avatar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  NoteAlt as NoteIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Label as LabelIcon,
  Archive as ArchiveIcon,
  Palette as PaletteIcon,
  PushPin as PushPinIcon,
  PushPinOutlined as PushPinOutlinedIcon,
  MoreVert as MoreVertIcon,
  Close as CloseIcon,
  FormatBold as FormatBoldIcon,
  FormatItalic as FormatItalicIcon,
  FormatListBulleted as FormatListBulletedIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useNoteStore, NOTE_COLORS, Note } from '../store/noteStore';
import GridWrapper from '../utils/GridWrapper';
import { format } from 'date-fns';

// Add styled components for consistent note cards
const StyledNoteCard = styled(Card)(({ theme }) => ({
  height: '280px',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  position: 'relative',
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  boxShadow: theme.palette.mode === 'dark'
    ? `0 5px 15px ${alpha('#000', 0.3)}`
    : `0 5px 15px ${alpha('#000', 0.1)}`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.palette.mode === 'dark'
      ? `0 8px 25px ${alpha('#000', 0.4)}`
      : `0 8px 25px ${alpha('#000', 0.15)}`,
  },
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(2),
  height: '200px',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
}));

const NoteTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(1),
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

const NotePreview = styled(Typography)(({ theme }) => ({
  color: alpha(theme.palette.text.primary, 0.7),
  marginBottom: theme.spacing(1),
  flexGrow: 1,
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 3,
  textOverflow: 'ellipsis',
  whiteSpace: 'pre-wrap',
}));

const NoteFooter = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 'auto',
  padding: theme.spacing(1, 0, 0),
  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

const NotesPage: React.FC = () => {
  const theme = useTheme();
  const {
    notes,
    tags,
    addNote,
    updateNote,
    deleteNote,
    pinNote,
    archiveNote,
    addTag,
    addTagToNote,
    removeTagFromNote,
  } = useNoteStore();
  
  // State for managing notes
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [pinnedNotes, setPinnedNotes] = useState<Note[]>([]);
  const [unpinnedNotes, setUnpinnedNotes] = useState<Note[]>([]);
  
  // State for the new note
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState<string[]>([]);
  const [noteColor, setNoteColor] = useState(NOTE_COLORS[0]);
  const [newTagInput, setNewTagInput] = useState('');
  
  // State for UI interactions
  const [tagMenuAnchor, setTagMenuAnchor] = useState<null | HTMLElement>(null);
  const [colorMenuAnchor, setColorMenuAnchor] = useState<null | HTMLElement>(null);
  const [noteMenuAnchor, setNoteMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  
  // Filter notes based on search term, tags, and archived status
  useEffect(() => {
    let result = notes;
    
    // Filter by archive status
    result = result.filter(note => note.isArchived === showArchived);
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        note => note.title.toLowerCase().includes(term) || 
                note.content.toLowerCase().includes(term) ||
                note.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    // Filter by tag
    if (selectedTag) {
      result = result.filter(note => note.tags.includes(selectedTag));
    }
    
    // Sort by pinned status and then by date
    result.sort((a, b) => {
      if (a.isPinned === b.isPinned) {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      return a.isPinned ? -1 : 1;
    });
    
    // Separate pinned and unpinned notes
    setPinnedNotes(result.filter(note => note.isPinned));
    setUnpinnedNotes(result.filter(note => !note.isPinned));
    setFilteredNotes(result);
  }, [notes, searchTerm, selectedTag, showArchived]);
  
  // Handlers for note operations
  const handleCreateNote = () => {
    console.log('Opening create note dialog');
    setIsCreateDialogOpen(true);
    setIsEditMode(false);
    setCurrentNote(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteTags([]);
    setNoteColor(NOTE_COLORS[0]);
  };
  
  const handleEditNote = (note: Note) => {
    setIsCreateDialogOpen(true);
    setIsEditMode(true);
    setCurrentNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteTags([...note.tags]);
    setNoteColor(note.color || NOTE_COLORS[0]);
  };
  
  const handleSaveNote = () => {
    if (!noteTitle.trim()) {
      setSnackbarMessage('Note title cannot be empty');
      setSnackbarOpen(true);
      return;
    }
    
    const noteData = {
      title: noteTitle,
      content: noteContent,
      tags: noteTags,
      color: noteColor,
    };
    
    try {
      if (isEditMode && currentNote) {
        updateNote(currentNote.id, noteData);
        setSnackbarMessage('Note updated successfully');
      } else {
        addNote(noteData);
        setSnackbarMessage('Note created successfully');
      }
      
      setSnackbarOpen(true);
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving note:', error);
      setSnackbarMessage('Failed to save note. Please try again.');
      setSnackbarOpen(true);
    }
  };
  
  const handleDeleteNote = (id: string) => {
    deleteNote(id);
    setNoteMenuAnchor(null);
    setSnackbarMessage('Note deleted');
    setSnackbarOpen(true);
  };
  
  const handleTogglePin = (id: string, isPinned: boolean) => {
    pinNote(id, !isPinned);
    setSnackbarMessage(isPinned ? 'Note unpinned' : 'Note pinned');
    setSnackbarOpen(true);
  };
  
  const handleArchiveNote = (id: string, isArchived: boolean) => {
    archiveNote(id, !isArchived);
    setNoteMenuAnchor(null);
    setSnackbarMessage(isArchived ? 'Note unarchived' : 'Note archived');
    setSnackbarOpen(true);
  };
  
  // Handlers for tags
  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    
    if (!noteTags.includes(newTagInput)) {
      setNoteTags([...noteTags, newTagInput]);
      addTag(newTagInput);
    }
    
    setNewTagInput('');
    setTagMenuAnchor(null);
  };
  
  const handleRemoveTag = (tag: string) => {
    setNoteTags(noteTags.filter(t => t !== tag));
  };
  
  const handleSelectTag = (tag: string) => {
    if (!noteTags.includes(tag)) {
      setNoteTags([...noteTags, tag]);
    }
    setTagMenuAnchor(null);
  };
  
  const handleFilterByTag = (tag: string | null) => {
    setSelectedTag(tag);
    setFilterMenuAnchor(null);
  };
  
  // Handlers for note dialog
  const handleCloseDialog = () => {
    console.log('Closing dialog');
    setIsCreateDialogOpen(false);
    setCurrentNote(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteTags([]);
    setNoteColor(NOTE_COLORS[0]);
  };
  
  // Handlers for menus
  const handleTagMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setTagMenuAnchor(event.currentTarget);
  };
  
  const handleColorMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setColorMenuAnchor(event.currentTarget);
  };
  
  const handleNoteMenuOpen = (event: React.MouseEvent<HTMLElement>, noteId: string) => {
    event.stopPropagation();
    setNoteMenuAnchor(event.currentTarget);
    setSelectedNoteId(noteId);
  };
  
  const handleFilterMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFilterMenuAnchor(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setTagMenuAnchor(null);
    setColorMenuAnchor(null);
    setNoteMenuAnchor(null);
    setFilterMenuAnchor(null);
  };
  
  // Helpers
  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM d, yyyy');
  };
  
  // Render note card
  const renderNoteCard = (note: Note) => (
    <GridWrapper key={note.id} item xs={12} sm={6} md={4} lg={3}>
      <StyledNoteCard
        elevation={0}
        sx={{
          bgcolor: alpha(note.color || theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.2 : 0.3),
          border: `1px solid ${alpha(note.color || theme.palette.divider, theme.palette.mode === 'dark' ? 0.3 : 0.2)}`,
        }}
      >
        {note.isPinned && (
          <IconButton
            size="small"
            onClick={() => handleTogglePin(note.id, note.isPinned)}
            sx={{
              position: 'absolute',
              top: 2,
              right: 2,
              color: theme.palette.warning.main,
              bgcolor: alpha(theme.palette.background.paper, 0.7),
              backdropFilter: 'blur(4px)',
              '&:hover': {
                bgcolor: alpha(theme.palette.background.paper, 0.9),
              },
              zIndex: 2,
              width: 30,
              height: 30,
            }}
          >
            <PushPinIcon fontSize="small" />
          </IconButton>
        )}
        
        <StyledCardContent
          onClick={() => handleEditNote(note)}
          sx={{ cursor: 'pointer' }}
        >
          <NoteTitle variant="subtitle1">
            {note.title}
          </NoteTitle>
          
          <NotePreview variant="body2">
            {note.content}
          </NotePreview>
          
          <NoteFooter>
            <Typography variant="caption" color="text.secondary">
              {formatDate(new Date(note.updatedAt))}
            </Typography>
            
            <Box>
              {note.tags.slice(0, 2).map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFilterByTag(tag);
                  }}
                  sx={{
                    ml: 0.5,
                    height: 20,
                    fontSize: '0.625rem',
                    fontWeight: 500,
                  }}
                />
              ))}
              {note.tags.length > 2 && (
                <Chip
                  label={`+${note.tags.length - 2}`}
                  size="small"
                  sx={{
                    ml: 0.5,
                    height: 20,
                    fontSize: '0.625rem',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}
                />
              )}
            </Box>
          </NoteFooter>
        </StyledCardContent>
        
        <CardActions
          disableSpacing
          sx={{
            p: 1,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            justifyContent: 'space-between',
            bgcolor: alpha(theme.palette.background.paper, 0.4),
            backdropFilter: 'blur(4px)',
          }}
        >
          <Box>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => handleEditNote(note)}
                sx={{ color: theme.palette.primary.main }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={note.isPinned ? "Unpin" : "Pin"}>
              <IconButton
                size="small"
                onClick={() => handleTogglePin(note.id, note.isPinned)}
                sx={{ color: note.isPinned ? theme.palette.warning.main : 'inherit' }}
              >
                {note.isPinned ? <PushPinIcon fontSize="small" /> : <PushPinOutlinedIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>
          
          <IconButton
            size="small"
            onClick={(e) => handleNoteMenuOpen(e, note.id)}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </CardActions>
      </StyledNoteCard>
    </GridWrapper>
  );
  
  return (
    <Box sx={{ 
      width: '100%',
      minHeight: '100vh',
      p: { xs: 2, sm: 3 },
      background: theme.palette.mode === 'dark' 
        ? `linear-gradient(145deg, ${alpha(theme.palette.background.default, 0.9)}, ${alpha('#000', 0.95)})`
        : `linear-gradient(145deg, ${alpha('#fff', 0.95)}, ${alpha('#f8fafc', 0.9)})`,
    }}>
      {/* Header Section */}
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
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: { xs: '100%', sm: 'auto' } }}>
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                color: theme.palette.secondary.main,
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 },
              }}
            >
              <NoteIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, fontWeight: 600 }}>
                {showArchived ? 'Archived Notes' : 'My Notes'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'} 
                {selectedTag ? ` tagged with "${selectedTag}"` : ''}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            gap: 1,
            ml: { xs: 0, sm: 'auto' },
            width: { xs: '100%', sm: 'auto' },
            flexWrap: 'wrap'
          }}>
            <TextField
              size="small"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                endAdornment: searchTerm && (
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                ),
                sx: { borderRadius: 2 }
              }}
              sx={{ 
                flexGrow: { xs: 1, sm: 0 },
                minWidth: { sm: 200 },
                bgcolor: alpha(theme.palette.background.paper, 0.5),
              }}
            />

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateNote}
              sx={{
                borderRadius: 2,
                px: 2,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              New Note
            </Button>

            <Button
              variant={showArchived ? "contained" : "outlined"}
              startIcon={<ArchiveIcon />}
              onClick={() => setShowArchived(!showArchived)}
              sx={{
                borderRadius: 2,
                px: 2,
                ...(showArchived && {
                  background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
                  boxShadow: `0 2px 8px ${alpha(theme.palette.secondary.main, 0.3)}`,
                })
              }}
            >
              {showArchived ? 'View Active' : 'View Archived'}
            </Button>

            <IconButton
              onClick={handleFilterMenuOpen}
              sx={{
                borderRadius: 2,
                bgcolor: filterMenuAnchor || selectedTag || showArchived
                  ? alpha(theme.palette.primary.main, 0.1)
                  : 'transparent',
              }}
            >
              <FilterListIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Active Filters */}
        {(selectedTag || showArchived) && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {selectedTag && (
              <Chip
                label={selectedTag}
                onDelete={() => handleFilterByTag(null)}
                color="primary"
                size="small"
              />
            )}
          </Box>
        )}
      </Paper>

      {/* Empty State */}
      {filteredNotes.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 3,
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <NoteIcon sx={{ fontSize: 48, color: alpha(theme.palette.text.secondary, 0.3), mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No notes found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {showArchived
              ? "You don't have any archived notes."
              : selectedTag
              ? `No notes tagged with "${selectedTag}".`
              : searchTerm
              ? `No notes match your search for "${searchTerm}".`
              : "Create your first note by clicking the 'New Note' button."}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateNote}
            sx={{ borderRadius: 2 }}
          >
            Create New Note
          </Button>
        </Paper>
      )}

      {/* Notes Grid */}
      {filteredNotes.length > 0 && (
        <Box sx={{ mt: 3 }}>
          {/* Pinned Notes */}
          {pinnedNotes.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PushPinIcon sx={{ mr: 1, color: theme.palette.warning.main }} />
                <Typography variant="h6" fontWeight={600}>
                  Pinned Notes
                </Typography>
              </Box>
              <Grid container spacing={2}>
                {pinnedNotes.map(note => (
                  <GridWrapper key={note.id} item xs={12} sm={6} md={4} lg={3}>
                    {renderNoteCard(note)}
                  </GridWrapper>
                ))}
              </Grid>
            </Box>
          )}

          {/* Other Notes */}
          {unpinnedNotes.length > 0 && (
            <Box>
              {pinnedNotes.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <NoteIcon sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight={600}>
                    Other Notes
                  </Typography>
                </Box>
              )}
              <Grid container spacing={2}>
                {unpinnedNotes.map(note => (
                  <GridWrapper key={note.id} item xs={12} sm={6} md={4} lg={3}>
                    {renderNoteCard(note)}
                  </GridWrapper>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      )}

      {/* Create/Edit Note Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: noteColor || '#ffffff', // Fallback to white if noteColor is undefined
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <Box sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'rgba(0,0,0,0.1)', p: 1, fontSize: '10px' }}>
            Dialog open: {isCreateDialogOpen.toString()}, Color: {noteColor}
          </Box>
        )}

        <DialogTitle sx={{ pb: 1 }}>
          <TextField
            fullWidth
            placeholder="Title"
            variant="standard"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            InputProps={{
              disableUnderline: true,
              style: { 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                color: theme.palette.mode === 'dark' && noteColor === '#ffffff' ? theme.palette.text.primary : undefined 
              }
            }}
            sx={{ 
              '& .MuiInputBase-input::placeholder': {
                color: theme.palette.mode === 'dark' ? alpha(theme.palette.text.primary, 0.6) : alpha(theme.palette.text.primary, 0.4)
              }
            }}
          />
        </DialogTitle>
        
        <DialogContent sx={{ pb: 0, flexGrow: 1 }}>
          <TextField
            fullWidth
            placeholder="Note content"
            variant="standard"
            multiline
            minRows={8}
            maxRows={15}
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            InputProps={{
              disableUnderline: true,
              style: { 
                minHeight: '200px',
                color: theme.palette.mode === 'dark' && noteColor === '#ffffff' ? theme.palette.text.primary : undefined 
              }
            }}
            sx={{ 
              mb: 2,
              '& .MuiInputBase-input::placeholder': {
                color: theme.palette.mode === 'dark' ? alpha(theme.palette.text.primary, 0.6) : alpha(theme.palette.text.primary, 0.4)
              }
            }}
          />
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {noteTags.map(tag => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                onDelete={() => handleRemoveTag(tag)}
              />
            ))}
            
            {noteTags.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No tags
              </Typography>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Add tag">
              <IconButton 
                onClick={handleTagMenuOpen}
                sx={{ 
                  bgcolor: alpha(theme.palette.background.paper, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.background.paper, 0.2) } 
                }}
              >
                <LabelIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Change color">
              <IconButton 
                onClick={handleColorMenuOpen}
                sx={{ 
                  bgcolor: alpha(theme.palette.background.paper, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.background.paper, 0.2) } 
                }}
              >
                <PaletteIcon />
              </IconButton>
            </Tooltip>
            
            {isEditMode && currentNote && (
              <>
                <Tooltip title={currentNote.isPinned ? "Unpin" : "Pin"}>
                  <IconButton 
                    onClick={() => handleTogglePin(currentNote.id, currentNote.isPinned)}
                    sx={{ 
                      bgcolor: alpha(theme.palette.background.paper, 0.1),
                      '&:hover': { bgcolor: alpha(theme.palette.background.paper, 0.2) } 
                    }}
                  >
                    {currentNote.isPinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}
                  </IconButton>
                </Tooltip>
                
                <Tooltip title={currentNote.isArchived ? "Unarchive" : "Archive"}>
                  <IconButton 
                    onClick={() => handleArchiveNote(currentNote.id, currentNote.isArchived)}
                    sx={{ 
                      bgcolor: alpha(theme.palette.background.paper, 0.1),
                      '&:hover': { bgcolor: alpha(theme.palette.background.paper, 0.2) } 
                    }}
                  >
                    <ArchiveIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Delete">
                  <IconButton 
                    onClick={() => handleDeleteNote(currentNote.id)} 
                    color="error"
                    sx={{ 
                      bgcolor: alpha(theme.palette.background.paper, 0.1),
                      '&:hover': { bgcolor: alpha(theme.palette.background.paper, 0.2) } 
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
          
          <Box>
            <Button
              onClick={handleCloseDialog}
              color="inherit"
              sx={{ 
                mr: 1,
                bgcolor: alpha(theme.palette.background.paper, 0.1),
                '&:hover': { bgcolor: alpha(theme.palette.background.paper, 0.2) } 
              }}
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleSaveNote}
              variant="contained"
              disabled={!noteTitle.trim()}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.8),
                '&:hover': { bgcolor: theme.palette.primary.main }
              }}
            >
              Save
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
      
      {/* Menus */}
      <Menu
        anchorEl={tagMenuAnchor}
        open={Boolean(tagMenuAnchor)}
        onClose={handleMenuClose}
      >
        <Box sx={{ px: 2, py: 1, width: 250 }}>
          <Typography variant="subtitle2" gutterBottom>
            Add tag
          </Typography>
          
          <Box sx={{ display: 'flex', mb: 2 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="New tag"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleAddTag();
              }}
            />
            <Button
              onClick={handleAddTag}
              disabled={!newTagInput.trim()}
              sx={{ ml: 1 }}
            >
              Add
            </Button>
          </Box>
          
          <Divider sx={{ mb: 1 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            Select existing tag
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {tags
              .filter(tag => !noteTags.includes(tag))
              .map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  onClick={() => handleSelectTag(tag)}
                  sx={{ margin: 0.5 }}
                />
              ))}
            
            {tags.filter(tag => !noteTags.includes(tag)).length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No more tags available
              </Typography>
            )}
          </Box>
        </Box>
      </Menu>
      
      <Menu
        anchorEl={colorMenuAnchor}
        open={Boolean(colorMenuAnchor)}
        onClose={handleMenuClose}
      >
        <Box sx={{ px: 2, py: 1, width: 200 }}>
          <Typography variant="subtitle2" gutterBottom>
            Note color
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
            {NOTE_COLORS.map((color) => (
              <Box
                key={color}
                onClick={() => {
                  setNoteColor(color);
                  setColorMenuAnchor(null);
                }}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: color,
                  cursor: 'pointer',
                  border: color === noteColor ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                  '&:hover': {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }
                }}
              />
            ))}
          </Box>
        </Box>
      </Menu>
      
      <Menu
        anchorEl={noteMenuAnchor}
        open={Boolean(noteMenuAnchor)}
        onClose={handleMenuClose}
      >
        {selectedNoteId && notes.find(note => note.id === selectedNoteId) && (
          <>
            <MenuItem onClick={() => {
              const note = notes.find(note => note.id === selectedNoteId);
              if (note) handleEditNote(note);
              setNoteMenuAnchor(null);
            }}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="inherit">Edit</Typography>
            </MenuItem>
            
            <MenuItem onClick={() => {
              const note = notes.find(note => note.id === selectedNoteId);
              if (note) handleTogglePin(note.id, note.isPinned);
              setNoteMenuAnchor(null);
            }}>
              <ListItemIcon>
                {notes.find(note => note.id === selectedNoteId)?.isPinned ? 
                  <PushPinIcon fontSize="small" /> : 
                  <PushPinOutlinedIcon fontSize="small" />
                }
              </ListItemIcon>
              <Typography variant="inherit">
                {notes.find(note => note.id === selectedNoteId)?.isPinned ? 'Unpin' : 'Pin'}
              </Typography>
            </MenuItem>
            
            <MenuItem onClick={() => {
              const note = notes.find(note => note.id === selectedNoteId);
              if (note) handleArchiveNote(note.id, note.isArchived);
            }}>
              <ListItemIcon>
                <ArchiveIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="inherit">
                {notes.find(note => note.id === selectedNoteId)?.isArchived ? 'Unarchive' : 'Archive'}
              </Typography>
            </MenuItem>
            
            <MenuItem onClick={() => {
              if (selectedNoteId) handleDeleteNote(selectedNoteId);
            }}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <Typography variant="inherit" color="error">Delete</Typography>
            </MenuItem>
          </>
        )}
      </Menu>
      
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem 
          onClick={() => handleFilterByTag(null)}
          selected={selectedTag === null}
        >
          <Typography variant="inherit">All Notes</Typography>
        </MenuItem>
        
        <Divider />
        
        {tags.length > 0 ? (
          tags.map((tag) => (
            <MenuItem 
              key={tag}
              onClick={() => handleFilterByTag(tag)}
              selected={selectedTag === tag}
            >
              <ListItemIcon>
                <LabelIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="inherit">{tag}</Typography>
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>
            <Typography variant="inherit" color="text.secondary">No tags available</Typography>
          </MenuItem>
        )}
      </Menu>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default NotesPage; 