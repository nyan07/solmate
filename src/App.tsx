import { Suspense } from "react";
import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import PlacesList from "./places/PlacesList";
import PlaceDetails from "./places/PlaceDetails";
import Mappr from "./map/Mappr";
import { MapProvider } from "./map/MapContext";
import LandingPage from "./pages/LandingPage";

function App() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/beta" element={<Navigate to="/places" replace />} />
                <Route
                    path="/*"
                    element={
                        <MapProvider>
                            <Mappr />
                            <Routes>
                                <Route path="/places" element={<PlacesList />} />
                                <Route path="/places/:placeId" element={<PlaceDetails />} />
                            </Routes>
                            <div className="fixed bottom-0 h-16 p-2 bg-neutral-lightest w-full z-50">
                                <img src="/arkie.png" alt="Arkie" className="max-h-10 m-auto" />
                            </div>
                        </MapProvider>
                    }
                />
            </Routes>
        </Suspense>
    );
}

export default App;
