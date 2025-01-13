import {
  getSubscriptionsOfUser,
  getUserActivePostNumber,
} from "@/services/subscriptionServices";
import { PostBehaviourType } from "@/types/postTypes";
import { Subscription } from "@/types/subscriptions";
import { useEffect, useState } from "react";
import { toastifyError } from "../functions/toastify";

const useUserPostLimit = (
  userId: string,
  postBehaviourType?: PostBehaviourType
) => {
  const [numberOfPosts, setNumberOfPosts] = useState<
    Record<PostBehaviourType, number>
  >({
    agenda: 0,
    libre: 0,
  });

  const [limits, setLimits] = useState({
    agenda: 0,
    libre: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNumberOfPosts = async () => {
      const res = await getUserActivePostNumber();
      if ("error" in res) {
        toastifyError(
          "Error al traer el número de anuncios activos. Por favor intenta de nuevo."
        );
        return;
      }
      setLimits({
        agenda: res.totalAgendaPostLimit,
        libre: res.totalLibrePostLimit,
      });
      setNumberOfPosts({
        agenda: res.agendaPostCount,
        libre: res.librePostCount,
      });
      setLoading(false);
    };

    fetchNumberOfPosts();
  }, []);

  return {
    userCanPublishPost: postBehaviourType
      ? numberOfPosts[postBehaviourType] < limits[postBehaviourType]
      : true,
    limit: limits,
    numberOfPosts,
    loading,
  };
};

export default useUserPostLimit;
