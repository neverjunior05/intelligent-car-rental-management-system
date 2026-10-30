import { requireRole } from "@/lib/auth";
import { generateInvoice } from "@/lib/services";

// Module 7 — generate/refresh an invoice for a booking (staff/admin).
export async function POST(req: Request) {
  const guard = await requireRole(["staff", "admin"]);
  if (!guard.ok) return guard.response;
  const { bookingId } = await req.json();
  if (!bookingId)
    return Response.json({ error: "bookingId required" }, { status: 400 });
  const invoice = await generateInvoice(Number(bookingId));
  return Response.json({ invoice });
}
