import { getVehiclesCollection } from "@/lib/mongodb";
import { requireRole } from "@/lib/auth";
import { mockVehicles } from "@/lib/mockVehicles";

export const dynamic = "force-dynamic";

// GET /api/vehicles — list + search/filter from MongoDB
export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const transmission = url.searchParams.get("transmission");
  const fuelType = url.searchParams.get("fuelType");
  const availableOnly = url.searchParams.get("availableOnly") === "true";

  try {
    const col = await getVehiclesCollection();
    const query: Record<string, any> = {};

    if (category && category !== "All") {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }
    if (transmission) {
      query.transmission = transmission;
    }
    if (fuelType) {
      query.fuelType = fuelType;
    }
    if (availableOnly) {
      query.status = "available";
    }

    const rows = await col.find(query).toArray();

    if (rows && rows.length > 0) {
      // Clean Mongo _id or map id
      const formatted = rows.map((v) => ({
        ...v,
        id: v.id ?? v._id.toString(),
      }));
      return Response.json({ vehicles: formatted });
    }
  } catch (err: any) {
    console.warn("MongoDB query failed in /api/vehicles, falling back:", err?.message || err);
  }

  // Graceful fallback if empty
  let fallback = mockVehicles;
  if (category && category !== "All") fallback = fallback.filter((v) => v.category.toLowerCase() === category.toLowerCase());
  if (transmission) fallback = fallback.filter((v) => v.transmission === transmission);
  if (fuelType) fallback = fallback.filter((v) => v.fuelType === fuelType);
  if (availableOnly) fallback = fallback.filter((v) => v.status === "available");

  return Response.json({ vehicles: fallback });
}

// POST /api/vehicles — add a vehicle to MongoDB (staff or admin only)
export async function POST(req: Request) {
  const guard = await requireRole(["staff", "admin"]);
  if (!guard.ok) return guard.response;
  const body = await req.json();

  try {
    const col = await getVehiclesCollection();
    
    // Find highest numerical ID to auto-increment
    const lastVehicle = await col.find().sort({ id: -1 }).limit(1).toArray();
    const nextId = lastVehicle.length > 0 && typeof lastVehicle[0].id === "number" ? lastVehicle[0].id + 1 : Date.now();

    const newVehicle = {
      id: nextId,
      make: body.make,
      model: body.model,
      year: Number(body.year),
      vin: body.vin,
      registrationNumber: body.registrationNumber,
      category: body.category || "Economy",
      fuelType: body.fuelType || "petrol",
      transmission: body.transmission || "automatic",
      seats: Number(body.seats ?? 5),
      mileage: Number(body.mileage ?? 0),
      fuelLevel: Number(body.fuelLevel ?? 100),
      dailyRate: String(body.dailyRate ?? "2500"),
      status: body.status ?? "available",
      color: body.color || "Black",
      imageUrl: body.imageUrl || "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80&auto=format&fit=crop",
      locationId: body.locationId ? Number(body.locationId) : 1,
      createdAt: new Date(),
    };

    await col.insertOne(newVehicle as any);
    return Response.json({ vehicle: newVehicle }, { status: 201 });
  } catch (e: any) {
    return Response.json(
      { error: "Failed to create vehicle in MongoDB: " + (e?.message || e) },
      { status: 400 }
    );
  }
}
