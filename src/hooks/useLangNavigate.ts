import { useNavigate, useParams } from "react-router-dom";

/**
 * Returns a navigate function that automatically prepends the current language
 * prefix (e.g. "/en" or "/de") to the given path.
 */
export function useLangNavigate() {
    const navigate = useNavigate();
    const { lang = "en" } = useParams<{ lang: string }>();
    return (path: string) => navigate(`/${lang}${path}`);
}
