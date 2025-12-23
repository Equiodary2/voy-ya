import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import * as db from "./db";

// ============ VALIDATION SCHEMAS ============

const createUserProfileSchema = z.object({
  userType: z.enum(["rider", "driver", "both"]),
  phoneNumber: z.string().optional(),
  bio: z.string().optional(),
});

const createDriverSchema = z.object({
  vehicleType: z.enum(["economy", "comfort", "premium"]).default("economy"),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehiclePlate: z.string().optional(),
  vehicleColor: z.string().optional(),
  licenseNumber: z.string().optional(),
});

const createRideSchema = z.object({
  pickupLatitude: z.number(),
  pickupLongitude: z.number(),
  pickupAddress: z.string().optional(),
  dropoffLatitude: z.number(),
  dropoffLongitude: z.number(),
  dropoffAddress: z.string().optional(),
  distance: z.number().optional(),
  estimatedDuration: z.number().optional(),
  baseFare: z.number(),
  distanceFare: z.number().optional(),
  timeFare: z.number().optional(),
  totalFare: z.number(),
  vehicleType: z.enum(["economy", "comfort", "premium"]).default("economy"),
  paymentMethod: z.enum(["cash", "card", "wallet"]).default("card"),
});

const updateRideSchema = z.object({
  rideId: z.number(),
  status: z
    .enum([
      "requested",
      "accepted",
      "driver_arriving",
      "arrived",
      "in_progress",
      "completed",
      "cancelled",
    ])
    .optional(),
  driverId: z.number().optional(),
  actualDuration: z.number().optional(),
  paymentStatus: z.enum(["pending", "completed", "failed"]).optional(),
  cancellationReason: z.string().optional(),
});

const createRatingSchema = z.object({
  rideId: z.number(),
  ratedUserId: z.number(),
  ratingType: z.enum(["driver_rating", "rider_rating"]),
  score: z.number().min(1).max(5),
  comment: z.string().optional(),
});

const updateDriverLocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

const updateDriverAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
});

