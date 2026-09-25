import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET() {
  try {
    const { env } = await getCloudflareContext({
      async: true
    });

    return NextResponse.json({
      success: true,
      withdrawals: []
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "No se pudieron obtener los retiros."
      },
      {
        status: 500
      }
    );
  }
}
