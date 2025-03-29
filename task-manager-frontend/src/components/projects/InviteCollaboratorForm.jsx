import { useState } from "react";
import { inviteCollaborator } from "../../api/projects";

export default function InviteCollaboratorForm({ projectID, onInvite }) {
    const [username, setUsername] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await inviteCollaborator(projectID, username);
            alert("User invited!");
            setUsername("");
            if (onInvite) onInvite();
        } catch (err) {
            console.error(err);
            alert("Failed to invite user.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4">
        <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username to invite"
            className="border p-1 rounded mr-2"
        />
        <button type="submit" className="bg-green-500 text-white px-3 py-1 rounded">
            Invite
        </button>
        </form>
    );
}