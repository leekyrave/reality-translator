import {useState, useRef, useCallback, useEffect} from "react";
import {Link, useSearchParams} from "react-router-dom";
import "../styles/workspace.css";
import {chatApi} from "../api/chat";
import type {ChatMessage} from "../types";
import {MdOutlineUploadFile} from "react-icons/md";
import {CiFileOn} from "react-icons/ci";
import AppSidebar from "../components/AppSidebar";
import {useAuth} from "../context/AuthContext.tsx";
import {useNavigate} from "react-router-dom";

async function* readSSEStream(response: Response): AsyncGenerator<string> {
    if (!response.ok || !response.body) throw new Error(`Stream error: ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
        const {done, value} = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, {stream: true});
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;

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

export default function WorkspacePage() {
    const {logout} = useAuth();
    const [searchParams] = useSearchParams();
    const initialWsId = searchParams.get("id");
    const navigate = useNavigate();

    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [workspaceId, setWorkspaceId] = useState<string | null>(initialWsId);
    const [sidebarKey, setSidebarKey] = useState(0);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [streamingContent, setStreamingContent] = useState<string>("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [defaultTemplate, setDefaultTemplate] = useState<string>("BRAK SZABLONU");

    const [chatInput, setChatInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Sync workspaceId state with URL param on navigation
    useEffect(() => {
        setWorkspaceId(initialWsId);
        setMessages([]);
        setStreamingContent("");
        setError(null);
        setFile(null);
    }, [initialWsId]);

    useEffect(() => {
        if (!initialWsId) return;
        chatApi
            .getHistory(initialWsId)
            .then((data) => setMessages(Array.isArray(data) ? data : []))
            .catch(() => {
            });
    }, [initialWsId]);

    useEffect(() => {
        const fetchDefaultTemplate = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/template/default", {
                    credentials: "include",
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.data.title) setDefaultTemplate(data.data.title.toUpperCase());
                }
            } catch (err) {
                console.error("Nie udało się pobrać domyślnego szablonu:", err);
            }
        };
        fetchDefaultTemplate();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages, streamingContent]);

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
                setMessages((prev) => [...prev, {role: "assistant", content: accumulated}]);
            }
        } catch (e) {
            setError((e as Error).message ?? "Błąd strumieniowania");
        } finally {
            setStreamingContent("");
            setIsStreaming(false);
        }
    }, []);

    const sendMessage = useCallback(
        async (message: string, fileToSend?: File) => {
            const formData = new FormData();
            formData.set("message", message);
            if (workspaceId) formData.set("workspace", workspaceId);
            if (fileToSend) formData.set("file", fileToSend);

            const {workspaceId: newWsId} = await chatApi.saveMessage(formData);

            if (!workspaceId) {
                setWorkspaceId(newWsId);
                setSidebarKey((k) => k + 1);
            }
            setMessages((prev) => [...prev, {role: "user", content: message}]);

            await streamFromWorkspace(newWsId);
        },
        [workspaceId, streamFromWorkspace],
    );

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

    const handleUpload = async () => {
        if (!file) return;
        setIsUploading(true);
        setError(null);
        try {
            await sendMessage("Proszę przeanalizuj i uprość ten dokument.", file);
            setFile(null);
        } catch (e) {
            setError((e as Error).message ?? "Przesyłanie nie powiodło się");
        } finally {
            setIsUploading(false);
        }
    };

    const handleChatSubmit = async () => {
        const msg = chatInput.trim();
        if (!msg || isStreaming) return;
        setChatInput("");
        setError(null);
        try {
            await sendMessage(msg);
        } catch (e) {
            setError((e as Error).message ?? "Nie udało się wysłać wiadomości");
        }
    };

    const handleChip = (text: string) => {
        if (isStreaming) return;
        setChatInput(text);
    };

    const handleNewDoc = () => {
        setFile(null);
        setMessages([]);
        setStreamingContent("");
        setWorkspaceId(null);
        setError(null);
    };

    const hasContent = messages.length > 0 || isStreaming;
    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="ws-root">

            <AppSidebar
                activePage="workspace"
                workspaceKey={sidebarKey}
                onUploadClick={() => fileInputRef.current?.click()}
            />

            {/* ══ Main ══ */}
            <main className="ws-main">

                {/* topbar */}
                <header className="ws-topbar">
                    <div className="ws-topbar-brand">AI-Kumpel</div>
                    <nav className="ws-topbar-nav">
                        <Link to="/workspace" className="ws-topbar-link active">Obszar roboczy</Link>
                    </nav>
                    <div className="ws-topbar-right">
                        <button className="ws-new-doc-btn" onClick={handleNewDoc}>
                            Nowy czat
                        </button>
                        <button className="ws-new-doc-btn" onClick={handleLogout}>
                            Wyloguj
                        </button>
                    </div>
                </header>

                <div className="ws-content">

                    {/* ── Source Panel (left, compact) ── */}
                    <section className="ws-source-panel">
                        <div className="ws-source-header">
                            <CiFileOn style={{width: "13px", height: "13px"}}/>
                            <span className="ws-source-label">ŹRÓDŁO</span>
                        </div>

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
                                style={{display: "none"}}
                                onChange={onInputChange}
                            />

                            {!file ? (
                                <div className="ws-dropzone-empty">
                                    <div className="ws-drop-icon">
                                        <MdOutlineUploadFile style={{width: "32px", height: "32px"}}/>
                                    </div>
                                    <p className="ws-drop-title">Upuść plik tutaj</p>
                                    <p className="ws-drop-sub">lub <span className="ws-drop-link">przeglądaj</span></p>
                                    <p className="ws-drop-types">PDF · DOCX · TXT · MD · CSV</p>
                                </div>
                            ) : (
                                <div className="ws-file-preview">
                                    <div className="ws-file-info">
                                        <div className="ws-file-icon">📄</div>
                                        <div className="ws-file-meta">
                                            <div className="ws-file-name" title={file.name}>{file.name}</div>
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

                        {file && (
                            <button
                                className="ws-analyse-btn"
                                onClick={handleUpload}
                                disabled={isUploading || isStreaming}
                            >
                                {isUploading
                                    ? <><span className="ws-spinner"/> Analizowanie…</>
                                    : "✦ Analizuj i uprość"}
                            </button>
                        )}

                        {error && <div className="ws-error-box">⚠ {error}</div>}
                    </section>

                    {/* ── Chat Panel (main) ── */}
                    <section className="ws-chat-panel">

                        {/* messages area */}
                        <div className="ws-messages-area">
                            {!hasContent && (
                                <div className="ws-empty-chat">
                                    <div className="ws-empty-icon">✦</div>
                                    <p className="ws-empty-title">Rozpocznij rozmowę</p>
                                    <p className="ws-empty-sub">Prześlij dokument do analizy lub zadaj pytanie poniżej.</p>
                                </div>
                            )}

                            {messages.map((m, i) => (
                                <div key={i} className={`ws-bubble ws-bubble-${m.role}`}>
                                    <p style={{whiteSpace: "pre-wrap", margin: 0}}
                                       dangerouslySetInnerHTML={{__html: m.content}}></p>
                                </div>
                            ))}

                            {/* inline streaming bubble */}
                            {isStreaming && (
                                <div className="ws-bubble ws-bubble-assistant">
                                    {!streamingContent ? (
                                        <div className="ws-loading-row">
                                            <span className="ws-spinner blue"/> Generowanie odpowiedzi…
                                        </div>
                                    ) : (
                                        <p style={{whiteSpace: "pre-wrap", margin: 0}}>
                                            {streamingContent}<span className="ws-cursor">▌</span>
                                        </p>
                                    )}
                                </div>
                            )}

                            <div ref={messagesEndRef}/>
                        </div>

                        {/* input area */}
                        <div className="ws-input-area">
                            <div className="ws-chat-badge">{defaultTemplate}</div>
                            <div className="ws-chat-input-row">
                                <input
                                    type="text"
                                    className="ws-chat-input"
                                    placeholder="Zadaj pytanie dotyczące dokumentu…"
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
                                    {isStreaming ? <span className="ws-spinner"/> : "Wyślij ➤"}
                                </button>
                            </div>
                            <div className="ws-chat-chips">
                                {["Wyjaśnij sekcję 4", "Podsumuj kluczowe punkty", "Uprość dalej", "Wyjaśnij żargon"].map((c) => (
                                    <button
                                        key={c}
                                        className="ws-chip"
                                        onClick={() => handleChip(c)}
                                        disabled={isStreaming}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </section>
                </div>
            </main>
        </div>
    );
}
