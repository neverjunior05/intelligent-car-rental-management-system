import { db } from "@/db";
import { users, vehicles, locations } from "@/db/schema";
import { hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Idempotent demo seed. Safe to hit multiple times.
export async function POST() {
  const existing = await db.select().from(users);
  if (existing.length > 0) {
    return Response.json({ ok: true, seeded: false, message: "Already seeded" });
  }

  const pw = await hashPassword("password123");

  await db.insert(users).values([
    { name: "System Admin", email: "admin@carrent.com", passwordHash: pw, role: "admin" },
    { name: "Rachel Staff", email: "staff@carrent.com", passwordHash: pw, role: "staff" },
    { name: "Mike Mechanic", email: "maint@carrent.com", passwordHash: pw, role: "maintenance" },
    {
      name: "Jane Customer",
      email: "customer@carrent.com",
      passwordHash: pw,
      role: "customer",
      phone: "555-0100",
      licenseNumber: "DL-9981234",
    },
  ]);

  const [loc1, loc2] = await db
    .insert(locations)
    .values([
      { name: "Downtown Hub", address: "12 Main St", city: "Metropolis" },
      { name: "Airport Branch", address: "1 Airport Rd", city: "Metropolis" },
    ])
    .returning();

  const img = (id: string) =>
    `https://images.unsplash.com/${id}?w=800&q=80&auto=format&fit=crop`;

  await db.insert(vehicles).values([
    { make: "Toyota", model: "Corolla", year: 2023, vin: "VIN0001TOY", registrationNumber: "MH01AB1001", category: "Economy", fuelType: "petrol", transmission: "automatic", seats: 5, mileage: 15000, fuelLevel: 90, dailyRate: "2500", status: "available", locationId: loc1.id, imageUrl: img("photo-1590362891991-f776e747a588") },
    { make: "Honda", model: "Civic", year: 2022, vin: "VIN0002HON", registrationNumber: "MH01AB1002", category: "Sedan", fuelType: "petrol", transmission: "manual", seats: 5, mileage: 22000, fuelLevel: 80, dailyRate: "3000", status: "available", locationId: loc1.id, imageUrl: img("photo-1606664515524-ed2f786a0bd6") },
    { make: "Tesla", model: "Model 3", year: 2024, vin: "VIN0003TES", registrationNumber: "MH01AB1003", category: "Luxury", fuelType: "electric", transmission: "automatic", seats: 5, mileage: 8000, fuelLevel: 100, dailyRate: "6500", status: "available", locationId: loc2.id, imageUrl: img("photo-1560958089-b8a1929cea89") },
    { make: "Jeep", model: "Compass", year: 2023, vin: "VIN0004JEE", registrationNumber: "MH01AB1004", category: "SUV", fuelType: "diesel", transmission: "automatic", seats: 7, mileage: 30000, fuelLevel: 60, dailyRate: "4500", status: "available", locationId: loc2.id, imageUrl: img("photo-1533473359331-0135ef1b58bf") },
    { make: "Maruti", model: "Swift", year: 2021, vin: "VIN0005MAR", registrationNumber: "MH01AB1005", category: "Economy", fuelType: "petrol", transmission: "manual", seats: 5, mileage: 41000, fuelLevel: 45, dailyRate: "1800", status: "maintenance", locationId: loc1.id, imageUrl: img("photo-1552519507-da3b142c6e3d") },
    { make: "BMW", model: "3 Series", year: 2023, vin: "VIN0006BMW", registrationNumber: "MH01AB1006", category: "Luxury", fuelType: "petrol", transmission: "automatic", seats: 5, mileage: 12000, fuelLevel: 85, dailyRate: "7000", status: "available", locationId: loc2.id, imageUrl: img("photo-1555215695-3004980ad54e") },
    { make: "Mercedes", model: "C-Class", year: 2024, vin: "VIN0007MER", registrationNumber: "MH01AB1007", category: "Luxury", fuelType: "petrol", transmission: "automatic", seats: 5, mileage: 6000, fuelLevel: 95, dailyRate: "8000", status: "available", locationId: loc2.id, imageUrl: img("photo-1618843479313-40f8afb4b4d8") },
    { make: "Audi", model: "Q5", year: 2023, vin: "VIN0008AUD", registrationNumber: "MH01AB1008", category: "SUV", fuelType: "diesel", transmission: "automatic", seats: 5, mileage: 18000, fuelLevel: 70, dailyRate: "7500", status: "available", locationId: loc1.id, imageUrl: img("photo-1606152421802-db97b9c7a11b") },
    { make: "Porsche", model: "911 Carrera", year: 2024, vin: "VIN0009POR", registrationNumber: "MH01AB1009", category: "Luxury", fuelType: "petrol", transmission: "automatic", seats: 2, mileage: 3000, fuelLevel: 100, dailyRate: "9500", status: "available", locationId: loc2.id, imageUrl: img("photo-1503376780353-7e6692767b70") },
    { make: "Hyundai", model: "Creta", year: 2022, vin: "VIN0010HYU", registrationNumber: "MH01AB1010", category: "SUV", fuelType: "petrol", transmission: "automatic", seats: 5, mileage: 25000, fuelLevel: 65, dailyRate: "3800", status: "available", locationId: loc1.id, imageUrl: img("photo-1619767886558-efdc259cde1a") },
    { make: "Kia", model: "Seltos", year: 2023, vin: "VIN0011KIA", registrationNumber: "MH01AB1011", category: "SUV", fuelType: "petrol", transmission: "manual", seats: 5, mileage: 14000, fuelLevel: 88, dailyRate: "3600", status: "available", locationId: loc1.id, imageUrl: img("photo-1631295868223-63265b40d9e4") },
    { make: "Volkswagen", model: "Polo", year: 2021, vin: "VIN0012VOL", registrationNumber: "MH01AB1012", category: "Economy", fuelType: "petrol", transmission: "manual", seats: 5, mileage: 33000, fuelLevel: 50, dailyRate: "2200", status: "available", locationId: loc1.id, imageUrl: img("photo-1541899481282-d53bffe3c35d") },
    { make: "Ford", model: "Mustang", year: 2023, vin: "VIN0013FOR", registrationNumber: "MH01AB1013", category: "Luxury", fuelType: "petrol", transmission: "automatic", seats: 4, mileage: 9000, fuelLevel: 92, dailyRate: "8800", status: "available", locationId: loc2.id, imageUrl: img("photo-1584345604476-8ec5e12e42dd") },
    { make: "Nissan", model: "Magnite", year: 2022, vin: "VIN0014NIS", registrationNumber: "MH01AB1014", category: "SUV", fuelType: "petrol", transmission: "automatic", seats: 5, mileage: 21000, fuelLevel: 60, dailyRate: "3200", status: "available", locationId: loc1.id, imageUrl: img("photo-1609521263047-f8f205293f24") },
    { make: "Tata", model: "Nexon EV", year: 2024, vin: "VIN0015TAT", registrationNumber: "MH01AB1015", category: "SUV", fuelType: "electric", transmission: "automatic", seats: 5, mileage: 7000, fuelLevel: 100, dailyRate: "4200", status: "available", locationId: loc2.id, imageUrl: img("photo-1617788138017-80ad40651399") },
    { make: "Toyota", model: "Fortuner", year: 2023, vin: "VIN0016TOY", registrationNumber: "MH01AB1016", category: "SUV", fuelType: "diesel", transmission: "automatic", seats: 7, mileage: 27000, fuelLevel: 55, dailyRate: "6000", status: "available", locationId: loc2.id, imageUrl: img("photo-1568844293986-8d0400bd4745") },
    { make: "Mahindra", model: "Thar", year: 2023, vin: "VIN0017MAH", registrationNumber: "MH01AB1017", category: "SUV", fuelType: "diesel", transmission: "manual", seats: 4, mileage: 16000, fuelLevel: 75, dailyRate: "4800", status: "available", locationId: loc1.id, imageUrl: img("photo-1533473359331-0135ef1b58bf") },
    { make: "Skoda", model: "Slavia", year: 2023, vin: "VIN0018SKO", registrationNumber: "MH01AB1018", category: "Sedan", fuelType: "petrol", transmission: "automatic", seats: 5, mileage: 13000, fuelLevel: 82, dailyRate: "3400", status: "available", locationId: loc1.id, imageUrl: img("photo-1471479917193-f00955256257") },
    { make: "Toyota", model: "Camry Hybrid", year: 2024, vin: "VIN0019TOY", registrationNumber: "MH01AB1019", category: "Sedan", fuelType: "hybrid", transmission: "automatic", seats: 5, mileage: 9500, fuelLevel: 95, dailyRate: "5200", status: "available", locationId: loc1.id, imageUrl: img("photo-1621007947382-bb3c3994e3fb") },
    { make: "Honda", model: "City e:HEV", year: 2023, vin: "VIN0020HON", registrationNumber: "MH01AB1020", category: "Sedan", fuelType: "hybrid", transmission: "automatic", seats: 5, mileage: 14000, fuelLevel: 85, dailyRate: "3500", status: "available", locationId: loc1.id, imageUrl: img("photo-1590362891991-f776e747a588") },
    { make: "Toyota", model: "Urban Cruiser Hyryder", year: 2024, vin: "VIN0021TOY", registrationNumber: "MH01AB1021", category: "SUV", fuelType: "hybrid", transmission: "automatic", seats: 5, mileage: 11000, fuelLevel: 90, dailyRate: "4200", status: "available", locationId: loc2.id, imageUrl: img("photo-1549399542-7e3f8b79c341") },
    { make: "Lexus", model: "RX 500h F-Sport", year: 2024, vin: "VIN0022LEX", registrationNumber: "MH01AB1022", category: "Luxury", fuelType: "hybrid", transmission: "automatic", seats: 5, mileage: 5000, fuelLevel: 100, dailyRate: "11500", status: "available", locationId: loc2.id, imageUrl: img("photo-1553440569-bcc63803a83d") },
    { make: "BMW", model: "M4 Competition", year: 2023, vin: "VIN0023BMW", registrationNumber: "MH01AB1023", category: "Luxury", fuelType: "petrol", transmission: "manual", seats: 4, mileage: 7500, fuelLevel: 88, dailyRate: "10500", status: "available", locationId: loc2.id, imageUrl: img("photo-1580273916550-e323be2ae537") },
    { make: "Hyundai", model: "Ioniq 5", year: 2024, vin: "VIN0024HYU", registrationNumber: "MH01AB1024", category: "SUV", fuelType: "electric", transmission: "automatic", seats: 5, mileage: 6200, fuelLevel: 100, dailyRate: "5800", status: "available", locationId: loc1.id, imageUrl: img("photo-1552519507-da3b142c6e3d") },
    { make: "BYD", model: "Seal Dynamic", year: 2024, vin: "VIN0025BYD", registrationNumber: "MH01AB1025", category: "Sedan", fuelType: "electric", transmission: "automatic", seats: 5, mileage: 4800, fuelLevel: 100, dailyRate: "5400", status: "available", locationId: loc2.id, imageUrl: img("photo-1542282088-72c9c27ed0cd") },
    { make: "Hyundai", model: "Grand i10 Nios", year: 2023, vin: "VIN0026HYU", registrationNumber: "MH01AB1026", category: "Economy", fuelType: "diesel", transmission: "manual", seats: 5, mileage: 28000, fuelLevel: 70, dailyRate: "1900", status: "available", locationId: loc1.id, imageUrl: img("photo-1502877338535-766e1452684a") },
    { make: "Tata", model: "Tiago EV", year: 2024, vin: "VIN0027TAT", registrationNumber: "MH01AB1027", category: "Economy", fuelType: "electric", transmission: "automatic", seats: 5, mileage: 9000, fuelLevel: 100, dailyRate: "2100", status: "available", locationId: loc1.id, imageUrl: img("photo-1511919884226-fd3cad34687c") },
    { make: "Maruti", model: "Grand Vitara", year: 2023, vin: "VIN0028MAR", registrationNumber: "MH01AB1028", category: "SUV", fuelType: "hybrid", transmission: "manual", seats: 5, mileage: 17500, fuelLevel: 80, dailyRate: "3800", status: "available", locationId: loc1.id, imageUrl: img("photo-1533473359331-0135ef1b58bf") },
    { make: "Mercedes", model: "E-Class Exclusive", year: 2024, vin: "VIN0029MER", registrationNumber: "MH01AB1029", category: "Luxury", fuelType: "diesel", transmission: "automatic", seats: 5, mileage: 8500, fuelLevel: 92, dailyRate: "9200", status: "available", locationId: loc2.id, imageUrl: img("photo-1617814076367-b759c7d7e738") },
    { make: "Audi", model: "RS5 Sportback", year: 2024, vin: "VIN0030AUD", registrationNumber: "MH01AB1030", category: "Luxury", fuelType: "petrol", transmission: "automatic", seats: 4, mileage: 4200, fuelLevel: 98, dailyRate: "12500", status: "available", locationId: loc2.id, imageUrl: img("photo-1603584173870-7f23fdae1b7a") },
  ]);

  return Response.json({ ok: true, seeded: true });
}
