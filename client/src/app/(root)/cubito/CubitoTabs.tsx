"use client";

import { useState } from "react";
import { Tabs, Tab } from "@nextui-org/react";
import { FaComments, FaTableColumns } from "react-icons/fa6";
import CubitoChat from "./CubitoChat";
import WorkspaceLayout from "./workspace/WorkspaceLayout";

export default function CubitoTabs({ defaultTab }: { defaultTab?: string }) {
    const [selected, setSelected] = useState(defaultTab || "chat");

    return (
        <div className="w-full max-w-7xl mx-auto">
            <Tabs
                selectedKey={selected}
                onSelectionChange={(key) => setSelected(key as string)}
                aria-label="Cubito Tabs"
                color="primary"
                variant="underlined"
                classNames={{
                    tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                    cursor: "w-full bg-service",
                    tab: "max-w-fit px-4 h-12",
                    tabContent: "group-data-[selected=true]:text-service",
                }}
            >
                <Tab
                    key="chat"
                    title={
                        <div className="flex items-center gap-2">
                            <FaComments size={16} />
                            <span>Chat</span>
                        </div>
                    }
                >
                    <div className="flex justify-center pt-4">
                        <CubitoChat />
                    </div>
                </Tab>
                <Tab
                    key="tablero"
                    title={
                        <div className="flex items-center gap-2">
                            <FaTableColumns size={16} />
                            <span>Tablero de Trabajo</span>
                        </div>
                    }
                >
                    <div className="pt-4">
                        <WorkspaceLayout />
                    </div>
                </Tab>
            </Tabs>
        </div>
    );
}
