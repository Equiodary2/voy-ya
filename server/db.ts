import { eq, and, or, desc, gte, lte, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  userProfiles,
  InsertUserProfile,
  drivers,
  InsertDriver,
  rides,
  InsertRide,
  ratings,
  InsertRating,
  paymentMethods,
  InsertPaymentMethod,
  rideRequests,
  InsertRideRequest,
  UserProfile,
  Driver,
  Ride,
  Rating,
  PaymentMethod,
  RideRequest,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ USER PROFILE FUNCTIONS ============

export async function createUserProfile(data: InsertUserProfile): Promise<UserProfile> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(userProfiles).values(data);
  const profile = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, data.userId))
    .limit(1);

  return profile[0];
}

export async function getUserProfile(userId: number): Promise<UserProfile | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(userId: number, data: Partial<InsertUserProfile>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(userProfiles).set(data).where(eq(userProfiles.userId, userId));
}

// ============ DRIVER FUNCTIONS ============

export async function createDriver(data: InsertDriver): Promise<Driver> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(drivers).values(data);
  const driver = await db
    .select()
    .from(drivers)
    .where(eq(drivers.userId, data.userId))
    .limit(1);

  return driver[0];
}

export async function getDriver(userId: number): Promise<Driver | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(drivers).where(eq(drivers.userId, userId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateDriver(userId: number, data: Partial<InsertDriver>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(drivers).set(data).where(eq(drivers.userId, userId));
}

export async function getAvailableDrivers(limit: number = 10): Promise<Driver[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(drivers).where(eq(drivers.isAvailable, true)).limit(limit);
}

export async function updateDriverLocation(
  userId: number,
  latitude: number,
  longitude: number
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(drivers)
    .set({
      currentLatitude: latitude.toString(),
      currentLongitude: longitude.toString(),
      lastLocationUpdate: new Date(),
    })
    .where(eq(drivers.userId, userId));
}

// ============ RIDE FUNCTIONS ============

export async function createRide(data: InsertRide): Promise<Ride> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(rides).values(data);
  const rideId = (result as any).insertId || (result as any)[0]?.id;
  const ride = await db
    .select()
    .from(rides)
    .where(eq(rides.riderId, data.riderId))
    .orderBy(desc(rides.createdAt))
    .limit(1);

  return ride[0];
}

export async function getRide(rideId: number): Promise<Ride | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(rides).where(eq(rides.id, rideId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateRide(rideId: number, data: Partial<InsertRide>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(rides).set(data).where(eq(rides.id, rideId));
}

export async function getRiderRideHistory(userId: number, limit: number = 20): Promise<Ride[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(rides)
    .where(eq(rides.riderId, userId))
    .orderBy(desc(rides.createdAt))
    .limit(limit);
}

export async function getDriverRideHistory(userId: number, limit: number = 20): Promise<Ride[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(rides)
    .where(eq(rides.driverId, userId))
    .orderBy(desc(rides.createdAt))
    .limit(limit);
}

export async function getActiveRides(userId: number, userType: "rider" | "driver"): Promise<Ride[]> {
  const db = await getDb();
  if (!db) return [];

  const activeStatuses = ["requested", "accepted", "driver_arriving", "arrived", "in_progress"];

  if (userType === "rider") {
    return db
      .select()
      .from(rides)
      .where(and(eq(rides.riderId, userId), inArray(rides.status, activeStatuses as any)));
  } else {
    return db
      .select()
      .from(rides)
      .where(and(eq(rides.driverId, userId), inArray(rides.status, activeStatuses as any)));
  }
}

// ============ RATING FUNCTIONS ============

export async function createRating(data: InsertRating): Promise<Rating> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(ratings).values(data);
  const rating = await db
    .select()
    .from(ratings)
    .where(eq(ratings.rideId, data.rideId))
    .limit(1);

  return rating[0];
}

export async function getRating(rideId: number): Promise<Rating | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(ratings).where(eq(ratings.rideId, rideId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserRatings(userId: number): Promise<Rating[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(ratings).where(eq(ratings.ratedUserId, userId));
}

// ============ PAYMENT METHOD FUNCTIONS ============

export async function createPaymentMethod(data: InsertPaymentMethod): Promise<PaymentMethod> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(paymentMethods).values(data);
  const method = await db
    .select()
    .from(paymentMethods)
    .where(eq(paymentMethods.userId, data.userId))
    .orderBy(desc(paymentMethods.createdAt))
    .limit(1);

  return method[0];
}

export async function getUserPaymentMethods(userId: number): Promise<PaymentMethod[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(paymentMethods).where(eq(paymentMethods.userId, userId));
}

export async function getDefaultPaymentMethod(userId: number): Promise<PaymentMethod | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(paymentMethods)
    .where(and(eq(paymentMethods.userId, userId), eq(paymentMethods.isDefault, true)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updatePaymentMethod(
  paymentMethodId: number,
  data: Partial<InsertPaymentMethod>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(paymentMethods).set(data).where(eq(paymentMethods.id, paymentMethodId));
}

// ============ RIDE REQUEST FUNCTIONS ============

export async function createRideRequest(data: InsertRideRequest): Promise<RideRequest> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(rideRequests).values(data);
  const request = await db
    .select()
    .from(rideRequests)
    .where(eq(rideRequests.riderId, data.riderId))
    .orderBy(desc(rideRequests.createdAt))
    .limit(1);

  return request[0];
}

export async function getRideRequest(requestId: number): Promise<RideRequest | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(rideRequests).where(eq(rideRequests.id, requestId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateRideRequest(requestId: number, data: Partial<InsertRideRequest>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(rideRequests).set(data).where(eq(rideRequests.id, requestId));
}

export async function getPendingRideRequests(): Promise<RideRequest[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(rideRequests)
    .where(
      and(
        eq(rideRequests.status, "pending"),
        gte(rideRequests.expiresAt, new Date())
      )
    )
    .orderBy(desc(rideRequests.createdAt));
}

export async function deleteExpiredRideRequests(): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(rideRequests)
    .where(lte(rideRequests.expiresAt, new Date()));
}
