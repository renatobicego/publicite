"use client";

import { useEffect, useState } from "react";
import { Button, Link, Progress, Spinner } from "@nextui-org/react";
import { HiSparkles } from "react-icons/hi2";
import DataBox, { DataItem } from "../../DataBox";
import { getMyChatbotTokenStatus } from "@/services/chatbotServices";
import { ChatbotTokenStatus } from "@/types/chatbotTypes";
import { SUBSCRIPTIONS } from "@/utils/data/urls";

/**
 * Card del perfil con los tokens Publicité de IA que le quedan al usuario
 * en el período (cuota del plan, o cuota gratuita si no tiene plan pago).
 */
const AiTokensLimit = () => {
  const [status, setStatus] = useState<ChatbotTokenStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await getMyChatbotTokenStatus();
        if (!res || "error" in res) {
          setHasError(true);
          return;
        }
        setStatus(res);
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const formatTokens = (value: number) =>
    value.toLocaleString("es-AR", { maximumFractionDigits: 2 });

  const resetsAtLabel = status
    ? new Date(status.resetsAt).toLocaleDateString("es-AR", {
        day: "numeric",
        month: "long",
        timeZone: "UTC",
      })
    : "";

  return (
    <DataBox
      key="dataAiTokens"
      className="max-md:my-2.5 !items-start"
      labelText="Tokens Publicité de IA"
      labelClassname="md:w-1/4 md:my-2.5 max-md:flex-none max-md:max-w-[65%] max-md:min-w-[40px]"
    >
      <div className="flex flex-col gap-2 flex-1 my-2.5">
        {isLoading ? (
          <Spinner size="sm" className="self-start" />
        ) : hasError || !status ? (
          <DataItem className="font-normal">
            No pudimos cargar tus tokens de IA. Intentá de nuevo más tarde.
          </DataItem>
        ) : (
          <>
            <DataItem className="font-normal" asDiv>
              <HiSparkles className="shrink-0 text-secondary" />
              <span>
                Te quedan{" "}
                <em className="font-semibold">
                  {formatTokens(status.remaining)} de{" "}
                  {formatTokens(status.allowance)}
                </em>{" "}
                tokens{" "}
                {status.hasActivePaidPlan
                  ? "de tu plan"
                  : "de tu cuota gratuita"}
              </span>
            </DataItem>
            <Progress
              aria-label="Tokens Publicité de IA restantes"
              value={status.allowance > 0 ? status.remaining : 0}
              maxValue={status.allowance > 0 ? status.allowance : 1}
              color={
                status.remaining <= 0
                  ? "danger"
                  : status.remaining / (status.allowance || 1) < 0.2
                  ? "warning"
                  : "secondary"
              }
              size="sm"
              className="max-w-md"
            />
            <DataItem className="font-normal text-xs">
              Se renuevan el {resetsAtLabel}. Los usás cada vez que chateás con
              Cubito, nuestro asistente de IA.
            </DataItem>
            {!status.hasActivePaidPlan && !status.communityTokensAvailable && (
              <DataItem className="font-normal text-xs text-danger">
                Por ahora no hay tokens comunitarios disponibles: suscribite a
                un plan para usar la IA con tu propia cuota.
              </DataItem>
            )}
          </>
        )}
      </div>
      {!isLoading && status && !status.hasActivePaidPlan && (
        <Button
          color="secondary"
          variant="light"
          radius="full"
          className="font-normal"
          as={Link}
          href={SUBSCRIPTIONS}
        >
          Conseguir más tokens
        </Button>
      )}
    </DataBox>
  );
};

export default AiTokensLimit;