// ============ MAIN ROUTER ============

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ USER PROFILE ROUTES ============

  userProfile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserProfile(ctx.user.id);
    }),

    create: protectedProcedure
      .input(createUserProfileSchema)
      .mutation(async ({ ctx, input }) => {
        return db.createUserProfile({
          userId: ctx.user.id,
          userType: input.userType,
          phoneNumber: input.phoneNumber,
          bio: input.bio,
        });
      }),

    update: protectedProcedure
      .input(z.object({ userType: z.enum(["rider", "driver", "both"]).optional(), bio: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserProfile(ctx.user.id, input);
        return db.getUserProfile(ctx.user.id);
      }),
  }),

  // ============ DRIVER ROUTES ============

  driver: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return db.getDriver(ctx.user.id);
    }),

    create: protectedProcedure
      .input(createDriverSchema)
      .mutation(async ({ ctx, input }) => {
        return db.createDriver({
          userId: ctx.user.id,
          vehicleType: input.vehicleType,
          vehicleMake: input.vehicleMake,
          vehicleModel: input.vehicleModel,
          vehiclePlate: input.vehiclePlate,
          vehicleColor: input.vehicleColor,
          licenseNumber: input.licenseNumber,
        });
      }),

    update: protectedProcedure
      .input(createDriverSchema)
      .mutation(async ({ ctx, input }) => {
        await db.updateDriver(ctx.user.id, input);
        return db.getDriver(ctx.user.id);
      }),

    updateLocation: protectedProcedure
      .input(updateDriverLocationSchema)
      .mutation(async ({ ctx, input }) => {
        await db.updateDriverLocation(ctx.user.id, input.latitude, input.longitude);
        return { success: true };
      }),

    updateAvailability: protectedProcedure
      .input(updateDriverAvailabilitySchema)
      .mutation(async ({ ctx, input }) => {
        await db.updateDriver(ctx.user.id, { isAvailable: input.isAvailable });
        return { success: true };
      }),

    getAvailable: publicProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => {
        return db.getAvailableDrivers(input.limit);
      }),
  }),

  // ============ RIDE ROUTES ============

  ride: router({
    get: protectedProcedure
      .input(z.object({ rideId: z.number() }))
      .query(async ({ input }) => {
        return db.getRide(input.rideId);
      }),

    create: protectedProcedure
      .input(createRideSchema)
      .mutation(async ({ ctx, input }) => {
        return db.createRide({
          riderId: ctx.user.id,
          pickupLatitude: input.pickupLatitude.toString(),
          pickupLongitude: input.pickupLongitude.toString(),
          pickupAddress: input.pickupAddress,
          dropoffLatitude: input.dropoffLatitude.toString(),
          dropoffLongitude: input.dropoffLongitude.toString(),
          dropoffAddress: input.dropoffAddress,
          distance: input.distance?.toString(),
          estimatedDuration: input.estimatedDuration,
          baseFare: input.baseFare.toString(),
          distanceFare: input.distanceFare?.toString(),
          timeFare: input.timeFare?.toString(),
          totalFare: input.totalFare.toString(),
          vehicleType: input.vehicleType,
          paymentMethod: input.paymentMethod,
        });
      }),

    update: protectedProcedure
      .input(updateRideSchema)
      .mutation(async ({ ctx, input }) => {
        await db.updateRide(input.rideId, {
          status: input.status,
          driverId: input.driverId,
          actualDuration: input.actualDuration,
          paymentStatus: input.paymentStatus,
          cancellationReason: input.cancellationReason,
        });
        return db.getRide(input.rideId);
      }),

    getRiderHistory: protectedProcedure
      .input(z.object({ limit: z.number().default(20) }))
      .query(async ({ ctx, input }) => {
        return db.getRiderRideHistory(ctx.user.id, input.limit);
      }),

    getDriverHistory: protectedProcedure
      .input(z.object({ limit: z.number().default(20) }))
      .query(async ({ ctx, input }) => {
        return db.getDriverRideHistory(ctx.user.id, input.limit);
      }),

    getActive: protectedProcedure
      .input(z.object({ userType: z.enum(["rider", "driver"]) }))
      .query(async ({ ctx, input }) => {
        return db.getActiveRides(ctx.user.id, input.userType);
      }),
  }),

  // ============ RATING ROUTES ============

  rating: router({
    create: protectedProcedure
      .input(createRatingSchema)
      .mutation(async ({ ctx, input }) => {
        return db.createRating({
          rideId: input.rideId,
          ratedById: ctx.user.id,
          ratedUserId: input.ratedUserId,
          ratingType: input.ratingType,
          score: input.score,
          comment: input.comment,
        });
      }),

    get: protectedProcedure
      .input(z.object({ rideId: z.number() }))
      .query(async ({ input }) => {
        return db.getRating(input.rideId);
      }),

    getUserRatings: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return db.getUserRatings(input.userId);
      }),
  }),

  // ============ PAYMENT METHOD ROUTES ============

  paymentMethod: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserPaymentMethods(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          paymentType: z.enum(["card", "wallet", "bank_transfer"]),
          cardLast4: z.string().optional(),
          cardBrand: z.string().optional(),
          isDefault: z.boolean().default(false),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return db.createPaymentMethod({
          userId: ctx.user.id,
          paymentType: input.paymentType,
          cardLast4: input.cardLast4,
          cardBrand: input.cardBrand,
          isDefault: input.isDefault,
        });
      }),

    getDefault: protectedProcedure.query(async ({ ctx }) => {
      return db.getDefaultPaymentMethod(ctx.user.id);
    }),

    update: protectedProcedure
      .input(
        z.object({
          paymentMethodId: z.number(),
          isDefault: z.boolean().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await db.updatePaymentMethod(input.paymentMethodId, {
          isDefault: input.isDefault,
          isActive: input.isActive,
        });
        return { success: true };
      }),
  }),

  // ============ FARE CALCULATION ROUTES ============

  fare: router({
    calculate: publicProcedure
      .input(
        z.object({
          distance: z.number(),
          duration: z.number(),
          vehicleType: z.enum(["economy", "comfort", "premium"]).default("economy"),
        })
      )
      .query(({ input }) => {
        // Base fare by vehicle type
        const baseFares: Record<string, number> = {
          economy: 2.5,
          comfort: 4.0,
          premium: 6.0,
        };

        // Rate per km
        const ratePerKm: Record<string, number> = {
          economy: 1.5,
          comfort: 2.0,
          premium: 2.5,
        };

        // Rate per minute
        const ratePerMinute: Record<string, number> = {
          economy: 0.25,
          comfort: 0.35,
          premium: 0.5,
        };

        const baseFare = baseFares[input.vehicleType];
        const distanceFare = input.distance * ratePerKm[input.vehicleType];
        const timeFare = input.duration * ratePerMinute[input.vehicleType];
        const totalFare = baseFare + distanceFare + timeFare;

        return {
          baseFare: parseFloat(baseFare.toFixed(2)),
          distanceFare: parseFloat(distanceFare.toFixed(2)),
          timeFare: parseFloat(timeFare.toFixed(2)),
          totalFare: parseFloat(totalFare.toFixed(2)),
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
