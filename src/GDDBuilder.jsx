import React, { useState, useRef } from "react";
import { Plus, Trash2, Copy, Download, FileText, ArrowLeft, Check, Upload, Save, Info } from "lucide-react";
import initialSections from "./schema.js";

/* ============================================================
   THEME TOKENS — drafting-table / ledger aesthetic.
   Dark slate "table", brass accent for actions, muted teal
   for "selected" state (like ink stamps on a ledger).
   ============================================================ */
const theme = {
  bg: "#161A21",
  panel: "#1E242E",
  panelAlt: "#252C38",
  border: "#333D4C",
  borderSoft: "#2A313D",
  ink: "#EAE4D3",
  inkMuted: "#8E97A4",
  inkFaint: "#5C6572",
  accent: "#C68A46",
  accentDim: "#8C6636",
  accentSoft: "#372C1E",
  select: "#5C8C81",
  selectSoft: "#1E2E2B",
  danger: "#B5573F",
  paper: "#EFEAD9",
  paperInk: "#232017",
  serif: "'Iowan Old Style','Palatino Linotype',Georgia,serif",
  mono: "'IBM Plex Mono','SFMono-Regular',Menlo,Consolas,monospace",
  sans: "-apple-system,'Segoe UI',Inter,sans-serif",
};

function withRuntimeState(sections) {
  return sections.map((s) =>
    s.isCharacterSection
      ? { ...s, characters: [] }
      : { ...s, subsections: s.subsections.map((sub) => ({ ...sub, selected: [], notes: "" })) }
  );
}

let uid = 0;
const nextId = () => `c${Date.now()}_${uid++}`;

/* ============================================================
   MULTI-SELECT CHECKLIST — replaces the native <select multiple>
   ============================================================ */
