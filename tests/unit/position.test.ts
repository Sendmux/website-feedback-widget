import { normalisePosition } from "../../src/position";

test("normalises position aliases", () => {
  expect(normalisePosition("centre")).toBe("center");
  expect(normalisePosition("middle")).toBe("center");
  expect(normalisePosition("middle-centre")).toBe("center");
  expect(normalisePosition("top-centre")).toBe("top-center");
  expect(normalisePosition("top-middle")).toBe("top-center");
  expect(normalisePosition("right-middle")).toBe("middle-right");
  expect(normalisePosition("bottom-centre")).toBe("bottom-center");
});

test("falls back to bottom-right for invalid positions", () => {
  expect(normalisePosition("somewhere")).toBe("bottom-right");
  expect(normalisePosition(undefined)).toBe("bottom-right");
});
