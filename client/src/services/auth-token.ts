import { auth } from "@clerk/nextjs/server";

interface CachedToken {
  token: string;
  expiresAt: number; // Timestamp when the token expires
}

// In-memory cache for the token
let tokenCache: CachedToken | null = null;

// Buffer time before expiration to refresh token (5 minutes)
const EXPIRATION_BUFFER = 10 * 60 * 1000;

export async function getAuthToken(template = "testing"): Promise<string> {
  const authData = auth();

  if (!authData.userId) {
    return "";
  }

  // Get a new token
  const token = await authData.getToken({ template });
   
  if (!token) {
    return "";
  }
  return token

  const currentTime = Date.now();

  // Check if we have a cached token that's still valid (with buffer time)
  if (tokenCache && currentTime < tokenCache.expiresAt - EXPIRATION_BUFFER) {
    return tokenCache.token;
  }

  console.log("llamando token");

  

 

  // Parse the JWT to get the expiration time
  // JWT tokens have three parts separated by dots
  const tokenParts = token.split(".");
  if (tokenParts.length === 3) {
    try {
      // The second part contains the payload
      const payload = JSON.parse(atob(tokenParts[1]));

      // 'exp' is the standard JWT expiration claim (in seconds)
      if (payload.exp) {
        // Convert to milliseconds and store in cache
        tokenCache = {
          token,
          expiresAt: payload.exp * 1000, // Convert seconds to milliseconds
        };
      }
    } catch (error) {
      console.error("Failed to parse token expiration:", error);
      // If parsing fails, still cache the token but with a default expiration (1 hour)
      tokenCache = {
        token,
        expiresAt: currentTime + 60 * 60 * 1000, // 1 hour from now
      };
    }
  } else {
    // If token format is unexpected, still cache with default expiration
    tokenCache = {
      token,
      expiresAt: currentTime + 60 * 60 * 1000, // 1 hour from now
    };
  }

  return token;
}
