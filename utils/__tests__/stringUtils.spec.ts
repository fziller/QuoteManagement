import { validateEmail } from "../stringUtils";

describe("stringUtils", () => {
  it("validateEmail", () => {
    expect(validateEmail("j2o6o@example.com")).toBe(true);
    expect(validateEmail("invalid-email")).toBe(false);
    expect(validateEmail("abc@example")).toBe(false);
    expect(validateEmail("abc@example.")).toBe(false);
  });
});
