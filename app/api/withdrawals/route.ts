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
