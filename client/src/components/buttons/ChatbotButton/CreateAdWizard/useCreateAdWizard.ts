"use client";
import { useState, useCallback } from "react";
import { AdPostType, WizardData, WizardMessage, WizardStep } from "./types";
import { PostBehaviourType } from "@/types/postTypes";

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useCreateAdWizard = () => {
  const [step, setStep] = useState<WizardStep>("idle");
  const [data, setData] = useState<WizardData>({});
  const [messages, setMessages] = useState<WizardMessage[]>([]);

  const addBotMessage = useCallback((content: string, step?: WizardStep) => {
    setMessages((prev) => [
      ...prev,
      { id: generateId(), role: "assistant", content, type: "step", step },
    ]);
  }, []);

  const addUserMessage = useCallback((content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: generateId(), role: "user", content, type: "text" },
    ]);
  }, []);

  const startWizard = useCallback(() => {
    setStep("postType");
    setData({});
    setMessages([]);
    addBotMessage(
      "Te ayudo a crear tu publicación. ¿Qué tipo de publicación querés crear?",
      "postType"
    );
  }, [addBotMessage]);

  const getNextStepAfterPrice = useCallback(
    (postType: AdPostType): WizardStep => {
      if (postType === "good") return "condition";
      if (postType === "petition") return "petitionType";
      return "category";
    },
    []
  );

  const setPostType = useCallback(
    (type: AdPostType) => {
      const labels = { good: "Bien", service: "Servicio", petition: "Necesidad" };
      addUserMessage(labels[type]);
      setData((prev) => ({ ...prev, postType: type }));
      setStep("behaviourType");
      addBotMessage(
        "¿Qué comportamiento tendrá tu anuncio?\n\n**Libre:** será público y visible según el alcance de tu ubicación.\n**Agenda:** será visible solo para tu agenda de contactos.",
        "behaviourType"
      );
    },
    [addBotMessage, addUserMessage]
  );

  const setBehaviourType = useCallback(
    (type: PostBehaviourType) => {
      const labels = { libre: "Libre", agenda: "Agenda" };
      addUserMessage(labels[type]);
      setData((prev) => ({ ...prev, postBehaviourType: type }));
      setStep("title");
      addBotMessage("¿Cuál es el título de tu publicación?", "title");
    },
    [addBotMessage, addUserMessage]
  );

  const setTitle = useCallback(
    (title: string) => {
      addUserMessage(title);
      setData((prev) => ({ ...prev, title }));
      setStep("description");
      addBotMessage(
        "Agregá una descripción (opcional). Podés continuar sin una si preferís.",
        "description"
      );
    },
    [addBotMessage, addUserMessage]
  );

  const setDescription = useCallback(
    (description?: string) => {
      if (description) {
        addUserMessage(description);
      } else {
        addUserMessage("Sin descripción");
      }
      setData((prev) => ({ ...prev, description: description || "" }));
      setStep("price");

      const postType = data.postType;
      if (postType === "service") {
        addBotMessage(
          "¿Cuál es el precio? (opcional). Si lo agregás, también podés indicar la frecuencia del cobro (por hora, día, semana, mes o año).",
          "price"
        );
      } else if (postType === "petition") {
        addBotMessage(
          "¿Cuál es el precio o rango de precios? (opcional). También podés indicar la frecuencia del pago.",
          "price"
        );
      } else {
        addBotMessage("¿Cuál es el precio? (opcional)", "price");
      }
    },
    [addBotMessage, addUserMessage, data.postType]
  );

  const setPrice = useCallback(
    (priceData: {
      price?: number;
      toPrice?: number;
      frequencyPrice?: FrequencyPrice;
    }) => {
      const parts: string[] = [];
      if (priceData.price) {
        if (priceData.price === 8613.10) {
          parts.push("Negociable / a pactar");
        } else {
          parts.push(`$${priceData.price}`);
          if (priceData.toPrice) parts.push(`- $${priceData.toPrice}`);
          if (priceData.frequencyPrice) parts.push(`por ${priceData.frequencyPrice}`);
        }
      } else {
        parts.push("Sin precio");
      }
      addUserMessage(parts.join(" "));
      setData((prev) => ({ ...prev, ...priceData }));

      const nextStep = getNextStepAfterPrice(data.postType!);
      setStep(nextStep);

      if (nextStep === "condition") {
        addBotMessage("¿Cuál es la condición del bien?", "condition");
      } else if (nextStep === "petitionType") {
        addBotMessage(
          "¿Qué tipo de necesidad es? ¿Buscás un bien o un servicio?",
          "petitionType"
        );
      } else {
        addBotMessage("Seleccioná la categoría de tu publicación.", "category");
      }
    },
    [addBotMessage, addUserMessage, data.postType, getNextStepAfterPrice]
  );

  const setCondition = useCallback(
    (condition: "new" | "used") => {
      addUserMessage(condition === "new" ? "Nuevo" : "Usado");
      setData((prev) => ({ ...prev, condition }));
      setStep("category");
      addBotMessage("Seleccioná la categoría de tu publicación.", "category");
    },
    [addBotMessage, addUserMessage]
  );

  const setPetitionType = useCallback(
    (petitionType: "good" | "service") => {
      addUserMessage(petitionType === "good" ? "Bien" : "Servicio");
      setData((prev) => ({ ...prev, petitionType }));
      setStep("category");
      addBotMessage("Seleccioná la categoría de tu publicación.", "category");
    },
    [addBotMessage, addUserMessage]
  );

  const setCategory = useCallback(
    (categoryId: string, categoryLabel: string) => {
      addUserMessage(categoryLabel);
      setData((prev) => ({ ...prev, category: categoryId, categoryLabel }));
      setStep("location");
      addBotMessage(
        "Seleccioná tu ubicación. Podés elegirla en el mapa o usar tu ubicación actual.",
        "location"
      );
    },
    [addBotMessage, addUserMessage]
  );

  const setLocation = useCallback(
    (geoLocation: {
      lat: number;
      lng: number;
      description: string;
      ratio: number;
    }) => {
      addUserMessage(geoLocation.description);
      setData((prev) => ({
        ...prev,
        geoLocation: { ...geoLocation, userSetted: true },
        locationDescription: geoLocation.description,
      }));

      // If petition, skip images
      if (data.postType === "petition") {
        setStep("summary");
        addBotMessage(
          "Revisá el resumen de tu publicación y confirmá para publicar.",
          "summary"
        );
      } else {
        setStep("images");
        addBotMessage(
          "Subí al menos una imagen para tu anuncio. Podés generar una con IA o subir las tuyas.",
          "images"
        );
      }
    },
    [addBotMessage, addUserMessage, data.postType]
  );

  const setImages = useCallback(
    (files: File[]) => {
      addUserMessage(
        `${files.length} imagen${files.length > 1 ? "es" : ""} seleccionada${files.length > 1 ? "s" : ""}`
      );
      setData((prev) => ({ ...prev, images: files }));
      setStep("summary");
      addBotMessage(
        "Revisá el resumen de tu publicación y confirmá para publicar.",
        "summary"
      );
    },
    [addBotMessage, addUserMessage]
  );

  const cancelWizard = useCallback(() => {
    setStep("idle");
    setData({});
    setMessages([]);
  }, []);

  const setSubmitting = useCallback(() => {
    setStep("submitting");
  }, []);

  const setDone = useCallback(() => {
    setStep("done");
    addBotMessage("Tu publicación fue creada exitosamente.");
  }, [addBotMessage]);

  const setError = useCallback(
    (errorMsg: string) => {
      setStep("error");
      addBotMessage(`Error: ${errorMsg}. Podés intentar de nuevo.`);
    },
    [addBotMessage]
  );

  return {
    step,
    data,
    messages,
    startWizard,
    setPostType,
    setBehaviourType,
    setTitle,
    setDescription,
    setPrice,
    setCondition,
    setPetitionType,
    setCategory,
    setLocation,
    setImages,
    cancelWizard,
    setSubmitting,
    setDone,
    setError,
  };
};
