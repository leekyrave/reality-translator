import { useState, useRef, useCallback, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "../styles/workspace.css";
import { chatApi } from "../api/chat";
import type { ChatMessage } from "../types";

/* ─── sidebar nav ─────────────────────────────────────── */
const NAV = [
  { icon: "💬", label: "Recent Chats", to: "/workspace", active: true },
  { icon: "🗂", label: "Document Vault", to: "/vault" },
  { icon: "✏️", label: "Simplification Rules", to: "/cards" },
  { icon: "👥", label: "Team Assets", to: "/team" },
  { icon: "🕐", label: "Archive", to: "/archive" },
];

/* ─── SSE stream reader ───────────────────────────────── */
async function* readSSEStream(response: Response): AsyncGenerator<string> {
  if (!response.ok || !response.body) throw new Error(`Stream error: ${response.status}`);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? ""; // keep incomplete last line

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const raw = line.slice(6).trim();
      if (!raw) continue;

      // ResponseInterceptor wraps events: { data: { data: "chunk" }, success: true }
      let chunk: string;
      try {
        const parsed = JSON.parse(raw);
        chunk = parsed?.data?.data ?? parsed?.data ?? raw;
      } catch {
        chunk = raw;
      }

      if (chunk === "[DONE]") return;
      if (chunk) yield chunk;
    }
  }
}

