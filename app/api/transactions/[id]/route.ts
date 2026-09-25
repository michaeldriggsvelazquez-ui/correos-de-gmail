import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/cloudflare/auth";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
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

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID de transacción no válido."
        },
        {
          status: 400
        }
      );
    }

    return NextResponse.json({
      success: true,
      transaction: {
        id,
        type: "credit",
        amount: 0,
        currency: "USDT",
        description: "Movimiento interno",
        status: "completed"
      }
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "No se pudo obtener la transacción."
      },
      {
        status: 500
      }
    );
  }
        }
