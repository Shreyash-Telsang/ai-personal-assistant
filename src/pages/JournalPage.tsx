import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Divider,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack,
  useTheme,
  alpha,
  Avatar,
  Tooltip,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Create as CreateIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  MoreVert as MoreVertIcon,
  FormatBold as FormatBoldIcon,
  FormatItalic as FormatItalicIcon,
  FormatListBulleted as FormatListBulletedIcon,
  FormatListNumbered as FormatListNumberedIcon,
  Add as AddIcon,
  Close as CloseIcon,
  EventNote as EventNoteIcon,
  Label as LabelIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import GridWrapper from '../utils/GridWrapper';
import { useTaskStore } from '../store/taskStore';
import { format } from 'date-fns';

// Define journal entry interface
interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: Date;
  mood?: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
  tags: string[];
  isBookmarked: boolean;
}

// Sample data
const SAMPLE_ENTRIES: JournalEntry[] = [
  {
    id: '1',
    title: 'Project Kickoff',
    content: 'Today we started the new project. The team seems enthusiastic and we have clear goals for the next sprint. I need to follow up on setting up the development environment by tomorrow.',
    date: new Date('2023-05-01'),
    mood: 'good',
    tags: ['work', 'project'],
    isBookmarked: true,
  },
  {
    id: '2',
    title: 'Weekly Reflection',
    content: 'This week was quite productive. I completed most of my tasks ahead of schedule. Areas to improve: spending too much time on email, need better focus sessions.',
    date: new Date('2023-04-28'),
    mood: 'great',
    tags: ['reflection', 'productivity'],
    isBookmarked: false,
  },
  {
    id: '3',
    title: 'Learning React Hooks',
    content: 'Spent 2 hours learning about useEffect and useContext hooks. Still need more practice but made good progress. Resources: React docs and Frontend Masters course.',
    date: new Date('2023-04-25'),
    mood: 'neutral',
    tags: ['learning', 'react'],
    isBookmarked: true,
  },
  {
    id: '4',
    title: 'Meeting Notes: Client Presentation',
    content: 'Client was satisfied with the demo. Questions raised about timeline for the next phase. Action items: update roadmap, send meeting minutes, schedule follow-up for next week.',
    date: new Date('2023-04-20'),
    mood: 'good',
    tags: ['meeting', 'client'],
    isBookmarked: false,
  },
  {
    id: '5',
    title: 'Debugging Session',
    content: 'Spent most of the day tracking down that memory leak. Finally found it was related to event listener cleanup. Need to be more careful with useEffect cleanup functions in the future.',
    date: new Date('2023-04-18'),
    mood: 'bad',
    tags: ['debugging', 'problem-solving'],
    isBookmarked: false,
  },
];

// All available tags
const ALL_TAGS = ['work', 'project', 'reflection', 'productivity', 'learning', 'react', 'meeting', 'client', 'debugging', 'problem-solving'];

// Define mood options with icons and colors
const MOOD_OPTIONS = [
  { value: 'great', label: 'Great', color: '#4caf50' },
  { value: 'good', label: 'Good', color: '#8bc34a' },
  { value: 'neutral', label: 'Neutral', color: '#ffc107' },
  { value: 'bad', label: 'Bad', color: '#ff9800' },
  { value: 'terrible', label: 'Terrible', color: '#f44336' },
];

