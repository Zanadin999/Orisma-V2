import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";

export default function LoginView() {
  const { login } = useAuth();
  const { settings } = useSettings();
  const [email, setEmail] = useState("admin@orisma.local");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res?.error) setError(res.error);
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f6f5f1] px-4">
      <div className="bg-white border border-[#e6e4dd] rounded-xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {settings.shopName.split(" ")[0]} <span className="text-teal-600">{settings.shopName.split(" ").slice(1).join(" ")}</span>
          </div>
          <div className="text-[12px] text-[#7c8783] mt-1">Sign in to continue</div>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-[12px] mb-3">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[11px] text-[#7c8783]">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@orisma.local" className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] mt-1 outline-none focus:border-teal-600" />
          </div>
          <div>
            <label className="text-[11px] text-[#7c8783]">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full border border-[#e6e4dd] rounded-lg px-3 py-2 text-[13px] mt-1 outline-none focus:border-teal-600" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#0e3b3a] text-white rounded-lg py-2.5 text-[13px] font-medium hover:bg-[#143a38] disabled:opacity-60">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div className="text-[11px] text-[#7c8783] mt-4 text-center">
          Demo: admin@orisma.local / admin • staff@orisma.local / staff
        </div>
      </div>
    </div>
  );
}
