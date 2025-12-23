import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Extended user profile for ride-sharing app
 * Stores additional information beyond authentication
 */
export const userProfiles = mysqlTable(
  "user_profiles",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().unique(),
    userType: mysqlEnum("userType", ["rider", "driver", "both"]).default("rider").notNull(),
    phoneNumber: varchar("phoneNumber", { length: 20 }),
    profileImageUrl: text("profileImageUrl"),
    rating: decimal("rating", { precision: 3, scale: 2 }).default("5.00"),
    totalRides: int("totalRides").default(0),
    totalEarnings: decimal("totalEarnings", { precision: 10, scale: 2 }).default("0.00"),
    bio: text("bio"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("userIdIdx").on(table.userId),
  })
);

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

/**
 * Driver-specific information
 * Stores vehicle details, availability, and driver documents
 */
export const drivers = mysqlTable(
  "drivers",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().unique(),
    vehicleType: mysqlEnum("vehicleType", ["economy", "comfort", "premium"]).default("economy").notNull(),
    vehicleMake: varchar("vehicleMake", { length: 100 }),
    vehicleModel: varchar("vehicleModel", { length: 100 }),
    vehiclePlate: varchar("vehiclePlate", { length: 20 }).unique(),
    vehicleColor: varchar("vehicleColor", { length: 50 }),
    vehicleImageUrl: text("vehicleImageUrl"),
    licenseNumber: varchar("licenseNumber", { length: 50 }).unique(),
    licenseExpiry: timestamp("licenseExpiry"),
    isAvailable: boolean("isAvailable").default(false).notNull(),
    currentLatitude: decimal("currentLatitude", { precision: 10, scale: 8 }),
    currentLongitude: decimal("currentLongitude", { precision: 11, scale: 8 }),
    lastLocationUpdate: timestamp("lastLocationUpdate"),
    documentsVerified: boolean("documentsVerified").default(false),
    backgroundCheckPassed: boolean("backgroundCheckPassed").default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("driverUserIdIdx").on(table.userId),
    vehiclePlateIdx: index("vehiclePlateIdx").on(table.vehiclePlate),
    availabilityIdx: index("availabilityIdx").on(table.isAvailable),
  })
);

export type Driver = typeof drivers.$inferSelect;
export type InsertDriver = typeof drivers.$inferInsert;

/**
 * Ride requests and history
 * Tracks all ride transactions
 */
export const rides = mysqlTable(
  "rides",
  {
    id: int("id").autoincrement().primaryKey(),
    riderId: int("riderId").notNull(),
    driverId: int("driverId"),
    pickupLatitude: decimal("pickupLatitude", { precision: 10, scale: 8 }).notNull(),
    pickupLongitude: decimal("pickupLongitude", { precision: 11, scale: 8 }).notNull(),
    pickupAddress: text("pickupAddress"),
    dropoffLatitude: decimal("dropoffLatitude", { precision: 10, scale: 8 }).notNull(),
    dropoffLongitude: decimal("dropoffLongitude", { precision: 11, scale: 8 }).notNull(),
    dropoffAddress: text("dropoffAddress"),
    distance: decimal("distance", { precision: 8, scale: 2 }),
    estimatedDuration: int("estimatedDuration"),
    actualDuration: int("actualDuration"),
    baseFare: decimal("baseFare", { precision: 8, scale: 2 }).notNull(),
    distanceFare: decimal("distanceFare", { precision: 8, scale: 2 }).default("0.00"),
    timeFare: decimal("timeFare", { precision: 8, scale: 2 }).default("0.00"),
    totalFare: decimal("totalFare", { precision: 8, scale: 2 }).notNull(),
    status: mysqlEnum("status", [
      "requested",
      "accepted",
      "driver_arriving",
      "arrived",
      "in_progress",
      "completed",
      "cancelled",
    ])
      .default("requested")
      .notNull(),
    vehicleType: mysqlEnum("vehicleType", ["economy", "comfort", "premium"]).default("economy").notNull(),
    paymentMethod: mysqlEnum("paymentMethod", ["cash", "card", "wallet"]).default("card"),
    paymentStatus: mysqlEnum("paymentStatus", ["pending", "completed", "failed"]).default("pending"),
    requestedAt: timestamp("requestedAt").defaultNow().notNull(),
    acceptedAt: timestamp("acceptedAt"),
    startedAt: timestamp("startedAt"),
    completedAt: timestamp("completedAt"),
    cancelledAt: timestamp("cancelledAt"),
    cancellationReason: text("cancellationReason"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    riderIdIdx: index("riderIdIdx").on(table.riderId),
    driverIdIdx: index("driverIdIdx").on(table.driverId),
    statusIdx: index("statusIdx").on(table.status),
  })
);

