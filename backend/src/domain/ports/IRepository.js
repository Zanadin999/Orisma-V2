/**
 * IRepository — Port (contract) for data persistence.
 * Any infrastructure adapter used by application services must implement these methods.
 *
 * @typedef {Object} IRepository
 * @property {() => Object[]} findAllUnits
 * @property {(units: Object[]) => void} saveUnits
 * @property {() => Object[]} findAllTransactions
 * @property {(txs: Object[]) => void} saveTransactions
 * @property {() => Object[]} findAllAccounts
 * @property {(accounts: Object[]) => void} saveAccounts
 * @property {() => Object} getSettings
 * @property {(settings: Object) => void} saveSettings
 */

// This file documents the contract. JsonRepository in infrastructure/persistence
// fulfills this contract. If you ever swap to a real database, implement this
// interface in a new adapter and inject it in app.js — no service files change.
export {};
