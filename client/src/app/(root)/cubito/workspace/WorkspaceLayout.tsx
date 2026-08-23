"use client";

import { useEffect } from "react";
import { Tabs, Tab } from "@nextui-org/react";
import { FaImages, FaChalkboard, FaBookmark } from "react-icons/fa6";
import { useWorkspace } from "./hooks/useWorkspace";
import ReferencesPanel from "./panels/ReferencesPanel";
import WorkboardPanel from "./panels/WorkboardPanel";
import ResultsPanel from "./panels/ResultsPanel";
import TokenDisplay from "./shared/TokenDisplay";
import ModeSelector from "./shared/ModeSelector";

export default function WorkspaceLayout() {
    const workspace = useWorkspace();

    // Initialize sessionId on mount
    useEffect(() => {
        if (!sessionStorage.getItem("workspaceSessionId")) {
            sessionStorage.setItem("workspaceSessionId", crypto.randomUUID());
        }
        if (!sessionStorage.getItem("workspaceChatSessionId")) {
            sessionStorage.setItem("workspaceChatSessionId", crypto.randomUUID());
        }
    }, []);

    const isInModule = workspace.activeModule === "valuacion" || workspace.activeModule === "match";

    return (
        <div className="flex flex-col h-[calc(100vh-220px)] min-h-[600px]">
            {/* Top bar: Mode selector + Token display */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-divider bg-white dark:bg-slate-900">
                <ModeSelector
                    activeMode={workspace.activeMode}
                    onModeChange={workspace.setActiveMode}
                />
                <TokenDisplay tokenStatus={workspace.tokenStatus} />
            </div>

            {/* Main 3-panel area - Desktop: grid, Mobile: tabs */}
            <div className="flex-1 overflow-hidden">
                {/* Desktop layout */}
                {isInModule ? (
                    <div className="hidden md:grid md:grid-cols-[250px_1fr_280px] h-full">
                        <div className="border-r border-divider overflow-y-auto">
                            <ReferencesPanel
                                references={workspace.references}
                                onAdd={workspace.addReference}
                                onRemove={workspace.removeReference}
                                onUpdateUrl={workspace.updateReferenceUrl}
                                activeModule={workspace.activeModule}
                                onImageUploadedForMatch={(url) => {
                                    if (workspace.activeModule === "match") {
                                        workspace.handleSearchMatch(undefined, [url]);
                                    }
                                }}
                            />
                        </div>
                        <div className="overflow-y-auto flex flex-col h-full">
                            <WorkboardPanel workspace={workspace} />
                        </div>
                        <div className="border-l border-divider overflow-y-auto">
                            <ResultsPanel workspace={workspace} />
                        </div>
                    </div>
                ) : (
                    <div className="hidden md:grid md:grid-cols-[1fr_280px] h-full">
                        <div className="overflow-y-auto flex flex-col h-full">
                            <WorkboardPanel workspace={workspace} />
                        </div>
                        <div className="border-l border-divider overflow-y-auto">
                            <ResultsPanel workspace={workspace} />
                        </div>
                    </div>
                )}

                {/* Mobile layout: tabs */}
                <div className="md:hidden h-full">
                    {isInModule ? (
                        <Tabs
                            aria-label="Paneles del workspace"
                            variant="solid"
                            color="primary"
                            fullWidth
                            classNames={{ tabList: "rounded-none" }}
                        >
                            <Tab key="refs" title={<FaImages size={16} />}>
                                <div className="overflow-y-auto h-[calc(100%-48px)]">
                                    <ReferencesPanel
                                        references={workspace.references}
                                        onAdd={workspace.addReference}
                                        onRemove={workspace.removeReference}
                                        onUpdateUrl={workspace.updateReferenceUrl}
                                        activeModule={workspace.activeModule}
                                        onImageUploadedForMatch={(url) => {
                                            if (workspace.activeModule === "match") {
                                                workspace.handleSearchMatch(undefined, [url]);
                                            }
                                        }}
                                    />
                                </div>
                            </Tab>
                            <Tab key="board" title={<FaChalkboard size={16} />}>
                                <div className="overflow-y-auto h-[calc(100%-48px)]">
                                    <WorkboardPanel workspace={workspace} />
                                </div>
                            </Tab>
                            <Tab key="results" title={<FaBookmark size={16} />}>
                                <div className="overflow-y-auto h-[calc(100%-48px)]">
                                    <ResultsPanel workspace={workspace} />
                                </div>
                            </Tab>
                        </Tabs>
                    ) : (
                        <div className="h-full flex flex-col">
                            <WorkboardPanel workspace={workspace} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
