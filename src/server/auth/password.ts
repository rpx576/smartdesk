import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

/**
 * Password hashing with Node's built-in scrypt (no native add-ons).
 * Stored format: `scrypt$N$r$p$<salt base64>$<hash base64>`, so parameters
 * can be raised later without invalidating existing hashes.
 */
const PARAMS = { N: 16384, r: 8, p: 1 } as const;
const KEY_LENGTH = 64;
const SALT_BYTES = 16;

function derive(password: string, salt: Buffer, options: ScryptOptions, keyLength: number) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password.normalize("NFKC"), salt, keyLength, options, (error, key) =>
      error ? reject(error) : resolve(key),
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const key = await derive(password, salt, PARAMS, KEY_LENGTH);
  return ["scrypt", PARAMS.N, PARAMS.r, PARAMS.p, salt.toString("base64"), key.toString("base64")].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, n, r, p, saltB64, hashB64] = stored.split("$");
  if (algorithm !== "scrypt" || !saltB64 || !hashB64) return false;

  const expected = Buffer.from(hashB64, "base64");
  const options = { N: Number(n), r: Number(r), p: Number(p), maxmem: 64 * 1024 * 1024 };
  const actual = await derive(password, Buffer.from(saltB64, "base64"), options, expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** A valid hash of a random password, used to keep timing constant for unknown emails. */
let dummyHash: Promise<string> | undefined;
export function getDummyHash(): Promise<string> {
  dummyHash ??= hashPassword(randomBytes(32).toString("hex"));
  return dummyHash;
}
