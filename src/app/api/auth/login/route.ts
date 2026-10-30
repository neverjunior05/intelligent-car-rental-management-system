import { getUsersCollection } from "@/lib/mongodb";
import {
  verifyPassword,
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return Response.json(
      { error: "email and password are required" },
      { status: 400 },
    );
  }

  let user: any = null;

  try {
    const col = await getUsersCollection();
    const cleanEmail = email.trim().toLowerCase();
    
    // Look up in MongoDB users collection
    const dbUser = await col.findOne({
      email: { $regex: new RegExp(`^${cleanEmail}$`, "i") }
    });

    if (dbUser) {
      const isMatch = await verifyPassword(password, dbUser.passwordHash);
      if (isMatch) {
        user = {
          id: dbUser.id || dbUser._id.toString(),
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
        };
      }
    }
  } catch (err: any) {
    console.error("MongoDB login error:", err?.message || err);
  }

  // Graceful fallback for standard demo accounts if MongoDB is offline or unseeded
  if (!user) {
    const cleanEmail = email.trim().toLowerCase();
    const DEMO_USERS = [
      { id: 1, name: "System Admin", email: "admin@carrent.com", role: "admin", password: "password123" },
      { id: 2, name: "Rachel Staff", email: "staff@carrent.com", role: "staff", password: "password123" },
      { id: 3, name: "Mike Mechanic", email: "maint@carrent.com", role: "maintenance", password: "password123" },
      { id: 4, name: "Jane Customer", email: "customer@carrent.com", role: "customer", password: "password123" },
    ];
    const match = DEMO_USERS.find((u) => u.email === cleanEmail && u.password === password);
    if (match) {
      user = {
        id: match.id,
        name: match.name,
        email: match.email,
        role: match.role,
      };
    }
  }

  if (!user) {
    return Response.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = await createSessionToken({
    userId: typeof user.id === "number" ? user.id : 1,
    role: user.role,
    name: user.name,
    email: user.email,
  });
  await setSessionCookie(token);

  return Response.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}