/* ─── component ──────────────────────────────────────── */
export default function WorkspacePage() {
  const [searchParams] = useSearchParams();
  const initialWsId = searchParams.get("id");

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [workspaceId, setWorkspaceId] = useState<string | null>(initialWsId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load history when opening an existing workspace
  useEffect(() => {
    if (!initialWsId) return;
    chatApi
      .getHistory(initialWsId)
      .then((data) => {
        setMessages(Array.isArray(data) ? data : []);
      })
      .catch(() => {/* workspace may be empty, ignore */});
  }, [initialWsId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  /* ── stream helper ────────────────────────────────────── */
  const streamFromWorkspace = useCallback(async (wsId: string) => {
    setIsStreaming(true);
    setStreamingContent("");
    setError(null);

    try {
      const response = await chatApi.openStream(wsId);
      let accumulated = "";

      for await (const chunk of readSSEStream(response)) {
        accumulated += chunk;
        setStreamingContent(accumulated);
      }

      if (accumulated) {
        setMessages((prev) => [...prev, { role: "assistant", content: accumulated }]);
      }
    } catch (e) {
      setError((e as Error).message ?? "Streaming failed");
    } finally {
      setStreamingContent("");
      setIsStreaming(false);
    }
  }, []);

  /* ── send message (shared by upload + chat) ─────────────── */
  const sendMessage = useCallback(
    async (message: string, fileToSend?: File) => {
      const formData = new FormData();
      formData.set("message", message);
      if (workspaceId) formData.set("workspace", workspaceId);
      if (fileToSend) formData.set("file", fileToSend);

      const { workspaceId: newWsId } = await chatApi.saveMessage(formData);

      if (!workspaceId) setWorkspaceId(newWsId);
      setMessages((prev) => [...prev, { role: "user", content: message }]);

      await streamFromWorkspace(newWsId);
    },
    [workspaceId, streamFromWorkspace],
  );

  /* ── file helpers ─────────────────────────────────────── */
  const handleFileSelect = (f: File) => {
    setFile(f);
    setError(null);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  }, []);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  /* ── upload & analyse ─────────────────────────────────── */
  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      await sendMessage("Please analyse and simplify this document.", file);
    } catch (e) {
      setError((e as Error).message ?? "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  /* ── chat submit ──────────────────────────────────────── */
  const handleChatSubmit = async () => {
    const msg = chatInput.trim();
    if (!msg || isStreaming) return;
    setChatInput("");
    setError(null);
    try {
      await sendMessage(msg);
    } catch (e) {
      setError((e as Error).message ?? "Failed to send message");
    }
  };

  /* ── reset workspace ─────────────────────────────────── */
  const handleNewDoc = () => {
    setFile(null);
    setMessages([]);
    setStreamingContent("");
    setWorkspaceId(null);
    setError(null);
  };

  const lastAssistantMsg =
    streamingContent ||
    [...messages].reverse().find((m) => m.role === "assistant")?.content;

  return (
    <div className="ws-root">

      {/* ══ Sidebar ══ */}
      <aside className="ws-sidebar">
        <div className="ws-brand">
          <BrandIcon />
          <div>
            <div className="ws-brand-name">The Lucid Curator</div>
            <div className="ws-brand-mode">AI ARCHITECT MODE</div>
          </div>
        </div>

        <nav className="ws-nav">
          {NAV.map((n) => (
            <Link key={n.label} to={n.to} className={`ws-nav-item${n.active ? " active" : ""}`}>
              <span className="ws-nav-icon">{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>

        <button className="ws-upload-btn" onClick={() => fileInputRef.current?.click()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          Upload Document
        </button>
      </aside>

      {/* ══ Main ══ */}
      <main className="ws-main">

        {/* top nav */}
        <header className="ws-topbar">
          <div className="ws-topbar-brand">Lucid Curator</div>
          <nav className="ws-topbar-nav">
            <Link to="/dashboard" className="ws-topbar-link">Dashboard</Link>
            <Link to="/workspace" className="ws-topbar-link active">Workspace</Link>
          </nav>
          <div className="ws-topbar-right">
            <button className="ws-new-doc-btn" onClick={handleNewDoc}>
              New Simplified Doc
            </button>
            <button className="ws-icon-btn">🔔</button>
            <button className="ws-icon-btn">⚙️</button>
            <div className="ws-avatar">LC</div>
          </div>
        </header>

        <div className="ws-content">

          {/* ── Left: Document + Chat Panel ── */}
          <section className="ws-doc-panel">
            <div className="ws-doc-header">
              <div className="ws-doc-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                SOURCE: {file ? file.name.toUpperCase() : "NO FILE LOADED"}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="ws-icon-btn sm">🔍</button>
                <button className="ws-icon-btn sm">⊕</button>
              </div>
            </div>

            {/* Drop zone */}
            <div
              className={`ws-dropzone${isDragging ? " dragging" : ""}${file ? " has-file" : ""}`}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => !file && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.md,.csv"
                style={{ display: "none" }}
                onChange={onInputChange}
              />

              {!file ? (
                <div className="ws-dropzone-empty">
                  <div className="ws-drop-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="12" y1="18" x2="12" y2="12" />
                      <polyline points="9 15 12 12 15 15" />
                    </svg>
                  </div>
                  <p className="ws-drop-title">Drop your document here</p>
                  <p className="ws-drop-sub">or <span className="ws-drop-link">browse files</span> — PDF, DOCX, TXT, MD, CSV</p>
                </div>
              ) : (
                <div className="ws-file-preview">
                  <div className="ws-file-info">
                    <div className="ws-file-icon">📄</div>
                    <div>
                      <div className="ws-file-name">{file.name}</div>
                      <div className="ws-file-size">{(file.size / 1024).toFixed(1)} KB</div>
                    </div>
                    <button
                      className="ws-file-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Upload button */}
            {file && messages.length === 0 && (
              <button
                className="ws-analyse-btn"
                onClick={handleUpload}
                disabled={isUploading || isStreaming}
              >
                {isUploading ? (
                  <><span className="ws-spinner" /> Analysing…</>
                ) : "✦ Analyse & Simplify"}
              </button>
            )}

            {error && <div className="ws-error-box">⚠ {error}</div>}

            {/* Chat input */}
            <div className="ws-chat-bar">
              <div className="ws-chat-badge">AI ARCHITECT ACTIVE</div>
              <div className="ws-chat-input-row">
                <input
                  type="text"
                  className="ws-chat-input"
                  placeholder="Ask a question about the document…"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && void handleChatSubmit()}
                  disabled={isStreaming}
                />
                <button
                  className="ws-synthesize-btn"
                  onClick={() => void handleChatSubmit()}
                  disabled={isStreaming || !chatInput.trim()}
                >
                  {isStreaming ? <span className="ws-spinner blue" /> : "Synthesize ➤"}
                </button>
              </div>
              <div className="ws-chat-chips">
                {["Explain Section 4", "Summarize Liability", "Is this standard?", "Clause risks"].map((c) => (
                  <button
                    key={c}
                    className="ws-chip"
                    onClick={() => setChatInput(c)}
                    disabled={isStreaming}
                  >
                    "{c}"
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ── Right: Results Panel ── */}
          <section className="ws-results-panel">

            {/* Lucid Simplification — shows last assistant response */}
            <div className="ws-result-card lucid">
              <div className="ws-result-label">
                <span className="ws-result-icon">✦</span>
                LUCID SIMPLIFICATION
              </div>

              <div className="ws-result-placeholder">
                {!lastAssistantMsg && !isStreaming && messages.length === 0 ? (
                  <>
                    <blockquote className="ws-result-quote">
                      "Upload a document or ask a question to begin."
                    </blockquote>
                    <div className="ws-result-arrow-row">
                      <span className="ws-result-arrow">→</span>
                      <p className="ws-result-text">AI simplified output will appear here.</p>
                    </div>
                  </>
                ) : isStreaming && !streamingContent ? (
                  <div className="ws-loading-row">
                    <span className="ws-spinner blue" /> Generating response…
                  </div>
                ) : (
                  <p className="ws-result-text" style={{ whiteSpace: "pre-wrap" }}>
                    {lastAssistantMsg}
                    {isStreaming && <span className="ws-cursor">▌</span>}
                  </p>
                )}
              </div>

              <div className="ws-result-actions">
                <button className="ws-action-btn" disabled={isStreaming}>✦ Simplify More</button>
                <button className="ws-action-btn" disabled={isStreaming}>☰ Explain Jargon</button>
              </div>
            </div>

            {/* Conversation history */}
            {messages.length > 0 && (
              <div className="ws-result-card" style={{ maxHeight: 320, overflowY: "auto" }}>
                <div className="ws-result-label">
                  <span className="ws-result-icon">🗨</span>
                  CONVERSATION
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "8px 0" }}>
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      style={{
                        alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                        maxWidth: "85%",
                        padding: "8px 12px",
                        borderRadius: 8,
                        background: m.role === "user" ? "#2d4a7a" : "#f0f4ff",
                        color: m.role === "user" ? "#fff" : "#1a1a2e",
                        fontSize: 13,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {m.content}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            )}

          </section>
        </div>
      </main>
    </div>
  );
}

function BrandIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2d4a7a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="2" />
      <line x1="12" y1="7" x2="8" y2="19" />
      <line x1="12" y1="7" x2="16" y2="19" />
      <line x1="7" y1="14" x2="17" y2="14" />
    </svg>
  );
}
