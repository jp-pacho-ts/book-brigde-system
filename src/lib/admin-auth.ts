import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const ADMIN_SESSION_COOKIE = "bookbridge_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const HASH_ALGORITHM = "scrypt";

export type AdminSession = {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN";
};

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? process.env.DATABASE_URL ?? "bookbridge-local-admin-secret";
}

function signSessionPayload(payload: string) {
  return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

function safeEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function createSessionToken(adminId: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `${adminId}.${expiresAt}`;
  const signature = signSessionPayload(payload);

  return `${payload}.${signature}`;
}

function verifySessionToken(token: string) {
  const [adminId, expiresAtValue, signature] = token.split(".");

  if (!adminId || !expiresAtValue || !signature) {
    return null;
  }

  const expiresAt = Number(expiresAtValue);

  if (!Number.isFinite(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) {
    return null;
  }

  const payload = `${adminId}.${expiresAtValue}`;
  const expectedSignature = signSessionPayload(payload);

  if (!safeEquals(signature, expectedSignature)) {
    return null;
  }

  return adminId;
}

export function hashPassword(password: string, salt = crypto.randomBytes(16).toString("base64url")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("base64url");
  return `${HASH_ALGORITHM}:${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, hash] = storedHash.split(":");

  if (algorithm !== HASH_ALGORITHM || !salt || !hash) {
    return false;
  }

  const candidateHash = crypto.scryptSync(password, salt, 64).toString("base64url");
  return safeEquals(candidateHash, hash);
}

export async function setAdminSession(adminId: string) {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, createSessionToken(adminId), {
    httpOnly: true,
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const adminId = verifySessionToken(token);

  if (!adminId) {
    return null;
  }

  return prisma.adminUser.findUnique({
    where: { id: adminId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  });
}

export async function requireAdminSession() {
  const admin = await getAdminSession();

  if (!admin) {
    return null;
  }

  return admin;
}

export function isSuperAdmin(admin: AdminSession | null) {
  return admin?.role === "SUPER_ADMIN";
}
