import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/cloudflare/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "No autenticado."
        },
        {
          status: 401
        }
      );
    }

    return NextResponse.json({
      success: true,
      accounts: []
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "No se pudo obtener el historial de cuentas."
      },
      {
        status: 500
      }
    );
  }
}
