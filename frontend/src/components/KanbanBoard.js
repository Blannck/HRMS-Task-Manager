import React from "react";
import { Box, Paper, Typography, Chip, Avatar } from "@mui/material";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function KanbanBoard({
  columns,
  tasksByColumn,
  onMoveTask,
  currentUser,
  canDragTask,
  onReorderColumns,
}) {
  const handleDragEnd = (result) => {
    const { source, destination, draggableId, type } = result;
    if (!destination) return;

    // Handle column reordering
    if (type === "COLUMN") {
      if (source.index !== destination.index) {
        onReorderColumns?.(source.index, destination.index);
      }
      return;
    }

    // Handle task dragging
    const sourceKey = source.droppableId;
    const destKey = destination.droppableId;

    if (sourceKey === destKey && source.index === destination.index) {
      // Same position, no change
      return;
    }

    if (sourceKey === destKey) {
      // Reorder within same column
      onMoveTask(draggableId, {
        column: sourceKey,
        reorder: { from: source.index, to: destination.index },
      });
      return;
    }

    if (sourceKey !== destKey) {
      // Extract only the numeric/actual ID from the string "task-123"
      const actualTaskId = draggableId.replace("task-", "");
      onMoveTask(actualTaskId, { column: destKey });
      return;
    }

    // Moved across columns
    onMoveTask(draggableId, { column: destKey });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="all-columns" direction="horizontal" type="COLUMN">
        {(provided, snapshot) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{ display: "flex", gap: 2, alignItems: "flex-start", pb: 2 }}
          >
            {columns.map((col, colIndex) => {
              const colKey = col.id ?? col.key;
              const tasks = tasksByColumn[colKey] || [];

              return (
                <Draggable
                  key={`col-${colKey}`}
                  draggableId={`col-${colKey}`}
                  index={colIndex}
                  type="COLUMN"
                >
                  {(dragProv, dragSnap) => (
                    <div
                      ref={dragProv.innerRef}
                      {...dragProv.draggableProps}
                      {...dragProv.dragHandleProps}
                      style={{
                        ...dragProv.draggableProps.style,
                        opacity: dragSnap.isDragging ? 0.6 : 1,
                      }}
                    >
                      <Droppable droppableId={String(colKey)} type="TASK">
                        {(dropProv, dropSnap) => (
                          <Paper ref={dropProv.innerRef} {...dropProv.droppableProps}
                            sx={{
                              width: 320,
                              minHeight: 300,
                              maxHeight: "70vh",
                              overflowY: "auto",
                              p: 2, 
                              backgroundColor: dropSnap.isDraggingOver
                                ? "rgba(6, 182, 212, 0.08)"
                                : "#FFFFFF",
                              border: dropSnap.isDraggingOver
                                ? "2px solid #06B6D4"
                                : "1px solid #E2E8F0",
                              borderRadius: "8px",
                              transition: "all 0.2s ease",
                              cursor: "grab",
                            }}
                            {...dragProv.dragHandleProps}
                          >
                            <Box
                            ref={dropProv.innerRef}
                            {...dropProv.droppableProps}
                            elevation={dropSnap.isDraggingOver ? 4 : 1}
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 2,
                              }}
                            >
                              <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 700, color: "#0F172A" }}
                              >
                                {col.name}
                              </Typography>
                              <Chip
                                label={tasks.length}
                                size="small"
                                sx={{
                                  backgroundColor: "#E2E8F0",
                                  color: "#64748B",
                                }}
                              />
                            </Box>

                            {tasks.map((task, index) => {
                              const draggable = canDragTask
                                ? canDragTask(task, currentUser)
                                : false;

                              return (
                                <Draggable
                                  key={`task-${task.id}`}
                                  draggableId={`task-${task.id}`}
                                  index={index}
                                  isDragDisabled={!draggable}
                                >
                                  {(prov, snap) => (
                                    <Paper
                                      ref={prov.innerRef}
                                      {...prov.draggableProps}
                                      {...prov.dragHandleProps}
                                      elevation={snap.isDragging ? 8 : 1}
                                      sx={{
                                        p: 2,
                                        mb: 2,
                                        cursor: draggable ? "grab" : "default",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2,
                                        backgroundColor: "#FFFFFF",
                                        border: "1px solid #E2E8F0",
                                        transition: "all 0.2s ease",
                                        "&:hover": {
                                          boxShadow:
                                            "0 4px 12px rgba(0, 0, 0, 0.08)",
                                          borderColor: "#CBD5E1",
                                        },
                                      }}
                                    >
                                      <Avatar
                                        sx={{
                                          width: 40,
                                          height: 40,
                                          backgroundColor: "#06B6D4",
                                          color: "#FFFFFF",
                                          fontSize: "0.9rem",
                                        }}
                                      >
                                        {task.title?.charAt(0)?.toUpperCase() ??
                                          "?"}
                                      </Avatar>
                                      <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography
                                          variant="subtitle2"
                                          sx={{
                                            fontWeight: 600,
                                            color: "#0F172A",
                                          }}
                                        >
                                          {task.title}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            color: "#64748B",
                                            display: "block",
                                            mt: 0.5,
                                          }}
                                        >
                                          {task.assigned_users
                                            ?.map((u) => u.name)
                                            .join(", ") || "Unassigned"}
                                        </Typography>
                                      </Box>
                                    </Paper>
                                  )}
                                </Draggable>
                              );
                            })}

                            {tasks.length === 0 && (
                              <Box
                                sx={{
                                  textAlign: "center",
                                  py: 4,
                                  color: "#CBD5E1",
                                }}
                              >
                                <Typography variant="caption">
                                  No tasks
                                </Typography>
                              </Box>
                            )}

                            {dropProv.placeholder}
                          </Paper>
                        )}
                      </Droppable>
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </DragDropContext>
  );
}
