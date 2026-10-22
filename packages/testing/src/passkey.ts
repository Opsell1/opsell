// A software WebAuthn authenticator, so contract tests sign Platform Staff in through the real
// passkey ceremonies, the way a browser would, with no test-only endpoints (ADR 0009). It makes
// P-256 credentials with "none" attestation and signs assertions with them.
import { createHash, generateKeyPairSync, type KeyObject, randomBytes, sign } from "node:crypto";

type Cbor = number | Uint8Array | string | Map<Cbor, Cbor>;

/** Just enough CBOR (RFC 8949) for an attestation object and a COSE key. */
function cbor(value: Cbor): Buffer {
  const head = (major: number, length: number) => {
    if (length < 24) return Buffer.from([(major << 5) | length]);
    if (length < 0x100) return Buffer.from([(major << 5) | 24, length]);
    const b = Buffer.alloc(3);
    b[0] = (major << 5) | 25;
    b.writeUInt16BE(length, 1);
    return b;
  };
  if (typeof value === "number") return value >= 0 ? head(0, value) : head(1, -1 - value);
  if (typeof value === "string") {
    const bytes = Buffer.from(value, "utf8");
    return Buffer.concat([head(3, bytes.length), bytes]);
  }
  if (value instanceof Uint8Array) return Buffer.concat([head(2, value.length), value]);
  const parts: Buffer[] = [head(5, value.size)];
  for (const [key, item] of value) parts.push(cbor(key), cbor(item));
  return Buffer.concat(parts);
}

const sha256 = (data: Buffer | string) => createHash("sha256").update(data).digest();
const b64url = (data: Buffer) => data.toString("base64url");

/** WebAuthn flags: user present, user verified, attested credential data included. */
const UP = 0x01;
const UV = 0x04;
const AT = 0x40;

interface Credential {
  id: Buffer;
  rpId: string;
  privateKey: KeyObject;
  counter: number;
}

export interface RegistrationOptions {
  challenge: string;
  rp: { id?: string; name: string };
}

export interface AuthenticationOptions {
  challenge: string;
  rpId?: string;
}

/** One device holding passkeys, like a phone or a security key. */
export class VirtualAuthenticator {
  readonly #credentials: Credential[] = [];

