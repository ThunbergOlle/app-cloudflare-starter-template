// JWT utilities using Web Crypto API for Cloudflare Workers compatibility

interface JWTPayload {
  userId: number;
  email: string;
  locale: string;
  iat: number;
  exp: number;
}

interface JWTHeader {
  alg: string;
  typ: string;
}

// Base64 URL encode (without padding)
function base64UrlEncode(data: ArrayBuffer | string): string {
  const bytes =
    typeof data === 'string'
      ? new TextEncoder().encode(data)
      : new Uint8Array(data);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Base64 URL decode
function base64UrlDecode(str: string): Uint8Array {
  // Add padding if needed
  str += '='.repeat((4 - (str.length % 4)) % 4);
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Create HMAC SHA-256 signature
async function createSignature(
  message: string,
  secret: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(message),
  );
  return base64UrlEncode(signature);
}

// Verify HMAC SHA-256 signature
async function verifySignature(
  message: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );

  const signatureBytes = base64UrlDecode(signature);
  return await crypto.subtle.verify(
    'HMAC',
    key,
    signatureBytes,
    encoder.encode(message),
  );
}

export async function createJWT(
  userId: number,
  email: string,
  locale: string,
  secret: string,
): Promise<string> {
  const header: JWTHeader = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const oneYearFromNow = now + 365 * 24 * 60 * 60; // 1 year in seconds

  const payload: JWTPayload = {
    userId,
    email,
    locale,
    iat: now,
    exp: oneYearFromNow,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const message = `${encodedHeader}.${encodedPayload}`;

  const signature = await createSignature(message, secret);

  return `${message}.${signature}`;
}

export async function verifyJWT(
  token: string,
  secret: string,
): Promise<{ valid: boolean; payload?: JWTPayload }> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false };
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const message = `${encodedHeader}.${encodedPayload}`;

    // Verify signature
    const isValidSignature = await verifySignature(message, signature, secret);
    if (!isValidSignature) {
      return { valid: false };
    }

    // Decode and validate payload
    const payloadBytes = base64UrlDecode(encodedPayload);
    const payloadString = new TextDecoder().decode(payloadBytes);
    const payload: JWTPayload = JSON.parse(payloadString);

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return { valid: false };
    }

    return { valid: true, payload };
  } catch (error) {
    return { valid: false };
  }
}

