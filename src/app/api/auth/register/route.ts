import { getUsersCollection } from "@/lib/mongodb";
import {
  hashPassword,
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth";

// Customer self-registration in MongoDB
export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, password, phone, licenseNumber, address } = body;
  if (!name || !email || !password) {
    return Response.json(
      { error: "name, email and password are required" },
      { status: 400 },
    );
  }

  try {
    const col = await getUsersCollection();
    const cleanEmail = email.trim().toLowerCase();

    // Check if email already registered in MongoDB
    const existing = await col.findOne({
      email: { $regex: new RegExp(`^${cleanEmail}$`, "i") },
    });

    if (existing) {
      return Response.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    
    // Auto increment numerical id
    const lastUser = await col.find().sort({ id: -1 }).limit(1).toArray();
    const nextId = lastUser.length > 0 && typeof lastUser[0].id === "number" ? lastUser[0].id + 1 : Date.now();

    const newUser = {
      id: nextId,
      name,
      email: cleanEmail,
      passwordHash,
      role: "customer" as const,
      phone: phone || "",
      licenseNumber: licenseNumber || "",
      address: address || "",
      status: "active",
      createdAt: new Date(),
    };

    await col.insertOne(newUser as any);

    const token = await createSessionToken({
      userId: newUser.id,
      role: "customer",
      name: newUser.name,
      email: newUser.email,
    });
    await setSessionCookie(token);

    return Response.json({
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    }, { status: 201 });
  } catch (err: any) {
    return Response.json(
      { error: "Registration failed: " + (err?.message || err) },
      { status: 500 }
    );
  }
}
