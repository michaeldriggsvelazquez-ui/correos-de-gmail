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
      balance: {
        amount: 0,
        currency: "USDT"
      },
      withdrawal: {
        available: false,
        minimum: 0
      }
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "No se pudo obtener el balance."
      },
      {
        status: 500
      }
    );
  }
}
