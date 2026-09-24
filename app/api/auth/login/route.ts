import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { normalizeEmail } from "@/lib/utils/validation";

function verifyPassword(password: string, storedHash: string) {
  const [salt, key] = storedHash.split(":");

  if (!salt || !key) {
    return false;
  }

  const derivedKey = scryptSync(password, salt, 64);
  const storedKey = Buffer.from(key, "hex");

  if (derivedKey.length !== storedKey.length) {
    return false;
  }

  return timingSafeEqual(derivedKey, storedKey);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = normalizeEmail(body.email ?? "");
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Correo y contraseña son obligatorios." },
        { status: 400 }
      );
    }

    const { env } = await getCloudflareContext({
      async: true
    });

    const user = await env.DB.prepare(
      "SELECT id, email, password_hash FROM users WHERE email = ? LIMIT 1"
    )
      .bind(email)
      .first<{
        id: string;
        email: string;
        password_hash: string;
      }>();

    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json(
        { error: "Correo o contraseña incorrectos." },
        { status: 401 }
      );
    }

    const sessionId = randomUUID();
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + 60 * 60 * 24 * 30;

    await env.DB.prepare(
      "INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)"
    )
      .bind(sessionId, user.id, expiresAt, now)
      .run();

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      }
    });

    response.cookies.set("session_id", sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "No se pudo iniciar sesión." },
      { status: 500 }
    );
  }
      }
