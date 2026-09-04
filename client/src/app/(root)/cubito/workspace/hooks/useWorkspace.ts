"use client";

import { useState, useCallback, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import {
  CubitoMode,
  WorkspaceModule,
  ValuacionCategory,
  ValuacionResult,
  ValuacionMessageResponse,
  MatchedPost,
  MatchResponse,
  TokenStatus,
  ReferenceImage,
  WorkspaceMessage,
  BriefItem,
} from "@/types/workspaceTypes";
import {
  startValuacion,
  sendValuacionMessage,
  skipValuacionBriefQuestion,
  generateValuacionResult,
  saveValuacionResult as saveValuacionResultService,
  restoreValuacionToBoard as restoreService,
  deleteValuacion as deleteService,
  searchMatch,
  getUserValuaciones,
} from "@/services/workspaceServices";
import { sendMessageToAI, generateAdImageWithAI } from "@/services/chatbotServices";
import { deleteFilesService } from "@/app/server/uploadThing";

const generateId = () => Math.random().toString(36).substring(2, 9);

export function useWorkspace() {
  // General state
  const [activeModule, setActiveModule] = useState<WorkspaceModule>("chat");
  const [activeMode, setActiveMode] = useState<CubitoMode>("general");
  const [rolePrompt, setRolePrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<TokenStatus | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [limitMessage, setLimitMessage] = useState<string | null>(null);

  // Chat messages
  const [messages, setMessages] = useState<WorkspaceMessage[]>([]);

  // Free chat state (chat libre con Cubito)
  const [chatMessages, setChatMessages] = useState<WorkspaceMessage[]>([]);
  const [isChatProcessing, setIsChatProcessing] = useState(false);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<{ id: string; base64: string; prompt: string }[]>([]);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // References panel
  const [references, setReferences] = useState<ReferenceImage[]>([]);

  // Valuación state
  const [valuacionId, setValuacionId] = useState<string | null>(null);
  const [valuacionStatus, setValuacionStatus] = useState<string>("idle");
  const [briefComplete, setBriefComplete] = useState(false);
  const [currentLayer, setCurrentLayer] = useState<1 | 2 | 3>(1);
  const [completionPercent, setCompletionPercent] = useState(0);
  const [coveredFields, setCoveredFields] = useState<string[]>([]);
  const [briefItems, setBriefItems] = useState<BriefItem[]>([]);
  const [valuacionTitle, setValuacionTitle] = useState<string | null>(null);
  const [valuacionResult, setValuacionResult] = useState<ValuacionResult | null>(null);

  // Saved results (panel derecho)
  const [savedValuaciones, setSavedValuaciones] = useState<ValuacionResult[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(true);

  // Match state
  const [matchStatus, setMatchStatus] = useState<"idle" | "searching" | "results">("idle");
  const [matchResults, setMatchResults] = useState<MatchedPost[]>([]);
  const [matchInterpretation, setMatchInterpretation] = useState<string | null>(null);
  const [matchCandidatesEvaluated, setMatchCandidatesEvaluated] = useState(0);
  const [matchMessage, setMatchMessage] = useState<string | null>(null);
  const [savedMatchPostIds, setSavedMatchPostIds] = useState<string[]>([]);
  const [savedMatchPosts, setSavedMatchPosts] = useState<MatchedPost[]>([]);

  const { user } = useUser();

  const getSessionId = () => sessionStorage.getItem("workspaceSessionId") || "";

  // --- Load saved match posts from localStorage on mount ---
  useEffect(() => {
    try {
      const storedPosts = localStorage.getItem("savedMatchPosts");
      if (storedPosts) {
        const parsed: MatchedPost[] = JSON.parse(storedPosts);
        setSavedMatchPosts(parsed);
        setSavedMatchPostIds(parsed.map((p) => p.postId));
      }
    } catch {
      // Silent fail — corrupted data
    }
  }, []);

  // --- Load saved valuaciones from BE on mount ---
  useEffect(() => {
    if (!user) return;
    const loadSaved = async () => {
      setIsLoadingSaved(true);
      const res = await getUserValuaciones(20, 1);
      if (res && !("error" in res) && res.valuaciones) {
        const saved = res.valuaciones.filter(
          (v: any) => v.status === "saved"
        );
        setSavedValuaciones(saved);
      }
      setIsLoadingSaved(false);
    };
    loadSaved();
  }, [user]);

  // --- Helper to add messages ---
  const addMessage = useCallback((role: "user" | "assistant", content: string) => {
    setMessages((prev) => [...prev, { id: generateId(), role, content, timestamp: new Date() }]);
  }, []);

  // --- Update token status from any response ---
  const updateTokens = useCallback((ts: TokenStatus | null) => {
    if (ts) setTokenStatus(ts);
  }, []);

  // --- Update valuación state from response ---
  const updateValuacionFromResponse = useCallback((res: ValuacionMessageResponse) => {
    const v = res.valuacion;
    setValuacionId(v.id);
    setValuacionStatus(v.status);
    setCurrentLayer(v.layer);
    setCompletionPercent(v.completionPercent);
    setCoveredFields(v.coveredFields || []);
    setBriefItems(v.briefItems || []);
    if (v.title !== undefined) setValuacionTitle(v.title ?? null);
    setBriefComplete(res.briefComplete);
    updateTokens(v.tokenStatus);
    if (res.limitReached) {
      setLimitReached(true);
      setLimitMessage(res.reply);
    }
  }, [updateTokens]);

  // ============================================================
  // REFERENCES PANEL
  // ============================================================

  const addReference = useCallback((image: ReferenceImage) => {
    setReferences((prev) => [...prev, image]);
  }, []);

  const removeReference = useCallback((id: string) => {
    const ref = references.find((r) => r.id === id);
    setReferences((prev) => prev.filter((r) => r.id !== id));
    // Delete from UploadThing to avoid orphaned files
    if (ref?.url) {
      const key = ref.url.split("/").pop();
      if (key) {
        deleteFilesService([key]).catch(() => {
          // Silent fail — not critical
        });
      }
    }
  }, [references]);

  const updateReferenceUrl = useCallback((id: string, newUrl: string) => {
    setReferences((prev) => prev.map((r) => (r.id === id ? { ...r, url: newUrl } : r)));
  }, []);

  // ============================================================
  // VALUACIÓN IA
  // ============================================================

  const handleStartValuacion = useCallback(async (category: ValuacionCategory) => {
    if (!user) {
      toastifyError("Necesitás iniciar sesión para usar la Valuación IA");
      return;
    }
    setActiveModule("valuacion");
    setValuacionStatus("draft");
    setBriefComplete(false);
    setValuacionResult(null);
    setIsProcessing(true);

    // Get current references at call time (not from closure)
    const currentRefs = references;
    const imageUrls = currentRefs.map((r) => r.url).filter(Boolean);

    const res = await startValuacion({
      category,
      imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      mode: activeMode !== "general" ? activeMode : undefined,
      sessionId: getSessionId(),
    });

    setIsProcessing(false);

    if (res && "error" in res) {
      toastifyError(res.error);
      // Reset to idle so user can retry
      setValuacionStatus("idle");
      return;
    }

    addMessage("assistant", res.reply);
    updateValuacionFromResponse(res);
  }, [user, references, activeMode, addMessage, updateValuacionFromResponse]);

  const handleSendValuacionMessage = useCallback(async (message: string, imageUrls?: string[]) => {
    if (!valuacionId) return;
    addMessage("user", message);
    setIsProcessing(true);

    // If no explicit imageUrls passed, grab any new references not yet sent
    const urls = imageUrls || references.map((r) => r.url).filter(Boolean);

    const res = await sendValuacionMessage({
      valuacionId,
      message,
      imageUrls: urls.length > 0 ? urls : undefined,
    });

    setIsProcessing(false);

    if (res && "error" in res) {
      toastifyError(res.error);
      return;
    }

    addMessage("assistant", res.reply);
    updateValuacionFromResponse(res);
  }, [valuacionId, references, addMessage, updateValuacionFromResponse]);

  const handleSkipQuestion = useCallback(async () => {
    if (!valuacionId) return;
    addMessage("user", "Omitir");
    setIsProcessing(true);

    const res = await skipValuacionBriefQuestion(valuacionId);

    setIsProcessing(false);

    if (res && "error" in res) {
      toastifyError(res.error);
      return;
    }

    addMessage("assistant", res.reply);
    updateValuacionFromResponse(res);
  }, [valuacionId, addMessage, updateValuacionFromResponse]);

  const handleGenerateResult = useCallback(async () => {
    if (!valuacionId) return;
    setValuacionStatus("processing");
    setIsProcessing(true);

    const res = await generateValuacionResult(valuacionId);

    setIsProcessing(false);

    if (res && "error" in res) {
      toastifyError(res.error);
      setValuacionStatus("draft");
      return;
    }

    setValuacionResult(res);
    setValuacionStatus("completed");
    updateTokens(res.tokenStatus);
  }, [valuacionId, updateTokens]);

  const handleSaveResult = useCallback(async () => {
    if (!valuacionId || !valuacionResult) return;

    const res = await saveValuacionResultService(valuacionId);
    if (res && "error" in res) {
      toastifyError(res.error);
      return;
    }

    setValuacionStatus("saved");
    setSavedValuaciones((prev) => [...prev, { ...valuacionResult, status: "saved" }]);
    toastifySuccess("Valuación guardada");
  }, [valuacionId, valuacionResult]);

  const handleRestoreToBoard = useCallback(async (id: string) => {
    const res = await restoreService(id);
    if (res && "error" in res) {
      toastifyError(res.error);
      return;
    }
    // Load the full result into the board from the BE response (keep it in saved panel)
    setActiveModule("valuacion");
    setValuacionId(id);
    setValuacionStatus("completed");
    setValuacionResult(res);
  }, []);

  const handleDeleteValuacion = useCallback(async (id: string) => {
    const res = await deleteService(id);
    if (res === null || res === undefined || (typeof res === "object" && "error" in res)) {
      toastifyError(typeof res === "object" && res !== null ? res.error : "Error al eliminar");
      return;
    }
    setSavedValuaciones((prev) => prev.filter((v) => v.id !== id));
    if (valuacionId === id) {
      setValuacionStatus("idle");
      setValuacionResult(null);
      setValuacionId(null);
    }
    toastifySuccess("Valuación eliminada");
  }, [valuacionId]);

  // ============================================================
  // MATCH IA
  // ============================================================

  const handleSearchMatch = useCallback(async (text?: string, imageUrls?: string[], postId?: string) => {
    setActiveModule("match");
    setMatchStatus("searching");
    setMatchResults([]);
    setMatchMessage(null);
    setIsProcessing(true);

    if (text) addMessage("user", text);

    const res: MatchResponse | { error: string } = await searchMatch({
      text,
      imageUrls,
      postId,
      mode: activeMode !== "general" ? activeMode : undefined,
      sessionId: getSessionId(),
    });

    setIsProcessing(false);

    if (res && "error" in res) {
      toastifyError(res.error);
      setMatchStatus("idle");
      return;
    }

    setMatchResults(res.matches);
    setMatchInterpretation(res.interpretation);
    setMatchCandidatesEvaluated(res.candidatesEvaluated);
    setMatchMessage(res.message);
    setMatchStatus("results");
    updateTokens(res.tokenStatus);

    if (res.limitReached) {
      setLimitReached(true);
      setLimitMessage(res.message);
    }
  }, [activeMode, addMessage, updateTokens]);

  const handleSaveMatch = useCallback((postId: string) => {
    setSavedMatchPostIds((prev) => {
      const updated = [...prev, postId];
      return updated;
    });
    setSavedMatchPosts((prev) => {
      const post = matchResults.find((m) => m.postId === postId);
      if (!post || prev.some((p) => p.postId === postId)) return prev;
      const updated = [...prev, post];
      try {
        localStorage.setItem("savedMatchPosts", JSON.stringify(updated));
      } catch {
        // quota exceeded — silent
      }
      return updated;
    });
  }, [matchResults]);

  const handleRemoveSavedMatch = useCallback((postId: string) => {
    setSavedMatchPostIds((prev) => prev.filter((id) => id !== postId));
    setSavedMatchPosts((prev) => {
      const updated = prev.filter((p) => p.postId !== postId);
      try {
        localStorage.setItem("savedMatchPosts", JSON.stringify(updated));
      } catch {
        // silent
      }
      return updated;
    });
  }, []);

  // ============================================================
  // CHAT LIBRE (conversación general con Cubito en el tablero)
  // ============================================================

  const handleSendChatMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { id: generateId(), role: "user", content: text, timestamp: new Date() },
    ]);
    setIsChatProcessing(true);

    try {
      const sessionId = sessionStorage.getItem("workspaceChatSessionId") || "";
      const res = await sendMessageToAI({
        sessionId,
        message: text,
        ...(selectedAvatarId ? { avatarId: selectedAvatarId } : {}),
        ...(activeMode !== "general" ? { mode: activeMode } : {}),
      });

      if (!res || "error" in res) {
        setChatMessages((prev) => [
          ...prev,
          { id: generateId(), role: "assistant", content: "Hubo un error al procesar tu mensaje. Intentá de nuevo.", timestamp: new Date() },
        ]);
        setIsChatProcessing(false);
        return;
      }

      // Si el backend disparó la tool CREATE_AD (responde con texto de crear anuncio),
      // la ignoramos y le pedimos que conteste normalmente — esto pasa porque el prompt
      // del BE siempre tiene la tool disponible. En el workspace queremos chat libre.
      const isCreateAdAction = res.action === "CREATE_AD";
      const botText = isCreateAdAction
        ? "¡Hola! Soy Cubito, tu asistente en el Tablero de Trabajo. Podés preguntarme lo que quieras, pedirme que genere imágenes, o usar las herramientas de Valuación y Match que tenés arriba. ¿En qué te puedo ayudar?"
        : res.botResponse;

      setChatMessages((prev) => [
        ...prev,
        { id: generateId(), role: "assistant", content: botText, timestamp: new Date() },
      ]);

      if (!sessionId && res.sessionId) {
        sessionStorage.setItem("workspaceChatSessionId", res.sessionId);
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { id: generateId(), role: "assistant", content: "Error inesperado. Intentá de nuevo.", timestamp: new Date() },
      ]);
    }

    setIsChatProcessing(false);
  }, [selectedAvatarId, activeMode]);

  const handleGenerateImage = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return;
    if (!user) {
      setChatMessages((prev) => [
        ...prev,
        { id: generateId(), role: "assistant", content: "Necesitás iniciar sesión para generar imágenes.", timestamp: new Date() },
      ]);
      return;
    }
    setIsGeneratingImage(true);
    setChatMessages((prev) => [
      ...prev,
      { id: generateId(), role: "user", content: `🎨 Generar imagen: ${prompt}`, timestamp: new Date() },
    ]);

    // Contexto para follow-ups: usamos la última imagen generada como referencia
    // para que el BE la edite (p. ej. "el mismo perro pero ahora con su dueño").
    // Si no hay ninguna, se genera desde cero.
    const lastImage = generatedImages[generatedImages.length - 1];
    const referenceImages = lastImage?.base64 ? [lastImage.base64] : undefined;

    try {
      const res = await generateAdImageWithAI(prompt, referenceImages);
      console.log("[WorkspaceChat] generateAdImageWithAI response:", {
        hasRes: !!res,
        type: typeof res,
        keys: res ? Object.keys(res) : [],
        hasError: res && "error" in res,
        base64Length: res && "imageBase64" in res ? (res as any).imageBase64?.length : 0,
        base64Start: res && "imageBase64" in res ? (res as any).imageBase64?.substring(0, 50) : null,
      });
      if (!res || "error" in res) {
        const errorMsg = (res && "error" in res) ? (res as any).error : "Error desconocido";
        setChatMessages((prev) => [
          ...prev,
          { id: generateId(), role: "assistant", content: `No pude generar la imagen: ${errorMsg}`, timestamp: new Date() },
        ]);
        setIsGeneratingImage(false);
        return;
      }

      const newImage = { id: generateId(), base64: (res as any).imageBase64, prompt };
      setGeneratedImages((prev) => [...prev, newImage]);
      setChatMessages((prev) => [
        ...prev,
        { id: generateId(), role: "assistant", content: `__IMAGE__${newImage.id}`, timestamp: new Date() },
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        { id: generateId(), role: "assistant", content: `Error al generar la imagen: ${err?.message || "Intentá de nuevo."}`, timestamp: new Date() },
      ]);
    }

    setIsGeneratingImage(false);
  }, [user, generatedImages]);

  // ============================================================
  // GENERAL
  // ============================================================

  const resetWorkspace = useCallback(() => {
    setActiveModule("chat");
    setValuacionId(null);
    setValuacionStatus("idle");
    setValuacionResult(null);
    setBriefComplete(false);
    setCompletionPercent(0);
    setCoveredFields([]);
    setBriefItems([]);
    setValuacionTitle(null);
    setMessages([]);
    setMatchStatus("idle");
    setMatchResults([]);
    setLimitReached(false);
    setLimitMessage(null);
  }, []);

  return {
    // General
    activeModule,
    setActiveModule,
    activeMode,
    setActiveMode,
    rolePrompt,
    setRolePrompt,
    isProcessing,
    tokenStatus,
    limitReached,
    limitMessage,
    messages,
    addMessage,
    resetWorkspace,

    // References
    references,
    addReference,
    removeReference,
    updateReferenceUrl,

    // Chat libre
    chatMessages,
    isChatProcessing,
    selectedAvatarId,
    setSelectedAvatarId,
    generatedImages,
    isGeneratingImage,
    handleSendChatMessage,
    handleGenerateImage,

    // Valuación
    valuacionId,
    valuacionStatus,
    briefComplete,
    currentLayer,
    completionPercent,
    coveredFields,
    briefItems,
    valuacionTitle,
    valuacionResult,
    savedValuaciones,
    isLoadingSaved,
    handleStartValuacion,
    handleSendValuacionMessage,
    handleSkipQuestion,
    handleGenerateResult,
    handleSaveResult,
    handleRestoreToBoard,
    handleDeleteValuacion,

    // Match
    matchStatus,
    matchResults,
    matchInterpretation,
    matchCandidatesEvaluated,
    matchMessage,
    savedMatchPostIds,
    savedMatchPosts,
    handleSearchMatch,
    handleSaveMatch,
    handleRemoveSavedMatch,
  };
}
