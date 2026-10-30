import { clearSessionCookie } from "@/lib/auth";

export async function POST() {
  await clearSessionCookie();
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": "carrent_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; SameSite=Lax",
    },
  });
}
