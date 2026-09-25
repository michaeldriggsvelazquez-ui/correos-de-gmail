import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/cloudflare/auth";

type WithdrawalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "completed";

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
          error: "ID de retiro no válido."
        },
        {
          status: 400
        }
      );
    }

    const status: WithdrawalStatus = "pending";

    return NextResponse.json({
      success: true,
      withdrawal: {
        id,
        amount: 0,
        currency: "USDT",
        status,
        createdAt: null,
        completedAt: null
      }
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "No se pudo obtener el retiro."
      },
      {
        status: 500
      }
    );
  }
        }
