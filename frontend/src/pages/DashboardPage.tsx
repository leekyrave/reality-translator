import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { workspaceApi } from "../api/workspace";
import type { Workspace } from "../types";

const DashboardPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    workspaceApi
      .getAll()
      .then((data) => {
        setWorkspaces(Array.isArray(data) ? data : []);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setIsLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleOpenWorkspace = (id: string) => {
    navigate(`/workspace?id=${id}`);
  };

  const handleNewWorkspace = () => {
    navigate("/workspace");
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">The Lucid Curator</h1>
            <p className="text-sm text-gray-500 mt-1">Your AI document simplification workspaces</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleNewWorkspace}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition"
            >
              + New Workspace
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-100 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
            ⚠ {error}
          </div>
        )}

        {/* Workspace list */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading workspaces…</div>
          ) : workspaces.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">📄</div>
              <p className="text-gray-600 font-medium">No workspaces yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Upload a document or start a conversation to create one.
              </p>
              <button
                onClick={handleNewWorkspace}
                className="mt-5 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition"
              >
                Start your first workspace
              </button>
            </div>
          ) : (
            workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => handleOpenWorkspace(ws.id)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">💬</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{ws.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {ws.messagesCount} message{ws.messagesCount !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
