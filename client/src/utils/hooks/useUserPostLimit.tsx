import {
  getSubscriptionsOfUser,
  getUserActivePostNumber,
} from "@/services/subscriptionServices";
import { PostBehaviourType } from "@/types/postTypes";
import { Subscription } from "@/types/subscriptions";
import { useEffect, useState } from "react";

const useUserPostLimit = (
  userId: string,
  postBehaviourType?: PostBehaviourType
) => {
  const [subscriptionsUser, setSubscriptionsUser] = useState<Subscription[]>(
    []
  );
  const [numberOfPosts, setNumberOfPosts] = useState<
    Record<PostBehaviourType, number>
  >({
    agenda: 0,
    libre: 0,
  });

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchSubscriptionsUser = async () => {
      const susbcriptionsOfUser = await getSubscriptionsOfUser(userId, signal);
      setSubscriptionsUser(susbcriptionsOfUser);
    };

    const fetchNumberOfPosts = async () => {
      setNumberOfPosts(await getUserActivePostNumber(userId));
    };

    fetchSubscriptionsUser();
    fetchNumberOfPosts();

    return () => abortController.abort(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate the total post limit from active subscriptions
  const postAgendaLimit = subscriptionsUser.reduce((acc, subscription) => {
    if (subscription.status === "active") {
      return acc + subscription.subscriptionPlan.postsAgendaCount;
    }
    return acc;
  }, 0);

  const postLibreLimit = subscriptionsUser.reduce((acc, subscription) => {
    if (subscription.status === "active") {
      return acc + subscription.subscriptionPlan.postsLibresCount;
    }
    return acc;
  }, 0);

  const limit = {
    agenda: postAgendaLimit,
    libre: postLibreLimit,
  };

  return {
    userCanPublishPost: postBehaviourType
      ? numberOfPosts[postBehaviourType] < limit[postBehaviourType]
      : true,
    limit,
    numberOfPosts,
  };
};

export default useUserPostLimit;