const JournalPage: React.FC = () => {
  const theme = useTheme();
  const { tasks } = useTaskStore();
  
  // State
  const [entries, setEntries] = useState<JournalEntry[]>(SAMPLE_ENTRIES);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>(SAMPLE_ENTRIES);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [tagAnchorEl, setTagAnchorEl] = useState<null | HTMLElement>(null);
  
  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formMood, setFormMood] = useState<JournalEntry['mood'] | undefined>(undefined);
  const [formBookmarked, setFormBookmarked] = useState(false);
  const [newTag, setNewTag] = useState('');
  
  // Effects
  useEffect(() => {
    // Filter entries based on search term and tag filter
    let result = entries;
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(entry => 
        entry.title.toLowerCase().includes(search) || 
        entry.content.toLowerCase().includes(search) ||
        entry.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }
    
    if (filterTag) {
      result = result.filter(entry => 
        entry.tags.includes(filterTag)
      );
    }
    
    setFilteredEntries(result);
  }, [entries, searchTerm, filterTag]);
  
  // Handlers
  const handleOpenEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setFormTitle(entry.title);
    setFormContent(entry.content);
    setFormTags(entry.tags);
    setFormMood(entry.mood);
    setFormBookmarked(entry.isBookmarked);
    setIsEditing(false);
  };
  
  const handleCloseEntry = () => {
    setSelectedEntry(null);
    setIsEditing(false);
  };
  
  const handleEditEntry = () => {
    setIsEditing(true);
  };
  
  const handleCreateEntry = () => {
    setFormTitle('');
    setFormContent('');
    setFormTags([]);
    setFormMood(undefined);
    setFormBookmarked(false);
    setIsCreating(true);
  };
  
  const handleSaveEntry = () => {
    if (isCreating) {
      // Create new entry
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        title: formTitle,
        content: formContent,
        date: new Date(),
        mood: formMood,
        tags: formTags,
        isBookmarked: formBookmarked,
      };
      
      setEntries([newEntry, ...entries]);
      setIsCreating(false);
      setSnackbarMessage('Journal entry created successfully');
      setShowSnackbar(true);
      
    } else if (selectedEntry) {
      // Update existing entry
      const updatedEntries = entries.map(entry => 
        entry.id === selectedEntry.id
          ? {
              ...entry,
              title: formTitle,
              content: formContent,
              tags: formTags,
              mood: formMood,
              isBookmarked: formBookmarked,
            }
          : entry
      );
      
      setEntries(updatedEntries);
      setSelectedEntry({
        ...selectedEntry,
        title: formTitle,
        content: formContent,
        tags: formTags,
        mood: formMood,
        isBookmarked: formBookmarked,
      });
      setIsEditing(false);
      setSnackbarMessage('Journal entry updated successfully');
      setShowSnackbar(true);
    }
  };
  
  const handleCancelEdit = () => {
    if (isCreating) {
      setIsCreating(false);
    } else if (selectedEntry) {
      setFormTitle(selectedEntry.title);
      setFormContent(selectedEntry.content);
      setFormTags(selectedEntry.tags);
      setFormMood(selectedEntry.mood);
      setFormBookmarked(selectedEntry.isBookmarked);
      setIsEditing(false);
    }
  };
  
  const handleDeleteEntry = () => {
    if (selectedEntry) {
      setEntries(entries.filter(entry => entry.id !== selectedEntry.id));
      setSelectedEntry(null);
      setSnackbarMessage('Journal entry deleted');
      setShowSnackbar(true);
    }
  };
  
  const handleToggleBookmark = (entry: JournalEntry) => {
    const updatedEntries = entries.map(e => 
      e.id === entry.id ? { ...e, isBookmarked: !e.isBookmarked } : e
    );
    setEntries(updatedEntries);
    
    if (selectedEntry && selectedEntry.id === entry.id) {
      setSelectedEntry({ ...selectedEntry, isBookmarked: !selectedEntry.isBookmarked });
      setFormBookmarked(!selectedEntry.isBookmarked);
    }
  };
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleAddTag = () => {
    if (newTag && !formTags.includes(newTag)) {
      setFormTags([...formTags, newTag]);
      setNewTag('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setFormTags(formTags.filter(tag => tag !== tagToRemove));
  };
  
  const handleTagMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setTagAnchorEl(event.currentTarget);
  };
  
  const handleTagMenuClose = () => {
    setTagAnchorEl(null);
  };
  
  const handleSelectTag = (tag: string) => {
    if (!formTags.includes(tag)) {
      setFormTags([...formTags, tag]);
    }
    setTagAnchorEl(null);
  };
  
  const handleFilterByTag = (tag: string | null) => {
    setFilterTag(tag);
  };
  
  const formatEntryDate = (date: Date) => {
    return format(date, 'MMM d, yyyy');
  };
  
  // Get mood color
  const getMoodColor = (mood?: string) => {
    if (!mood) return theme.palette.grey[400];
    const option = MOOD_OPTIONS.find(option => option.value === mood);
    return option ? option.color : theme.palette.grey[400];
  };
  
  return (
    <Box>
      <Paper 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)}, ${alpha(theme.palette.primary.dark, 0.05)})`,
        }}
      >
        <Grid container alignItems="center" spacing={2}>
          <GridWrapper item>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 56,
                height: 56,
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
              }}
            >
              <EventNoteIcon fontSize="large" />
            </Avatar>
          </GridWrapper>
          <GridWrapper item xs>
            <Typography variant="h4" fontWeight="bold">Journal</Typography>
            <Typography variant="body1" color="text.secondary">
              Record your thoughts, ideas, and reflections
            </Typography>
          </GridWrapper>
          <GridWrapper item>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateEntry}
              sx={{ borderRadius: 8 }}
            >
              New Entry
            </Button>
          </GridWrapper>
        </Grid>
      </Paper>
      
      <Grid container spacing={3}>
        <GridWrapper item xs={12} md={4} lg={3}>
          <Card sx={{ borderRadius: 2, height: '100%' }}>
            <CardHeader
              title="Entries"
              action={
                <Box>
                  <IconButton onClick={handleMenuOpen}>
                    <FilterListIcon />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={() => handleFilterByTag(null)} selected={filterTag === null}>
                      All entries
                    </MenuItem>
                    <MenuItem onClick={() => setEntries(entries.sort((a, b) => b.date.getTime() - a.date.getTime()))}>
                      Sort by newest
                    </MenuItem>
                    <MenuItem onClick={() => setEntries(entries.sort((a, b) => a.date.getTime() - b.date.getTime()))}>
                      Sort by oldest
                    </MenuItem>
                    <MenuItem onClick={() => setFilteredEntries(entries.filter(entry => entry.isBookmarked))}>
                      Bookmarked only
                    </MenuItem>
                    <Divider />
                    {ALL_TAGS.slice(0, 6).map(tag => (
                      <MenuItem key={tag} onClick={() => handleFilterByTag(tag)} selected={filterTag === tag}>
                        <LabelIcon sx={{ mr: 1, fontSize: 18, color: alpha(theme.palette.primary.main, 0.7) }} />
                        {tag}
                      </MenuItem>
                    ))}
                  </Menu>
                </Box>
              }
            />
            <Divider />
            
            <Box sx={{ p: 2 }}>
              <TextField
                size="small"
                placeholder="Search entries..."
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                }}
                sx={{ mb: 2 }}
              />
              
              {filterTag && (
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" mr={1}>
                    Filtered by:
                  </Typography>
                  <Chip 
                    label={filterTag}
                    size="small"
                    onDelete={() => handleFilterByTag(null)}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              )}
            </Box>
            
            <Divider />
            
            <List sx={{ height: '60vh', overflow: 'auto', p: 0 }}>
              {filteredEntries.length > 0 ? (
                filteredEntries.map(entry => (
                  <ListItem
                    key={entry.id}
                    onClick={() => handleOpenEntry(entry)}
                    component="div"
                    sx={{ 
                      borderLeft: entry.mood 
                        ? `4px solid ${getMoodColor(entry.mood)}` 
                        : 'none',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      },
                      bgcolor: selectedEntry?.id === entry.id 
                        ? alpha(theme.palette.primary.main, 0.1)
                        : 'transparent',
                    }}
                  >
                    <ListItemText
                      primary={entry.title}
                      secondary={
                        <Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="caption" color="text.secondary">
                            {formatEntryDate(entry.date)}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {entry.content}
                          </Typography>
                          
                          {entry.tags.length > 0 && (
                            <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {entry.tags.slice(0, 2).map(tag => (
                                <Chip 
                                  key={tag} 
                                  label={tag} 
                                  size="small" 
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleFilterByTag(tag);
                                  }}
                                />
                              ))}
                              {entry.tags.length > 2 && (
                                <Chip 
                                  label={`+${entry.tags.length - 2}`} 
                                  size="small" 
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                          )}
                        </Box>
                      }
                      primaryTypographyProps={{
                        fontWeight: entry.isBookmarked ? 'bold' : 'normal',
                      }}
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleBookmark(entry);
                        }}
                      >
                        {entry.isBookmarked ? (
                          <BookmarkIcon color="primary" fontSize="small" />
                        ) : (
                          <BookmarkBorderIcon fontSize="small" />
                        )}
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    No entries found
                  </Typography>
                  <Button 
                    startIcon={<AddIcon />} 
                    onClick={handleCreateEntry}
                    sx={{ mt: 2 }}
                  >
                    Create New Entry
                  </Button>
                </Box>
              )}
            </List>
          </Card>
        </GridWrapper>
        
        <GridWrapper item xs={12} md={8} lg={9}>
          {(selectedEntry || isCreating) ? (
            <Card sx={{ borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardHeader
                title={
                  isEditing || isCreating
                    ? <TextField
                        fullWidth
                        placeholder="Entry Title"
                        variant="standard"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        InputProps={{
                          disableUnderline: false,
                          style: { fontSize: '1.25rem', fontWeight: 'bold' }
                        }}
                      />
                    : selectedEntry?.title
                }
                subheader={
                  isCreating
                    ? 'New Entry'
                    : formatEntryDate(selectedEntry?.date ?? new Date())
                }
                action={
                  <Box>
                    {(isEditing || isCreating) ? (
                      <>
                        <Button
                          color="inherit"
                          onClick={handleCancelEdit}
                          sx={{ mr: 1 }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          onClick={handleSaveEntry}
                          disabled={!formTitle.trim()}
                        >
                          Save
                        </Button>
                      </>
                    ) : (
                      <>
                        <IconButton onClick={handleEditEntry}>
                          <CreateIcon />
                        </IconButton>
                        {!isCreating && (
                          <IconButton onClick={handleDeleteEntry}>
                            <DeleteIcon />
                          </IconButton>
                        )}
                        <IconButton 
                          onClick={() => handleToggleBookmark(selectedEntry!)}
                        >
                          {selectedEntry?.isBookmarked ? (
                            <BookmarkIcon color="primary" />
                          ) : (
                            <BookmarkBorderIcon />
                          )}
                        </IconButton>
                      </>
                    )}
                  </Box>
                }
              />
              
              <Divider />
              
              {(isEditing || isCreating) && (
                <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    How are you feeling?
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {MOOD_OPTIONS.map(option => (
                      <Tooltip key={option.value} title={option.label}>
                        <Box
                          component="button"
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            backgroundColor: formMood === option.value
                              ? option.color
                              : alpha(option.color, 0.2),
                            border: formMood === option.value
                              ? `2px solid ${option.color}`
                              : `1px solid ${alpha(option.color, 0.3)}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              backgroundColor: alpha(option.color, 0.4),
                            },
                          }}
                          onClick={() => setFormMood(option.value as any)}
                          type="button"
                        />
                      </Tooltip>
                    ))}
                  </Stack>
                </Box>
              )}
              
              {(isEditing || isCreating) && (
                <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Tags
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                    {formTags.map(tag => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        onDelete={() => handleRemoveTag(tag)}
                      />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                      size="small"
                      placeholder="Add a tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddTag();
                        }
                      }}
                      sx={{ mr: 1 }}
                    />
                    <Button 
                      size="small" 
                      onClick={handleAddTag}
                      disabled={!newTag.trim() || formTags.includes(newTag)}
                    >
                      Add
                    </Button>
                    <IconButton onClick={handleTagMenuOpen}>
                      <LabelIcon />
                    </IconButton>
                    <Menu
                      anchorEl={tagAnchorEl}
                      open={Boolean(tagAnchorEl)}
                      onClose={handleTagMenuClose}
                    >
                      {ALL_TAGS.filter(tag => !formTags.includes(tag)).map(tag => (
                        <MenuItem
                          key={tag}
                          onClick={() => handleSelectTag(tag)}
                        >
                          {tag}
                        </MenuItem>
                      ))}
                    </Menu>
                  </Box>
                </Box>
              )}
              
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {isEditing || isCreating ? (
                  <>
                    <Box sx={{ mb: 2, borderBottom: `1px solid ${theme.palette.divider}`, pb: 1 }}>
                      <IconButton size="small" sx={{ mr: 1 }}>
                        <FormatBoldIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" sx={{ mr: 1 }}>
                        <FormatItalicIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" sx={{ mr: 1 }}>
                        <FormatListBulletedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small">
                        <FormatListNumberedIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <TextField
                      fullWidth
                      multiline
                      placeholder="Write your thoughts here..."
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      minRows={12}
                      maxRows={20}
                      variant="outlined"
                      sx={{ flexGrow: 1 }}
                    />
                  </>
                ) : (
                  <>
                    {selectedEntry?.mood && (
                      <Box sx={{ mb: 2 }}>
                        <Chip
                          label={MOOD_OPTIONS.find(o => o.value === selectedEntry.mood)?.label || selectedEntry.mood}
                          size="small"
                          sx={{ 
                            backgroundColor: alpha(getMoodColor(selectedEntry.mood), 0.2),
                            color: getMoodColor(selectedEntry.mood),
                            fontWeight: 'bold',
                          }}
                        />
                      </Box>
                    )}
                    
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.8,
                      }}
                    >
                      {selectedEntry?.content}
                    </Typography>
                    
                    {selectedEntry?.tags && selectedEntry.tags.length > 0 && (
                      <Box sx={{ mt: 4, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selectedEntry.tags.map(tag => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            onClick={() => handleFilterByTag(tag)}
                            sx={{ 
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              }
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: 4,
                bgcolor: alpha(theme.palette.background.paper, 0.5),
                borderRadius: 2,
              }}
            >
              <EventNoteIcon sx={{ fontSize: 80, color: alpha(theme.palette.text.secondary, 0.2), mb: 2 }} />
              <Typography variant="h6" color="text.secondary" align="center" gutterBottom>
                Select an entry to view or edit
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" mb={3}>
                Or create a new entry to start journaling
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateEntry}
              >
                Create New Entry
              </Button>
            </Box>
          )}
        </GridWrapper>
      </Grid>
      
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          onClose={() => setShowSnackbar(false)}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default JournalPage;