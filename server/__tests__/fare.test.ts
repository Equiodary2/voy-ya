import { describe, it, expect } from "vitest";

/**
 * Fare calculation logic for Voy Ya
 * Base fare + distance fare + time fare
 */
function calculateFare(
  distance: number,
  duration: number,
  vehicleType: "economy" | "comfort" | "premium"
) {
  const baseFares: Record<string, number> = {
    economy: 2.5,
    comfort: 4.0,
    premium: 6.0,
  };

  const ratePerKm: Record<string, number> = {
    economy: 1.5,
    comfort: 2.0,
    premium: 2.5,
  };

  const ratePerMinute: Record<string, number> = {
    economy: 0.25,
    comfort: 0.35,
    premium: 0.5,
  };

  const baseFare = baseFares[vehicleType];
  const distanceFare = distance * ratePerKm[vehicleType];
  const timeFare = duration * ratePerMinute[vehicleType];
  const totalFare = baseFare + distanceFare + timeFare;

  return {
    baseFare: parseFloat(baseFare.toFixed(2)),
    distanceFare: parseFloat(distanceFare.toFixed(2)),
    timeFare: parseFloat(timeFare.toFixed(2)),
    totalFare: parseFloat(totalFare.toFixed(2)),
  };
}

describe("Fare Calculation", () => {
  describe("Economy Vehicle", () => {
    it("should calculate fare for short trip", () => {
      const result = calculateFare(5, 15, "economy");

      expect(result.baseFare).toBe(2.5);
      expect(result.distanceFare).toBe(7.5); // 5 * 1.5
      expect(result.timeFare).toBe(3.75); // 15 * 0.25
      expect(result.totalFare).toBe(13.75);
    });

    it("should calculate fare for long trip", () => {
      const result = calculateFare(20, 45, "economy");

      expect(result.baseFare).toBe(2.5);
      expect(result.distanceFare).toBe(30); // 20 * 1.5
      expect(result.timeFare).toBe(11.25); // 45 * 0.25
      expect(result.totalFare).toBe(43.75);
    });

    it("should handle zero distance", () => {
      const result = calculateFare(0, 5, "economy");

      expect(result.baseFare).toBe(2.5);
      expect(result.distanceFare).toBe(0);
      expect(result.timeFare).toBe(1.25); // 5 * 0.25
      expect(result.totalFare).toBe(3.75);
    });
  });

  describe("Comfort Vehicle", () => {
    it("should calculate fare with higher rates", () => {
      const result = calculateFare(5, 15, "comfort");

      expect(result.baseFare).toBe(4.0);
      expect(result.distanceFare).toBe(10); // 5 * 2.0
      expect(result.timeFare).toBe(5.25); // 15 * 0.35
      expect(result.totalFare).toBe(19.25);
    });
  });

  describe("Premium Vehicle", () => {
    it("should calculate fare with premium rates", () => {
      const result = calculateFare(5, 15, "premium");

      expect(result.baseFare).toBe(6.0);
      expect(result.distanceFare).toBe(12.5); // 5 * 2.5
      expect(result.timeFare).toBe(7.5); // 15 * 0.5
      expect(result.totalFare).toBe(26.0);
    });
  });

  describe("Fare Comparison", () => {
    it("economy should be cheapest", () => {
      const economy = calculateFare(10, 30, "economy");
      const comfort = calculateFare(10, 30, "comfort");
      const premium = calculateFare(10, 30, "premium");

      expect(economy.totalFare).toBeLessThan(comfort.totalFare);
      expect(comfort.totalFare).toBeLessThan(premium.totalFare);
    });
  });

  describe("Precision", () => {
    it("should round to 2 decimal places", () => {
      const result = calculateFare(3.33, 7.77, "economy");

      // Check that all values are properly rounded
      expect(result.baseFare.toString().split(".")[1]?.length || 0).toBeLessThanOrEqual(2);
      expect(result.distanceFare.toString().split(".")[1]?.length || 0).toBeLessThanOrEqual(2);
      expect(result.timeFare.toString().split(".")[1]?.length || 0).toBeLessThanOrEqual(2);
      expect(result.totalFare.toString().split(".")[1]?.length || 0).toBeLessThanOrEqual(2);
    });
  });
});
