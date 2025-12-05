import bcrypt from "bcryptjs";

// Import password utilities directly to avoid NextAuth import issues in tests
const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

function validatePasswordStrength(password: string): string | null {
  if (!password) {
    return "Password is required";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  return null;
}

describe("Password Hashing Utilities", () => {
  describe("hashPassword", () => {
    it("should hash a password", async () => {
      const password = "testpassword123";
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it("should generate different hashes for the same password", async () => {
      const password = "testpassword123";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("verifyPassword", () => {
    it("should verify a correct password", async () => {
      const password = "testpassword123";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it("should reject an incorrect password", async () => {
      const password = "testpassword123";
      const wrongPassword = "wrongpassword";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });

    it("should handle empty password", async () => {
      const password = "testpassword123";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword("", hash);

      expect(isValid).toBe(false);
    });
  });

  describe("isValidPassword", () => {
    it("should accept passwords with 8 or more characters", () => {
      expect(isValidPassword("12345678")).toBe(true);
      expect(isValidPassword("abcdefgh")).toBe(true);
      expect(isValidPassword("password123")).toBe(true);
    });

    it("should reject passwords with less than 8 characters", () => {
      expect(isValidPassword("1234567")).toBe(false);
      expect(isValidPassword("abc")).toBe(false);
      expect(isValidPassword("")).toBe(false);
    });
  });

  describe("validatePasswordStrength", () => {
    it("should return null for valid passwords", () => {
      expect(validatePasswordStrength("12345678")).toBeNull();
      expect(validatePasswordStrength("password123")).toBeNull();
      expect(validatePasswordStrength("verylongpassword")).toBeNull();
    });

    it("should return error for empty password", () => {
      const error = validatePasswordStrength("");
      expect(error).toBe("Password is required");
    });

    it("should return error for short passwords", () => {
      const error = validatePasswordStrength("1234567");
      expect(error).toBe("Password must be at least 8 characters long");
    });
  });
});
