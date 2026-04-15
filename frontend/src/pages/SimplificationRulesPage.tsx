import {useState} from "react";
import {Link} from "react-router-dom";
import {LuChartNoAxesColumn} from "react-icons/lu";
import {BsBox} from "react-icons/bs";
import {FiMonitor} from "react-icons/fi";
import {TbBrightnessUp} from "react-icons/tb";
import {FaRegEdit} from "react-icons/fa";
import {RiDeleteBinLine} from "react-icons/ri";
import '../styles/cardsPage.css';

// ── Types ──────────────────────────────────────────────────────────────
type JargonHandling = "REMOVE ENTIRELY" | "TRANSLATE & DEFINE" | "USE ANALOGIES" | "SIMPLIFY" | "KEEP AS-IS";

interface Rule {
    id: number;
    icon: "bar" | "legal" | "tech" | "custom";
    iconColor: string;
    title: string;
    description: string;
    persona: string;
    tone: string;
    jargonHandling: JargonHandling;
}

interface RuleT {
    id: number;
    title: string;
    content: string;
    role: string;
}

const JARGON_OPTIONS: JargonHandling[] = [
    "REMOVE ENTIRELY",
    "TRANSLATE & DEFINE",
    "USE ANALOGIES",
    "SIMPLIFY",
    "KEEP AS-IS",
];

const defaultRules: Rule[] = [
    {
        id: 1,
        icon: "bar",
        iconColor: "#4f6fba",
        title: "Executive Summary",
        description: "Condenses 50+ page technical reports into 3-5 bulleted high-level insights for C-suite decision makers.",
        persona: "Strategic Consultant",
        tone: "Direct & Professional",
        jargonHandling: "REMOVE ENTIRELY",
    },
    {
        id: 2,
        icon: "legal",
        iconColor: "#7c5cbf",
        title: "Legal to Layman",
        description: "Translates dense contractual language into understandable English while maintaining core obligations.",
        persona: "Patient Advocate",
        tone: "Empathetic & Clear",
        jargonHandling: "TRANSLATE & DEFINE",
    },
    {
        id: 3,
        icon: "tech",
        iconColor: "#4f6fba",
        title: "Tech for Non-Tech",
        description: "Converts architectural specs and API docs into marketing-friendly product descriptions.",
        persona: "Product Storyteller",
        tone: "Vibrant & Accessible",
        jargonHandling: "USE ANALOGIES",
    },
];

// ── Icons ──────────────────────────────────────────────────────────────
const BarIcon = () => (
    <LuChartNoAxesColumn style={{
        height: '25px',
        width: '25px'
    }}/>
);
const LegalIcon = () => (
    <BsBox style={{
        height: '22px',
        width: '22px'
    }}/>
);
const TechIcon = () => (
    <FiMonitor style={{height: '22px', width: '22px'}}/>
);
const CustomIcon = () => (
    <TbBrightnessUp style={{height: '25px', width: '25px'}}/>
);

const RuleIcon = ({icon, color}: { icon: Rule["icon"]; color: string }) => {
    const bg = color + "22";
    return (
        <div style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color
        }}>
            {icon === "bar" && <BarIcon/>}
            {icon === "legal" && <LegalIcon/>}
            {icon === "tech" && <TechIcon/>}
            {icon === "custom" && <CustomIcon/>}
        </div>
    );
};

const jargonStyle = (j: JargonHandling): React.CSSProperties => {
    const map: Record<JargonHandling, { bg: string; color: string }> = {
        "REMOVE ENTIRELY": {bg: "#e8eaf6", color: "#3949ab"},
        "TRANSLATE & DEFINE": {bg: "#e3f0e8", color: "#2e7d52"},
        "USE ANALOGIES": {bg: "#e8f0fb", color: "#1a56a0"},
        "SIMPLIFY": {bg: "#fff3e0", color: "#e65100"},
        "KEEP AS-IS": {bg: "#f3e5f5", color: "#7b1fa2"},
    };
    return {background: map[j].bg, color: map[j].color};
};

// ── Modal ──────────────────────────────────────────────────────────────
interface ModalProps {
    rule: Partial<Rule> | null;
    onClose: () => void;
    onSave: (r: Omit<Rule, "id">) => void;
}

const ICON_OPTIONS: Rule["icon"][] = ["bar", "legal", "tech", "custom"];
const COLOR_OPTIONS = ["#4f6fba", "#7c5cbf", "#2e7d52", "#c0392b", "#d97706"];

