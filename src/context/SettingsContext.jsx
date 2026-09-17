import React, { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "orisma_settings_v1";

const DEFAULTS = {
  shopName: "Showroom Orisma",
  shopShortName: "Orisma",
  zakatRate: 2.5, // percent for UI
  repairFeeDefault: 0,
  tenagaDefault: 130000,
  komisiDefault: 0,
  lainDefault: 10000,
  language: "id", // id | en
  agingWarn: 30,
  agingCritical: 60,
};

import { TRANSLATIONS } from '../utils/translations.js';

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULTS, ...parsed };
    }
  } catch {}
  return { ...DEFAULTS };
}

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => loadSettings());

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch {}
  }, [settings]);

  // also sync zakat rate to legacy keys for pricing/exportImport fallback
  useEffect(() => {
    try { localStorage.setItem("orisma_zakat_rate", String(settings.zakatRate)); } catch {}
  }, [settings.zakatRate]);

  const update = (patch) => setSettings(s => ({ ...s, ...patch }));
  const t = (key) => (TRANSLATIONS[settings.language] || TRANSLATIONS.id)[key] || key;
  const zakatFraction = Number(settings.zakatRate) / 100;

  return (
    <SettingsContext.Provider value={{ settings, update, t, zakatFraction }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be inside SettingsProvider");
  return ctx;
}

export function getStoredZakatFraction() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s.zakatRate != null) return Number(s.zakatRate) / 100;
    }
    const legacy = localStorage.getItem("orisma_zakat_rate");
    if (legacy) return Number(legacy) / 100;
  } catch {}
  return 0.025;
}

export function getStoredDefaults() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      return {
        repairFee: Number(s.repairFeeDefault ?? s.costUnitDefault ?? 0),
        tenaga: Number(s.tenagaDefault ?? 130000),
        komisi: Number(s.komisiDefault ?? 0),
        lain: Number(s.lainDefault ?? 10000),
      };
    }
  } catch {}
  return { repairFee: 0, tenaga: 130000, komisi: 0, lain: 10000 };
}

export { DEFAULTS };
