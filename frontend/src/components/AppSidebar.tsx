import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { workspaceApi } from "../api/workspace";
import type { Workspace } from "../types";
import { CiFileOn } from "react-icons/ci";

interface AppSidebarProps {
  activePage: "workspace" | "cards";
  /** Increment to trigger workspace list refetch after a new workspace is created */
  workspaceKey?: number;
  /** Override the upload button action (e.g. open a file picker on the parent page) */
  onUploadClick?: () => void;
}

export default function AppSidebar({ activePage, workspaceKey, onUploadClick }: AppSidebarProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    workspaceApi
      .getAll()
      .then((data) => setWorkspaces(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [workspaceKey]);

  const handleUploadClick = () => {
    if (onUploadClick) {
      onUploadClick();
    } else {
      navigate("/workspace");
    }
  };

  return (
    <aside className="ws-sidebar">
      {/* Brand */}
      <div className="ws-brand">
        <div className="brand-logo">✦</div>
        <div>
          <div className="ws-brand-name">The Lucid Curator</div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="ws-nav">
        <Link
          to="/workspace"
          className={`ws-nav-item${activePage === "workspace" ? " active" : ""}`}
        >
          <span className="ws-nav-icon">💬</span>
          Recent Chats
        </Link>
        <Link
          to="/cards"
          className={`ws-nav-item${activePage === "cards" ? " active" : ""}`}
        >
          <span className="ws-nav-icon">✏️</span>
          Simplification Rules
        </Link>

        {/* Workspace list */}
        {workspaces.length > 0 && (
          <div className="ws-sidebar-section">
            <div className="ws-sidebar-section-label">WORKSPACES</div>
            <div className="ws-workspace-list">
              {workspaces.map((ws) => (
                <Link
                  key={ws.id}
                  to={`/workspace?id=${ws.id}`}
                  className="ws-workspace-item"
                  title={ws.title}
                >
                  <span className="ws-workspace-dot" />
                  <span className="ws-workspace-title">{ws.title}</span>
                  <span className="ws-workspace-count">{ws.messagesCount}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <button className="ws-upload-btn" onClick={handleUploadClick}>
        <CiFileOn style={{ width: "16px", height: "16px" }} />
        Upload Document
      </button>
    </aside>
  );
}
