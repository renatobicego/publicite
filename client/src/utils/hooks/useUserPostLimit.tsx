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

  // Extra temporal de un cambio de plan: hasta cuándo dura y cómo quedan los límites.
  const [carryover, setCarryover] = useState<{
    until: string;
    agenda: number;
    libre: number;
    contacts: number;
  } | null>(null);

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
      setCarryover(
        res.carryoverExpiresAt
          ? {
              until: res.carryoverExpiresAt,
              agenda: res.totalAgendaPostLimitAfterCarryover ?? 0,
              libre: res.totalLibrePostLimitAfterCarryover ?? 0,
              contacts: res.contactLimitAfterCarryover ?? 0,
            }
          : null
      );
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
    carryover,
  };
};

export default useUserPostLimit;
