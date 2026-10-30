import { db } from "@/db";
import { drivers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth";

// Staff verifies a driver's documents (Module 4 verification).
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireRole(["staff", "admin"]);
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const { verified } = await req.json();
  const [driver] = await db
    .update(drivers)
    .set({ verified: !!verified })
    .where(eq(drivers.id, Number(id)))
    .returning();
  return Response.json({ driver });
}
