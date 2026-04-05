import { useState } from "react";
import { Outlet } from "react-router-dom";
import ExplorerView from "@/features/explorer/components/ExplorerView";
import { BottomNav } from "@/components/BottomNav";
import { Loader } from "@/components/Loader";
import { InstallPromptModal } from "@/features/explorer/components/InstallPromptModal";

export function ExplorerPage() {
    const [mapReady, setMapReady] = useState(false);

    return (
        <>
            <div className="fixed inset-2 rounded-xl bg-white overflow-hidden flex flex-col">
                <div className="relative flex-1 min-h-0 isolate">
                    <ExplorerView onReady={() => setMapReady(true)} />
                    <Outlet />
                </div>
                <BottomNav />
            </div>
            <div
                className={`transition-opacity duration-700 ${mapReady ? "opacity-0 pointer-events-none" : "opacity-100"}`}
            >
                <Loader />
            </div>
            <InstallPromptModal />
        </>
    );
}
