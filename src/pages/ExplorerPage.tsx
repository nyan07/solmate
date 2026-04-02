import { Outlet } from "react-router-dom";
import ExplorerView from "@/features/explorer/components/ExplorerView";
import { MapProvider } from "@/features/explorer/components/MapContext";
import { BottomNav } from "@/components/BottomNav";

export function ExplorerPage() {
    return (
        <MapProvider>
            <div className="fixed inset-2 rounded-xl bg-white overflow-hidden flex flex-col">
                <div className="relative flex-1 min-h-0 isolate">
                    <ExplorerView />
                    <Outlet />
                </div>
                <BottomNav />
            </div>
        </MapProvider>
    );
}
