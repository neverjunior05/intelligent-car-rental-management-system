import dns from "dns";
import { MongoClient, Db, Collection } from "mongodb";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Ignore in environments where setting DNS servers is restricted
}

// Direct replica set URI listing the primary shard (02) first for rapid connection
const directReplicaUri =
  process.env.MONGODB_URI ||
  "mongodb://neverjuniorkapanyota_db_user:neverjunior5@ac-dnmahnp-shard-00-02.eshhyb6.mongodb.net:27017,ac-dnmahnp-shard-00-01.eshhyb6.mongodb.net:27017,ac-dnmahnp-shard-00-00.eshhyb6.mongodb.net:27017/car_rental_db?ssl=true&replicaSet=atlas-s2b6bo-shard-0&authSource=admin&retryWrites=true&w=majority";

const dbName = process.env.MONGODB_DB || "car_rental_db";

interface GlobalWithMongo {
  _mongoClientPromiseV2?: Promise<MongoClient>;
}

const globalForMongo = globalThis as typeof globalThis & GlobalWithMongo;

export async function getMongoClient(): Promise<MongoClient> {
  if (!globalForMongo._mongoClientPromiseV2) {
    const client = new MongoClient(directReplicaUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
      retryWrites: true,
    });
    globalForMongo._mongoClientPromiseV2 = client.connect().catch((err) => {
      delete globalForMongo._mongoClientPromiseV2;
      throw err;
    });
  }
  return globalForMongo._mongoClientPromiseV2;
}

export async function getMongoDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(dbName);
}

export async function getCollection<T extends import("mongodb").Document = import("mongodb").Document>(
  collectionName: string
): Promise<Collection<T>> {
  const db = await getMongoDb();
  return db.collection<T>(collectionName);
}

// Convenient collection accessors
export const getUsersCollection = () => getCollection("users");
export const getVehiclesCollection = () => getCollection("vehicles");
export const getBookingsCollection = () => getCollection("bookings");
export const getPaymentsCollection = () => getCollection("payments");
export const getMaintenanceCollection = () => getCollection("maintenance");
export const getDamageCollection = () => getCollection("damage_reports");
export const getHandoverCollection = () => getCollection("handovers");
export const getReturnsCollection = () => getCollection("returns");
export const getNotificationsCollection = () => getCollection("notifications");
