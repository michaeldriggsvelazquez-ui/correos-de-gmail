import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

type RequestStatus = "pending" | "approved" | "rejected";

const messages: Record<RequestStatus, string> = {
  pending: "La solicitud está pendiente de revisión.",

  approved: "La solicitud ha sido aprobada correctamente.",

  rejected: "La solicitud ha sido rechazada."
};

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { env } = await getCloudflareContext({
      async: true
    });

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

    return NextResponse.json({
      success: true,
      request: {
        id,
        status: "pending"
      }
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "No se pudo obtener la solicitud."
      },
      {
        status: 500
      }
    );
  }
}

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { env } = await getCloudflareContext({
      async: true
    });

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
