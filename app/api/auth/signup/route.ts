import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { randomUUID, scryptSync, randomBytes } from "node:crypto";
import {
  isValidEmail,
  normalizeEmail,
  isValidPassword
} from "@/lib/utils/validation";

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");

  const hash = scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${hash}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = normalizeEmail(body.email ?? "");
    const password = body.password ?? "";

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Correo electrónico no válido." },
        { status: 400 }
      );
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres." },
        { status: 400 }
      );
    }

    const { env } = await getCloudflareContext({
      async: true
    });

    const existingUser = await env.DB.prepare(
      "SELECT id FROM users WHERE email = ? LIMIT 1"
    )
      .bind(email)
      .first();

    if (existingUser) {
      return NextResponse.json(
        { error: "Esta cuenta ya existe." },
        { status: 409 }
      );
    }

    const userId = randomUUID();
    const passwordHash = hashPassword(password);
    const now = Math.floor(Date.now() / 1000);

    await env.DB.prepare(
      "INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)"
    )
      .bind(userId, email, passwordHash, now)
      .run();

    return NextResponse.json(
      {
        success: true,
        user: {
          id: userId,
          email
        }
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "No se pudo crear la cuenta." },
      { status: 500 }
    );
  }
      }
