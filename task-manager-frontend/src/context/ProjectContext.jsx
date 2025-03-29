import { createContext, useContext, useEffect, useState } from "react";
import { fetchProjects } from "../api/projects";

const ProjectContext = createContext();

export const useProjects = () => useContext(ProjectContext);

export const ProjectProvider = ({ children }) => {
    const [projects, setProjects] = useState([]);

    const loadProjects = async () => {
        const res = await fetchProjects();
        setProjects(res.data);
    };

    useEffect(() => {
        loadProjects();
    }, []);

    return (
        <ProjectContext.Provider value={{ projects, setProjects, loadProjects }}>
        {children}
        </ProjectContext.Provider>
    );
};