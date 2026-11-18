import "server-only";
import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { cookies, headers } from "next/headers";
import { connection } from "next/server";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { Member } from "@/lib/community/types";

const scrypt = promisify(scryptCallback);
const cookieName = "frontline_session";
export const publicMember = {
  id: true,
  name: true,
  bio: true,
  specialty: true,
} as const;

function digest(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string | null) {
  const [salt, encoded] = (stored ?? "").split(":");
  // Perform the same expensive work for unknown accounts.
  const actual = (await scrypt(
    password,
    salt || "frontline-unknown-account",
    64,
  )) as Buffer;
  const expected = encoded ? Buffer.from(encoded, "hex") : Buffer.alloc(64);
  return (
    Boolean(stored) &&
    actual.length === expected.length &&
    timingSafeEqual(actual, expected)
  );
}

export const getCurrentMember = cache(async (): Promise<Member | null> => {
  await connection();
  const token = (await cookies()).get(cookieName)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const session = await prisma.session.findUnique({
    where: { id: digest(token) },
    select: { expiresAt: true, user: { select: publicMember } },
  });
  return session && session.expiresAt > new Date() ? session.user : null;
});

export async function startSession(userId: number) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
  await prisma.session.create({
    data: { id: digest(token), userId, expiresAt },
  });
  const requestHeaders = await headers();
  const secure =
    requestHeaders.get("x-forwarded-proto") === "https" ||
    new URL(requestHeaders.get("origin") || "http://localhost").protocol ===
      "https:";
  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    expires: expiresAt,
  });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (token) await prisma.session.deleteMany({ where: { id: digest(token) } });
  jar.delete(cookieName);
}

export async function checkAuthRateLimit(key: string) {
  const id = digest(key);
  await prisma.authThrottle.upsert({
    where: { key: id },
    create: {
      key: id,
      attempts: 0,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
    update: {},
  });
  await prisma.authThrottle.updateMany({
    where: { key: id, expiresAt: { lt: new Date() } },
    data: { attempts: 0, expiresAt: new Date(Date.now() + 15 * 60 * 1000) },
  });
  const record = await prisma.authThrottle.update({
    where: { key: id },
    data: { attempts: { increment: 1 } },
  });
  if (record.attempts > 10)
    throw new Error("Too many attempts. Please try again in 15 minutes.");
}