// options: [{ label, definition }]   selected: [label, ...]
function OptionList({ options, selected, onToggle, onAdd, onEditDefinition }) {
  const [draft, setDraft] = useState("");
  const [draftDefinition, setDraftDefinition] = useState("");
  const [expandedLabel, setExpandedLabel] = useState(null);

  const submitDraft = () => {
    const val = draft.trim();
    if (!val) return;
    onAdd(val, draftDefinition.trim());
    setDraft("");
    setDraftDefinition("");
  };

  return (
    <div>
      <div
        style={{ border: `1px solid ${theme.border}`, borderRadius: 8, background: theme.bg, maxHeight: 280, overflowY: "auto" }}
      >
        {options.length === 0 && (
          <div style={{ padding: "14px 12px", color: theme.inkFaint, fontSize: 13, fontFamily: theme.mono }}>
            No options yet — add one below.
          </div>
        )}
        {options.map((opt) => {
          const isSelected = selected.includes(opt.label);
          const hasContent = !!opt.definition || isSelected;
          const isExpanded = expandedLabel === opt.label;
          return (
            <div key={opt.label}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  borderBottom: isExpanded ? "none" : `1px solid ${theme.borderSoft}`,
                  background: isSelected ? theme.selectSoft : "transparent",
                  cursor: "pointer",
                }}
                onClick={() => onToggle(opt.label)}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    border: `1px solid ${isSelected ? theme.select : theme.inkFaint}`,
                    background: isSelected ? theme.select : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isSelected && <Check size={11} color={theme.bg} strokeWidth={3} />}
                </span>
                <span style={{ flex: 1, fontSize: 13.5, color: isSelected ? theme.ink : theme.inkMuted, lineHeight: 1.3 }}>
                  {opt.label}
                </span>
                {hasContent && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedLabel(isExpanded ? null : opt.label);
                    }}
                    title={isExpanded ? "Hide definition" : "Show definition"}
                    style={{
                      flexShrink: 0,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 2,
                      display: "flex",
                      color: isExpanded ? theme.accent : theme.inkFaint,
                    }}
                  >
                    <Info size={14} />
                  </button>
                )}
              </div>
              {isExpanded && (
                <div
                  style={{
                    padding: "4px 14px 12px 40px",
                    background: theme.panelAlt,
                    borderBottom: `1px solid ${theme.borderSoft}`,
                    fontSize: 12,
                    lineHeight: 1.5,
                    color: theme.ink,
                  }}
                >
                  {opt.definition || <span style={{ color: theme.inkFaint, fontStyle: "italic" }}>No definition yet.</span>}
                  {isSelected && (
                    <div style={{ marginTop: 8, textAlign: "right" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedLabel(null);
                          onEditDefinition(opt.label);
                        }}
                        style={{
                          background: theme.accentSoft,
                          border: `1px solid ${theme.accentDim}`,
                          color: theme.accent,
                          borderRadius: 5,
                          padding: "3px 9px",
                          fontSize: 11,
                          cursor: "pointer",
                          fontFamily: theme.mono,
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitDraft()}
          placeholder="Add a new option…"
          style={{
            background: theme.panelAlt,
            border: `1px solid ${theme.border}`,
            borderRadius: 6,
            padding: "7px 10px",
            fontSize: 13,
            color: theme.ink,
            outline: "none",
          }}
        />
        <div style={{ display: "flex", gap: 6 }}>
          <input
            value={draftDefinition}
            onChange={(e) => setDraftDefinition(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitDraft()}
            placeholder="Definition (optional)…"
            style={{
              flex: 1,
              background: theme.panelAlt,
              border: `1px solid ${theme.border}`,
              borderRadius: 6,
              padding: "7px 10px",
              fontSize: 12.5,
              color: theme.inkMuted,
              outline: "none",
            }}
          />
          <button
            onClick={submitDraft}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: theme.accentSoft,
              border: `1px solid ${theme.accentDim}`,
              color: theme.accent,
              borderRadius: 6,
              padding: "0 10px",
              fontSize: 12.5,
              cursor: "pointer",
              fontFamily: theme.mono,
              flexShrink: 0,
            }}
          >
            <Plus size={13} /> ADD
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SUBSECTION BLOCK (H2 unit): checklist + free-text note
   ============================================================ */
function Subsection({ sub, onToggle, onAdd, onNotes, onEditDefinition }) {
  return (
    <div style={{ padding: "16px 18px", borderBottom: `1px solid ${theme.borderSoft}` }}>
      <h3
        style={{
          fontFamily: theme.mono,
          fontSize: 11.5,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: theme.inkMuted,
          marginBottom: 10,
          fontWeight: 600,
        }}
      >
        {sub.label}
      </h3>
      <OptionList
        options={sub.options}
        selected={sub.selected}
        onToggle={(opt) => onToggle(sub.id, opt)}
        onAdd={(val, definition) => onAdd(sub.id, val, definition)}
        onEditDefinition={(label) => onEditDefinition(sub.id, label)}
      />
      <textarea
        value={sub.notes}
        onChange={(e) => onNotes(sub.id, e.target.value)}
        placeholder="Additional notes for this item…"
        rows={2}
        style={{
          width: "100%",
          marginTop: 10,
          background: theme.panelAlt,
          border: `1px solid ${theme.border}`,
          borderRadius: 6,
          padding: "8px 10px",
          fontSize: 13,
          color: theme.ink,
          outline: "none",
          resize: "vertical",
          fontFamily: theme.sans,
        }}
      />
    </div>
  );
}

/* ============================================================
   CHARACTER CARD
   ============================================================ */
function CharacterCard({ char, index, fields, onChange, onRemove }) {
  return (
    <div style={{ border: `1px solid ${theme.border}`, borderRadius: 8, background: theme.bg, padding: 14, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontFamily: theme.mono, fontSize: 11.5, color: theme.accent, letterSpacing: "0.06em" }}>
          CHARACTER {String(index + 1).padStart(2, "0")}
        </span>
        <button
          onClick={onRemove}
          style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: theme.danger, cursor: "pointer", fontSize: 12 }}
        >
          <Trash2 size={13} /> Remove
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {fields.map((f) => (
          <div key={f.key} style={{ gridColumn: f.multiline ? "1 / -1" : "auto" }}>
            <label style={{ display: "block", fontFamily: theme.mono, fontSize: 10.5, color: theme.inkFaint, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {f.key}
            </label>
            {f.multiline ? (
              <textarea
                rows={2}
                value={char.values[f.key] || ""}
                onChange={(e) => onChange(f.key, e.target.value)}
                style={{ width: "100%", background: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: 6, padding: "7px 9px", fontSize: 13, color: theme.ink, outline: "none", resize: "vertical", fontFamily: theme.sans }}
              />
            ) : (
              <input
                value={char.values[f.key] || ""}
                onChange={(e) => onChange(f.key, e.target.value)}
                style={{ width: "100%", background: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: 6, padding: "7px 9px", fontSize: 13, color: theme.ink, outline: "none" }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   DEFINITION EDIT MODAL — opened from a selected option's
   expanded definition panel via the "Edit" button.
   ============================================================ */
function DefinitionModal({ label, value, onChange, onSave, onCancel }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10,12,16,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 20,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: theme.panel,
          border: `1px solid ${theme.border}`,
          borderRadius: 10,
          padding: 20,
          width: 420,
          maxWidth: "100%",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontFamily: theme.serif, fontSize: 19, color: theme.ink, marginBottom: 12, fontWeight: 500 }}>
          {label}
        </h3>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
          autoFocus
          placeholder="Write a definition…"
          style={{
            width: "100%",
            background: theme.panelAlt,
            border: `1px solid ${theme.border}`,
            borderRadius: 6,
            padding: "9px 11px",
            fontSize: 13.5,
            color: theme.ink,
            outline: "none",
            resize: "vertical",
            fontFamily: theme.sans,
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
          <button onClick={onCancel} style={btnGhost}>
            Cancel
          </button>
          <button onClick={onSave} style={btnAccent}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   TOP-LEVEL SECTION CONTAINER (H1 unit)
   ============================================================ */
function SectionContainer({ section, index, children }) {
  return (
    <div style={{ background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: 12, marginBottom: 22, overflow: "hidden" }}>
      <div style={{ padding: "18px 20px", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "baseline", gap: 12 }}>
        <span style={{ fontFamily: theme.mono, fontSize: 12, color: theme.accent, letterSpacing: "0.08em" }}>
          SECTION {String(index + 1).padStart(2, "0")}
        </span>
        <h2 style={{ fontFamily: theme.serif, fontSize: 22, color: theme.ink, fontWeight: 500 }}>{section.title}</h2>
      </div>
      {children}
    </div>
  );
}

/* ============================================================
   DOCUMENT GENERATION — pure organization, no invented text
   ============================================================ */
function generateMarkdown(sections) {
  const lines = [];
  sections.forEach((section) => {
    lines.push(`# ${section.title}`, "");
    if (section.isCharacterSection) {
      section.characters.forEach((char, idx) => {
        const name = (char.values["Name"] || "").trim() || `Character ${idx + 1}`;
        lines.push(`## ${name}`, "");
        section.characterFields.forEach((f) => {
          const val = (char.values[f.key] || "").trim();
          if (val) lines.push(`- **${f.key}:** ${val}`);
        });
        lines.push("");
      });
    } else {
      section.subsections.forEach((sub) => {
        lines.push(`## ${sub.label}`, "");
        sub.selected.forEach((label) => {
          const opt = sub.options.find((o) => o.label === label);
          const def = opt && opt.definition ? opt.definition.trim() : "";
          lines.push(def ? `- ${label} : ${def}` : `- ${label}`);
        });
        if (sub.notes.trim()) {
          if (sub.selected.length) lines.push("");
          lines.push(sub.notes.trim());
        }
        lines.push("");
      });
    }
  });
  return lines.join("\n").trim() + "\n";
}

/* ============================================================
   APP
   ============================================================ */
export default function GDDBuilder() {
  const [sections, setSections] = useState(() => withRuntimeState(initialSections));
  const [doc, setDoc] = useState(null);
  const [copied, setCopied] = useState(false);
  const [editModal, setEditModal] = useState(null); // { sectionId, subId, label, value }
  const [importError, setImportError] = useState(null);
  const [importedNotice, setImportedNotice] = useState(false);
  const fileInputRef = useRef(null);

  const updateSub = (sectionId, subId, patch) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : { ...s, subsections: s.subsections.map((sub) => (sub.id !== subId ? sub : { ...sub, ...patch(sub) })) }
      )
    );
  };

  const toggleOption = (sectionId, subId, opt) =>
    updateSub(sectionId, subId, (sub) => ({
      selected: sub.selected.includes(opt) ? sub.selected.filter((o) => o !== opt) : [...sub.selected, opt],
    }));

  const addOption = (sectionId, subId, val, definition = "") =>
    updateSub(sectionId, subId, (sub) =>
      sub.options.some((o) => o.label === val)
        ? {}
        : { options: [...sub.options, { label: val, definition }], selected: [...sub.selected, val] }
    );

  const setNotes = (sectionId, subId, val) => updateSub(sectionId, subId, () => ({ notes: val }));

  const updateOptionDefinition = (sectionId, subId, label, newDefinition) =>
    updateSub(sectionId, subId, (sub) => ({
      options: sub.options.map((o) => (o.label === label ? { ...o, definition: newDefinition } : o)),
    }));

  const openEditModal = (sectionId, subId, label) => {
    const section = sections.find((s) => s.id === sectionId);
    const sub = section.subsections.find((su) => su.id === subId);
    const opt = sub.options.find((o) => o.label === label);
    setEditModal({ sectionId, subId, label, value: opt ? opt.definition : "" });
  };

  const closeEditModal = () => setEditModal(null);

  const saveEditModal = () => {
    updateOptionDefinition(editModal.sectionId, editModal.subId, editModal.label, editModal.value.trim());
    setEditModal(null);
  };

  const addCharacter = (sectionId) =>
    setSections((prev) =>
      prev.map((s) => (s.id !== sectionId ? s : { ...s, characters: [...s.characters, { id: nextId(), values: {} }] }))
    );

  const removeCharacter = (sectionId, charId) =>
    setSections((prev) =>
      prev.map((s) => (s.id !== sectionId ? s : { ...s, characters: s.characters.filter((c) => c.id !== charId) }))
    );

  const updateCharacterField = (sectionId, charId, field, value) =>
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : { ...s, characters: s.characters.map((c) => (c.id !== charId ? c : { ...c, values: { ...c.values, [field]: value } })) }
      )
    );

  const handleGenerate = () => setDoc(generateMarkdown(sections));

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(doc);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const handleDownload = () => {
    const blob = new Blob([doc], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "game-design-document.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ---------- PROJECT EXPORT / IMPORT ----------
     Exports the full editable state (selections, custom-added
     options, edited definitions, notes, characters) as JSON —
     not the generated markdown, which is lossy. Importing this
     file fully re-populates the editor, so the same project can
     be picked back up in a later session. */
  const handleExportProject = () => {
    const payload = { type: "gdd-builder-project", version: 1, exportedAt: new Date().toISOString(), sections };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gdd-builder-project.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    setImportError(null);
    fileInputRef.current?.click();
  };

  // Re-hydrates against the current schema so the file stays usable even if
  // sections/subsections were added or renamed in schema.js since the export.
  const reconcileImportedSections = (imported) => {
    const freshBase = withRuntimeState(initialSections);
    const importedById = new Map(imported.filter((s) => s && s.id).map((s) => [s.id, s]));
    return freshBase.map((freshSection) => {
      const importedSection = importedById.get(freshSection.id);
      if (!importedSection) return freshSection;
      if (freshSection.isCharacterSection) {
        return {
          ...freshSection,
          characters: Array.isArray(importedSection.characters) ? importedSection.characters : freshSection.characters,
        };
      }
      const importedSubsById = new Map((importedSection.subsections || []).filter((su) => su && su.id).map((su) => [su.id, su]));
      return {
        ...freshSection,
        subsections: freshSection.subsections.map((freshSub) => {
          const importedSub = importedSubsById.get(freshSub.id);
          if (!importedSub) return freshSub;
          return {
            ...freshSub,
            options: Array.isArray(importedSub.options) ? importedSub.options : freshSub.options,
            selected: Array.isArray(importedSub.selected) ? importedSub.selected : freshSub.selected,
            notes: typeof importedSub.notes === "string" ? importedSub.notes : freshSub.notes,
          };
        }),
      };
    });
  };

  const handleImportFile = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const importedSections = Array.isArray(parsed) ? parsed : parsed.sections;
        if (!Array.isArray(importedSections)) throw new Error("Missing sections array");
        setSections(reconcileImportedSections(importedSections));
        setImportError(null);
        setImportedNotice(true);
        setTimeout(() => setImportedNotice(false), 2500);
      } catch (err) {
        setImportError("Couldn't read that file — make sure it's a GDD Builder project export (.json).");
      }
    };
    reader.onerror = () => setImportError("Couldn't read that file.");
    reader.readAsText(file);
  };

  /* ---------- DOCUMENT PREVIEW VIEW ---------- */
  if (doc !== null) {
    return (
      <div style={{ minHeight: "100%", background: theme.bg, fontFamily: theme.sans, padding: "32px 16px" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <button
              onClick={() => setDoc(null)}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: theme.inkMuted, cursor: "pointer", fontSize: 13, fontFamily: theme.mono }}
            >
              <ArrowLeft size={15} /> BACK TO EDITOR
            </button>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleCopy} style={btnGhost}>
                {copied ? <Check size={14} color={theme.select} /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
              </button>
              <button onClick={handleDownload} style={btnAccent}>
                <Download size={14} /> Download .md
              </button>
            </div>
          </div>
          <div
            style={{
              background: theme.paper,
              color: theme.paperInk,
              borderRadius: 10,
              padding: "40px 46px",
              fontFamily: theme.serif,
              fontSize: 15.5,
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
            }}
          >
            {doc}
          </div>
        </div>
      </div>
    );
  }

  /* ---------- EDITOR VIEW ---------- */
  return (
    <div style={{ minHeight: "100%", background: theme.bg, fontFamily: theme.sans, padding: "32px 16px 90px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FileText size={20} color={theme.accent} />
            <span style={{ fontFamily: theme.mono, fontSize: 11.5, color: theme.inkFaint, letterSpacing: "0.1em" }}>GDD BUILDER</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleImportFile}
              style={{ display: "none" }}
            />
            <button onClick={handleImportClick} style={btnGhost}>
              <Upload size={14} /> Import
            </button>
            <button onClick={handleExportProject} style={btnGhost}>
              <Save size={14} /> Save Project
            </button>
          </div>
        </div>
        <h1 style={{ fontFamily: theme.serif, fontSize: 34, color: theme.ink, marginBottom: 10, fontWeight: 500 }}>
          Game Design Document
        </h1>
        {importError && (
          <p style={{ fontSize: 13, color: theme.danger, marginBottom: 12 }}>{importError}</p>
        )}
        {importedNotice && (
          <p style={{ fontSize: 13, color: theme.select, marginBottom: 12 }}>Project imported successfully.</p>
        )}
        <p style={{ fontSize: 13, color: theme.inkFaint, marginBottom: 28 }}>
          Click the (i) icon next to an option to see its definition. Select it first to reveal an Edit button there
          too. Use "Save Project" to export your
          work as a file you can "Import" again later to keep editing.
        </p>

        {sections.map((section, i) => (
          <SectionContainer key={section.id} section={section} index={i}>
            {section.isCharacterSection ? (
              <div style={{ padding: 18 }}>
                {section.characters.map((char, idx) => (
                  <CharacterCard
                    key={char.id}
                    char={char}
                    index={idx}
                    fields={section.characterFields}
                    onChange={(field, val) => updateCharacterField(section.id, char.id, field, val)}
                    onRemove={() => removeCharacter(section.id, char.id)}
                  />
                ))}
                <button onClick={() => addCharacter(section.id)} style={{ ...btnAccent, width: "100%", justifyContent: "center" }}>
                  <Plus size={14} /> Add Character
                </button>
              </div>
            ) : (
              section.subsections.map((sub) => (
                <Subsection
                  key={sub.id}
                  sub={sub}
                  onToggle={(subId, opt) => toggleOption(section.id, subId, opt)}
                  onAdd={(subId, val, definition) => addOption(section.id, subId, val, definition)}
                  onNotes={(subId, val) => setNotes(section.id, subId, val)}
                  onEditDefinition={(subId, label) => openEditModal(section.id, subId, label)}
                />
              ))
            )}
          </SectionContainer>
        ))}

        <button onClick={handleGenerate} style={{ ...btnAccent, width: "100%", justifyContent: "center", padding: "13px 0", fontSize: 14.5 }}>
          <FileText size={16} /> Generate Document
        </button>
      </div>

      {editModal && (
        <DefinitionModal
          label={editModal.label}
          value={editModal.value}
          onChange={(val) => setEditModal((prev) => ({ ...prev, value: val }))}
          onSave={saveEditModal}
          onCancel={closeEditModal}
        />
      )}
    </div>
  );
}

const btnGhost = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  background: "none",
  border: `1px solid ${theme.border}`,
  color: theme.inkMuted,
  borderRadius: 7,
  padding: "7px 12px",
  fontSize: 13,
  cursor: "pointer",
};

const btnAccent = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  background: theme.accentSoft,
  border: `1px solid ${theme.accentDim}`,
  color: theme.accent,
  borderRadius: 7,
  padding: "7px 12px",
  fontSize: 13,
  cursor: "pointer",
  fontFamily: theme.mono,
};
