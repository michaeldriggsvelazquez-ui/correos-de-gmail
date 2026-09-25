import { NextResponse } from "next/server";

type MessageType =
  | "account_submitted"
  | "account_approved"
  | "account_rejected";

const messages: Record<MessageType, string> = {
  account_submitted:
    "Tu solicitud de cuenta fue enviada correctamente y está pendiente de revisión.",

  account_approved:
    "Tu solicitud fue aprobada. Ya puedes utilizar tu cuenta.",

  account_rejected:
    "Tu solicitud fue rechazada. Revisa la información enviada y vuelve a intentarlo."
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const type = body.type as MessageType;

    if (!type || !messages[type]) {
      return NextResponse.json(
        {
          error: "Tipo de mensaje no válido."
        },
        {
          status: 400
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: messages[type]
    });
  } catch {
    return NextResponse.json(
      {
        error: "No se pudo procesar el mensaje."
      },
      {
        status: 400
      }
    );
  }
}
