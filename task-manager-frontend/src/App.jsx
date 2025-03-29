import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ProfilePage from "./pages/users/ProfilePage";
import DashboardPage from "./pages/home/DashboardPage";
import ProjectDetailPage from "./pages/projects/ProjectDetailPage";
import CollaboratorsPage from "./pages/projects/CollaboratorsPage";
import TaskBoardPage from "./pages/boards/TaskBoardPage";
import KanbanBoardPage from "./pages/boards/KanbanBoardPage";
import GanttBoardPage from "./pages/boards/GanttBoardPage";
import ProjectChatPage from "./pages/projects/ProjectChatPage";

import { useAuth } from "./context/AuthContext";

function App() {
    const { user } = useAuth();

    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/projects/:projectID" element={<ProjectDetailPage />} />
                <Route path="/projects/:projectID/collaborators" element={<CollaboratorsPage />} />
                <Route path="/projects/:projectID/task-boards/:boardID" element={<TaskBoardPage />} />
                <Route path="/projects/:projectID/kanban-boards/:boardID" element={<KanbanBoardPage />} />
                <Route path="/projects/:projectID/gantt-boards/:boardID" element={<GanttBoardPage />} />
                <Route path="/projects/:projectID/chat" element={<ProjectChatPage />} />
            </Routes>
        </>
    )
}

export default App
