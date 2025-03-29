import { useEffect, useState } from "react";
import { fetchProjects } from "../../api/projects";
import ProjectCard from "./ProjectCard";

export default function ProjectList({ reloadFlag }) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadProjects = async () => {
        try {
            const data = await fetchProjects();
            setProjects(data);
        } catch (err) {
            console.error("Failed to fetch projects:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProjects();
    }, [ reloadFlag ]);

    return (
        <div>
            <h1 className="text-xl font-bold mb-4">Your Projects</h1>
            {loading ? (
                <p>Loading...</p>
            ) : Array.isArray(projects) && projects.length > 0 ? (
                projects.map((project) => (
                    <ProjectCard key={project.id} project={project} onRefresh={loadProjects} />
                ))
            ) : (
                <p>No projects found.</p>
            )}
        </div>
    );
}