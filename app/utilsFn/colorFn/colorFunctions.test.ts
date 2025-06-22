import { darkenColor } from "./darkenColor";
import { lightenColor } from "./lightenColor";

describe("Color Functions", () => {
  describe("darkenColor", () => {
    it("should darken a normal RGB color", () => {
      const input = [255, 128, 64];
      const expected = [178, 89, 44]; // Each value * 0.7, floored
      const result = darkenColor(input);

      expect(result).toEqual(expected);
    });

    it("should handle pure white", () => {
      const input = [255, 255, 255];
      const expected = [178, 178, 178]; // 255 * 0.7 = 178.5, floored to 178
      const result = darkenColor(input);

      expect(result).toEqual(expected);
    });

    it("should handle pure black", () => {
      const input = [0, 0, 0];
      const expected = [0, 0, 0]; // Black stays black
      const result = darkenColor(input);

      expect(result).toEqual(expected);
    });

    it("should not mutate the original array", () => {
      const input = [100, 150, 200];
      const original = [...input];

      darkenColor(input);

      expect(input).toEqual(original);
    });

    it("should clamp values to valid RGB range", () => {
      const input = [10, 5, 2];
      const result = darkenColor(input);

      expect(result.every((val) => val >= 0 && val <= 255)).toBe(true);
    });
  });

  describe("lightenColor", () => {
    it("should lighten a normal RGB color", () => {
      const input = [100, 50, 200];
      // Formula: channel + (255 - channel) * 0.3
      const expected = [146, 111, 216];
      const result = lightenColor(input);

      expect(result).toEqual(expected);
    });

    it("should handle pure black", () => {
      const input = [0, 0, 0];
      const expected = [76, 76, 76]; // 0 + (255 - 0) * 0.3 = 76.5 -> 76
      const result = lightenColor(input);

      expect(result).toEqual(expected);
    });

    it("should handle pure white", () => {
      const input = [255, 255, 255];
      const expected = [255, 255, 255]; // White stays white
      const result = lightenColor(input);

      expect(result).toEqual(expected);
    });

    it("should not mutate the original array", () => {
      const input = [100, 150, 200];
      const original = [...input];

      lightenColor(input);

      expect(input).toEqual(original);
    });

    it("should clamp values to valid RGB range", () => {
      const input = [250, 240, 230];
      const result = lightenColor(input);

      expect(result.every((val) => val >= 0 && val <= 255)).toBe(true);
    });
  });

  describe("Integration tests", () => {
    it("darken then lighten should approximate original color", () => {
      const input = [128, 128, 128];
      const darkened = darkenColor(input);
      const lightened = lightenColor(darkened);

      // Should be closer to original than darkened version
      const originalDistance = input.reduce(
        (sum, val, i) => sum + Math.abs(val - lightened[i]),
        0
      );
      const darkenedDistance = input.reduce(
        (sum, val, i) => sum + Math.abs(val - darkened[i]),
        0
      );

      expect(originalDistance).toBeLessThan(darkenedDistance);
    });

    it("both functions should handle RGBA values", () => {
      const input = [255, 128, 64, 128];
      const darkened = darkenColor(input);
      const lightened = lightenColor(input);

      expect(darkened).toHaveLength(4);
      expect(lightened).toHaveLength(4);
      expect(darkened.every((val) => val >= 0 && val <= 255)).toBe(true);
      expect(lightened.every((val) => val >= 0 && val <= 255)).toBe(true);
    });
  });
});
