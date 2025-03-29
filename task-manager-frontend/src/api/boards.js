import { API } from "./auth";

export const getTaskBoards = (projectID) =>
    API.get(`projects/${projectID}/task-boards/`).then(res => res.data);

export const getTaskBoard = (projectID, boardID) =>
    API.get(`projects/${projectID}/task-boards/${boardID}/`).then(res => res.data);

export const createTaskBoard = (projectID, boardData) =>
    API.post(`projects/${projectID}/task-boards/`, boardData);

export const deleteTaskBoard = (projectID, boardID) =>
    API.delete(`projects/${projectID}/task-boards/${boardID}/`);

export const getTaskBoardTasks = (projectID, boardID) =>
    API.get(`projects/${projectID}/task-boards/${boardID}/tasks/`).then(res => res.data);

export const createTaskBoardTask = (projectID, boardID, taskData) =>
    API.post(`projects/${projectID}/task-boards/${boardID}/tasks/`, taskData);

export const updateTaskBoardTask = (projectID, boardID, taskID, taskData) =>
    API.put(`projects/${projectID}/task-boards/${boardID}/tasks/${taskID}/`, taskData);

export const deleteTaskBoardTask = (projectID, boardID, taskID) =>
    API.delete(`projects/${projectID}/task-boards/${boardID}/tasks/${taskID}/`);

export const reorderTaskBoardTasks = (projectID, boardID, newOrder) =>
    API.post(`projects/${projectID}/task-boards/${boardID}/tasks/reorder/`, {
        order: newOrder,
    });

export const getKanbanBoards = (projectID) =>
    API.get(`projects/${projectID}/kanban-boards/`).then(res => res.data);

export const getKanbanBoard = (projectID, boardID) =>
    API.get(`projects/${projectID}/kanban-boards/${boardID}/`).then(res => res.data);

export const createKanbanBoard = (projectID, boardData) =>
    API.post(`projects/${projectID}/kanban-boards/`, boardData);

export const deleteKanbanBoard = (projectID, boardID) =>
    API.delete(`projects/${projectID}/kanban-boards/${boardID}/`);

export const getKanbanColumns = (projectID, boardID) =>
    API.get(`projects/${projectID}/kanban-boards/${boardID}/columns/`).then(res => res.data);

export const createKanbanColumn = (projectID, boardID, columnData) =>
    API.post(`projects/${projectID}/kanban-boards/${boardID}/columns/`, columnData);
  
export const updateKanbanColumn = (projectID, boardID, columnID, columnData) =>
    API.put(`projects/${projectID}/kanban-boards/${boardID}/columns/${columnID}/`, columnData);

export const deleteKanbanColumn = (projectID, boardID, columnID) =>
    API.delete(`projects/${projectID}/kanban-boards/${boardID}/columns/${columnID}/`);

export const reorderKanbanColumns = (projectID, boardID, columnOrder) =>
    API.post(`projects/${projectID}/kanban-boards/${boardID}/columns/reorder/`, {
        order: columnOrder,
});

export const createKanbanTask = (projectID, boardID, columnID, taskData) =>
    API.post(`projects/${projectID}/kanban-boards/${boardID}/columns/${columnID}/tasks/`, taskData);

export const updateKanbanTask = (projectID, boardID, columnID, taskID, taskData) =>
    API.put(`projects/${projectID}/kanban-boards/${boardID}/columns/${columnID}/tasks/${taskID}/`, taskData);

export const deleteKanbanTask = (projectID, boardID, columnID, taskID) =>
    API.delete(`projects/${projectID}/kanban-boards/${boardID}/columns/${columnID}/tasks/${taskID}/`);

export const reorderKanbanTasks = (projectID, boardID, columnID, taskOrder) =>
    API.post(`projects/${projectID}/kanban-boards/${boardID}/columns/${columnID}/tasks/reorder/`, {
        order: taskOrder,
});

export const getGanttBoards = (projectID) =>
    API.get(`projects/${projectID}/gantt-boards/`).then(res => res.data);

export const getGanttBoard = (projectID, boardID) =>
    API.get(`projects/${projectID}/gantt-boards/${boardID}/`).then(res => res.data);

export const createGanttBoard = (projectID, boardData) =>
    API.post(`projects/${projectID}/gantt-boards/`, boardData);

export const deleteGanttBoard = (projectID, boardID) =>
    API.delete(`projects/${projectID}/gantt-boards/${boardID}/`);

export const getGanttTasks = (projectID, boardID) =>
    API.get(`/projects/${projectID}/gantt-boards/${boardID}/tasks/`).then(res => res.data);
  
export const createGanttTask = (projectID, boardID, taskData) =>
API.post(`/projects/${projectID}/gantt-boards/${boardID}/tasks/`, taskData);

export const updateGanttTask = (projectID, boardID, taskID, taskData) =>
API.put(`/projects/${projectID}/gantt-boards/${boardID}/tasks/${taskID}/`, taskData);

export const deleteGanttTask = (projectID, boardID, taskID) =>
API.delete(`/projects/${projectID}/gantt-boards/${boardID}/tasks/${taskID}/`);