import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/cloudflare/auth";

type NotificationType =
  | "account_submitted"
  | "account_approved"
  | "account_rejected"
  | "withdrawal_created"
  | "balance_updated";

const notificationMessages: Record<NotificationType, string> = {
  account_submitted:
    "Tu cuenta fue enviada correctamente y está pendiente de revisión.",

  account_approved:
    "Tu cuenta ha sido revisada y aceptada.",

  account_rejected:
    "Tu cuenta ha sido rechazada. Revisa la información enviada y vuelve a intentarlo.",

  withdrawal_created:
    "Se ha registrado un nuevo movimiento de retiro en tu cuenta.",

  balance_updated:
    "Tu balance ha sido actualizado."
};

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

export async function POST(request: Request) {
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

    const body = await request.json();
    const type = body.type as NotificationType;

    if (!type || !notificationMessages[type]) {
      return NextResponse.json(
        {
          success: false,
          error: "Tipo de notificación no válido."
        },
        {
          status: 400
        }
      );
    }

    return NextResponse.json({
      success: true,
      notification: {
        type,
        message: notificationMessages[type],
        read: false
      }
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "No se pudo crear la notificación."
      },
      {
        status: 400
      }
    );
  }
    }
