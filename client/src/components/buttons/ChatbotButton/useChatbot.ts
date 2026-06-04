"use client";

import { useState, useCallback } from "react";
import { sendMessageToAI } from "@/services/chatbotServices";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { UIMessage } from "ai";
import { useCreateAdWizard } from "./CreateAdWizard/useCreateAdWizard";
import { createPost } from "@/app/server/postActions";
import { getLocalTimeZone, today } from "@internationalized/date";
import { useUploadThing } from "@/utils/uploadThing";
import imageCompression from "browser-image-compression";
import { useRouter } from "next-nprogress-bar";
import { POSTS } from "@/utils/data/urls";
import { useUser } from "@clerk/nextjs";
import { getUserActivePostandActiveRelationsNumber } from "@/services/subscriptionServices";

/**
 * Shared hook that encapsulates all chatbot logic.
 * Used by both the floating chatbot widget and the full-page chatbot.
 */
export function useChatbot() {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [status, setStatus] = useState<"idle" | "in_progress" | "error">(
    "idle"
  );
  const [showCreateAdButton, setShowCreateAdButton] = useState(false);
  const [isSubmittingAd, setIsSubmittingAd] = useState(false);

  const wizard = useCreateAdWizard();
  const router = useRouter();
  const { user } = useUser();

  const { startUpload } = useUploadThing("fileUploader", {
    onUploadError: (e) => {
      toastifyError(`Error al subir el archivo/imagen: ${e.name}`);
    },
  });

  const handleSendMessage = async (text: string) => {
    // If wizard is active, don't send to AI
    if (
      wizard.step !== "idle" &&
      wizard.step !== "done" &&
      wizard.step !== "error"
    ) {
      return;
    }

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        role: "user",
        content: text,
        id: prevMessages.length.toString(),
        parts: [{ text, type: "text" }],
      },
    ]);
    try {
      const sessionId = sessionStorage.getItem("chatSessionId") || "";
      setStatus("in_progress");
      const response = await sendMessageToAI({
        sessionId,
        message: text,
      });
      if (!response || "botResponse" in response === false) {
        setStatus("error");
        toastifyError("Error al enviar el mensaje al chatbot.");
        return;
      }

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: response.botResponse,
          id: `${(prevMessages.length + 1).toString()}bot`,
          parts: [{ text: response.botResponse, type: "text" }],
        },
      ]);
      setStatus("idle");

      // Check if BE returned action to create ad
      if ("action" in response && response.action === "CREATE_AD") {
        setShowCreateAdButton(true);
      }

      if (!sessionId && response.sessionId) {
        sessionStorage.setItem("chatSessionId", response.sessionId);
      }
    } catch (error) {
      setStatus("error");
      toastifyError("Error al enviar el mensaje al chatbot.");
    }
  };

  const handleStartCreateAd = useCallback(() => {
    if (!user) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Para crear un anuncio necesitás iniciar sesión. Podés hacerlo desde el botón de arriba a la derecha.",
          id: `${Date.now()}bot`,
          parts: [
            {
              text: "Para crear un anuncio necesitás iniciar sesión. Podés hacerlo desde el botón de arriba a la derecha.",
              type: "text",
            },
          ],
        },
      ]);
      setShowCreateAdButton(false);
      return;
    }
    setShowCreateAdButton(false);
    wizard.startWizard();
  }, [wizard, user]);

  const handleSubmitAd = useCallback(async () => {
    setIsSubmittingAd(true);
    wizard.setSubmitting();

    try {
      const { data } = wizard;

      // El autor del anuncio es el mongoId del usuario logueado (mismo dato que usa el flujo normal)
      const authorId = user?.publicMetadata?.mongoId as string | undefined;
      if (!authorId) {
        wizard.setError("Necesitás iniciar sesión para publicar un anuncio");
        setIsSubmittingAd(false);
        return;
      }

      // Verificar el límite de anuncios según el plan/suscripción del usuario
      const limitRes = await getUserActivePostandActiveRelationsNumber();
      if ("error" in limitRes) {
        wizard.setError(
          "No pudimos verificar tu límite de anuncios. Intentá de nuevo"
        );
        setIsSubmittingAd(false);
        return;
      }
      const userCanPublishPost =
        data.postBehaviourType === "agenda"
          ? limitRes.agendaPostCount < limitRes.totalAgendaPostLimit
          : limitRes.librePostCount < limitRes.totalLibrePostLimit;
      if (!userCanPublishPost) {
        wizard.setError(
          "Alcanzaste el límite de anuncios activos de tu plan"
        );
        setIsSubmittingAd(false);
        return;
      }

      const files = data.images || [];

      // Upload images if any (for good/service)
      let imagesUrls: string[] = [];
      if (files.length > 0) {
        const compressedFiles = await Promise.all(
          files.map(async (file) => {
            if (file.type.startsWith("video/")) return file;
            return await imageCompression(file, {
              maxSizeMB: 1,
              maxWidthOrHeight: 600,
              useWebWorker: true,
            });
          })
        );

        const uploadRes = await startUpload(compressedFiles);
        if (!uploadRes || uploadRes.length === 0) {
          wizard.setError("Error al subir las imágenes");
          setIsSubmittingAd(false);
          return;
        }
        imagesUrls = uploadRes.map((file) => file.key);
      }

      // Build the post data
      const postData: any = {
        title: data.title,
        description: data.description || "",
        price: data.price,
        category: [data.category],
        author: authorId,
        postType: data.postType,
        postBehaviourType: data.postBehaviourType,
        visibility: {
          post: data.postBehaviourType === "agenda" ? "contacts" : "public",
          socialMedia: "public",
        },
        geoLocation: {
          location: {
            type: "Point",
            coordinates: [data.geoLocation?.lng, data.geoLocation?.lat],
          },
          description: data.geoLocation?.description || "",
          userSetted: true,
          ratio: (data.geoLocation?.ratio || 5) * 1000,
        },
        attachedFiles: [],
        createAt: today(getLocalTimeZone()).toString(),
        endDate: today(getLocalTimeZone()).add({ days: 14 }).toString(),
        imagesUrls,
      };

      // Add type-specific fields
      if (data.postType === "good") {
        postData.condition = data.condition;
      }
      if (data.postType === "service") {
        postData.frequencyPrice = data.frequencyPrice;
      }
      if (data.postType === "petition") {
        postData.petitionType = data.petitionType;
        postData.frequencyPrice = data.frequencyPrice;
        postData.toPrice = data.toPrice;
      }

      const resApi = await createPost(postData, userCanPublishPost);
      if (resApi.error) {
        wizard.setError(resApi.error);
        setIsSubmittingAd(false);
        return;
      }

      wizard.setDone();
      toastifySuccess("¡Anuncio creado exitosamente!");
      setIsSubmittingAd(false);

      if (resApi.id) {
        router.push(`${POSTS}/${resApi.id}`);
      }
    } catch (error) {
      wizard.setError("Error inesperado al crear el anuncio");
      setIsSubmittingAd(false);
    }
  }, [wizard, router, startUpload, user]);

  return {
    messages,
    status,
    showCreateAdButton,
    isSubmittingAd,
    wizard,
    handleSendMessage,
    handleStartCreateAd,
    handleSubmitAd,
  };
}