const Modal = ({rule, onClose, onSave}: ModalProps) => {
    const [form, setForm] = useState<Omit<Rule, "id">>({
        icon: (rule?.icon as Rule["icon"]) ?? "bar",
        iconColor: rule?.iconColor ?? "#4f6fba",
        title: rule?.title ?? "",
        description: rule?.description ?? "",
        persona: rule?.persona ?? "",
        tone: rule?.tone ?? "",
        jargonHandling: rule?.jargonHandling ?? "REMOVE ENTIRELY",
    });

    const set = (k: keyof typeof form, v: string) =>
        setForm((p) => ({...p, [k]: v}));

    const valid = form.title.trim() && form.persona.trim() && form.tone.trim();

    return (
        <div style={S.overlay} onClick={onClose}>
            <div style={S.modal} onClick={(e) => e.stopPropagation()}>
                <div style={S.modalHeader}>
                    <span style={S.modalTitle}>{rule?.title ? "Edit Rule" : "New Rule"}</span>
                    <button style={S.closeBtn} onClick={onClose}>✕</button>
                </div>

                {/* Icon picker */}
                <div style={S.fieldGroup}>
                    <label style={S.label}>Icon</label>
                    <div style={{display: "flex", gap: 10, flexWrap: "wrap"}}>
                        {ICON_OPTIONS.map((ic) => (
                            <button
                                key={ic}
                                onClick={() => set("icon", ic)}
                                style={{
                                    ...S.iconPickBtn,
                                    background: form.icon === ic ? form.iconColor + "22" : "#f5f6f8",
                                    border: form.icon === ic ? `2px solid ${form.iconColor}` : "2px solid #e5e7eb",
                                    color: form.icon === ic ? form.iconColor : "#9ca3af",
                                }}
                            >
                                {ic === "bar" && <BarIcon/>}
                                {ic === "legal" && <LegalIcon/>}
                                {ic === "tech" && <TechIcon/>}
                                {ic === "custom" && <CustomIcon/>}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Color picker */}
                <div style={S.fieldGroup}>
                    <label style={S.label}>Icon Color</label>
                    <div style={{display: "flex", gap: 8}}>
                        {COLOR_OPTIONS.map((c) => (
                            <button
                                key={c}
                                onClick={() => set("iconColor", c)}
                                style={{
                                    width: 28, height: 28, borderRadius: "50%", background: c, border: "none",
                                    cursor: "pointer", outline: form.iconColor === c ? `3px solid ${c}` : "none",
                                    outlineOffset: 2,
                                }}
                            />
                        ))}
                    </div>
                </div>

                <div style={S.fieldGroup}>
                    <label style={S.label}>Title *</label>
                    <input style={S.input} value={form.title} onChange={(e) => set("title", e.target.value)}
                           placeholder="e.g. Executive Summary"/>
                </div>

                <div style={S.fieldGroup}>
                    <label style={S.label}>Description</label>
                    <textarea
                        style={{...S.input, height: 76, resize: "vertical"} as React.CSSProperties}
                        value={form.description}
                        onChange={(e) => set("description", e.target.value)}
                        placeholder="What does this rule do?"
                    />
                </div>

                <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14}}>
                    <div style={S.fieldGroup}>
                        <label style={S.label}>Persona *</label>
                        <input style={S.input} value={form.persona} onChange={(e) => set("persona", e.target.value)}
                               placeholder="e.g. Strategic Consultant"/>
                    </div>
                    <div style={S.fieldGroup}>
                        <label style={S.label}>Tone *</label>
                        <input style={S.input} value={form.tone} onChange={(e) => set("tone", e.target.value)}
                               placeholder="e.g. Direct & Professional"/>
                    </div>
                </div>

                <div style={S.fieldGroup}>
                    <label style={S.label}>Jargon Handling</label>
                    <select style={S.input} value={form.jargonHandling}
                            onChange={(e) => set("jargonHandling", e.target.value as JargonHandling)}>
                        {JARGON_OPTIONS.map((j) => <option key={j}>{j}</option>)}
                    </select>
                </div>

                <div style={{display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8}}>
                    <button style={S.cancelBtn} onClick={onClose}>Cancel</button>
                    <button
                        style={{...S.saveBtn, opacity: valid ? 1 : 0.5, cursor: valid ? "pointer" : "not-allowed"}}
                        onClick={() => valid && onSave(form)}
                    >
                        {rule?.title ? "Save Changes" : "Create Rule"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Main Page ──────────────────────────────────────────────────────────
const SimplificationRulesPage = () => {
    const [rules, setRules] = useState<Rule[]>(defaultRules);
    const [modal, setModal] = useState<{ rule: Partial<Rule> | null; id?: number } | null>(null);
    const [search, setSearch] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    const filtered = rules.filter(
        (r) =>
            r.title.toLowerCase().includes(search.toLowerCase()) ||
            r.persona.toLowerCase().includes(search.toLowerCase())
    );

    const openAdd = () => setModal({rule: null});
    const openEdit = (r: Rule) => setModal({rule: r, id: r.id});
    const closeModal = () => setModal(null);

    const handleSave = (form: Omit<Rule, "id">) => {
        if (modal?.id !== undefined) {
            setRules((rs) => rs.map((r) => (r.id === modal.id ? {...form, id: r.id} : r)));
        } else {
            setRules((rs) => [...rs, {...form, id: Date.now()}]);
        }
        closeModal();
    };

    const handleDelete = (id: number) => {
        setRules((rs) => rs.filter((r) => r.id !== id));
        setDeleteConfirm(null);
    };

    const navItems = [
        {label: "Recent Chats", icon: "💬", to: "/workspace"},
        {label: "Document Vault", icon: "🗂", to: "/"},
        {label: "Simplification Rules", icon: "✏️", to: "/cards", active: true},
        {label: "Team Assets", icon: "👥", to: "/"},
        {label: "Archive", icon: "🕐", to: "/"},
    ];

    return (
        <>
            <div className="page-root">

                {/* ── Sidebar ── */}
                <aside className="sidebar">
                    <div className="sidebar-brand">
                        <div className="brand-logo">✦</div>
                        <div>
                            <div className="brand-name">The Lucid Curator</div>
                            <div className="brand-sub">AI Architect Mode</div>
                        </div>
                    </div>

                    {navItems.map((item) => (
                        <Link key={item.label} to={item.to} className={`nav-item${item.active ? " active" : ""}`}>
                            <span>{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}

                    <div className="sidebar-bottom">
                        <Link to="/" className="nav-item" style={{padding: "8px 0"}}>❓ Help Center</Link>
                        <Link to="/" className="nav-item" style={{padding: "8px 0"}}>👤 Account</Link>
                    </div>
                </aside>

                {/* ── Main ── */}
                <div className="main">
                    {/* Topbar */}
                    <div className="topbar">
                        <div>
                            <div className="breadcrumb">Workspace › <span>Simplification Rules</span></div>
                            <div className="page-title">Simplification Rules</div>
                        </div>
                        <div className="search-box">
                            <span style={{color: "#9ca3af"}}>🔍</span>
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search rules..."
                            />
                        </div>
                        <button className="add-btn" onClick={openAdd}>＋ Add New Rule</button>
                    </div>

                    {/* Content */}
                    <div className="content">

                        {/* Info banner */}
                        <div className="info-banner">
                            <div className="info-icon">ℹ</div>
                            <div>
                                <div className="info-title">Managing AI Personas</div>
                                <div className="info-text">
                                    Define how the Lucid Architect processes complex data. These rules dictate tone,
                                    jargon replacement
                                    strategies, and target reading levels across your workspace.
                                </div>
                            </div>
                        </div>

                        {/* Rule cards */}
                        <div className="cards-grid">
                            {filtered.map((rule) => (
                                <div key={rule.id} className="rule-card">
                                    <div className="card-top">
                                        <RuleIcon icon={rule.icon} color={rule.iconColor}/>
                                        <div className="card-actions">
                                            <button className="card-action-btn" onClick={() => openEdit(rule)}
                                                    title="Edit">
                                                <FaRegEdit style={{height: '15px', width: '15px'}}/>
                                            </button>
                                            <button className="card-action-btn del"
                                                    onClick={() => setDeleteConfirm(rule.id)} title="Delete">
                                                <RiDeleteBinLine style={{height: '15px', width: '15px'}}/>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="card-title">{rule.title}</div>
                                    <div className="card-desc">{rule.description}</div>
                                    <div className="card-meta">
                                        <div className="meta-row">
                                            <span className="meta-key">Persona</span>
                                            <span className="meta-val">{rule.persona}</span>
                                        </div>
                                        <div className="meta-row">
                                            <span className="meta-key">Tone</span>
                                            <span className="meta-val"
                                                  style={{color: "#374151", fontWeight: 500}}>{rule.tone}</span>
                                        </div>
                                        <div className="meta-row">
                                            <span className="meta-key">Jargon Handling</span>
                                            <span className="jargon-badge"
                                                  style={jargonStyle(rule.jargonHandling)}>{rule.jargonHandling}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Bottom row */}
                        <div className="bottom-row">
                            <div className="create-card" onClick={openAdd}>
                                <div className="create-plus">＋</div>
                                <div className="create-title">Create Custom Template</div>
                                <div className="create-sub">Define a new curation pattern</div>
                            </div>

                            <div className="perf-card">
                                <div className="perf-top">
                                    <span className="perf-title">System Performance</span>
                                    <span style={{color: "#2d4a7a", fontSize: 18}}>⚡</span>
                                </div>
                                <div className="perf-bar-bg">
                                    <div className="perf-bar"/>
                                </div>
                                <div className="perf-text">85% of documents processed using 'Executive Summary' this
                                    month.
                                </div>
                                <div className="perf-avatars">
                                    {["A", "B", "C"].map((l, i) => (
                                        <div key={i} className="avatar"
                                             style={{background: ["#2d4a7a", "#4f6fba", "#7c5cbf"][i]}}>{l}</div>
                                    ))}
                                    <div className="avatar avatar-more">+12</div>
                                </div>
                            </div>

                            <div className="feature-card">
                                <div className="feature-label">New Feature</div>
                                <div className="feature-title">Multi-Persona Chaining</div>
                                <div className="feature-desc">Apply multiple rules sequentially for complex document
                                    restructuring.
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="stats-row">
                            <div className="stat-item">
                                <div className="stat-label">Active Rules</div>
                                <div className="stat-val">{rules.length}</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-label">Global Usage</div>
                                <div className="stat-val">98.2<span className="stat-suffix">%</span></div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-label">Avg. Complexity Drop</div>
                                <div className="stat-val blue">4.2<span className="stat-suffix"
                                                                        style={{fontSize: 14}}>pts</span></div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-label">Jargon Redacted</div>
                                <div className="stat-val">1.2<span className="stat-suffix">M</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Modal ── */}
            {modal && (
                <Modal
                    rule={modal.rule ?? {}}
                    onClose={closeModal}
                    onSave={handleSave}
                />
            )}

            {/* ── Delete confirm ── */}
            {deleteConfirm !== null && (
                <div className="del-confirm" onClick={() => setDeleteConfirm(null)}>
                    <div className="del-box" onClick={(e) => e.stopPropagation()}>
                        <div className="del-title">Delete Rule?</div>
                        <div className="del-text">This action cannot be undone. The rule and all its settings will be
                            permanently removed.
                        </div>
                        <div className="del-actions">
                            <button style={S.cancelBtn} onClick={() => setDeleteConfirm(null)}>Cancel</button>
                            <button style={{...S.saveBtn, background: "#dc2626"}}
                                    onClick={() => handleDelete(deleteConfirm)}>Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// ── Shared modal styles ────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
    overlay: {
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
        padding: 16,
    },
    modal: {
        background: "white", borderRadius: 16, padding: 28,
        width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    },
    modalHeader: {
        display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22,
    },
    modalTitle: {fontSize: 18, fontWeight: 700, color: "#111827"},
    closeBtn: {
        background: "none", border: "none", fontSize: 16, color: "#9ca3af",
        cursor: "pointer", padding: "2px 6px", borderRadius: 4,
    },
    fieldGroup: {marginBottom: 16},
    label: {
        display: "block", fontSize: 11, fontWeight: 600, color: "#6b7280",
        letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 7,
    },
    input: {
        width: "100%", padding: "10px 13px", border: "1px solid #e5e7eb",
        borderRadius: 8, fontSize: 14, color: "#111827", fontFamily: "'DM Sans', sans-serif",
        outline: "none", background: "#fafafa",
    },
    iconPickBtn: {
        width: 44, height: 44, borderRadius: 10, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.12s",
    },
    cancelBtn: {
        padding: "9px 18px", background: "#f3f4f6", color: "#374151",
        border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600,
        fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
    },
    saveBtn: {
        padding: "9px 20px", background: "#2d4a7a", color: "white",
        border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600,
        fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
    },
};

export default SimplificationRulesPage;
