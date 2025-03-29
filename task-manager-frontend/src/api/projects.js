import { API } from "./auth.js";

export const fetchProjects = async () => {
    const res = await API.get("projects/");
    return res.data;
};

export const getProjectDetail = async (id) => {
    const res = await API.get(`projects/${id}/`);
    return res.data;
}

export const createProject = (data) => API.post("/projects/", data);

export const deleteProject = (id) => API.delete(`/projects/${id}/`);

export const leaveProject = (id) => API.post(`/projects/${id}/leave/`);

export const inviteCollaborator = (id, username) => API.post(`/projects/${id}/invite/`, { username });

export const removeCollaborator = (id, collaboratorId) => 
    API.post(`/projects/${id}/remove-collaborator/`, { collaborator_id: collaboratorId });

export const transferOwnership = (id, newOwnerId) =>
    API.post(`/projects/${id}/transfer-ownership/`, { new_owner_id: newOwnerId });
