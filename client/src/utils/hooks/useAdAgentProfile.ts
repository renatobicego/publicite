"use client";
import { useEffect, useState } from "react";
import { getAdAgentProfile } from "@/services/userServices";
import { AdAgentProfile } from "@/utils/data/adSpaces";

/**
 * Perfil de Empresa / Agente de un usuario (null si no lo es). Sirve para
 * saber si puede publicar espacios publicitarios y para mostrar sus impuestos.
 */
export const useAdAgentProfile = (userId?: string | null) => {
  const [profile, setProfile] = useState<AdAgentProfile | null>(null);
  const [loading, setLoading] = useState(!!userId);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    getAdAgentProfile(userId).then((res) => {
      if (!active) return;
      setProfile(res && !("error" in res) ? res : null);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [userId]);

  return { profile, isAdAgent: !!profile, loading, setProfile };
};
