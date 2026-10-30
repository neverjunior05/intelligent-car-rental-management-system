import { getBookingsCollection, getVehiclesCollection, getUsersCollection } from "@/lib/mongodb";
import { requireRole } from "@/lib/auth";
import { calculateBaseCost } from "@/lib/services";

export const dynamic = "force-dynamic";

// GET — customers see their own bookings; staff/admin see all.
export async function GET() {
  const guard = await requireRole(["customer", "staff", "admin"]);
  if (!guard.ok) return guard.response;
  const { session } = guard;

  try {
    const bookingsCol = await getBookingsCollection();
    const query: Record<string, any> = {};

    if (session.role === "customer") {
      query.$or = [{ customerId: session.userId }, { customerEmail: session.email }];
    }

    const bookingList = await bookingsCol.find(query).sort({ createdAt: -1 }).toArray();

    return Response.json({
      bookings: bookingList.map((b) => ({
        ...b,
        id: b.id ?? b._id.toString(),
      })),
    });
  } catch (err: any) {
    console.warn("MongoDB bookings query failed:", err?.message || err);
    return Response.json({ bookings: [] });
  }
}

// POST — create a booking in MongoDB. Checks availability & updates vehicle to "reserved".
export async function POST(req: Request) {
  const guard = await requireRole(["customer", "staff", "admin"]);
  if (!guard.ok) return guard.response;
  const { session } = guard;
  const body = await req.json();

  const vehicleId = Number(body.vehicleId) || body.vehicleId;
  const start = new Date(body.startDate);
  const end = new Date(body.endDate);

  if (!vehicleId || isNaN(start.getTime()) || isNaN(end.getTime())) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }
  if (end <= start) {
    return Response.json(
      { error: "End date must be after start date" },
      { status: 400 },
    );
  }

  try {
    const vehiclesCol = await getVehiclesCollection();
    const bookingsCol = await getBookingsCollection();

    const vehicle = await vehiclesCol.findOne({
      $or: [{ id: vehicleId }, { id: Number(vehicleId) }],
    });

    if (!vehicle) {
      return Response.json({ error: "Vehicle not found" }, { status: 404 });
    }
    if (vehicle.status === "maintenance") {
      return Response.json(
        { error: "Vehicle is currently under maintenance" },
        { status: 400 },
      );
    }

    // Overlap check in MongoDB
    const overlaps = await bookingsCol.find({
      $or: [{ vehicleId: vehicleId }, { vehicleId: Number(vehicleId) }],
      status: { $nin: ["cancelled", "completed"] },
      startDate: { $lt: body.endDate },
      endDate: { $gt: body.startDate },
    }).toArray();

    if (overlaps.length > 0) {
      return Response.json(
        { error: "Vehicle is already booked for the selected dates" },
        { status: 409 },
      );
    }

    const totalCost = calculateBaseCost(Number(vehicle.dailyRate || 2500), start, end);
    const customerId = session.role === "customer" ? session.userId : (Number(body.customerId) || session.userId);

    // Auto-increment ID
    const lastBooking = await bookingsCol.find().sort({ id: -1 }).limit(1).toArray();
    const nextId = lastBooking.length > 0 && typeof lastBooking[0].id === "number" ? lastBooking[0].id + 1 : Date.now();
    const bookingCode = `BK-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking = {
      id: nextId,
      bookingCode,
      customerId,
      customerName: session.name || "Customer",
      customerEmail: session.email || "",
      vehicleId,
      vehicleName: `${vehicle.make} ${vehicle.model} ${vehicle.year}`,
      vehicleImage: vehicle.imageUrl,
      startDate: body.startDate,
      endDate: body.endDate,
      status: "pending",
      totalCost,
      securityDeposit: vehicle.category === "Luxury" ? 15000 : 5000,
      paymentStatus: "unpaid",
      paymentMethod: body.paymentMethod || "card",
      createdAt: new Date(),
    };

    await bookingsCol.insertOne(newBooking as any);

    // Update vehicle to reserved if available
    if (vehicle.status === "available") {
      await vehiclesCol.updateOne(
        { $or: [{ id: vehicleId }, { id: Number(vehicleId) }] },
        { $set: { status: "reserved", updatedAt: new Date() } }
      );
    }

    return Response.json({ booking: newBooking }, { status: 201 });
  } catch (err: any) {
    return Response.json(
      { error: "Failed to create booking in MongoDB: " + (err?.message || err) },
      { status: 500 },
    );
  }
}
