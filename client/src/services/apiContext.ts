import { auth } from "@clerk/nextjs/server";

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
    authToken = await user.getToken({ template: "testing" });
  } else {
    if (user.userId) {
      authToken = await user.getToken({ template: "testing" });
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
