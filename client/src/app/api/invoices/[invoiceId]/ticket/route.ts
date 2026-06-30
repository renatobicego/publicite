import { getAuthToken } from "@/services/auth-token";
import { NextRequest, NextResponse } from "next/server";

// Proxy autenticado para descargar el comprobante (PDF) de un pago.
// El backend expone GET /invoices/:invoiceId/ticket protegido con Clerk.
// Hacemos el fetch desde el server (donde tenemos API_URL y el token) y
// devolvemos el PDF al navegador para que lo descargue.
export async function GET(
  _request: NextRequest,
  { params }: { params: { invoiceId: string } }
) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const res = await fetch(
      `${process.env.API_URL}/invoices/${params.invoiceId}/ticket`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "No se pudo generar el comprobante" },
        { status: res.status }
      );
    }

    const pdf = await res.arrayBuffer();
    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="comprobante-${params.invoiceId}.pdf"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al generar el comprobante" },
      { status: 500 }
    );
  }
}
