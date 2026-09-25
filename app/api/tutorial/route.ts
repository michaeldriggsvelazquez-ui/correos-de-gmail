import { NextResponse } from "next/server";

type TutorialStep = {
  id: number;
  title: string;
  description: string;
  image: string | null;
};

const tutorial: TutorialStep[] = [
  {
    id: 1,
    title: "Abre Gmail",
    description:
      "Abre la aplicación Gmail en tu dispositivo y entra al menú de cuentas.",
    image: null
  },
  {
    id: 2,
    title: "Añade una cuenta",
    description:
      "Selecciona la opción para añadir otra cuenta y continúa con la creación de una cuenta interna de prueba.",
    image: null
  },
  {
    id: 3,
    title: "Completa los datos",
    description:
      "Introduce los datos solicitados siguiendo las indicaciones del tutorial.",
    image: null
  },
  {
    id: 4,
    title: "Finaliza",
    description:
      "Cuando termines, vuelve al chat y continúa con el proceso de envío.",
    image: null
  }
];

export async function GET() {
  return NextResponse.json({
    success: true,
    tutorial
  });
}
