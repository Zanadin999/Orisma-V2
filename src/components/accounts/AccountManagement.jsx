import React, { useState } from "react";
import { useAuth, ROLES } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";

function RoleBadge({ role }) {
  const colors = { admin: "bg-red-50 text-red-700", manager: "bg-violet-50 text-violet-700", staff: "bg-blue-50 text-blue-700", sales: "bg-emerald-50 text-emerald-700" };
  return <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${colors[role] || "bg-neutral-100 text-neutral-600"}`}>{ROLES.find(r=>r.value===role)?.label || role}</span>;
}

export default function AccountManagement() {
  const { accounts, currentUser, addAccount, updateAccount, deleteAccount, switchUser } = useAuth();
  const { settings } = useSettings();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", role: "staff", password: "" });
  const [error, setError] = useState("");

  function openAdd() { setForm({ name: "", email: "", role: "staff", password: "" }); setError(""); setShowAdd(true); }
  function openEdit(acc) { setEditing(acc); setForm({ name: acc.name, email: acc.email, role: acc.role, password: acc.password }); setError(""); }
  function handleAdd() {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) { setError("Nama, email, password wajib diisi."); return; }
    if (accounts.some(a => a.email.toLowerCase() === form.email.toLowerCase())) { setError("Email sudah terdaftar."); return; }
    addAccount(form); setShowAdd(false);
  }
  function handleUpdate() {
    if (!form.name.trim() || !form.email.trim()) { setError("Nama & email wajib."); return; }
    updateAccount(editing.id, { name: form.name.trim(), email: form.email.trim().toLowerCase(), role: form.role, password: form.password });
    setEditing(null);
  }

  return (
    <>
      <div className="flex items-baseline justify-between mb-1">
        <h1 className="text-2xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Account Management</h1>
        <div className="text-sm text-[#7c8783]">{settings.shopName} • {accounts.length} akun</div>
      </div>
      <p className="text-[13.5px] text-[#7c8783] mb-5">Kelola akun staff — role menentukan akses menu. Data disimpan lokal (localStorage).</p>

      <div className="bg-white border border-[#e6e4dd] rounded-xl p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[13px] font-semibold">Akun Aktif: {currentUser.name} <RoleBadge role={currentUser.role} /></div>
          <div className="flex items-center gap-2">
            <select value={currentUser.id} onChange={e => switchUser(Number(e.target.value))} className="border border-[#e6e4dd] rounded-lg px-2 py-1.5 text-[12px] bg-white">
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name} — {a.email}</option>)}
            </select>
            <button onClick={openAdd} className="bg-[#0e3b3a] text-white rounded-lg px-3 py-1.5 text-[12px] font-medium">+ Tambah Akun</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#e6e4dd] text-[11px] text-[#7c8783] text-left">
                <th className="py-2 pr-3">Nama</th><th className="py-2 pr-3">Email</th><th className="py-2 pr-3">Role</th><th className="py-2 pr-3">Dibuat</th><th className="py-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(acc => (
                <tr key={acc.id} className={`border-b border-[#e6e4dd] ${acc.id===currentUser.id ? "bg-[#f6f5f1]" : ""}`}>
                  <td className="py-2.5 pr-3 font-medium">{acc.name} {acc.id===currentUser.id && <span className="text-[10px] text-[#7c8783]">• aktif</span>}</td>
                  <td className="py-2.5 pr-3 text-[#7c8783]">{acc.email}</td>
                  <td className="py-2.5 pr-3"><RoleBadge role={acc.role} /></td>
                  <td className="py-2.5 pr-3 text-[#7c8783] text-[12px]">{acc.createdAt}</td>
                  <td className="py-2.5 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(acc)} className="text-[11px] border border-[#e6e4dd] rounded-lg px-2.5 py-1 hover:bg-[#f6f5f1]">Edit</button>
                      <button onClick={() => { const r = deleteAccount(acc.id); if (r?.error) alert(r.error); }} className="text-[11px] border border-red-200 text-red-600 rounded-lg px-2.5 py-1 hover:bg-red-50">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-3 text-[11px]">
          {ROLES.map(r => (
            <div key={r.value} className="border border-[#e6e4dd] rounded-lg p-3">
              <div className="font-semibold mb-1 flex items-center gap-1.5"><RoleBadge role={r.value} /></div>
              <div className="text-[#7c8783]">{r.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {(showAdd || editing) && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50" onClick={() => { setShowAdd(false); setEditing(null); }}>
          <div className="bg-white rounded-xl p-5 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="text-[14px] font-semibold mb-4">{editing ? "Edit Akun" : "Tambah Akun"}</div>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-[12px] mb-3">{error}</div>}
            <div className="space-y-3">
              <div><label className="text-[11px] text-[#7c8783]">Nama</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] mt-1" placeholder="Nama lengkap" /></div>
              <div><label className="text-[11px] text-[#7c8783]">Email</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] mt-1" placeholder="email@orisma.local" /></div>
              <div><label className="text-[11px] text-[#7c8783]">Password</label><input type="text" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] mt-1" placeholder="••••••••" /></div>
              <div><label className="text-[11px] text-[#7c8783]">Role</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] mt-1 bg-white">
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label} — {r.desc}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => { setShowAdd(false); setEditing(null); }} className="border border-[#e6e4dd] rounded-lg px-4 py-2 text-[12px]">Batal</button>
                <button onClick={editing ? handleUpdate : handleAdd} className="bg-[#0e3b3a] text-white rounded-lg px-4 py-2 text-[12px] font-medium">{editing ? "Simpan" : "Tambah"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
