import React, { useState } from "react";
import { X, Pencil, Trash2, Check, Plus } from "lucide-react";
import { useCategoriesContext } from "../../context/CategoriesContext";

export default function BrandManagerModal({ onClose }) {
  const { categories: brands, addCategory, renameCategory, deleteCategory } = useCategoriesContext();
  const [editingKey, setEditingKey] = useState(null);
  const [draftLabel, setDraftLabel] = useState("");
  const [newLabel, setNewLabel] = useState("");

  function startEditing(b) {
    setEditingKey(b.key);
    setDraftLabel(b.label);
  }
  function saveEditing() {
    if (editingKey) renameCategory(editingKey, draftLabel);
    setEditingKey(null);
  }
  function handleAdd(e) {
    e.preventDefault();
    if (!newLabel.trim()) return;
    addCategory(newLabel);
    setNewLabel("");
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="text-[13px] font-semibold">Manage brands</div>
          <button onClick={onClose} className="text-[#7c8783]"><X size={16} /></button>
        </div>

        <div className="space-y-1.5 mb-4 max-h-64 overflow-y-auto">
          {brands.map(b => (
            <div key={b.key} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-neutral-50">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${b.color.split(" ")[0]}`} />
              {editingKey === b.key ? (
                <input
                  autoFocus
                  value={draftLabel}
                  onChange={e => setDraftLabel(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && saveEditing()}
                  className="flex-1 border border-[#e6e4dd] rounded-md px-2 py-1 text-[13px] outline-none"
                />
              ) : (
                <span className="flex-1 text-[13px]">{b.label}</span>
              )}
              {editingKey === b.key ? (
                <button onClick={saveEditing} className="text-teal-700" title="Save"><Check size={14} /></button>
              ) : (
                <button onClick={() => startEditing(b)} className="text-[#a8a49a] hover:text-black" title="Rename">
                  <Pencil size={13} />
                </button>
              )}
              <button onClick={() => deleteCategory(b.key)} className="text-[#a8a49a] hover:text-red-500" title="Delete brand">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          {brands.length === 0 && (
            <div className="text-[13px] text-[#7c8783] px-2 py-3">No brands yet — add one below.</div>
          )}
        </div>

        <p className="text-[11.5px] text-[#7c8783] mb-3">
          Deleting a brand doesn't delete its units — they move to "Lainnya".
        </p>

        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            placeholder="New brand name…"
            className="flex-1 border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] outline-none"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 bg-[#0e3b3a] text-white text-[13px] font-medium rounded-lg px-3 py-2"
          >
            <Plus size={14} /> Add
          </button>
        </form>
      </div>
    </div>
  );
}
