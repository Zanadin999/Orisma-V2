import React, { useState } from "react";
import { X } from "lucide-react";
import UnitFormFields, { unitToForm } from "./UnitFormFields";

export default function EditUnitModal({ unit, onClose, onSubmit }) {
  const [form, setForm] = useState(unitToForm(unit));

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }
  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl w-full max-w-sm p-5 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="text-[13px] font-semibold">Edit unit</div>
          <button onClick={onClose} className="text-[#7c8783]"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <UnitFormFields form={form} onChange={handleChange} />
          <button
            type="submit"
            className="w-full bg-[#0e3b3a] text-white text-[13px] font-medium rounded-lg py-2.5 mt-1 hover:bg-[#0b302f]"
          >
            Save changes
          </button>
        </form>
      </div>
    </div>
  );
}
