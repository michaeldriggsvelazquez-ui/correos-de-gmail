import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { normalizeEmail } from "@/lib/utils/validation";

const ADMIN_EMAIL = "michaeldriggsvelazquez@gmail.com";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = normalizeEmail(body.email ?? "");
    const password = String(body.password ?? "");

    const { env } = await getCloudflareContext({
      async: true
    });

    const adminPassword = env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "La autenticación administrativa no está configurada."
        },
        {
          status: 500
        }
      );
    }

    if (email !== ADMIN_EMAIL || password !== adminPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Credenciales administrativas incorrectas."
        },
        {
          status: 401
        }
      );
    }

    return NextResponse.json({
      success: true,
      admin: {
        email: ADMIN_EMAIL
      }
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "No se pudo procesar la autenticación administrativa."
      },
      {
        status: 400
      }
    );
  }
}
