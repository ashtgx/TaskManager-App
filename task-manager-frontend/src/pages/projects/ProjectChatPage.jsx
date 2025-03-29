import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProjectDetail } from "../../api/projects";
import { connectToChat, closeChatSocket } from "../../utils/chat";
import { useAuth } from "../../context/AuthContext";

export default function ProjectChatPage() {
    const { user } = useAuth();
    const { projectID } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState("");
    const [file, setFile] = useState(null);
    const fileInputRef = useRef();
    const bottomRef = useRef();


    const loadProject = async () => {
        try {
            const data = await getProjectDetail(projectID);
            setProject(data);
        } catch (err) {
            console.error("Failed to load project", err);
            alert("Project not found");
            navigate("/dashboard");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() && !file) return;

        const formData = new FormData();
        formData.append("content", content.trim());
        if (file) formData.append("file", file);

        try {
            const response = await fetch(`http://localhost:8000/api/projects/${projectID}/chat-messages/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access")}`,
                },
                body: formData,
            });

            setContent("");
            setFile(null);
            fileInputRef.current.value = null;

        } catch (err) {
            console.error("Failed to send message:", err);
        }
    };

    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        loadProject();
        connectToChat(projectID, (data) => {
            setMessages((prev) => [...prev, data]);
        });
        return () => closeChatSocket();
    }, [projectID]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="max-w-3xl mx-auto p-4 h-screen flex flex-col">
            <div className="mb-4">
                <button
                    onClick={() => navigate(`/projects/${projectID}`)}
                    className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                >
                    ← Back to Project
                </button>
            </div>

            <h2 className="text-xl font-bold mb-4">{project?.title} Chat</h2>

            <div className="flex-1 overflow-y-auto bg-gray-100 p-4 rounded shadow space-y-3">
                {messages.map((msg, idx) => {
                    const isOwn = msg.sender === user?.username;

                    return (
                        <div
                            key={idx}
                            className={`p-3 rounded shadow-sm w-fit max-w-[80%] ${
                                isOwn
                                    ? "ml-auto bg-blue-100"
                                    : "mr-auto bg-white"
                            }`}
                        >
                            <div className="text-sm text-gray-600 mb-1 flex justify-between">
                                <span className={`font-semibold mr-4 ${isOwn ? "text-right text-blue-600" : "text-left text-purple-600"}`}>
                                    {msg.sender}
                                </span>
                                <span className="text-xs text-gray-400">{msg.timestamp}</span>
                            </div>
                            {(msg.content || msg.message) && (
                                <div className="text-gray-800 whitespace-pre-line">{msg.content || msg.message}</div>
                            )}
                            {msg.file && (
                                <div className="mt-2">
                                    <a
                                        href={`http://localhost:8000${msg.file}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 underline text-sm"
                                    >
                                        {msg.original_filename || msg.file.split("/").pop()}
                                    </a>
                                </div>
                            )}
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSubmit} className="mt-4 flex gap-2 items-center">
                <input
                    type="text"
                    placeholder="Type your message..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="flex-1 p-2 border rounded"
                    required={!file} 
                />
                <label
                    htmlFor="file-upload"
                    className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-sm px-3 py-2 rounded border max-w-50 truncate"
                >
                    {file ? file.name : "Attach File"}
                </label>
                <input
                    type="file"
                    id="file-upload"
                    ref={fileInputRef}
                    onChange={(e) => setFile(e.target.files[0])}
                    className="hidden"
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Send
                </button>
            </form>
        </div>
    );
}