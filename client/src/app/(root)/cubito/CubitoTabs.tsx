"use client";

import { usePathname, useRouter } from "next/navigation";
import { Tabs, Tab } from "@nextui-org/react";
import { FaComments, FaTableColumns } from "react-icons/fa6";
import CubitoChat from "./CubitoChat";
import WorkspaceLayout from "./workspace/WorkspaceLayout";

const TAB_ROUTES: Record<string, string> = {
    chat: "/cubito",
    tablero: "/cubito/tablerodetrabajo",
};

function getTabFromPathname(pathname: string): string {
    if (pathname.includes("/tablerodetrabajo")) return "tablero";
    return "chat";
}

export default function CubitoTabs({ defaultTab }: { defaultTab?: string }) {
    const pathname = usePathname();
    const router = useRouter();

    const selected = defaultTab || getTabFromPathname(pathname);

    const handleSelectionChange = (key: React.Key) => {
        const tab = key as string;
        const route = TAB_ROUTES[tab];
        if (route) {
            router.push(route);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto">
            <Tabs
                selectedKey={selected}
                onSelectionChange={handleSelectionChange}
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
