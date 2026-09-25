import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body.email ?? "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: "Debes enviar un correo."
        },
        {
          status: 400
        }
      );
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "El correo no tiene un formato válido."
        },
        {
          status: 400
        }
      );
    }

    const { env } = await getCloudflareContext({
      async: true
    });

    const requestId = randomUUID();
    const now = Math.floor(Date.now() / 1000);

    return NextResponse.json(
      {
        success: true,
        request: {
          id: requestId,
          email,
          status: "pending",
          createdAt: now
        },
        message:
          "Tu solicitud fue enviada correctamente y está pendiente de revisión."
      },
      {
        status: 201
      }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "No se pudo crear la solicitud."
      },
      {
        status: 500
      }
    );
  }
  }
