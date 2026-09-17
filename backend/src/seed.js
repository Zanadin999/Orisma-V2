// Seed: populates data.json with default records on first boot.
// Extracted from server.js to keep the entry point clean (SRP).
import bcrypt from 'bcryptjs';

export function seedDefaults(repo) {
  const data = repo.read();
  let changed = false;

  if (!data.units || data.units.length === 0) {
    data.units = [
      {
        id: 1,
        name: 'Honda Vario 125',
        category: 'honda',
        year: 2021,
        plate: 'B 3311 FQ',
        unitPrice: 14500000,
        repairFee: 900000,
        additionalCost1: 130000,
        additionalCost2: 0,
        additionalCost3: 10000,
        ownerName: 'Budi Santoso',
        ownerAddress: 'Jl. Kenanga No. 12, Depok',
        notes: 'Pajak hidup s.d. Mar 2027',
        dateAcquired: '2026-07-02',
        status: 'available',
        acquisitionSource: 'purchase',
      },
    ];
    changed = true;
  }

  if (!data.accounts || data.accounts.length === 0) {
    data.accounts = [
      {
        id: 1,
        name: 'Admin',
        email: 'admin@orisma.local',
        role: 'admin',
        passwordHash: bcrypt.hashSync('admin', 10),
        createdAt: new Date().toISOString().slice(0, 10),
      },
      {
        id: 2,
        name: 'Staff Gudang',
        email: 'staff@orisma.local',
        role: 'staff',
        passwordHash: bcrypt.hashSync('staff', 10),
        createdAt: new Date().toISOString().slice(0, 10),
      },
    ];
    changed = true;
  }

  if (!data.settings || Object.keys(data.settings).length === 0) {
    data.settings = {
      shopName: 'Showroom Orisma',
      shopShortName: 'Orisma',
      zakatRate: 2.5,
      tenagaDefault: 130000,
      komisiDefault: 0,
      lainDefault: 10000,
      language: 'id',
      agingWarn: 30,
      agingCritical: 60,
    };
    changed = true;
  }

  // Ensure all accounts have hashed passwords (migration guard)
  for (const acc of data.accounts) {
    if (!acc.passwordHash) {
      acc.passwordHash = bcrypt.hashSync(
        acc.email.startsWith('admin') ? 'admin' : 'staff',
        10
      );
      changed = true;
    }
  }

  if (changed) repo.write(data);
}
