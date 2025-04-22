import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress
} from '@mui/material';
import GridWrapper from '../../utils/GridWrapper';
import { useAcademicStore } from '../../store/academicStore';

const OutlineGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const { isGeneratingOutline, generateOutline } = useAcademicStore();

  const handleGenerate = async () => {
    if (topic && description) {
      await generateOutline(topic, description);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Paper Outline Generator
        </Typography>
        <GridWrapper container spacing={2}>
          <GridWrapper xs={12}>
            <TextField
              fullWidth
              label="Research Topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter your research topic..."
              sx={{ mb: 2 }}
            />
          </GridWrapper>
          <GridWrapper xs={12}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your research paper..."
              sx={{ mb: 2 }}
            />
          </GridWrapper>
          <GridWrapper xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGenerate}
              disabled={isGeneratingOutline || !topic || !description}
              sx={{ height: '56px' }}
            >
              {isGeneratingOutline ? <CircularProgress size={24} /> : 'Generate Outline'}
            </Button>
          </GridWrapper>
        </GridWrapper>
      </Paper>
    </Box>
  );
};

export default OutlineGenerator; 