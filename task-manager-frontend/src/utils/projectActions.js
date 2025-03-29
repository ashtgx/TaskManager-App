import { deleteProject, leaveProject, transferOwnership, removeCollaborator } from "../api/projects";

export const handleDeleteProject = async (projectID, projectTitle, onSuccess = () => {}, navigate = null) => {
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete the project "${projectTitle}"" for everyone?`);
    if (!confirmDelete) return;

    try {
        await deleteProject(projectID);
        alert(`Project "${projectTitle}" deleted.`);
        onSuccess();
        if (navigate) navigate("/dashboard");
    } catch (err) {
        console.error(err);
        alert(`Failed to delete project "${projectTitle}".`);
    }
};

export const handleLeaveProject = async (projectID, projectTitle, onSuccess = () => {}, navigate = null) => {
    const confirmLeave = window.confirm(`Are you sure you wnat to leave the project "${projectTitle}"`);
    if (!confirmLeave) return;

    try {
        await leaveProject(projectID);
        alert(`You have left the project "${projectTitle}".`);
        onSuccess();
        if (navigate) navigate("/dashboard");
    } catch (err) {
        console.error(err);
        alert(`Failed to leave project "${projectTitle}".`);
    }
};

export const handleTransferOwnership = async (projectID, newOwner, onSuccess = () => {}) => {
    try {
        await transferOwnership(projectID, newOwner.id);
        alert(`Ownership has been transferred to ${newOwner.username}.`);
        onSuccess();
    } catch (err) {
        console.error(err);
        const msg = err.response?.data?.detail || "Failed to transfer ownership.";
        alert(msg);
        alert(`Failed to transfer ownership to ${newOwner.username}.`);
    }
};

export const handleRemoveCollaborator = async (projectID, collaborator, onSuccess = () => {}) => {
    try {
        await removeCollaborator(projectID, collaborator.id);
        alert(`Removed ${collaborator.username} from the project`);
        onSuccess();
    } catch (err) {
        console.error(err);
        alert(`Failed to remove ${collaborator.username} from the project`);
    }
};
