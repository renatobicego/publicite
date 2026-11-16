/*
Utilidades para recorrer Hacete Amigo y regalos contra el server LOCAL con
MercadoPago simulado, entrando a las cuentas de prueba (seed-test-accounts.ts)
por la API. Las sesiones se crean en la instancia de DESARROLLO de Clerk
(POST /v1/sessions, que sólo existe ahí) y se revocan al terminar.

Se niega si .env.qa apunta a producción, si la clave de Clerk no es sk_test_ o
si MP_MOCK no está activo.
*/
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const SERVER_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(path.join(SERVER_DIR, 'package.json'));
export const mongoose = require('mongoose');

const env = Object.fromEntries(
  readFileSync(path.join(SERVER_DIR, '.env.qa'), 'utf8')
    .split(/\r?\n/)
    .filter((line) => /^[A-Z0-9_]+=/.test(line))
    .map((line) => {
      const i = line.indexOf('=');
      return [line.slice(0, i), line.slice(i + 1).replace(/^["']|["']$/g, '')];
    }),
);

const CLERK_KEY = env.CLERK_SECRET_KEY ?? '';
if (!CLERK_KEY.startsWith('sk_test_')) throw new Error('Clerk no es de desarrollo: no sigo.');
if ((env.DATABASE_URI ?? '').includes('publicitecluster')) throw new Error('.env.qa apunta a prod.');
if (env.MP_MOCK !== 'true') throw new Error('MP_MOCK no está activo en .env.qa.');

const GRAPHQL = 'http://localhost:3002/graphql';
export const emailOf = (key) => `${key}+clerk_test@example.com`;

async function clerk(method, pathname, body) {
  const response = await fetch(`https://api.clerk.com/v1${pathname}`, {
    method,
    headers: { Authorization: `Bearer ${CLERK_KEY}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Clerk ${method} ${pathname}: ${response.status} ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}

const sessions = new Map(); // key -> { sessionId, jwt, exp }

export async function login(key) {
  if (sessions.has(key)) return sessions.get(key);
  const [user] = await clerk('GET', `/users?email_address=${encodeURIComponent(emailOf(key))}`);
  if (!user) throw new Error(`No existe en Clerk: ${emailOf(key)}`);
  const session = await clerk('POST', '/sessions', { user_id: user.id });
  const entry = { sessionId: session.id, clerkId: user.id, mongoId: user.public_metadata?.mongoId, jwt: null, exp: 0 };
  sessions.set(key, entry);
  return entry;
}

async function token(key) {
  const entry = await login(key);
  if (!entry.jwt || Date.now() > entry.exp) {
    const { jwt } = await clerk('POST', `/sessions/${entry.sessionId}/tokens`, {});
    entry.jwt = jwt;
    entry.exp = Date.now() + 40_000; // duran 60 s
  }
  return entry.jwt;
}

export function claims(jwt) {
  return JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString());
}
export const tokenOf = token;

export async function logoutAll() {
  for (const entry of sessions.values()) {
    await clerk('POST', `/sessions/${entry.sessionId}/revoke`).catch(() => {});
  }
  sessions.clear();
}

/** Ejecuta una operación como `key` (null = sin sesión). Devuelve { data, error }. */
export async function gql(key, query, variables = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (key) headers.authorization = await token(key);
  const response = await fetch(GRAPHQL, { method: 'POST', headers, body: JSON.stringify({ query, variables }) });
  const json = await response.json();
  // Igual que el cliente (getProductionErrorMessage): el texto está en originalError.
  const messageOf = (e) => {
    const original = e.extensions?.originalError;
    const m = typeof original?.message === 'string' ? original.message : original?.message?.message;
    return (Array.isArray(m) ? m.join('. ') : m) ?? e.message;
  };
  const error = json.errors?.map(messageOf).join(' | ') ?? null;
  return { data: json.data ?? null, error };
}

// --- Reporte -------------------------------------------------------------
export const results = [];
export async function check(name, fn) {
  try {
    const detail = await fn();
    results.push({ ok: true, name, detail });
    console.log(`  ✔ ${name}${detail ? ` — ${detail}` : ''}`);
  } catch (error) {
    results.push({ ok: false, name, detail: error.message });
    console.log(`  ✘ ${name} — ${error.message}`);
  }
}
export function section(title) {
  console.log(`\n${title}`);
}
export function assert(condition, message) {
  if (!condition) throw new Error(message);
}
export function summary() {
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} OK`);
  for (const f of failed) console.log(`  ✘ ${f.name} — ${f.detail}`);
  return failed.length;
}

// --- Base ---------------------------------------------------------------
let connection;
export async function db() {
  if (!connection) {
    await mongoose.connect(env.DATABASE_URI);
    connection = mongoose.connection.db;
  }
  return connection;
}
export async function closeDb() {
  if (connection) await mongoose.disconnect();
}
