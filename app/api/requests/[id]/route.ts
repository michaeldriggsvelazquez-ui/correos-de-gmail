import { NextResponse } from "next/server";

type RequestStatus = "pending" | "approved" | "rejected";

const messages: Record<RequestStatus, string> = {
  pending:
    "Tu solicitud está pendiente de revisión.",

  approved:
    "Tu cuenta ha sido revisada y aceptada.\n\nTu balance será actualizado con el movimiento correspondiente.",

  rejected:
    "Tu cuenta ha sido rechazada.\n\nRevisa la información enviada y vuelve a intentarlo."
};

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      {
        success: false,
        error: "ID de solicitud no válido."
      },
      {
        status: 400
      }
    );
  }

  const status: RequestStatus = "pending";

  return NextResponse.json({
    success: true,
    request: {
      id,
      status
    },
    message: messages[status]
  });
}

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const status = body.status as RequestStatus;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID de solicitud no válido."
        },
        {
          status: 400
        }
      );
    }

    if (!["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Estado no válido."
        },
        {
          status: 400
        }
      );
    }

    return NextResponse.json({
      success: true,
      request: {
        id,
        status
      },
      message: messages[status]
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "No se pudo actualizar la solicitud."
      },
      {
        status: 400
      }
    );
  }
  }
