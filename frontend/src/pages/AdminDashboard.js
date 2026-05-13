import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
} from '@mui/material';
import { Add as AddIcon, People as PeopleIcon } from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import KanbanBoard from '../components/KanbanBoard';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [progressions, setProgressions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [progressionName, setProgressionName] = useState('');
  const [progressionDescription, setProgressionDescription] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [proRes, taskRes] = await Promise.all([
        api.get('/task-progressions'),
        api.get('/tasks'),
      ]);

      const progBody = proRes.data;
      const progList = Array.isArray(progBody) ? progBody : (progBody.progressions ?? progBody.data ?? []);
      setProgressions(progList || []);

      const taskBody = taskRes.data;
      const taskList = Array.isArray(taskBody) ? taskBody : (taskBody.tasks ?? taskBody.data ?? []);
      setTasks(taskList || []);

      setError('');
    } catch (err) {
      console.error('Failed to load data', err);
      setError('Failed to load tasks and progressions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProgression = async () => {
    if (!progressionName.trim()) {
      alert('Please enter a progression name');
      return;
    }
    try {
      await api.post('/task-progressions', {
        name: progressionName,
        description: progressionDescription,
      });
      setProgressionName('');
      setProgressionDescription('');
      setOpenDialog(false);
      await fetchData();
    } catch (err) {
      console.error('Failed to create progression', err);
      alert('Failed to create progression: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleMoveTask = async (taskId, info) => {
    try {
      const column = info.column;
      const cleanId = String(taskId).replace('task-', '');
      // All columns are progression step ids
      await api.patch(`/tasks/${taskId}/status`, { task_progression_step_id: column });
      await fetchData();
    } catch (err) {
      console.error('Failed to move task', err);
    }
  };

  
  const handleReorderColumns = async (sourceIndex, destIndex) => {
  try {
    // 1. Get the current flat list of columns (steps)
    const allCols = getColumns();
    
    // 2. Perform the reorder on the flat list
    const newOrder = [...allCols];
    const [movedCol] = newOrder.splice(sourceIndex, 1);
    newOrder.splice(destIndex, 0, movedCol);

    // 3. Update the local state optimistically
    // We need to rebuild the progressions state with updated sort_orders for steps
    const updatedProgressions = progressions.map(prog => {
      return {
        ...prog,
        steps: prog.steps.map(step => {
          // Find the new index of this step in the flat list
          const newIdx = newOrder.findIndex(c => c.id === step.id);
          return { ...step, sort_order: newIdx + 1 };
        }).sort((a, b) => a.sort_order - b.sort_order)
      };
    });

    setProgressions(updatedProgressions);

    // 4. Send the new step order to the backend
    // Note: Your backend needs a /steps/reorder or similar endpoint
    // If you only have /task-progressions/reorder, you'd send the prog order instead
    await api.post('/task-progression-steps/reorder', {
      steps: newOrder.map((col, index) => ({
        id: col.id,
        sort_order: index + 1
      }))
    });

  } catch (err) {
    console.error('Reorder failed:', err);
    fetchData(); // Rollback on error
  }
};

  const getColumns = () => {
    const allColumns = [];

    // Add custom progression columns sorted by progression sort_order (without mutating)
    [...progressions]
      .sort((a, b) => a.sort_order - b.sort_order)
      .forEach((prog) => {
        prog.steps
          .sort((a, b) => a.sort_order - b.sort_order)
          .forEach((step) => {
            allColumns.push({
              id: step.id,
              name: step.name,
              progressionName: prog.name,
              progressionId: prog.id,
              sortOrder: step.sort_order,
            });
          });
      });

    return allColumns;
  };

  const getTasksByColumn = () => {
    const cols = getColumns();
    const map = {};

    cols.forEach((c) => (map[c.id] = []));

    tasks.forEach((task) => {
      if (task.progression) {
        // Custom progression tasks
        const stepId = task.progression_step?.id;
        if (map[stepId]) map[stepId].push(task);
        else if (cols.length > 0) {
          // Find first step of this progression and add there
          const firstStep = task.progression.steps?.[0];
          if (firstStep && map[firstStep.id]) map[firstStep.id].push(task);
        }
      }
    });

    return map;
  };

  return (
    <Box sx={{ backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 64px)', py: 4 }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: '#0F172A' }}>
            Task Management
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Progression Tabs */}
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            p: 2,
            backgroundColor: '#fff',
            border: '1px solid #E2E8F0',
            borderRadius: 2,
            display: 'flex',
            gap: 1,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{
              borderColor: '#06B6D4',
              color: '#06B6D4',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            New Progression
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/create-task')}
            sx={{
              backgroundColor: '#06B6D4',
              '&:hover': { backgroundColor: '#0891B2' },
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Create Task
          </Button>
          <Button
          variant="outlined"
          startIcon={<PeopleIcon />}
          onClick={() => navigate('/admin/users')}
          sx={{
            borderColor: '#64748B',
            color: '#64748B',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover' : { borderColor: '#0F172A', color: '#0F172A' }
          }}>
            Manage Users
          </Button>
        </Paper>

        {/* Loading State */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            <KanbanBoard
              columns={getColumns()}
              tasksByColumn={getTasksByColumn()}
              currentUser={user}
              canDragTask={() => true}
              onMoveTask={handleMoveTask}
              onReorderColumns={handleReorderColumns}
            />
          </Box>
        )}

        {/* Create Progression Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
            Create New Progression Type
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <TextField
              autoFocus
              fullWidth
              label="Progression Name"
              placeholder="e.g., Bug Fix, QA Testing, Feature Development"
              value={progressionName}
              onChange={(e) => setProgressionName(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description (Optional)"
              placeholder="Describe this progression type..."
              value={progressionDescription}
              onChange={(e) => setProgressionDescription(e.target.value)}
              variant="outlined"
              multiline
              rows={3}
            />
            <Typography variant="caption" sx={{ color: '#94A3B8', mt: 2, display: 'block' }}>
              A new progression column will be added to your task board.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenDialog(false)} sx={{ color: '#64748B' }}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateProgression}
              variant="contained"
              sx={{ backgroundColor: '#06B6D4' }}
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
