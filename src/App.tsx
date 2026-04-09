import { Suspense, useEffect } from "react";
import "./App.css";
import { Navigate, Outlet, Route, Routes, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { countInstallPromptOpen } from "@/features/explorer/hooks/useInstallPrompt";
import { WaitlistPage } from "@/pages/WaitlistPage";
import { ExplorerPage } from "@/pages/ExplorerPage";
import PlaceListOverlay from "@/features/explorer/components/PlaceListOverlay";
import PlaceDetailOverlay from "@/features/explorer/components/PlaceDetailOverlay";
import { AboutPage } from "@/pages/AboutPage";
import { PrivacyPolicyPage } from "@/pages/PrivacyPolicyPage";
import { TermsOfUsePage } from "@/pages/TermsOfUsePage";
import { Loader } from "@/components/Loader";

const SUPPORTED_LANGS = ["en", "de"] as const;
type Lang = (typeof SUPPORTED_LANGS)[number];

function resolveLang(lang: string): Lang {
    return (SUPPORTED_LANGS as readonly string[]).includes(lang) ? (lang as Lang) : "en";
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
    const location = useLocation();

    const resolved = resolveLang(lang ?? "en");
    const needsRedirect = lang !== resolved;

    useEffect(() => {
        if (!needsRedirect && resolved !== i18n.language) {
            void i18n.changeLanguage(resolved);
        }
    }, [needsRedirect, resolved, i18n]);

    // lang segment is not a recognised language code (e.g. /places) —
    // prepend the detected language and redirect, preserving the full path.
    if (needsRedirect) {
        return <Navigate to={`/${resolved}${location.pathname}`} replace />;
    }

    return <Outlet />;
}

function App() {
    const { pathname } = useLocation();

    useEffect(() => {
        if (pathname === "/") return;
        countInstallPromptOpen();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="p-2">
            <Suspense fallback={<Loader />}>
                <Routes>
                    <Route path="/" element={<WaitlistPage />} />
                    <Route path="/beta" element={<BetaRedirect />} />
                    <Route path="/:lang" element={<LangRoute />}>
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
