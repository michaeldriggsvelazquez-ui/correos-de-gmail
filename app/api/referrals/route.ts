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
      referral: {
        code: user.id,
        link: `/signup?ref=${encodeURIComponent(user.id)}`,
        totalReferrals: 0,
        registrationBonus: 0,
        accountSaleBonus: 0,
        totalEarned: 0
      }
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "No se pudo obtener la información de referidos."
      },
      {
        status: 500
      }
    );
  }
        }
