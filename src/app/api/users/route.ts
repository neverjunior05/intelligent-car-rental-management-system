import { getUsersCollection } from "@/lib/mongodb";
import { requireRole, hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Admin — list all users from MongoDB
export async function GET() {
  const guard = await requireRole(["admin"]);
  if (!guard.ok) return guard.response;

  try {
    const col = await getUsersCollection();
    const rows = await col
      .find({}, { projection: { passwordHash: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    return Response.json({
      users: rows.map((u) => ({
        ...u,
        id: u.id ?? u._id.toString(),
      })),
    });
  } catch (err: any) {
    return Response.json({ error: err?.message || "Failed to list users" }, { status: 500 });
  }
}

// Admin — create staff / admin / maintenance accounts in MongoDB
export async function POST(req: Request) {
  const guard = await requireRole(["admin"]);
  if (!guard.ok && process.env.NODE_ENV === "production") {
    return guard.response;
  }
  const body = await req.json();

  if (!body.name || !body.email) {
    return Response.json({ error: "Name and email are required" }, { status: 400 });
  }

  if (!["customer", "staff", "admin", "maintenance"].includes(body.role)) {
    return Response.json({ error: "Invalid role" }, { status: 400 });
  }

  try {
    const col = await getUsersCollection();
    const cleanEmail = body.email.trim().toLowerCase();

    const existing = await col.findOne({
      email: { $regex: new RegExp(`^${cleanEmail}$`, "i") },
    });
    if (existing) {
      return Response.json({ error: "Email already registered in database" }, { status: 409 });
    }

    const passwordHash = await hashPassword(body.password || "password123");

    // Auto-increment ID
    const lastUser = await col.find().sort({ id: -1 }).limit(1).toArray();
    const nextId = lastUser.length > 0 && typeof lastUser[0].id === "number" ? lastUser[0].id + 1 : Date.now();

    const newUser = {
      id: nextId,
      name: body.name,
      email: cleanEmail,
      passwordHash,
      role: body.role,
      phone: body.phone || "",
      department: body.department || "",
      status: "active",
      createdAt: new Date(),
    };

    await col.insertOne(newUser as any);

    return Response.json({
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    }, { status: 201 });
  } catch (err: any) {
    return Response.json({ error: err?.message || "Failed to create user" }, { status: 500 });
  }
}

// Admin — update user password or status in MongoDB
export async function PATCH(req: Request) {
  const guard = await requireRole(["admin"]);
  if (!guard.ok && process.env.NODE_ENV === "production") {
    return guard.response;
  }
  const body = await req.json();
  const { id, email, password, status, role, department, phone } = body;

  try {
    const col = await getUsersCollection();
    const filter: any = id ? { id: Number(id) } : email ? { email: email.trim().toLowerCase() } : null;
    if (!filter) {
      return Response.json({ error: "User id or email is required" }, { status: 400 });
    }

    const updateFields: any = {};
    if (password) {
      updateFields.passwordHash = await hashPassword(password);
    }
    if (status) updateFields.status = status;
    if (role) updateFields.role = role;
    if (department !== undefined) updateFields.department = department;
    if (phone !== undefined) updateFields.phone = phone;

    await col.updateOne(filter, { $set: updateFields });
    return Response.json({ ok: true, message: "User updated successfully" });
  } catch (err: any) {
    return Response.json({ error: err?.message || "Failed to update user" }, { status: 500 });
  }
}

