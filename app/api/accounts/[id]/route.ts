import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/cloudflare/auth";

type AccountStatus = "pending" | "approved" | "rejected";

const statusMessages: Record<AccountStatus, string> = {
  pending:
    "Tu cuenta está pendiente de revisión.",

  approved:
    "Tu cuenta ha sido revisada y aceptada.",

  rejected:
    "Tu cuenta ha sido rechazada. Revisa la información enviada y vuelve a intentarlo."
};

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
          error: "ID de cuenta no válido."
        },
        {
          status: 400
        }
      );
    }

    const status: AccountStatus = "pending";

    return NextResponse.json({
      success: true,
      account: {
        id,
        status
      },
      message: statusMessages[status]
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "No se pudo obtener el estado de la cuenta."
      },
      {
        status: 500
      }
    );
  }
            }
