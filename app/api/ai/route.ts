import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/cloudflare/auth";
import { generatePlannerResponse } from "@/lib/ai/planner";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autenticado." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const message = String(body.message ?? "").trim();

    if (!message) {
      return NextResponse.json(
        { error: "El mensaje está vacío." },
        { status: 400 }
      );
    }

    const result = await generatePlannerResponse(message);

    return NextResponse.json({
      success: true,
      result
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudo procesar la solicitud de IA." },
      { status: 500 }
    );
  }
          }
