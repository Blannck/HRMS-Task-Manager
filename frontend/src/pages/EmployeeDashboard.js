import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import KanbanBoard from "../components/KanbanBoard";
import { beBY } from "@mui/material/locale";

export default function EmployeeDashboard() {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [progressions, setProgressions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [proRes, taskRes] = await Promise.all([
        api.get("/task-progressions"),
        api.get(`/my-tasks/${user?.id}`),
      ]);

      const progBody = proRes.data;
      const progList = Array.isArray(progBody)
        ? progBody
        : (progBody.progressions ?? progBody.data ?? []);
      setProgressions(progList || []);

      const taskBody = taskRes.data;
      const taskList = Array.isArray(taskBody)
        ? taskBody
        : (taskBody.tasks ?? taskBody.data ?? []);
      setTasks(taskList || []);

      setError("");
    } catch (err) {
      console.error("Failed to load data", err);
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id, fetchData]);

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

  const handleMoveTask = async (taskId, info) => {
    try {
      const column = info.column;
      // All columns are progression step ids
      await api.patch(`/tasks/${taskId}/status`, {
        task_progression_step_id: column,
      });
      await fetchData();
    } catch (err) {
      console.error("Failed to move task", err);
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

  return (
    <Box
      sx={{
        backgroundColor: "#F8FAFC",
        minHeight: "calc(100vh - 64px)",
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h3"
            sx={{ fontWeight: 800, mb: 1, color: "#0F172A" }}
          >
            My Tasks
          </Typography>
          <Typography variant="body1" sx={{ color: "#64748B" }}>
            Track and manage your assigned work
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            <KanbanBoard
              columns={getColumns()}
              tasksByColumn={getTasksByColumn()}
              currentUser={user}
              canDragTask={(task, currentUser) =>
                task.assigned_users?.some((u) => u.id === currentUser?.id)
              }
              onMoveTask={handleMoveTask}
              onReorderColumns={handleReorderColumns}
            />
          </Box>
        )}
      </Container>
    </Box>
  );
}
