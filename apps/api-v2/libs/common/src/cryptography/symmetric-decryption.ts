import crypto from "node:crypto";
import { ALG } from "./algorithm";
// openssl rand -hex 32      <-- Generate 32-byte hex key for .env ENCRYPTION_KEY secret key

export const symmetricDecrypt = (encrypted: string): string => {
  // Get encryption key from environment variables
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY is not set");
  }

  // Split IV and encrypted data from input string
  const parts = encrypted.split(":");
  // shift() removes the first element from an array and returns it
  const iv = Buffer.from(parts.shift() ?? "", "hex");
  const data = Buffer.from(parts.join(":"), "hex");

  // Create decipher instance with key and IV
  const decipher = crypto.createDecipheriv(ALG, Buffer.from(key, "hex"), iv);

  // Perform initial decryption of the data
  let decrypted = decipher.update(data);

  // Concatenate initial decryption with final block
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  // Return decrypted data as string
  return decrypted.toString();
};
