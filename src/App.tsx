import { Suspense } from "react";
import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import { WaitlistPage } from "@/pages/WaitlistPage";
import { ExplorerPage } from "@/pages/ExplorerPage";
import PlaceListOverlay from "@/features/explorer/components/PlaceListOverlay";
import PlaceDetailOverlay from "@/features/explorer/components/PlaceDetailOverlay";
import { AboutPage } from "@/pages/AboutPage";

function App() {
    return (
        <div className="p-2">
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    <Route path="/" element={<Navigate to="/waitlist" replace />} />
                    <Route path="/beta" element={<Navigate to="/places" replace />} />
                    <Route path="/waitlist" element={<WaitlistPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/*" element={<ExplorerPage />}>
                        <Route path="places" element={<PlaceListOverlay />} />
                        <Route path="places/:placeId" element={<PlaceDetailOverlay />} />
                    </Route>
                </Routes>
            </Suspense>
        </div>
    );
}

export default App;
