import { auth, getAuth } from "@clerk/nextjs/server";
import { getAuthToken } from "./auth-token";

export const getApiContext = async (
  sendTokenNotRegistered?: boolean,
  token?: string | null
) => {
  const user = auth();
  let authToken: string | null;

  if (token) {
    authToken = token;
    return {
      context: {
        headers: {
          Authorization: token,
        },
      },
    };
  }

  if (!sendTokenNotRegistered) {
    authToken = await getAuthToken();
  } else {
    if (user.userId) {
      authToken = await getAuthToken();
    } else {
      authToken = process.env.NOT_REGISTERED_TOKEN || "";
    }
  }

  return {
    context: {
      headers: {
        Authorization: authToken,
      },
    },
  };
};
