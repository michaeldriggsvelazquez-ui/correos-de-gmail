import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET() {
  try {
    const { env } = await getCloudflareContext({
      async: true
    });

    return NextResponse.json({
      success: true,
      notifications: []
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "No se pudieron obtener las notificaciones."
      },
      {
        status: 500
      }
    );
  }
}
