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
import { deleteFilesService } from "@/app/server/uploadThing";

const generateId = () => Math.random().toString(36).substring(2, 9);

export function useWorkspace() {
  // General state
  const [activeModule, setActiveModule] = useState<WorkspaceModule>("idle");
  const [activeMode, setActiveMode] = useState<CubitoMode>("general");
  const [rolePrompt, setRolePrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<TokenStatus | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [limitMessage, setLimitMessage] = useState<string | null>(null);

  // Chat messages
  const [messages, setMessages] = useState<WorkspaceMessage[]>([]);

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

  // Match state
  const [matchStatus, setMatchStatus] = useState<"idle" | "searching" | "results">("idle");
  const [matchResults, setMatchResults] = useState<MatchedPost[]>([]);
  const [matchInterpretation, setMatchInterpretation] = useState<string | null>(null);
  const [matchCandidatesEvaluated, setMatchCandidatesEvaluated] = useState(0);
  const [matchMessage, setMatchMessage] = useState<string | null>(null);
  const [savedMatchPostIds, setSavedMatchPostIds] = useState<string[]>([]);

  const { user } = useUser();

  const getSessionId = () => sessionStorage.getItem("workspaceSessionId") || "";

  // --- Load saved valuaciones from BE on mount ---
  useEffect(() => {
    if (!user) return;
    const loadSaved = async () => {
      const res = await getUserValuaciones(20, 1);
      if (res && !("error" in res) && res.valuaciones) {
        // Only show valuaciones with status "saved" in the right panel
        const saved = res.valuaciones.filter(
          (v: any) => v.status === "saved"
        );
        setSavedValuaciones(saved);
      }
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
    // Remove from saved panel
    setSavedValuaciones((prev) => prev.filter((v) => v.id !== id));
    // Load the full result into the board from the BE response
    setActiveModule("valuacion");
    setValuacionId(id);
    setValuacionStatus("completed");
    setValuacionResult(res);
  }, []);

  const handleDeleteValuacion = useCallback(async (id: string) => {
    const res = await deleteService(id);
    if (res && "error" in res) {
      toastifyError(res.error);
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
    setSavedMatchPostIds((prev) => [...prev, postId]);
  }, []);

  const handleRemoveSavedMatch = useCallback((postId: string) => {
    setSavedMatchPostIds((prev) => prev.filter((id) => id !== postId));
  }, []);

  // ============================================================
  // GENERAL
  // ============================================================

  const resetWorkspace = useCallback(() => {
    setActiveModule("idle");
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
    handleSearchMatch,
    handleSaveMatch,
    handleRemoveSavedMatch,
  };
}
