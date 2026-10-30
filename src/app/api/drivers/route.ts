import { db } from "@/db";
import { drivers } from "@/db/schema";
import { requireRole } from "@/lib/auth";

// Module 4 — attach a registered driver (license + ID) to a booking.
export async function POST(req: Request) {
  const guard = await requireRole(["customer", "staff", "admin"]);
  if (!guard.ok) return guard.response;
  const body = await req.json();
  if (!body.bookingId || !body.name || !body.licenseNumber || !body.idNumber) {
    return Response.json({ error: "Missing driver fields" }, { status: 400 });
  }
  const [driver] = await db
    .insert(drivers)
    .values({
      bookingId: Number(body.bookingId),
      name: body.name,
      licenseNumber: body.licenseNumber,
      idNumber: body.idNumber,
      licenseExpiry: body.licenseExpiry || null,
      verified: false,
    })
    .returning();
  return Response.json({ driver });
}
