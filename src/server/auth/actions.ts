"use server";

import { z } from "zod";

import { prisma } from "@/server/db/prisma";

import { formatStoredPassword, hashPassword, verifyPassword } from "./password";
import { createSession, destroySession } from "./session";

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(120),
  password: z.string().min(6),
  role: z.enum(["L2", "LEAD", "L1_TS"]).optional().default("L2"),
  teamKey: z.string().min(1).max(200).optional(),
});

export async function registerAction(input: z.infer<typeof registerSchema>) {
  const data = registerSchema.parse(input);

  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existing) {
    throw new Error("Email already registered");
  }

  const { salt, hash } = hashPassword(data.password);
  const passwordHash = formatStoredPassword(salt, hash);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      passwordHash,
      role: data.role,
      teamKey: data.teamKey ?? null,
    },
  });

  await createSession(user.id);
  return { ok: true };
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function loginAction(input: z.infer<typeof loginSchema>) {
  const data = loginSchema.parse(input);
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) throw new Error("Invalid credentials");

  const ok = verifyPassword(data.password, user.passwordHash);
  if (!ok) throw new Error("Invalid credentials");

  await createSession(user.id);
  return { ok: true };
}

export async function logoutAction() {
  await destroySession();
  return { ok: true };
}
