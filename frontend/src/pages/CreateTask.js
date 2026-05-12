import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Card,
  Alert,
  Checkbox,
  FormControlLabel,
  FormGroup,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

export default function CreateTask() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/users');
      setEmployees(response.data.employees || []);
    } catch (err) {
      setError('Failed to load employees');
      console.error(err);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    if (selectedUsers.length === 0) {
      setError('Please select at least one employee');
      return;
    }

    setLoading(true);

    try {
      await api.post('/tasks', {
        title,
        description,
        user_ids: selectedUsers,
      });

      setSuccess('Task created successfully!');
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 64px)', py: 4 }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            onClick={() => navigate('/admin/dashboard')}
            startIcon={<BackIcon />}
            sx={{ color: '#64748B', '&:hover': { backgroundColor: '#F1F5F9' } }}
          >
            Back
          </Button>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#0F172A',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <AddIcon sx={{ color: '#06B6D4' }} />
              Create New Task
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', mt: 1 }}>
              Assign work to your employees
            </Typography>
          </Box>
        </Box>

        <Card
          sx={{
            border: '1px solid #E2E8F0',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                {success}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              {/* Title */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Task Title"
                  placeholder="e.g., Design Homepage Mockup"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
                  required
                />
              </Box>

              {/* Description */}
              <Box sx={{ mb: 4 }}>
                <TextField
                  fullWidth
                  label="Description"
                  placeholder="Describe the task in detail..."
                  multiline
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                />
              </Box>

              {/* Assign to Employees */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: '#0F172A',
                    mb: 2,
                  }}
                >
                  Assign to Employees
                </Typography>

                {loadingEmployees ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : employees.length === 0 ? (
                  <Typography variant="body2" sx={{ color: '#64748B' }}>
                    No employees available to assign
                  </Typography>
                ) : (
                  <Card
                    sx={{
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      p: 2,
                    }}
                  >
                    <FormGroup>
                      {employees.map((employee) => (
                        <FormControlLabel
                          key={employee.id}
                          control={
                            <Checkbox
                              checked={selectedUsers.includes(employee.id)}
                              onChange={() => handleUserSelect(employee.id)}
                              sx={{
                                color: '#CBD5E1',
                                '&.Mui-checked': {
                                  color: '#06B6D4',
                                },
                              }}
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500, color: '#0F172A' }}>
                                {employee.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                                {employee.email}
                              </Typography>
                            </Box>
                          }
                          sx={{
                            mb: 1.5,
                            backgroundColor: selectedUsers.includes(employee.id) ? '#CFFAFE' : 'transparent',
                            p: 1.5,
                            borderRadius: 1,
                            transition: 'all 0.2s ease',
                          }}
                        />
                      ))}
                    </FormGroup>
                  </Card>
                )}

                {selectedUsers.length > 0 && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      backgroundColor: '#F1F5F9',
                      borderRadius: 1,
                      borderLeft: '3px solid #06B6D4',
                    }}
                  >
                    <Typography variant="body2" sx={{ color: '#0F172A' }}>
                      <strong>{selectedUsers.length}</strong> team member
                      {selectedUsers.length !== 1 ? 's' : ''} selected
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/dashboard')}
                  disabled={loading}
                  sx={{
                    color: '#64748B',
                    borderColor: '#E2E8F0',
                    '&:hover': { borderColor: '#CBD5E1' },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={loading}
                  sx={{
                    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #020617 0%, #0F172A 100%)',
                    },
                  }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={18} sx={{ mr: 1 }} /> Creating...
                    </>
                  ) : (
                    'Create Task'
                  )}
                </Button>
              </Box>
            </form>
          </Box>
        </Card>
      </Container>
    </Box>
  );
}
