import { requireRole } from "@/lib/auth";
import { processPayment } from "@/lib/services";

// Module 7 — process a payment using the polymorphic payment strategies.
export async function POST(req: Request) {
  const guard = await requireRole(["customer", "staff", "admin"]);
  if (!guard.ok) return guard.response;
  const body = await req.json();
  const method = body.method as "card" | "upi" | "bank_transfer";
  if (!["card", "upi", "bank_transfer"].includes(method)) {
    return Response.json({ error: "Invalid payment method" }, { status: 400 });
  }
  if (!body.bookingId || !body.amount) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }
  const payment = await processPayment({
    bookingId: Number(body.bookingId),
    amount: Number(body.amount),
    method,
    isDeposit: !!body.isDeposit,
  });
  return Response.json({ payment });
}
