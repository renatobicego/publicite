import { getUserActivePostandActiveRelationsNumber } from "@/services/subscriptionServices";
import { PostBehaviourType } from "@/types/postTypes";
import { useEffect, useState } from "react";
import { toastifyError } from "../functions/toastify";

const useUserPostLimit = (postBehaviourType?: PostBehaviourType) => {
  const [numberOfPosts, setNumberOfPosts] = useState<
    Record<PostBehaviourType, number>
  >({
    agenda: 0,
    libre: 0,
  });

  const [limits, setLimits] = useState<Record<PostBehaviourType, number>>({
    agenda: 0,
    libre: 0,
  });

  const [activeRelations, setActiveRelations] = useState<
    Record<"count" | "limit", number>
  >({
    count: 0,
    limit: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNumberOfPosts = async () => {
      const res = await getUserActivePostandActiveRelationsNumber();
      if ("error" in res) {
        toastifyError(
          "Error al traer el número de anuncios activos y relaciones activas. Por favor intenta de nuevo."
        );
        return;
      }
      console.log(res);
      setLimits({
        agenda: res.totalAgendaPostLimit,
        libre: res.totalLibrePostLimit,
      });
      setNumberOfPosts({
        agenda: res.agendaPostCount,
        libre: res.librePostCount,
      });
      setActiveRelations({
        count: res.contactCount,
        limit: res.contactLimit,
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
    activeRelations,
  };
};

export default useUserPostLimit;
