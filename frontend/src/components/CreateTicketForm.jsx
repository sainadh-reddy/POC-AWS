import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Card, CardContent, Typography, TextField, MenuItem,
  Button, Box, Divider, Chip, CircularProgress, useTheme, IconButton, Tooltip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AddTaskIcon from '@mui/icons-material/AddTask';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import { ApiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';

const CATEGORIES = [
  { value: 'HARDWARE',  label: 'Hardware Issue' },
  { value: 'SOFTWARE',  label: 'Software & Apps' },
  { value: 'NETWORK',   label: 'Network & VPN' },
  { value: 'ACCESS',    label: 'Access & Permissions' },
  { value: 'OTHER',     label: 'Other Request' },
];

const PRIORITIES = [
  { value: 'LOW',    label: 'Low',    color: '#94a3b8' },
  { value: 'MEDIUM', label: 'Medium', color: '#2563eb' },
  { value: 'HIGH',   label: 'High',   color: '#d97706' },
  { value: 'URGENT', label: 'Urgent', color: '#dc2626' },
];

const formatBytes = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function CreateTicketForm({ onTicketCreated, onToast }) {
  const { user } = useAuth();
  const { currentTheme } = useAppTheme();
  const theme = useTheme();

  const [selectedFile, setSelectedFile] = useState(null);

  const inputSx = {
    mb: 2.5,
    '& .MuiOutlinedInput-root': {
      color: theme.palette.text.primary,
      bgcolor: currentTheme.inputBg,
      borderRadius: 2.5,
      '& fieldset': { borderColor: currentTheme.cardBorder },
      '&:hover fieldset': { borderColor: theme.palette.primary.main },
      '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main, borderWidth: '1.5px' },
    },
    '& .MuiInputLabel-root': { color: theme.palette.text.secondary },
    '& .MuiInputLabel-root.Mui-focused': { color: theme.palette.primary.main },
    '& .MuiFormHelperText-root': { color: '#dc2626' },
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      onToast('File must be smaller than 10 MB', 'error');
      return;
    }
    setSelectedFile(file);
  };

  const formik = useFormik({
    initialValues: { title: '', description: '', category: 'SOFTWARE', priority: 'MEDIUM' },
    validationSchema: Yup.object({
      title:       Yup.string().min(5, 'Minimum 5 characters').max(100).required('Title is required'),
      description: Yup.string().min(10, 'Minimum 10 characters').required('Description is required'),
      category:    Yup.string().required('Select a category'),
      priority:    Yup.string().required('Select a priority'),
    }),
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const payload = { ...values, status: 'OPEN', createdBy: user?.email || user?.name || 'User' };
        const res = await ApiService.createTicket(payload);

        if (res.success) {
          const ticketId = res.data?.id;

          // Upload attachment if user selected a file
          if (selectedFile && ticketId) {
            try {
              await ApiService.uploadAttachment(ticketId, selectedFile);
              onToast('Ticket and attachment created successfully!', 'success');
            } catch (err) {
              onToast('Ticket created! (Attachment upload failed)', 'warning');
            }
          } else {
            onToast('Ticket created successfully!', 'success');
          }

          resetForm();
          setSelectedFile(null);
          onTicketCreated();
        } else {
          onToast(res.message || 'Failed to create ticket', 'error');
        }
      } catch {
        onToast('Cannot connect to backend API. Is the server running?', 'error');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const selectedPriority = PRIORITIES.find(p => p.value === formik.values.priority);

  return (
    <Card
      sx={{
        background: currentTheme.cardBg,
        backdropFilter: 'blur(16px)',
        border: `1px solid ${currentTheme.cardBorder}`,
        borderRadius: 4,
        boxShadow: `0 20px 40px ${currentTheme.cardGlow}`,
        overflow: 'visible',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
          <Box
            sx={{
              background: currentTheme.accentGradient,
              p: 1,
              borderRadius: 2.5,
              display: 'flex',
              color: '#ffffff',
              boxShadow: `0 4px 15px ${currentTheme.cardGlow}`,
            }}
          >
            <AddTaskIcon sx={{ fontSize: '1.3rem' }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.text.primary, lineHeight: 1 }}>
              New IT Ticket
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
              Submit an IT support request
            </Typography>
          </Box>
          {selectedPriority && (
            <Chip
              label={selectedPriority.label}
              size="small"
              sx={{
                ml: 'auto',
                bgcolor: `${selectedPriority.color}18`,
                color: selectedPriority.color,
                border: `1px solid ${selectedPriority.color}40`,
                fontWeight: 700,
                fontSize: '0.7rem',
              }}
            />
          )}
        </Box>

        <Divider sx={{ mb: 3, borderColor: currentTheme.cardBorder }} />

        <form onSubmit={formik.handleSubmit}>
          {/* Title */}
          <TextField
            fullWidth
            id="title"
            name="title"
            label="Issue Title *"
            placeholder="e.g. VPN not connecting from home office"
            size="small"
            sx={inputSx}
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.title && Boolean(formik.errors.title)}
            helperText={formik.touched.title && formik.errors.title}
          />

          {/* Category */}
          <TextField
            fullWidth select id="category" name="category" label="Category *" size="small" sx={inputSx}
            value={formik.values.category} onChange={formik.handleChange}
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  sx: {
                    bgcolor: currentTheme.cardBg,
                    color: theme.palette.text.primary,
                    border: `1px solid ${currentTheme.cardBorder}`,
                  },
                },
              },
            }}
          >
            {CATEGORIES.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
          </TextField>

          {/* Priority */}
          <TextField
            fullWidth select id="priority" name="priority" label="Priority *" size="small" sx={inputSx}
            value={formik.values.priority} onChange={formik.handleChange}
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  sx: {
                    bgcolor: currentTheme.cardBg,
                    color: theme.palette.text.primary,
                    border: `1px solid ${currentTheme.cardBorder}`,
                  },
                },
              },
            }}
          >
            {PRIORITIES.map(p => (
              <MenuItem key={p.value} value={p.value}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.color }} />
                  {p.label}
                </Box>
              </MenuItem>
            ))}
          </TextField>

          {/* Description */}
          <TextField
            fullWidth multiline rows={4} id="description" name="description"
            label="Detailed Description *"
            placeholder="Describe the issue step-by-step..."
            sx={{ ...inputSx, mb: 2 }}
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
          />

          {/* Attachment Input Field */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700, mb: 1, display: 'block' }}>
              ATTACHMENT / SCREENSHOT (OPTIONAL)
            </Typography>

            {selectedFile ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.25,
                  px: 2,
                  bgcolor: currentTheme.chipBg,
                  border: `1px solid ${theme.palette.primary.main}50`,
                  borderRadius: 2.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                  <AttachFileIcon sx={{ color: theme.palette.primary.main, fontSize: '1.1rem' }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedFile.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, ml: 0.5 }}>
                    ({formatBytes(selectedFile.size)})
                  </Typography>
                </Box>
                <Tooltip title="Remove file">
                  <IconButton size="small" onClick={() => setSelectedFile(null)} sx={{ color: theme.palette.text.secondary, '&:hover': { color: '#dc2626' } }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            ) : (
              <Button
                component="label"
                fullWidth
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                sx={{
                  py: 1.2,
                  borderRadius: 2.5,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  borderStyle: 'dashed',
                  borderWidth: '1.5px',
                  borderColor: currentTheme.cardBorder,
                  color: theme.palette.text.secondary,
                  bgcolor: currentTheme.inputBg,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    bgcolor: currentTheme.chipBg,
                  },
                }}
              >
                Upload Screenshot or File (Max 10 MB)
                <input type="file" hidden onChange={handleFileChange} />
              </Button>
            )}
          </Box>

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={formik.isSubmitting}
            endIcon={formik.isSubmitting ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
            sx={{
              py: 1.3,
              borderRadius: 2.5,
              fontWeight: 800,
              fontSize: '0.95rem',
              background: currentTheme.accentGradient,
              boxShadow: `0 4px 20px ${currentTheme.cardGlow}`,
              color: '#ffffff',
              textTransform: 'none',
              '&:hover': {
                opacity: 0.92,
                boxShadow: `0 6px 25px ${currentTheme.cardGlow}`,
              },
              '&:disabled': { opacity: 0.6 },
            }}
          >
            {formik.isSubmitting ? 'Submitting Ticket...' : 'Submit IT Ticket'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
