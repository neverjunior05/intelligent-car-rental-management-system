import { db } from "@/db";
import { locations } from "@/db/schema";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db.select().from(locations);
  return Response.json({ locations: rows });
}

export async function POST(req: Request) {
  const guard = await requireRole(["admin"]);
  if (!guard.ok) return guard.response;
  const body = await req.json();
  const [location] = await db
    .insert(locations)
    .values({ name: body.name, address: body.address, city: body.city })
    .returning();
  return Response.json({ location });
}
