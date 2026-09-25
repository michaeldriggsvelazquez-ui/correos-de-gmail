import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET() {
  try {
    const { env } = await getCloudflareContext({
      async: true
    });

    const result = await env.DB.prepare(
      `
      SELECT
        id,
        email,
        created_at
      FROM users
      ORDER BY created_at DESC
      `
    ).all();

    return NextResponse.json({
      success: true,
      users: result.results ?? []
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "No se pudieron obtener los usuarios."
      },
      {
        status: 500
      }
    );
  }
      }
