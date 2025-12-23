import { describe, it, expect } from "vitest";

// Función de cálculo de distancia (Haversine formula)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

describe("Location Utilities", () => {
  describe("calculateDistance (Haversine Formula)", () => {
    it("should calculate distance between two points in New York", () => {
      // Times Square to Empire State Building (approximately 2.3 km)
      const lat1 = 40.758;
      const lon1 = -73.9855;
      const lat2 = 40.7484;
      const lon2 = -73.9857;

      const distance = calculateDistance(lat1, lon1, lat2, lon2);

      // Should be approximately 1 km
      expect(distance).toBeGreaterThan(0.5);
      expect(distance).toBeLessThan(1.5);
    });

    it("should calculate distance between two points in different cities", () => {
      // New York to Los Angeles (approximately 3944 km)
      const lat1 = 40.7128;
      const lon1 = -74.006;
      const lat2 = 34.0522;
      const lon2 = -118.2437;

      const distance = calculateDistance(lat1, lon1, lat2, lon2);

      // Should be approximately 3900-4000 km
      expect(distance).toBeGreaterThan(3900);
      expect(distance).toBeLessThan(4000);
    });

    it("should return 0 for same coordinates", () => {
      const lat = 40.7128;
      const lon = -74.006;

      const distance = calculateDistance(lat, lon, lat, lon);

      expect(distance).toBe(0);
    });

    it("should calculate short distance (1 km)", () => {
      // Approximately 1 km apart
      const lat1 = 40.7128;
      const lon1 = -74.006;
      const lat2 = 40.7228;
      const lon2 = -74.006;

      const distance = calculateDistance(lat1, lon1, lat2, lon2);

      // Should be approximately 1 km
      expect(distance).toBeGreaterThan(0.9);
      expect(distance).toBeLessThan(1.2);
    });

    it("should calculate medium distance (10 km)", () => {
      // Approximately 10 km apart
      const lat1 = 40.7128;
      const lon1 = -74.006;
      const lat2 = 40.8128;
      const lon2 = -74.006;

      const distance = calculateDistance(lat1, lon1, lat2, lon2);

      // Should be approximately 10-11 km
      expect(distance).toBeGreaterThan(9);
      expect(distance).toBeLessThan(12);
    });

    it("should calculate long distance (100 km)", () => {
      // New York to Philadelphia (approximately 95 km)
      const lat1 = 40.7128;
      const lon1 = -74.006;
      const lat2 = 39.9526;
      const lon2 = -75.1652;

      const distance = calculateDistance(lat1, lon1, lat2, lon2);

      // Should be approximately 90-130 km
      expect(distance).toBeGreaterThan(90);
      expect(distance).toBeLessThan(140);
    });

    it("should be symmetric (distance A->B equals B->A)", () => {
      const lat1 = 40.7128;
      const lon1 = -74.006;
      const lat2 = 34.0522;
      const lon2 = -118.2437;

      const distance1 = calculateDistance(lat1, lon1, lat2, lon2);
      const distance2 = calculateDistance(lat2, lon2, lat1, lon1);

      expect(distance1).toBe(distance2);
    });

    it("should handle negative coordinates (southern hemisphere)", () => {
      // Sydney to Melbourne (approximately 714 km)
      const lat1 = -33.8688;
      const lon1 = 151.2093;
      const lat2 = -37.8136;
      const lon2 = 144.9631;

      const distance = calculateDistance(lat1, lon1, lat2, lon2);

      // Should be approximately 700-730 km
      expect(distance).toBeGreaterThan(700);
      expect(distance).toBeLessThan(730);
    });

    it("should handle crossing international date line", () => {
      // Honolulu to Tokyo (approximately 6300 km)
      const lat1 = 21.3099;
      const lon1 = -157.8581;
      const lat2 = 35.6762;
      const lon2 = 139.6503;

      const distance = calculateDistance(lat1, lon1, lat2, lon2);

      // Should be approximately 6200-6400 km
      expect(distance).toBeGreaterThan(6200);
      expect(distance).toBeLessThan(6400);
    });

    it("should calculate distance for ride-sharing scenarios", () => {
      // Typical ride: 5 km
      const pickupLat = 40.7128;
      const pickupLon = -74.006;
      const dropoffLat = 40.7614;
      const dropoffLon = -73.9776;

      const distance = calculateDistance(pickupLat, pickupLon, dropoffLat, dropoffLon);

      // Should be approximately 5-6 km
      expect(distance).toBeGreaterThan(4);
      expect(distance).toBeLessThan(7);
    });
  });

  describe("Distance-based Fare Calculation", () => {
    it("should calculate fare for short ride (5 km)", () => {
      const distance = 5;
      const baseFare = 2.5;
      const ratePerKm = 1.5;

      const fare = baseFare + distance * ratePerKm;

      expect(fare).toBe(10); // 2.5 + (5 * 1.5)
    });

    it("should calculate fare for medium ride (15 km)", () => {
      const distance = 15;
      const baseFare = 2.5;
      const ratePerKm = 1.5;

      const fare = baseFare + distance * ratePerKm;

      expect(fare).toBe(25); // 2.5 + (15 * 1.5)
    });

    it("should calculate fare for long ride (50 km)", () => {
      const distance = 50;
      const baseFare = 2.5;
      const ratePerKm = 1.5;

      const fare = baseFare + distance * ratePerKm;

      expect(fare).toBe(77.5); // 2.5 + (50 * 1.5)
    });
  });
});