export type Ride = typeof rides.$inferSelect;
export type InsertRide = typeof rides.$inferInsert;

/**
 * Ratings and reviews between users
 * Tracks rider and driver ratings
 */
export const ratings = mysqlTable(
  "ratings",
  {
    id: int("id").autoincrement().primaryKey(),
    rideId: int("rideId").notNull().unique(),
    ratedById: int("ratedById").notNull(),
    ratedUserId: int("ratedUserId").notNull(),
    ratingType: mysqlEnum("ratingType", ["driver_rating", "rider_rating"]).notNull(),
    score: int("score").notNull(),
    comment: text("comment"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    rideIdIdx: index("rideIdIdx").on(table.rideId),
    ratedByIdIdx: index("ratedByIdIdx").on(table.ratedById),
    ratedUserIdIdx: index("ratedUserIdIdx").on(table.ratedUserId),
  })
);

export type Rating = typeof ratings.$inferSelect;
export type InsertRating = typeof ratings.$inferInsert;

/**
 * Payment methods stored by users
 * Supports multiple payment methods per user
 */
export const paymentMethods = mysqlTable(
  "payment_methods",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    paymentType: mysqlEnum("paymentType", ["card", "wallet", "bank_transfer"]).notNull(),
    cardLast4: varchar("cardLast4", { length: 4 }),
    cardBrand: varchar("cardBrand", { length: 50 }),
    walletBalance: decimal("walletBalance", { precision: 10, scale: 2 }).default("0.00"),
    isDefault: boolean("isDefault").default(false),
    isActive: boolean("isActive").default(true),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("paymentUserIdIdx").on(table.userId),
  })
);

export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = typeof paymentMethods.$inferInsert;

/**
 * Ride requests in real-time
 * Temporary collection for active ride requests
 */
export const rideRequests = mysqlTable(
  "ride_requests",
  {
    id: int("id").autoincrement().primaryKey(),
    riderId: int("riderId").notNull(),
    pickupLatitude: decimal("pickupLatitude", { precision: 10, scale: 8 }).notNull(),
    pickupLongitude: decimal("pickupLongitude", { precision: 11, scale: 8 }).notNull(),
    dropoffLatitude: decimal("dropoffLatitude", { precision: 10, scale: 8 }).notNull(),
    dropoffLongitude: decimal("dropoffLongitude", { precision: 11, scale: 8 }).notNull(),
    vehicleType: mysqlEnum("vehicleType", ["economy", "comfort", "premium"]).default("economy").notNull(),
    estimatedFare: decimal("estimatedFare", { precision: 8, scale: 2 }).notNull(),
    status: mysqlEnum("status", ["pending", "accepted", "expired"]).default("pending").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    riderIdIdx: index("requestRiderIdIdx").on(table.riderId),
    statusIdx: index("requestStatusIdx").on(table.status),
  })
);

export type RideRequest = typeof rideRequests.$inferSelect;
export type InsertRideRequest = typeof rideRequests.$inferInsert;

/**
 * Relations for Drizzle ORM
 */
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  driver: one(drivers, {
    fields: [users.id],
    references: [drivers.userId],
  }),
  ridesAsRider: many(rides, {
    relationName: "rider",
  }),
  ridesAsDriver: many(rides, {
    relationName: "driver",
  }),
  paymentMethods: many(paymentMethods),
  ratings: many(ratings),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const driversRelations = relations(drivers, ({ one }) => ({
  user: one(users, {
    fields: [drivers.userId],
    references: [users.id],
  }),
}));

export const ridesRelations = relations(rides, ({ one }) => ({
  rider: one(users, {
    fields: [rides.riderId],
    references: [users.id],
    relationName: "rider",
  }),
  driver: one(users, {
    fields: [rides.driverId],
    references: [users.id],
    relationName: "driver",
  }),
  rating: one(ratings, {
    fields: [rides.id],
    references: [ratings.rideId],
  }),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  ride: one(rides, {
    fields: [ratings.rideId],
    references: [rides.id],
  }),
}));

export const paymentMethodsRelations = relations(paymentMethods, ({ one }) => ({
  user: one(users, {
    fields: [paymentMethods.userId],
    references: [users.id],
  }),
}));

export const rideRequestsRelations = relations(rideRequests, ({ one }) => ({
  rider: one(users, {
    fields: [rideRequests.riderId],
    references: [users.id],
  }),
}));
