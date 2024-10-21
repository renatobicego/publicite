import { getBoardByUsername } from "@/services/boardServices";
import { getSubscriptionsOfUser } from "@/services/subscriptionServices";
import { getUserPreferences } from "@/services/userServices";
import { Board } from "@/types/board";
import { Subscription } from "@/types/subscriptions";
import { UserPreferences } from "@/types/userTypes";
import { useState, useEffect } from "react";
import { toastifyError } from "../functions/toastify";

const useConfigData = (user: any) => {
  const [configData, setConfigData] = useState<{
    accountType: Subscription;
    postsPacks: Subscription[];
    board: Board;
    userPreferences: UserPreferences;
  }>();

  const fetchPreferences = async () => {
    const subscriptions = await getSubscriptionsOfUser(
      user?.publicMetadata.mongoId as string
    );
    const accountType = subscriptions.find(
      (subscription: Subscription) => !subscription.subscriptionPlan.isPostPack
    );
    const postsPacks = subscriptions.filter(
      (subscription: Subscription) => subscription.subscriptionPlan.isPostPack
    );
    const preferences = await getUserPreferences(user.username);
    const userBoard = await getBoardByUsername(user.username);
    if (!preferences || preferences.error || !userBoard || userBoard.error) {
      toastifyError(preferences.error || userBoard.error);
      return;
    }
    setConfigData({
      accountType,
      postsPacks,
      board: userBoard.board
        ? {
            ...userBoard.board,
            user: {
              name: userBoard.name,
              username: userBoard.username,
              profilePhotoUrl: userBoard.profilePhotoUrl,
            },
          }
        : null,
      userPreferences: preferences,
    });
  };
  useEffect(() => {
    if (!user) return;
    fetchPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return configData;
};

export default useConfigData;
