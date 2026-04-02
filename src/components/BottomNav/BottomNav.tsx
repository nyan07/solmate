import { useLangNavigate } from "@/hooks/useLangNavigate";

export function BottomNav() {
    const navigate = useLangNavigate();

    return (
        <div className="relative z-50 h-16 shrink-0 flex items-center justify-center bg-white">
            <button onClick={() => navigate("/about")} className="block">
                <img src="/arkie.png" alt="Arkie" className="max-h-10" />
            </button>
        </div>
    );
}
