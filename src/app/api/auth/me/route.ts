import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ user: null });
  return Response.json({
    user: {
      id: session.userId,
      userId: session.userId,
      name: session.name,
      email: session.email,
      role: session.role,
    },
  });
}
