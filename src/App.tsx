import { Suspense, useEffect } from "react";
import "./App.css";
import { Navigate, Outlet, Route, Routes, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { WaitlistPage } from "@/pages/WaitlistPage";
import { ExplorerPage } from "@/pages/ExplorerPage";
import PlaceListOverlay from "@/features/explorer/components/PlaceListOverlay";
import PlaceDetailOverlay from "@/features/explorer/components/PlaceDetailOverlay";
import { AboutPage } from "@/pages/AboutPage";
import { PrivacyPolicyPage } from "@/pages/PrivacyPolicyPage";
import { TermsOfUsePage } from "@/pages/TermsOfUsePage";

const SUPPORTED_LANGS = ["en", "de"] as const;
type Lang = (typeof SUPPORTED_LANGS)[number];

function resolveLang(lang: string): Lang {
    return (SUPPORTED_LANGS as readonly string[]).includes(lang) ? (lang as Lang) : "en";
}

/** Redirects / to /:detectedLang based on browser / i18n state. */
function RootRedirect() {
    const { i18n } = useTranslation();
    return <Navigate to={`/${resolveLang(i18n.language)}`} replace />;
}

/** Redirects /beta to /:detectedLang/places (legacy URL support). */
function BetaRedirect() {
    const { i18n } = useTranslation();
    return <Navigate to={`/${resolveLang(i18n.language)}/places`} replace />;
}

/**
 * Reads the :lang URL param and keeps i18n in sync.
 * All language-prefixed routes are nested inside this.
 */
function LangRoute() {
    const { lang } = useParams<{ lang: string }>();
    const { i18n } = useTranslation();

    useEffect(() => {
        const resolved = resolveLang(lang ?? "en");
        if (resolved !== i18n.language) {
            void i18n.changeLanguage(resolved);
        }
    }, [lang, i18n]);

    return <Outlet />;
}

function App() {
    return (
        <div className="p-2">
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    <Route path="/" element={<RootRedirect />} />
                    <Route path="/beta" element={<BetaRedirect />} />
                    <Route path="/:lang" element={<LangRoute />}>
                        <Route index element={<WaitlistPage />} />
                        <Route path="about" element={<AboutPage />} />
                        <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
                        <Route path="terms-of-use" element={<TermsOfUsePage />} />
                        <Route path="*" element={<ExplorerPage />}>
                            <Route path="places" element={<PlaceListOverlay />} />
                            <Route path="places/:placeId" element={<PlaceDetailOverlay />} />
                        </Route>
                    </Route>
                </Routes>
            </Suspense>
        </div>
    );
}

export default App;
