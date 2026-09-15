// Application Service: Identity
import repo from "../../infrastructure/persistence/Repository.js";
import { createAccount, safeAccount } from "../../domain/identity/Account.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "orisma_live_secret_change_me";

export class AuthService {
  list() { return repo.findAllAccounts().map(safeAccount); }

  async register(data) {
    const accounts = repo.findAllAccounts();
    if (accounts.some(a => a.email.toLowerCase() === String(data.email).toLowerCase())) throw new Error("Email sudah terdaftar");
    const acc = createAccount(data);
    accounts.push(acc);
    repo.saveAccounts(accounts);
    return safeAccount(acc);
  }

  async login(email, password) {
    const accounts = repo.findAllAccounts();
    // lazy init seed hashes if empty
    for (const acc of accounts) if (!acc.passwordHash) { acc.passwordHash = bcrypt.hashSync(acc.email.startsWith("admin") ? "admin" : "staff", 10); }
    const acc = accounts.find(a => a.email.toLowerCase() === String(email).toLowerCase());
    if (!acc || !bcrypt.compareSync(String(password), acc.passwordHash)) throw new Error("Email atau password salah");
    const token = jwt.sign({ id: acc.id, email: acc.email, role: acc.role, name: acc.name }, SECRET, { expiresIn: "7d" });
    return { token, user: safeAccount(acc) };
  }

  update(id, patch) {
    const accounts = repo.findAllAccounts();
    const acc = accounts.find(a => String(a.id) === String(id));
    if (!acc) throw new Error("Akun tidak ditemukan");
    if (patch.name) acc.name = String(patch.name).trim();
    if (patch.email) acc.email = String(patch.email).toLowerCase();
    if (patch.role) acc.role = patch.role;
    if (patch.password) acc.passwordHash = bcrypt.hashSync(String(patch.password), 10);
    repo.saveAccounts(accounts);
    return safeAccount(acc);
  }

  remove(id) {
    const accounts = repo.findAllAccounts();
    if (accounts.length <= 1) throw new Error("Keep at least one account");
    const filtered = accounts.filter(a => String(a.id) !== String(id));
    repo.saveAccounts(filtered);
    return filtered.length;
  }
}

export default new AuthService();
