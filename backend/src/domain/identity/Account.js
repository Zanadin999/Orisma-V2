// Domain Entity: Account (Identity context)
import bcrypt from "bcryptjs";

export function createAccount({ name, email, role, password }) {
  if (!name?.trim() || !email?.trim() || !password) throw new Error("Nama, email, password wajib");
  return {
    id: Date.now(),
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    role: role || "staff",
    passwordHash: bcrypt.hashSync(String(password), 10),
    createdAt: new Date().toISOString().slice(0, 10),
  };
}

export function verifyPassword(account, plain) {
  return bcrypt.compareSync(String(plain), account.passwordHash);
}

export function safeAccount(account) {
  const { passwordHash, ...safe } = account;
  return safe;
}
