import {
  getSubscriptionsOfUser,
  getUserActivePostNumber,
} from "@/services/subscriptionServices";
import { Subscription } from "@/types/subscriptions";
import { useEffect, useState } from "react";

const useUserPostLimit = (userId: string) => {
  const [subscriptionsUser, setSubscriptionsUser] = useState<Subscription[]>(
    []
  );
  const [numberOfPosts, setNumberOfPosts] = useState(0);

  useEffect(() => {
    const fetchSubscriptionsUser = async () => {
      const susbcriptionsOfUser = await getSubscriptionsOfUser(userId);
      setSubscriptionsUser(susbcriptionsOfUser);
    };

    const fetchNumberOfPosts = async () => {
      setNumberOfPosts(await getUserActivePostNumber(userId));
    };

    fetchSubscriptionsUser();
    fetchNumberOfPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate the total post limit from active subscriptions
  const postLimit = subscriptionsUser.reduce((acc, subscription) => {
    if (subscription.status === "active") {
      return acc + subscription.subscriptionPlan.postLimit;
    }
    return acc;
  }, 0); // Initialize accumulator to 0
  const limit = postLimit || 5;

  return {
    userCanPublishPost: numberOfPosts < limit,
    limit,
    numberOfPosts: numberOfPosts,
  };
};

export default useUserPostLimit;
