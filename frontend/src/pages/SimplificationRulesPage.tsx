import { useState, useEffect, type CSSProperties } from "react";
import { LuChartNoAxesColumn } from "react-icons/lu";
import { BsBox } from "react-icons/bs";
import { FiMonitor } from "react-icons/fi";
import { TbBrightnessUp } from "react-icons/tb";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import { templateApi } from "../api/template";
import AppSidebar from "../components/AppSidebar";
import '../styles/workspace.css';
import '../styles/cardsPage.css';

interface Rule {
  id: string;
  icon: "bar" | "legal" | "tech" | "custom";
  iconColor: string;
  title: string;
  description: string;
  persona: string;
  isDefault: boolean;
}

function deriveIcon(title: string): Rule["icon"] {
  const t = title.toLowerCase();
  if (t.includes("executive") || t.includes("summary")) return "bar";
  if (t.includes("legal") || t.includes("law") || t.includes("layman")) return "legal";
  if (t.includes("tech")) return "tech";
  return "custom";
}

function deriveColor(icon: Rule["icon"]): string {
  const map: Record<Rule["icon"], string> = {
    bar: "#4f6fba",
    legal: "#7c5cbf",
    tech: "#4f6fba",
    custom: "#2e7d52",
  };
  return map[icon];
}

const BarIcon = () => <LuChartNoAxesColumn style={{ height: "25px", width: "25px" }} />;
const LegalIcon = () => <BsBox style={{ height: "22px", width: "22px" }} />;
const TechIcon = () => <FiMonitor style={{ height: "22px", width: "22px" }} />;
const CustomIcon = () => <TbBrightnessUp style={{ height: "25px", width: "25px" }} />;

const RuleIcon = ({ icon, color }: { icon: Rule["icon"]; color: string }) => (
  <div style={{
    width: 44, height: 44, borderRadius: 10,
    background: color + "22",
    display: "flex", alignItems: "center", justifyContent: "center", color,
  }}>
    {icon === "bar" && <BarIcon />}
    {icon === "legal" && <LegalIcon />}
    {icon === "tech" && <TechIcon />}
    {icon === "custom" && <CustomIcon />}
  </div>
);

interface ModalProps {
  rule: Partial<Rule> | null;
  onClose: () => void;
  onSave: (r: Omit<Rule, "id" | "isDefault">) => Promise<void>;
}

const ICON_OPTIONS: Rule["icon"][] = ["bar", "legal", "tech", "custom"];
const COLOR_OPTIONS = ["#4f6fba", "#7c5cbf", "#2e7d52", "#c0392b", "#d97706"];