  /** Answers `navigator.credentials.create()` for registration `options` at `origin`. */
  register(options: RegistrationOptions, origin: string) {
    const rpId = options.rp.id ?? new URL(origin).hostname;
    const { privateKey, publicKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
    const jwk = publicKey.export({ format: "jwk" });
    if (!jwk.x || !jwk.y) throw new Error("P-256 key without coordinates");
    const credential: Credential = { id: randomBytes(32), rpId, privateKey, counter: 0 };
    this.#credentials.push(credential);

    // COSE_Key: kty EC2, alg ES256, crv P-256, x, y.
    const coseKey = cbor(
      new Map<Cbor, Cbor>([
        [1, 2],
        [3, -7],
        [-1, 1],
        [-2, Buffer.from(jwk.x, "base64url")],
        [-3, Buffer.from(jwk.y, "base64url")],
      ]),
    );
    const idLength = Buffer.alloc(2);
    idLength.writeUInt16BE(credential.id.length);
    const authData = Buffer.concat([
      sha256(rpId),
      Buffer.from([UP | UV | AT]),
      Buffer.alloc(4),
      Buffer.alloc(16),
      idLength,
      credential.id,
      coseKey,
    ]);
    const clientDataJSON = Buffer.from(
      JSON.stringify({ type: "webauthn.create", challenge: options.challenge, origin }),
    );
    return {
      id: b64url(credential.id),
      rawId: b64url(credential.id),
      type: "public-key",
      authenticatorAttachment: "platform",
      clientExtensionResults: {},
      response: {
        clientDataJSON: b64url(clientDataJSON),
        attestationObject: b64url(
          cbor(
            new Map<Cbor, Cbor>([
              ["fmt", "none"],
              ["attStmt", new Map()],
              ["authData", authData],
            ]),
          ),
        ),
        transports: ["internal"],
      },
    };
  }

  /** Answers `navigator.credentials.get()` for `options` at `origin`, with the newest passkey. */
  authenticate(options: AuthenticationOptions, origin: string) {
    const rpId = options.rpId ?? new URL(origin).hostname;
    const credential = this.#credentials.findLast((c) => c.rpId === rpId);
    if (!credential) throw new Error(`No passkey for ${rpId} on this authenticator`);
    credential.counter += 1;
    const counter = Buffer.alloc(4);
    counter.writeUInt32BE(credential.counter);
    const authenticatorData = Buffer.concat([sha256(rpId), Buffer.from([UP | UV]), counter]);
    const clientDataJSON = Buffer.from(
      JSON.stringify({ type: "webauthn.get", challenge: options.challenge, origin }),
    );
    const signature = sign("sha256", Buffer.concat([authenticatorData, sha256(clientDataJSON)]), {
      key: credential.privateKey,
      dsaEncoding: "der",
    });
    return {
      id: b64url(credential.id),
      rawId: b64url(credential.id),
      type: "public-key",
      authenticatorAttachment: "platform",
      clientExtensionResults: {},
      response: {
        clientDataJSON: b64url(clientDataJSON),
        authenticatorData: b64url(authenticatorData),
        signature: b64url(signature),
      },
    };
  }
}

/** Cookies a response set, as one Cookie header value merged over `previous`. */
function mergeCookies(previous: string, response: Response): string {
  const jar = new Map(
    previous
      .split("; ")
      .filter(Boolean)
      .map((pair) => [pair.slice(0, pair.indexOf("=")), pair] as const),
  );
  for (const cookie of response.headers.getSetCookie()) {
    const pair = cookie.split(";")[0] ?? "";
    jar.set(pair.slice(0, pair.indexOf("=")), pair);
  }
  return [...jar.values()].join("; ");
}

interface PasskeyCeremony {
  apiOrigin: string;
  /** The console's origin, as the browser sends it and as the passkey is bound to. */
  consoleOrigin: string;
  authenticator: VirtualAuthenticator;
}

async function ceremony(
  { apiOrigin, consoleOrigin }: PasskeyCeremony,
  optionsPath: string,
  verifyPath: string,
  respond: (options: never) => unknown,
  extraBody: Record<string, unknown> = {},
): Promise<{ response: Response; cookie: string }> {
  const base = `${apiOrigin}/api/console/auth`;
  const optionsResponse = await fetch(`${base}${optionsPath}`, {
    headers: { origin: consoleOrigin },
  });
  if (!optionsResponse.ok) {
    return { response: optionsResponse, cookie: "" };
  }
  const challengeCookie = mergeCookies("", optionsResponse);
  const credential = respond((await optionsResponse.json()) as never);
  const response = await fetch(`${base}${verifyPath}`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: consoleOrigin, cookie: challengeCookie },
    body: JSON.stringify({ response: credential, ...extraBody }),
  });
  return { response, cookie: mergeCookies("", response) };
}

/**
 * Registers a first passkey with an enrollment token, as the console's enroll page does, and
 * returns the response and the session cookie it set.
 */
export function enrollPasskey(options: PasskeyCeremony & { token: string }) {
  const { authenticator, consoleOrigin, token } = options;
  return ceremony(
    options,
    `/passkey/generate-register-options?context=${encodeURIComponent(token)}`,
    "/passkey/verify-registration",
    (registration: RegistrationOptions) => authenticator.register(registration, consoleOrigin),
    { createSession: true },
  );
}

/** Signs in with a passkey, as the console's sign-in page does. */
export function signInWithPasskey(options: PasskeyCeremony) {
  const { authenticator, consoleOrigin } = options;
  return ceremony(
    options,
    "/passkey/generate-authenticate-options",
    "/passkey/verify-authentication",
    (authentication: AuthenticationOptions) =>
      authenticator.authenticate(authentication, consoleOrigin),
  );
}
