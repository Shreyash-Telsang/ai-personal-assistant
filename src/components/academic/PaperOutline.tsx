import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Collapse,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  DragIndicator as DragIndicatorIcon,
} from '@mui/icons-material';

interface Section {
  id: string;
  title: string;
  content: string;
  subsections: Subsection[];
}

interface Subsection {
  id: string;
  title: string;
  content: string;
}

const PaperOutline: React.FC = () => {
  const theme = useTheme();
  const [sections, setSections] = useState<Section[]>([]);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState('');

  const handleAddSection = () => {
    if (!newSectionTitle.trim()) return;

    const newSection: Section = {
      id: Date.now().toString(),
      title: newSectionTitle,
      content: '',
      subsections: [],
    };

    setSections([...sections, newSection]);
    setNewSectionTitle('');
  };

  const handleDeleteSection = (sectionId: string) => {
    setSections(sections.filter(section => section.id !== sectionId));
  };

  const handleAddSubsection = (sectionId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          subsections: [
            ...section.subsections,
            {
              id: Date.now().toString(),
              title: 'New Subsection',
              content: '',
            },
          ],
        };
      }
      return section;
    }));
  };

  const toggleExpand = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 3,
        bgcolor: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(10px)',
      }}
    >
      <Typography variant="h6" gutterBottom>
        Paper Outline
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          label="New Section Title"
          value={newSectionTitle}
          onChange={(e) => setNewSectionTitle(e.target.value)}
          sx={{ mb: 1 }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddSection}
          disabled={!newSectionTitle.trim()}
        >
          Add Section
        </Button>
      </Box>

      <List>
        {sections.map((section) => (
          <React.Fragment key={section.id}>
            <ListItem
              secondaryAction={
                <Box>
                  <IconButton onClick={() => handleAddSubsection(section.id)}>
                    <AddIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteSection(section.id)}>
                    <DeleteIcon />
                  </IconButton>
                  <IconButton onClick={() => toggleExpand(section.id)}>
                    {expandedSection === section.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>
              }
            >
              <ListItemIcon>
                <DragIndicatorIcon />
              </ListItemIcon>
              <ListItemText primary={section.title} />
            </ListItem>

            <Collapse in={expandedSection === section.id}>
              <List component="div" disablePadding>
                {section.subsections.map((subsection) => (
                  <ListItem
                    key={subsection.id}
                    sx={{ pl: 4 }}
                    secondaryAction={
                      <IconButton>
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemIcon>
                      <DragIndicatorIcon />
                    </ListItemIcon>
                    <ListItemText primary={subsection.title} />
                  </ListItem>
                ))}
              </List>
            </Collapse>
            <Divider component="li" />
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default PaperOutline; 