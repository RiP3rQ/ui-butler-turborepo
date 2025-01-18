import crypto from "node:crypto";
import { ALG } from "./algorythm";

/**
 * Encrypts a string using AES-256-CBC symmetric encryption.
 * Requires ENCRYPTION_KEY env variable (32-byte hex).
 * Returns format: "iv:encryptedData" in hex.
 *
 * @param value - Text to encrypt
 * @returns Encrypted hex string
 * @throws If ENCRYPTION_KEY is not set
 */
export const symmetricEncrypt = (value: string): string => {
  // Get encryption key from environment variables
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY is not set");
  }

  // Generate random 16-byte initialization vector
  const iv = crypto.randomBytes(16);

  // Create cipher instance with key and IV
  const cipher = crypto.createCipheriv(ALG, Buffer.from(key, "hex"), iv);

  // Perform initial encryption of the value
  let encrypted = cipher.update(value);

  // Concatenate initial encryption with final block
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  // Return IV and encrypted data as hex strings, separated by colon
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
};
