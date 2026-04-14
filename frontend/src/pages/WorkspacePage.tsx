import { useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/workspace.css";
import type { SimplificationResult } from "../types";

/* ─── types ─────────────────────────────────────────── */

type UploadState = "idle" | "uploading" | "done" | "error";

/* ─── sidebar nav items ──────────────────────────────── */
const NAV = [
  { icon: "💬", label: "Recent Chats", to: "/workspace", active: true },
  { icon: "🗂", label: "Document Vault", to: "/vault" },
  { icon: "✏️", label: "Simplification Rules", to: "/rules" },
  { icon: "👥", label: "Team Assets", to: "/team" },
  { icon: "🕐", label: "Archive", to: "/archive" },
];

const BASE_URL = "http://localhost:5000/api";

export default function WorkspacePage() {
  const navigate = useNavigate();

  /* file state */
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* result state */
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SimplificationResult | null>(null);

  /* chat input */
  const [chatInput, setChatInput] = useState("");
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  /* ── file helpers ── */
  const handleFileSelect = (f: File) => {
    setFile(f);
    setResult(null);
    setError(null);
    setUploadState("idle");
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  }, []);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);

  /* ── stream chat ── */
  async function* streamChatMessage(workspaceId: string, message: string): AsyncGenerator<string> {
    const res = await fetch(`${BASE_URL}/chat/stream/${workspaceId}`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
      credentials: "include",
    });

    if (!res.ok || !res.body) throw new Error(`Error: ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const line of decoder.decode(value).split('\n')) {
        if (!line.startsWith('data: ') || line === 'data: [DONE]') continue;
        try {
          const text = JSON.parse(line.slice(6)).content;
          if (text) yield text;
        } catch { /* skip malformed chunks */ }
      }
    }
  }

  /* ── upload & analyse ── */
  const handleUpload = async () => {
    if (!file) return;
    setUploadState("uploading");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("message", file.name);


      const res = await fetch(`${BASE_URL}/chat/message`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? `Error ${res.status}`);
      }

      const data: SimplificationResult = await res.json();
      setResult(data);
      setUploadState("done");
    } catch (e: unknown) {
      setError((e as Error).message ?? "Upload failed");
      setUploadState("error");
    }
  };

  /* ── chat submit ── */
  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
    
    try {
      const message = chatInput;
      setChatInput("");

      // First, get the workspaceId from the initial message endpoint
      const form = new FormData();
      form.set('message', message);

      const res = await fetch(`${BASE_URL}/chat/message`, {
        method: "POST",
        body: form,
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? `Error ${res.status}`);
      }

      const data = await res.json();
      const newWorkspaceId = data.workspaceId;

      if (newWorkspaceId) {
        setWorkspaceId(newWorkspaceId);

        // Now stream from the chat stream endpoint
        for await (const chunk of streamChatMessage(newWorkspaceId, message)) {
          console.log("Stream chunk:", chunk);
          // Handle streamed data here (e.g., append to chat messages state if you have one)
        }
      }
    } catch (e: unknown) {
      setError((e as Error).message ?? "Chat submission failed");
    }
  };

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
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
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
            <Link to="/library" className="ws-topbar-link">Library</Link>
          </nav>
          <div className="ws-topbar-right">
            <button className="ws-new-doc-btn" onClick={() => { setFile(null); setResult(null); setError(null); setUploadState("idle"); }}>
              New Simplified Doc
            </button>
            <button className="ws-icon-btn">🔔</button>
            <button className="ws-icon-btn">⚙️</button>
            <div className="ws-avatar">LC</div>
          </div>
        </header>

        <div className="ws-content">

          {/* ── Left: Document Panel ── */}
          <section className="ws-doc-panel">
            <div className="ws-doc-header">
              <div className="ws-doc-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
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
                accept=".pdf,.doc,.docx,.txt"
                style={{ display: "none" }}
                onChange={onInputChange}
              />

              {!file ? (
                <div className="ws-dropzone-empty">
                  <div className="ws-drop-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 12 15 15"/></svg>
                  </div>
                  <p className="ws-drop-title">Drop your document here</p>
                  <p className="ws-drop-sub">or <span className="ws-drop-link">browse files</span> — PDF, DOC, DOCX, TXT</p>
                </div>
              ) : (
                <div className="ws-file-preview">
                  <div className="ws-file-info">
                    <div className="ws-file-icon">📄</div>
                    <div>
                      <div className="ws-file-name">{file.name}</div>
                      <div className="ws-file-size">{(file.size / 1024).toFixed(1)} KB</div>
                    </div>
                    <button className="ws-file-remove" onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); setUploadState("idle"); }}>✕</button>
                  </div>

                  {/* Sample text preview */}
                  <div className="ws-doc-text">
                    <p>
                      The Client hereby acknowledges and agrees that the service provider shall maintain{" "}
                      <span className="ws-highlight">unilateral discretionary authority</span>{" "}
                      regarding the implementation of architectural protocols.
                    </p>
                    <p>
                      Furthermore,{" "}
                      <span className="ws-highlight">
                        notwithstanding any prior oral or written communications to the contrary, the liability of the provider shall be limited to the maximum extent permissible by the governing statutes
                      </span>{" "}
                      of the relevant jurisdiction.
                    </p>
                    <p className="ws-text-muted">
                      In the event of a force majeure occurrence, performance obligations shall be suspended for a duration commensurate with the disruptive event...
                    </p>
                    <p>
                      The <span className="ws-highlight-soft">indemnification clauses</span> herein shall survive the termination of this agreement for a period of no less than twenty-four (24) months.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Upload button */}
            {file && uploadState !== "done" && (
              <button
                className="ws-analyse-btn"
                onClick={handleUpload}
                disabled={uploadState === "uploading"}
              >
                {uploadState === "uploading" ? (
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
                  placeholder="Select text to simplify or ask a question about the document..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleChatSubmit()}
                />
                <button className="ws-icon-btn">🎤</button>
                <button className="ws-synthesize-btn" onClick={handleChatSubmit}>
                  Synthesize ➤
                </button>
              </div>
              <div className="ws-chat-chips">
                {["Explain Section 4", "Summarize Liability", "Is this standard?", "Clause risks"].map((c) => (
                  <button key={c} className="ws-chip" onClick={() => setChatInput(c)}>"{c}"</button>
                ))}
              </div>
            </div>
          </section>

          {/* ── Right: Results Panel ── */}
          <section className="ws-results-panel">

            {/* Lucid Simplification */}
            <div className="ws-result-card lucid">
              <div className="ws-result-label">
                <span className="ws-result-icon">✦</span>
                LUCID SIMPLIFICATION
              </div>

              {!result ? (
                <div className="ws-result-placeholder">
                  {uploadState === "uploading" ? (
                    <div className="ws-loading-row"><span className="ws-spinner blue" /> Processing document…</div>
                  ) : (
                    <>
                      <blockquote className="ws-result-quote">
                        "The provider shall maintain unilateral discretionary authority regarding implementation..."
                      </blockquote>
                      <div className="ws-result-arrow-row">
                        <span className="ws-result-arrow">→</span>
                        <p className="ws-result-text">The service provider makes all the final decisions on how the work gets done.</p>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="ws-result-placeholder">
                  <blockquote className="ws-result-quote">"{result.original_excerpt}"</blockquote>
                  <div className="ws-result-arrow-row">
                    <span className="ws-result-arrow">→</span>
                    <p className="ws-result-text">{result.simplified}</p>
                  </div>
                </div>
              )}

              <div className="ws-result-actions">
                <button className="ws-action-btn">✦ Simplify More</button>
                <button className="ws-action-btn">☰ Explain Jargon</button>
              </div>
            </div>

            {/* Legal Guardrail */}
            <div className="ws-result-card guardrail">
              <div className="ws-result-label">
                <span className="ws-result-icon red">⚑</span>
                LEGAL GUARDRAIL
              </div>

              {!result?.legal_guardrail ? (
                <>
                  <blockquote className="ws-result-quote">"notwithstanding any prior oral or written communications..."</blockquote>
                  <div className="ws-guardrail-box">
                    <div className="ws-guardrail-title">⚠ Critical Limitation</div>
                    <p className="ws-guardrail-text">
                      This means any previous promises made to you in person or via email are void. Only what's written in this specific contract counts.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <blockquote className="ws-result-quote">"{result.legal_guardrail.excerpt}"</blockquote>
                  <div className="ws-guardrail-box">
                    <div className="ws-guardrail-title">⚠ {result.legal_guardrail.label}</div>
                    <p className="ws-guardrail-text">{result.legal_guardrail.warning}</p>
                  </div>
                </>
              )}
            </div>

            {/* Jargon Context */}
            {(result?.jargon_terms ?? [{ term: "Indemnification", definition: "means to compensate for loss." }]).map((jt) => (
              <div key={jt.term} className="ws-result-card jargon">
                <div className="ws-jargon-row">
                  <span className="ws-jargon-icon">📖</span>
                  <div className="ws-jargon-content">
                    <div className="ws-jargon-label">JARGON CONTEXT</div>
                    <div className="ws-jargon-text">"{jt.term}" {jt.definition}</div>
                  </div>
                  <button className="ws-jargon-link">View Glossary</button>
                </div>
              </div>
            ))}

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
