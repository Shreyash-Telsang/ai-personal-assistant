import React, { useEffect } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AIAssistant: React.FC = () => {
  const navigate = useNavigate();

  // Automatically redirect to the main assistant page which now uses ChatBot
  useEffect(() => {
    navigate('/assistant');
  }, [navigate]);

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography variant="h5">
          Redirecting to the new ChatGPT Bot...
        </Typography>
      </Box>
    </Paper>
  );
};

export default AIAssistant;
