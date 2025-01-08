import { auth } from "@clerk/nextjs/server";

export const getApiContext = async (sendTokenNotRegistered?: boolean) => {
  const user = auth();
  let authToken: string | null;

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
