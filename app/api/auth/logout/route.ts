import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(request: Request) {
  try {
    const { env } = await getCloudflareContext({
      async: true
    });

    const cookieHeader = request.headers.get("cookie") ?? "";

    const sessionMatch = cookieHeader.match(
      /(?:^|;\s*)session_id=([^;]+)/
    );

    const sessionId = sessionMatch?.[1];

    if (sessionId) {
      await env.DB.prepare(
        "DELETE FROM sessions WHERE id = ?"
      )
        .bind(sessionId)
        .run();
    }

    const response = NextResponse.json({
      success: true
    });

    response.cookies.set("session_id", "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "No se pudo cerrar la sesión." },
      { status: 500 }
    );
  }
  }
