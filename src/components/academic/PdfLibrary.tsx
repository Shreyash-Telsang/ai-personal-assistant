import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Chip,
  TextField,
  Alert,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Card,
  CardContent,
  Link
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Label as LabelIcon,
  Add as AddIcon,
  OpenInNew as OpenIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useAcademicStore } from '../../store/academicStore';
import { StoredPDF } from '../../services/pdfService';
import GridWrapper from '../../utils/GridWrapper';

const PdfLibrary: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    pdfs, 
    activePdfId, 
    isStoringPdf, 
    storePdf, 
    setActivePdf, 
    deletePdf 
  } = useAcademicStore();
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [addTagDialogOpen, setAddTagDialogOpen] = useState(false);
  const [selectedPdfId, setSelectedPdfId] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are supported');
      return;
    }
    
    setError(null);
    handleUploadFile(file);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleUploadFile = async (file: File) => {
    try {
      const pdf = await storePdf(file);
      setSuccess(`"${pdf.name}" uploaded successfully`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to upload PDF');
      console.error(err);
    }
  };
  
  const handleDeletePdf = async (id: string) => {
    try {
      await deletePdf(id);
      setSuccess('PDF deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to delete PDF');
      console.error(err);
    }
  };
  
  const handleAddTag = (pdfId: string) => {
    setSelectedPdfId(pdfId);
    setAddTagDialogOpen(true);
  };
  
  const handleTagSubmit = () => {
    // In a real implementation, this would call a service method
    // For now, we'll just close the dialog
    setAddTagDialogOpen(false);
    setNewTag('');
  };
  
  const filteredPdfs = pdfs.filter(pdf => 
    pdf.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const activePdf = pdfs.find(pdf => pdf.id === activePdfId);
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <GridWrapper container spacing={2}>
        <GridWrapper xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="h6" gutterBottom>
              PDF Library
            </Typography>
            
            {(error || success) && (
              <Alert 
                severity={error ? 'error' : 'success'} 
                sx={{ mb: 2 }}
                onClose={() => {
                  setError(null);
                  setSuccess(null);
                }}
              >
                {error || success}
              </Alert>
            )}
            
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search PDFs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                }}
                size="small"
              />
            </Box>
            
            <Button
              variant="contained"
              component="label"
              startIcon={isStoringPdf ? <CircularProgress size={20} color="inherit" /> : <UploadIcon />}
              disabled={isStoringPdf}
              sx={{ mb: 2 }}
            >
              {isStoringPdf ? 'Uploading...' : 'Upload PDF'}
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                hidden
                onChange={handleFileUpload}
              />
            </Button>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              {filteredPdfs.length === 0 ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  py: 4
                }}>
                  <PdfIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary" align="center">
                    {searchQuery 
                      ? 'No PDFs match your search' 
                      : 'No PDFs yet. Upload your first document!'}
                  </Typography>
                </Box>
              ) : (
                <List sx={{ width: '100%' }}>
                  {filteredPdfs.map((pdf) => (
                    <ListItem
                      key={pdf.id}
                      alignItems="flex-start"
                      sx={{
                        cursor: 'pointer',
                        bgcolor: activePdfId === pdf.id ? 'action.selected' : 'inherit',
                        borderRadius: 1,
                        mb: 1,
                        '&:hover': {
                          bgcolor: 'action.hover',
                        }
                      }}
                      onClick={() => setActivePdf(pdf.id)}
                      secondaryAction={
                        <Box>
                          <IconButton 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddTag(pdf.id);
                            }}
                            sx={{ mr: 1 }}
                          >
                            <LabelIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePdf(pdf.id);
                            }}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PdfIcon sx={{ mr: 1, color: 'error.main' }} />
                            <Typography variant="body1" noWrap sx={{ maxWidth: 180 }}>
                              {pdf.name}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Added: {new Date(pdf.createdAt).toLocaleDateString()}
                            </Typography>
                            
                            {pdf.tags && pdf.tags.length > 0 && (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                {pdf.tags.map((tag, index) => (
                                  <Chip
                                    key={index}
                                    label={tag}
                                    size="small"
                                    variant="outlined"
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                  />
                                ))}
                              </Box>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Paper>
        </GridWrapper>
        
        <GridWrapper xs={12} md={8}>
          <Paper 
            elevation={3} 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {!activePdf ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                p: 4,
                height: '100%'
              }}>
                <PdfIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" textAlign="center" gutterBottom>
                  PDF Viewer
                </Typography>
                <Typography color="text.secondary" textAlign="center">
                  Select a PDF from the library to view it here.
                </Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ 
                  p: 2, 
                  borderBottom: 1, 
                  borderColor: 'divider',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Typography variant="h6" noWrap sx={{ maxWidth: '70%' }}>
                    {activePdf.name}
                  </Typography>
                  
                  <Box>
                    <Tooltip title="Open in new tab">
                      <IconButton 
                        component={Link} 
                        href={activePdf.url} 
                        target="_blank" 
                        rel="noopener"
                      >
                        <OpenIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete PDF">
                      <IconButton 
                        color="error"
                        onClick={() => handleDeletePdf(activePdf.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                
                <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                  <iframe
                    src={activePdf.url}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      border: 'none' 
                    }}
                    title={activePdf.name}
                  />
                </Box>
              </>
            )}
          </Paper>
        </GridWrapper>
      </GridWrapper>
      
      {/* Add Tag Dialog */}
      <Dialog open={addTagDialogOpen} onClose={() => setAddTagDialogOpen(false)}>
        <DialogTitle>Add Tag</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tag"
            fullWidth
            variant="outlined"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddTagDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleTagSubmit} 
            variant="contained"
            disabled={!newTag.trim()}
          >
            Add Tag
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PdfLibrary; 