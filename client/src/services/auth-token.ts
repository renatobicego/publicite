import { auth } from "@clerk/nextjs/server";

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
  return token;
}
