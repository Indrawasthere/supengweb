import crypto from "crypto";

const ITERATIONS = 120_000;
const KEYLEN = 64;
const DIGEST = "sha512";

export function hashPassword(password: string, salt?: string) {
  const actualSalt = salt ?? crypto.randomBytes(16).toString("hex");
  const derived = crypto.pbkdf2Sync(password, actualSalt, ITERATIONS, KEYLEN, DIGEST);
  return {
    salt: actualSalt,
    hash: derived.toString("hex"),
  };
}

export function verifyPassword(password: string, stored: string) {
  // stored format: pbkdf2$<salt>$<hash>
  const [algo, salt, hash] = stored.split("$");
  if (algo !== "pbkdf2" || !salt || !hash) return false;

  const derived = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST);

  const hashBuf = Buffer.from(hash, "hex");
  return crypto.timingSafeEqual(derived, hashBuf);
}

export function formatStoredPassword(salt: string, hash: string) {
  return `pbkdf2$${salt}$${hash}`;
}
