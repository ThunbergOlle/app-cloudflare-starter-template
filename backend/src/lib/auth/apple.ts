// Apple Sign-In token verification utilities

interface ApplePublicKey {
  kty: string;
  kid: string;
  use: string;
  alg: string;
  n: string;
  e: string;
}

interface AppleKeysResponse {
  keys: ApplePublicKey[];
}

interface AppleIdTokenPayload {
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  sub: string; // Apple user identifier
  email?: string;
  email_verified?: boolean;
  is_private_email?: boolean;
  real_user_status?: number;
}

interface AppleIdTokenHeader {
  kid: string;
  alg: string;
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

// Convert base64 string to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Fetch Apple's public keys
async function fetchApplePublicKeys(): Promise<AppleKeysResponse> {
  const response = await fetch('https://appleid.apple.com/auth/keys');
  if (!response.ok) {
    throw new Error('Failed to fetch Apple public keys');
  }
  return response.json();
}

// Find the correct public key for the token
function findPublicKey(keys: ApplePublicKey[], kid: string): ApplePublicKey | null {
  return keys.find(key => key.kid === kid) || null;
}

// Import RSA public key for verification
async function importRSAPublicKey(n: string, e: string): Promise<CryptoKey> {
  // Convert base64url to ArrayBuffer
  const nBuffer = base64ToArrayBuffer(n.replace(/-/g, '+').replace(/_/g, '/'));
  const eBuffer = base64ToArrayBuffer(e.replace(/-/g, '+').replace(/_/g, '/'));

  // Create JWK format
  const jwk = {
    kty: 'RSA',
    n: n,
    e: e,
    alg: 'RS256',
    use: 'sig',
  };

  return await crypto.subtle.importKey(
    'jwk',
    jwk,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['verify']
  );
}

// Verify the JWT signature
async function verifySignature(
  token: string,
  publicKey: CryptoKey
): Promise<boolean> {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  const [header, payload, signature] = parts;
  const message = `${header}.${payload}`;
  const signatureBytes = base64UrlDecode(signature);

  return await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    publicKey,
    signatureBytes,
    new TextEncoder().encode(message)
  );
}

// Main function to verify Apple ID token
export async function verifyAppleIdToken(
  idToken: string,
  bundleId?: string
): Promise<{ valid: boolean; payload?: AppleIdTokenPayload }> {
  try {
    // Basic token format validation
    if (!idToken || typeof idToken !== 'string') {
      console.error('Invalid token format: token is not a string');
      return { valid: false };
    }

    const parts = idToken.split('.');
    if (parts.length !== 3) {
      console.error('Invalid token format: expected 3 parts, got', parts.length);
      return { valid: false };
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    // Decode header and payload
    const headerBytes = base64UrlDecode(headerB64);
    const payloadBytes = base64UrlDecode(payloadB64);
    
    const header: AppleIdTokenHeader = JSON.parse(new TextDecoder().decode(headerBytes));
    const payload: AppleIdTokenPayload = JSON.parse(new TextDecoder().decode(payloadBytes));

    // Verify basic token structure
    if (!header.kid || header.alg !== 'RS256') {
      console.error('Invalid token header:', { kid: header.kid, alg: header.alg });
      return { valid: false };
    }

    // Verify issuer
    if (payload.iss !== 'https://appleid.apple.com') {
      console.error('Invalid issuer:', payload.iss);
      return { valid: false };
    }

    // Verify audience (your app's bundle ID) if provided
    if (bundleId && payload.aud !== bundleId) {
      console.error('Bundle ID mismatch:', { expected: bundleId, actual: payload.aud });
      return { valid: false };
    }

    // Verify expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      console.error('Token expired:', { exp: payload.exp, now });
      return { valid: false };
    }

    // Verify not-before time
    if (payload.iat > now + 60) { // Allow 60 seconds clock skew
      console.error('Token not yet valid:', { iat: payload.iat, now });
      return { valid: false };
    }

    // For development/testing: Skip signature verification if no bundle ID is provided
    if (!bundleId) {
      console.log('Development mode: Skipping signature verification');
      return { valid: true, payload };
    }

    // Fetch Apple's public keys
    const appleKeys = await fetchApplePublicKeys();
    const publicKeyData = findPublicKey(appleKeys.keys, header.kid);

    if (!publicKeyData) {
      console.error('Public key not found for kid:', header.kid);
      return { valid: false };
    }

    // Import the public key
    const publicKey = await importRSAPublicKey(publicKeyData.n, publicKeyData.e);

    // Verify signature
    const isValidSignature = await verifySignature(idToken, publicKey);

    if (!isValidSignature) {
      console.error('Signature verification failed');
      return { valid: false };
    }

    return { valid: true, payload };
  } catch (error) {
    console.error('Error verifying Apple ID token:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      tokenParts: idToken.split('.').length,
    });
    return { valid: false };
  }
}

// Generate a random Apple user ID for testing (development only)
export function generateTestAppleUserId(): string {
  return `test_apple_${Math.random().toString(36).substring(2, 15)}`;
}