const Modal = ({ rule, onClose, onSave }: ModalProps) => {
  const [form, setForm] = useState<Omit<Rule, "id" | "isDefault">>({
    icon: rule?.icon ?? "bar",
    iconColor: rule?.iconColor ?? "#4f6fba",
    title: rule?.title ?? "",
    description: rule?.description ?? "",
    persona: rule?.persona ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const set = (k: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const valid = form.title.trim() && form.persona.trim() && form.description.trim();

  const handleSubmit = async () => {
    if (!valid) return;
    setSaving(true);
    setSaveError(null);
    try {
      await onSave(form);
      onClose();
    } catch (e) {
      setSaveError((e as Error).message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalHeader}>
          <span style={S.modalTitle}>{rule?.title ? "Edit Rule" : "New Rule"}</span>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={S.fieldGroup}>
          <label style={S.label}>Title *</label>
          <input
            style={S.input}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Executive Summary"
          />
        </div>

        <div style={S.fieldGroup}>
          <label style={S.label}>Persona / Role *</label>
          <input
            style={S.input}
            value={form.persona}
            onChange={(e) => set("persona", e.target.value)}
            placeholder="e.g. Strategic Consultant"
          />
        </div>

        <div style={S.fieldGroup}>
          <label style={S.label}>Instructions *</label>
          <textarea
            style={{ ...S.input, height: 100, resize: "vertical" } as CSSProperties}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Describe how the AI should process and respond to documents…"
          />
        </div>

        {saveError && (
          <div style={{ color: "#dc2626", fontSize: 12, marginBottom: 10 }}>⚠ {saveError}</div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
          <button style={S.cancelBtn} onClick={onClose} disabled={saving}>Cancel</button>
          <button
            style={{ ...S.saveBtn, opacity: valid && !saving ? 1 : 0.5, cursor: valid && !saving ? "pointer" : "not-allowed" }}
            onClick={handleSubmit}
            disabled={!valid || saving}
          >
            {saving ? "Saving…" : rule?.title ? "Save Changes" : "Create Rule"}
          </button>
        </div>
      </div>
    </div>
  );
};

const SimplificationRulesPage = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modal, setModal] = useState<{ rule: Partial<Rule> | null; id?: string } | null>(null);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  /* ── Load templates from backend ───────────────────────── */
  useEffect(() => {
    templateApi
      .getAll()
      .then((templates) => {
        setRules(
          templates.map((t) => {
            const icon = deriveIcon(t.title);
            return {
              id: t.id,
              icon,
              iconColor: deriveColor(icon),
              title: t.title,
              description: t.content,
              persona: t.role,
              isDefault: t.isDefault,
            };
          }),
        );
      })
      .catch((e) => setLoadError((e as Error).message ?? "Failed to load rules"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = rules.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.persona.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => { setModal({ rule: null }); setActionError(null); };
  const openEdit = (r: Rule) => { setModal({ rule: r, id: r.id }); setActionError(null); };
  const closeModal = () => setModal(null);

  /* ── Create / Update ────────────────────────────────────── */
  const handleSave = async (form: Omit<Rule, "id" | "isDefault">) => {
    if (modal?.id) {
      // Update
      await templateApi.update(modal.id, {
        title: form.title,
        role: form.persona,
        content: form.description,
      });
      setRules((rs) =>
        rs.map((r) => (r.id === modal.id ? { ...r, ...form } : r)),
      );
    } else {
      // Create
      const { id } = await templateApi.create({
        title: form.title,
        role: form.persona,
        content: form.description,
      });
      setRules((rs) => [...rs, { ...form, id, isDefault: false }]);
    }
  };

  /* ── Delete ─────────────────────────────────────────────── */
  const handleDelete = async (id: string) => {
    try {
      await templateApi.delete(id);
      setRules((rs) => rs.filter((r) => r.id !== id));
      setDeleteConfirm(null);
    } catch (e) {
      setActionError((e as Error).message ?? "Failed to delete");
      setDeleteConfirm(null);
    }
  };

  /* ── Set default ────────────────────────────────────────── */
  const handleSetDefault = async (id: string) => {
    try {
      await templateApi.update(id, { isDefault: true });
      setRules((rs) =>
        rs.map((r) => ({ ...r, isDefault: r.id === id })),
      );
    } catch (e) {
      setActionError((e as Error).message ?? "Failed to set default");
    }
  };

  return (
    <>
      <div className="ws-root">

        {/* ── Sidebar ── */}
        <AppSidebar activePage="cards" />

        {/* ── Main ── */}
        <main className="ws-main">

          {/* Topbar */}
          <header className="ws-topbar">
            <div className="ws-topbar-brand">Simplification Rules</div>
            <div className="ws-cards-search">
              <span style={{ color: "#9ca3af", fontSize: 13 }}>🔍</span>
              <input
                className="ws-cards-search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search rules..."
              />
            </div>
            <div className="ws-topbar-right">
              <button className="ws-new-doc-btn" onClick={openAdd}>＋ Add New Rule</button>
              <div className="ws-avatar">{rules.length}</div>
            </div>
          </header>

          {/* Content */}
          <div className="ws-cards-content">

            {/* Info banner */}
            <div className="info-banner">
              <div className="info-icon">ℹ</div>
              <div>
                <div className="info-title">Managing AI Personas</div>
                <div className="info-text">
                  Define how the Lucid Architect processes complex data. Set one rule as your
                  <strong> default</strong> — it will be injected automatically as the AI's system
                  prompt when you analyse documents.
                </div>
              </div>
            </div>

            {/* Error banner */}
            {(loadError || actionError) && (
              <div style={{
                background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10,
                padding: "12px 18px", marginBottom: 20, fontSize: 13, color: "#dc2626",
              }}>
                ⚠ {loadError ?? actionError}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div style={{ padding: "40px", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
                Loading rules…
              </div>
            )}

            {/* Rule cards */}
            {!loading && (
              <div className="cards-grid">
                {filtered.map((rule) => (
                  <div key={rule.id} className="rule-card flex flex-col justify-start">
                    <div className="card-top">
                      <RuleIcon icon={rule.icon} color={rule.iconColor} />
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {rule.isDefault && (
                          <span style={{
                            fontSize: 9, fontWeight: 700, letterSpacing: "0.06em",
                            background: "#dce7f5", color: "#2d4a7a",
                            padding: "3px 8px", borderRadius: 20, textTransform: "uppercase",
                          }}>
                            Default
                          </span>
                        )}
                        <div className="card-actions">
                          <button className="card-action-btn" onClick={() => openEdit(rule)} title="Edit">
                            <FaRegEdit style={{ height: "15px", width: "15px" }} />
                          </button>
                          <button className="card-action-btn del" onClick={() => setDeleteConfirm(rule.id)} title="Delete">
                            <RiDeleteBinLine style={{ height: "15px", width: "15px" }} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="card-title">{rule.title}</div>
                    <div className="card-desc">{rule.description}</div>

                    <div className="card-meta">
                      <div className="meta-row">
                        <span className="meta-key">Persona</span>
                        <span className="meta-val">{rule.persona}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => !rule.isDefault && void handleSetDefault(rule.id)}
                      className="card-set-default-btn"
                      disabled={rule.isDefault}
                    >
                      {rule.isDefault ? "✦ Active Default" : "Set as Default"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Create card */}
            {!loading && (
              <div className="bottom-row">
                <div className="create-card" onClick={openAdd}>
                  <div className="create-plus">＋</div>
                  <div className="create-title">Create Custom Template</div>
                  <div className="create-sub">Define a new curation pattern</div>
                </div>
              </div>
            )}

          </div>
        </main>
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
            <div className="del-text">
              This action cannot be undone. The rule will be permanently removed.
            </div>
            <div className="del-actions">
              <button style={S.cancelBtn} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button
                style={{ ...S.saveBtn, background: "#dc2626" }}
                onClick={() => void handleDelete(deleteConfirm)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const S: Record<string, CSSProperties> = {
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
  modalTitle: { fontSize: 18, fontWeight: 700, color: "#111827" },
  closeBtn: {
    background: "none", border: "none", fontSize: 16, color: "#9ca3af",
    cursor: "pointer", padding: "2px 6px", borderRadius: 4,
  },
  fieldGroup: { marginBottom: 16 },
  label: {
    display: "block", fontSize: 11, fontWeight: 600, color: "#6b7280",
    letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 7,
  },
  input: {
    width: "100%", padding: "10px 13px", border: "1px solid #e5e7eb",
    borderRadius: 8, fontSize: 14, color: "#111827", fontFamily: "'DM Sans', sans-serif",
    outline: "none", background: "#fafafa", boxSizing: "border-box",
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
