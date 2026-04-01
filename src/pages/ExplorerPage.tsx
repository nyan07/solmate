import { Outlet } from "react-router-dom";
import ExplorerView from "../features/explorer/components/ExplorerView";
import { MapProvider } from "../features/explorer/components/MapContext";

export function ExplorerPage() {
    return (
        <MapProvider>
            <div style={{ position: "relative" }}>
                <ExplorerView />
                <Outlet />
            </div>
            <div className="fixed bottom-0 h-16 p-2 bg-neutral-lightest w-full z-50">
                <img src="/arkie.png" alt="Arkie" className="max-h-10 m-auto" />
            </div>
        </MapProvider>
    );
}
